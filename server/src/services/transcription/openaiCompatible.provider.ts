import fs from "fs";
import OpenAI from "openai";
import type { ProviderConfig } from "../../config/env";
import { TranscriptionProvider, TranscriptionResult } from "./types";

/**
 * Provedor de transcricao para qualquer API compativel com a da OpenAI.
 * Atende tanto a OpenAI (Whisper) quanto a Groq (Whisper hospedado),
 * mudando apenas a baseURL, a chave e o nome do modelo.
 */
export class OpenAICompatibleTranscriptionProvider
  implements TranscriptionProvider
{
  readonly name: string;
  private client: OpenAI;
  private model: string;

  constructor(config: ProviderConfig) {
    this.name = config.provider;
    this.model = config.model;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async transcribe(filePath: string): Promise<TranscriptionResult> {
    const response = await this.client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: this.model,
      response_format: "verbose_json",
    });

    // verbose_json traz text e (quando disponivel) duration
    const data = response as unknown as { text: string; duration?: number };
    return {
      text: data.text,
      durationSeconds: data.duration ? Math.round(data.duration) : null,
    };
  }
}
