import { prisma } from "../lib/prisma";
import { getTranscriptionProvider } from "./transcription";
import { getAnalysisProvider } from "./analysis";

/**
 * Pipeline de processamento de uma reuniao:
 *   transcrever -> analisar (triagem + analise) -> salvar relatorio
 *
 * Roda em segundo plano apos o upload. O status da reuniao e atualizado
 * em cada etapa para o frontend acompanhar.
 */
export async function processMeeting(meetingId: string): Promise<void> {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting || !meeting.audioPath) {
    console.error(`[pipeline] reuniao ${meetingId} sem audio.`);
    return;
  }

  try {
    // 1. Transcricao
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "transcribing" },
    });

    const transcriber = getTranscriptionProvider();
    const transcription = await transcriber.transcribe(meeting.audioPath);

    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        transcript: transcription.text,
        durationSeconds: transcription.durationSeconds ?? meeting.durationSeconds,
        status: "analyzing",
      },
    });

    // 2. Analise adaptativa (triagem + analise profunda)
    const analyzer = getAnalysisProvider();
    const result = await analyzer.analyze(transcription.text);

    // 3. Salvar relatorio
    await prisma.report.upsert({
      where: { meetingId },
      create: {
        meetingId,
        context: result.context as object,
        content: result.report as object,
        closingScore: result.report.closingScore?.value ?? null,
      },
      update: {
        context: result.context as object,
        content: result.report as object,
        closingScore: result.report.closingScore?.value ?? null,
      },
    });

    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "ready", errorMessage: null },
    });

    console.log(`[pipeline] reuniao ${meetingId} concluida.`);
  } catch (err) {
    console.error(`[pipeline] falha na reuniao ${meetingId}:`, err);
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: "error",
        errorMessage:
          err instanceof Error ? err.message : "Erro desconhecido no processamento.",
      },
    });
  }
}
