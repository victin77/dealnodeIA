import { env } from "../../config/env";
import { TranscriptionProvider } from "./types";
import { OpenAICompatibleTranscriptionProvider } from "./openaiCompatible.provider";
import { MockTranscriptionProvider } from "./mock.provider";

export * from "./types";

/**
 * Fabrica do provedor de transcricao.
 * OpenAI e Groq usam a mesma classe (APIs compativeis); muda so a config.
 * Para adicionar um servico nao-compativel, crie uma classe que implemente
 * TranscriptionProvider e adicione um case aqui.
 */
export function getTranscriptionProvider(): TranscriptionProvider {
  if (env.transcription.provider === "mock") {
    return new MockTranscriptionProvider();
  }
  return new OpenAICompatibleTranscriptionProvider(env.transcription);
}
