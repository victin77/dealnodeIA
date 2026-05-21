import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }
  return value;
}

const openaiKey = (process.env.OPENAI_API_KEY ?? "").trim();
const groqKey = (process.env.GROQ_API_KEY ?? "").trim();

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export type Provider = "openai" | "groq" | "mock";

/** Configuracao resolvida de um provedor (transcricao ou analise). */
export interface ProviderConfig {
  provider: Provider;
  apiKey: string;
  baseURL?: string;
  model: string;
}

/**
 * Decide qual provedor usar.
 * - "openai"/"groq"/"mock": forca o provedor (cai para mock se faltar a chave)
 * - "auto" (padrao): usa Groq se houver GROQ_API_KEY, senao OpenAI, senao mock
 */
function resolveProvider(envVar: string): Provider {
  const requested = (process.env[envVar] ?? "auto").toLowerCase();
  if (requested === "openai") return openaiKey ? "openai" : "mock";
  if (requested === "groq") return groqKey ? "groq" : "mock";
  if (requested === "mock") return "mock";
  if (groqKey) return "groq";
  if (openaiKey) return "openai";
  return "mock";
}

function transcriptionConfig(provider: Provider): ProviderConfig {
  if (provider === "groq") {
    return {
      provider,
      apiKey: groqKey,
      baseURL: GROQ_BASE_URL,
      model: process.env.GROQ_TRANSCRIPTION_MODEL ?? "whisper-large-v3-turbo",
    };
  }
  if (provider === "openai") {
    return {
      provider,
      apiKey: openaiKey,
      model: process.env.OPENAI_TRANSCRIPTION_MODEL ?? "whisper-1",
    };
  }
  return { provider: "mock", apiKey: "", model: "" };
}

function analysisConfig(provider: Provider): ProviderConfig {
  if (provider === "groq") {
    return {
      provider,
      apiKey: groqKey,
      baseURL: GROQ_BASE_URL,
      model: process.env.GROQ_ANALYSIS_MODEL ?? "llama-3.3-70b-versatile",
    };
  }
  if (provider === "openai") {
    return {
      provider,
      apiKey: openaiKey,
      model: process.env.OPENAI_ANALYSIS_MODEL ?? "gpt-4o-mini",
    };
  }
  return { provider: "mock", apiKey: "", model: "" };
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required("JWT_SECRET", "dev-secret-troque-isto"),
  clientUrl: required("CLIENT_URL", "http://localhost:5173"),

  // ID do cliente OAuth do Google (não é secreto — pode ficar no código).
  googleClientId:
    process.env.GOOGLE_CLIENT_ID ??
    "793973236663-dp8o9q0m8jvdeqv76jkm5t2ge03vf26c.apps.googleusercontent.com",

  transcription: transcriptionConfig(resolveProvider("TRANSCRIPTION_PROVIDER")),
  analysis: analysisConfig(resolveProvider("ANALYSIS_PROVIDER")),
};
