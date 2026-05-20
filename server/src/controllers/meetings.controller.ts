import fs from "fs";
import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { processMeeting } from "../services/pipeline";
import type { ReportContent } from "../services/analysis/types";

/** GET /api/meetings - lista as reunioes do usuario logado. */
export async function listMeetings(req: AuthRequest, res: Response) {
  const meetings = await prisma.meeting.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    include: { report: { select: { closingScore: true } } },
  });

  return res.json({
    meetings: meetings.map((m) => ({
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

/** GET /api/meetings/stats - numeros para o dashboard. */
export async function getStats(req: AuthRequest, res: Response) {
  const meetings = await prisma.meeting.findMany({
    where: { userId: req.userId },
    include: { report: { select: { closingScore: true } } },
  });

  const ready = meetings.filter((m) => m.status === "ready");
  const processing = meetings.filter((m) =>
    ["created", "transcribing", "analyzing"].includes(m.status)
  );
  const scores = ready
    .map((m) => m.report?.closingScore)
    .filter((s): s is number => typeof s === "number");
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return res.json({
    total: meetings.length,
    ready: ready.length,
    processing: processing.length,
    avgClosingScore: avgScore,
  });
}

/** GET /api/meetings/insights - dados agregados para a aba Desempenho. */
export async function getInsights(req: AuthRequest, res: Response) {
  const meetings = await prisma.meeting.findMany({
    where: { userId: req.userId, status: "ready" },
    orderBy: { createdAt: "asc" },
    include: { report: true },
  });

  const scoreTimeline: {
    id: string;
    title: string;
    date: Date;
    score: number;
  }[] = [];
  const objections: { text: string; meetingId: string; meetingTitle: string }[] =
    [];
  const improvements: {
    text: string;
    meetingId: string;
    meetingTitle: string;
  }[] = [];
  const interest = { alto: 0, medio: 0, baixo: 0 };

  for (const m of meetings) {
    if (m.report?.closingScore != null) {
      scoreTimeline.push({
        id: m.id,
        title: m.title,
        date: m.createdAt,
        score: m.report.closingScore,
      });
    }
    const content = m.report?.content as ReportContent | undefined;
    if (!content) continue;

    for (const o of content.objections ?? []) {
      objections.push({
        text: o.objection,
        meetingId: m.id,
        meetingTitle: m.title,
      });
    }
    for (const i of content.sellerCoaching?.improvements ?? []) {
      improvements.push({ text: i, meetingId: m.id, meetingTitle: m.title });
    }
    const level = (content.commercialInsights?.interestLevel ?? "").toLowerCase();
    if (level.includes("alto")) interest.alto++;
    else if (level.includes("baix")) interest.baixo++;
    else if (level.includes("med")) interest.medio++;
  }

  const scores = scoreTimeline.map((s) => s.score);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return res.json({
    totalAnalyzed: meetings.length,
    avgScore,
    bestScore: scores.length ? Math.max(...scores) : null,
    scoreTimeline,
    interestDistribution: interest,
    objections,
    improvements,
  });
}

/** GET /api/meetings/:id - detalhe da reuniao com o relatorio completo. */
export async function getMeeting(req: AuthRequest, res: Response) {
  const meeting = await prisma.meeting.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { report: true },
  });

  if (!meeting) throw new HttpError(404, "Reuniao nao encontrada.");

  return res.json({
    meeting: {
      id: meeting.id,
      title: meeting.title,
      clientName: meeting.clientName,
      source: meeting.source,
      status: meeting.status,
      transcript: meeting.transcript,
      durationSeconds: meeting.durationSeconds,
      consentConfirmed: meeting.consentConfirmed,
      errorMessage: meeting.errorMessage,
      folderId: meeting.folderId,
      createdAt: meeting.createdAt,
      report: meeting.report
        ? {
            context: meeting.report.context,
            content: meeting.report.content,
            closingScore: meeting.report.closingScore,
          }
        : null,
    },
  });
}

/**
 * POST /api/meetings - cria a reuniao a partir de um arquivo de audio.
 * multipart/form-data: file + title, clientName, source, consentConfirmed.
 * Vale tanto para upload de arquivo quanto para gravacao do navegador.
 */
export async function createMeeting(req: AuthRequest, res: Response) {
  const file = req.file;
  const { title, clientName, source, consentConfirmed } = req.body as Record<
    string,
    string
  >;

  if (!file) throw new HttpError(400, "Envie um arquivo de audio.");
  if (!title || title.trim().length < 2) {
    if (file.path) fs.unlink(file.path, () => {});
    throw new HttpError(400, "Informe um titulo para a reuniao.");
  }
  if (consentConfirmed !== "true") {
    if (file.path) fs.unlink(file.path, () => {});
    throw new HttpError(
      400,
      "E necessario confirmar a autorizacao dos participantes."
    );
  }

  const meeting = await prisma.meeting.create({
    data: {
      userId: req.userId!,
      title: title.trim(),
      clientName: clientName?.trim() || null,
      source: source === "recording" ? "recording" : "upload",
      status: "created",
      audioPath: file.path,
      audioMimeType: file.mimetype,
      consentConfirmed: true,
    },
  });

  // Processa em segundo plano (transcrever + analisar). Nao bloqueia a resposta.
  processMeeting(meeting.id).catch((err) =>
    console.error("[pipeline] erro nao capturado:", err)
  );

  return res.status(201).json({ id: meeting.id, status: meeting.status });
}

/** PATCH /api/meetings/:id - move a reuniao para uma pasta (ou tira da pasta). */
export async function updateMeeting(req: AuthRequest, res: Response) {
  const data = z
    .object({ folderId: z.string().nullable() })
    .parse(req.body);

  const meeting = await prisma.meeting.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!meeting) throw new HttpError(404, "Reuniao nao encontrada.");

  if (data.folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: data.folderId, userId: req.userId },
    });
    if (!folder) throw new HttpError(404, "Pasta nao encontrada.");
  }

  await prisma.meeting.update({
    where: { id: meeting.id },
    data: { folderId: data.folderId },
  });
  return res.json({ ok: true });
}

/** DELETE /api/meetings/:id - remove a reuniao e o arquivo de audio. */
export async function deleteMeeting(req: AuthRequest, res: Response) {
  const meeting = await prisma.meeting.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!meeting) throw new HttpError(404, "Reuniao nao encontrada.");

  if (meeting.audioPath && fs.existsSync(meeting.audioPath)) {
    fs.unlink(meeting.audioPath, () => {});
  }
  await prisma.meeting.delete({ where: { id: meeting.id } });

  return res.status(204).send();
}
