import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { HttpError } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

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
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new HttpError(401, "E-mail ou senha incorretos.");
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

  if (!(await bcrypt.compare(data.currentPassword, user.password))) {
    throw new HttpError(401, "Senha atual incorreta.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(data.newPassword, 10) },
  });

  return res.json({ ok: true });
}
