import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

const folderSchema = z.object({
  name: z
    .string()
    .min(1, "Informe um nome para a pasta.")
    .max(60, "Nome muito longo."),
});

/** GET /api/folders - lista as pastas do usuario com a contagem de reunioes. */
export async function listFolders(req: AuthRequest, res: Response) {
  const folders = await prisma.folder.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { meetings: true } } },
  });

  return res.json({
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      meetingCount: f._count.meetings,
      createdAt: f.createdAt,
    })),
  });
}

/** GET /api/folders/:id - detalhe da pasta com as reunioes dentro dela. */
export async function getFolder(req: AuthRequest, res: Response) {
  const folder = await prisma.folder.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      meetings: {
        orderBy: { createdAt: "desc" },
        include: { report: { select: { closingScore: true } } },
      },
    },
  });

  if (!folder) throw new HttpError(404, "Pasta nao encontrada.");

  return res.json({
    folder: { id: folder.id, name: folder.name, createdAt: folder.createdAt },
    meetings: folder.meetings.map((m) => ({
      id: m.id,
      title: m.title,
      clientName: m.clientName,
      source: m.source,
      status: m.status,
      durationSeconds: m.durationSeconds,
      closingScore: m.report?.closingScore ?? null,
      createdAt: m.createdAt,
    })),
  });
}

/** POST /api/folders - cria uma pasta. */
export async function createFolder(req: AuthRequest, res: Response) {
  const data = folderSchema.parse(req.body);
  const folder = await prisma.folder.create({
    data: { userId: req.userId!, name: data.name.trim() },
  });
  return res.status(201).json({ id: folder.id, name: folder.name });
}

/** PATCH /api/folders/:id - renomeia uma pasta. */
export async function updateFolder(req: AuthRequest, res: Response) {
  const data = folderSchema.parse(req.body);
  const existing = await prisma.folder.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) throw new HttpError(404, "Pasta nao encontrada.");

  await prisma.folder.update({
    where: { id: existing.id },
    data: { name: data.name.trim() },
  });
  return res.json({ ok: true });
}

/** DELETE /api/folders/:id - exclui a pasta (as reunioes ficam sem pasta). */
export async function deleteFolder(req: AuthRequest, res: Response) {
  const existing = await prisma.folder.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) throw new HttpError(404, "Pasta nao encontrada.");

  await prisma.folder.delete({ where: { id: existing.id } });
  return res.status(204).send();
}
