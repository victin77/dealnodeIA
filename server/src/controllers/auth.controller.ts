import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { HttpError } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(env.googleClientId);

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("E-mail invalido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

const loginSchema = z.object({
  email: z.string().email("E-mail invalido."),
  password: z.string().min(1, "Informe a senha."),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: z
    .string()
    .min(6, "A nova senha precisa ter ao menos 6 caracteres."),
});

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "7d" });
}

function publicUser(user: { id: string; name: string; email: string }) {
  return { id: user.id, name: user.name, email: user.email };
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new HttpError(409, "Ja existe uma conta com este e-mail.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: passwordHash },
  });

  return res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new HttpError(401, "E-mail ou senha incorretos.");
  }
  if (!user.password) {
    throw new HttpError(
      401,
      "Esta conta foi criada com o Google. Use o botão 'Entrar com Google'."
    );
  }
  if (!(await bcrypt.compare(data.password, user.password))) {
    throw new HttpError(401, "E-mail ou senha incorretos.");
  }

  return res.json({ token: signToken(user.id), user: publicUser(user) });
}

/**
 * Login com Google: recebe o ID token gerado pelo botão do Google,
 * valida com o Google e cria/recupera o usuário.
 */
export async function googleLogin(req: Request, res: Response) {
  const { credential } = z
    .object({
      credential: z.string().min(10, "Credencial do Google ausente."),
    })
    .parse(req.body);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, "Nao foi possivel validar o login com o Google.");
  }

  if (!payload?.email) {
    throw new HttpError(401, "O Google nao retornou um e-mail valido.");
  }

  const email = payload.email;
  const googleId = payload.sub;
  const name = payload.name?.trim() || email.split("@")[0];

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (user) {
    // Conta ja existe (por e-mail): vincula o googleId se ainda nao tiver.
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }
  } else {
    user = await prisma.user.create({ data: { name, email, googleId } });
  }

  return res.json({ token: signToken(user.id), user: publicUser(user) });
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new HttpError(404, "Usuario nao encontrado.");
  return res.json({ user: publicUser(user) });
}

export async function changePassword(req: AuthRequest, res: Response) {
  const data = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new HttpError(404, "Usuario nao encontrado.");
  if (!user.password) {
    throw new HttpError(
      400,
      "Sua conta usa login com Google e nao tem senha para alterar."
    );
  }

  if (!(await bcrypt.compare(data.currentPassword, user.password))) {
    throw new HttpError(401, "Senha atual incorreta.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(data.newPassword, 10) },
  });

  return res.json({ ok: true });
}
