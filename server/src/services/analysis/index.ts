import { env } from "../../config/env";
import { AnalysisProvider } from "./types";
import { OpenAICompatibleAnalysisProvider } from "./openaiCompatible.analyzer";
import { MockAnalysisProvider } from "./mock.analyzer";

export * from "./types";

/**
 * Fabrica do provedor de analise.
 * OpenAI e Groq usam a mesma classe (APIs compativeis); muda so a config.
 */
export function getAnalysisProvider(): AnalysisProvider {
  if (env.analysis.provider === "mock") {
    return new MockAnalysisProvider();
  }
  return new OpenAICompatibleAnalysisProvider(env.analysis);
}
