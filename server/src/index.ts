import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import meetingRoutes from "./routes/meetings.routes";
import folderRoutes from "./routes/folders.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    transcription: env.transcription.provider,
    analysis: env.analysis.provider,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/folders", folderRoutes);

// 404 em JSON para rotas de API inexistentes (evita cair no index.html).
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Rota de API não encontrada." });
});

/**
 * Serviço único: em produção o backend também serve o frontend (build do Vite).
 * Em dev o build não existe, então este bloco é ignorado e o front roda no Vite.
 */
const webDist = path.join(__dirname, "../../web/dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

app.use(errorHandler);

app.listen(env.port, () => {
  const real =
    env.transcription.provider !== "mock" || env.analysis.provider !== "mock";
  const mode = real ? "IA REAL" : "MODO MOCK (sem chave de API)";
  console.log(`\n  DealNote AI - servidor no ar`);
  console.log(`  http://localhost:${env.port}`);
  console.log(
    `  Transcricao: ${env.transcription.provider} (${env.transcription.model || "—"})`
  );
  console.log(
    `  Analise: ${env.analysis.provider} (${env.analysis.model || "—"})`
  );
  console.log(`  Frontend: ${fs.existsSync(webDist) ? "servido pelo backend" : "via Vite (dev)"}`);
  console.log(`  ${mode}\n`);
});
