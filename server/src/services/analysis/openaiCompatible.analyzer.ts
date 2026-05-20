import OpenAI from "openai";
import type { ProviderConfig } from "../../config/env";
import {
  AnalysisProvider,
  AnalysisResult,
  MeetingContext,
  ReportContent,
} from "./types";
import {
  TRIAGE_SYSTEM_PROMPT,
  triageUserPrompt,
  analysisSystemPrompt,
  analysisUserPrompt,
} from "./prompts";

/** Remove cercas de markdown (```json ... ```) que alguns modelos adicionam. */
function stripFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * Analise em duas passadas (triagem + analise profunda) usando qualquer
 * API compativel com a da OpenAI. Funciona com OpenAI (GPT) e Groq (Llama).
 */
export class OpenAICompatibleAnalysisProvider implements AnalysisProvider {
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

  private async askJson(system: string, user: string): Promise<any> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    return JSON.parse(stripFences(raw));
  }

  async analyze(transcript: string): Promise<AnalysisResult> {
    // Passada 1 - triagem: descobre o contexto da call
    const context = (await this.askJson(
      TRIAGE_SYSTEM_PROMPT,
      triageUserPrompt(transcript)
    )) as MeetingContext;

    // Passada 2 - analise profunda adaptada ao contexto
    const report = (await this.askJson(
      analysisSystemPrompt(context),
      analysisUserPrompt(transcript)
    )) as ReportContent;

    return { context, report };
  }
}
