// Gera prisma/schema.local.prisma a partir do schema.prisma, trocando
// o provider do banco para "sqlite".
//
// Por que isso existe:
//   - Em PRODUCAO (Railway) o banco e PostgreSQL  -> schema.prisma fica em "postgresql"
//   - Em DESENVOLVIMENTO local usamos SQLite       -> este script gera a versao "sqlite"
//
// O schema.prisma versionado NUNCA muda. O schema.local.prisma e um
// arquivo gerado (esta no .gitignore) e e recriado a cada `npm run dev`,
// entao nunca fica desatualizado em relacao ao schema real.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "schema.prisma");
const target = join(here, "schema.local.prisma");

const schema = readFileSync(source, "utf8");

if (!schema.includes('provider = "postgresql"')) {
  console.warn(
    '[use-local-schema] AVISO: provider = "postgresql" nao encontrado em schema.prisma. ' +
      "O schema.local.prisma pode sair errado."
  );
}

const header =
  "// ARQUIVO GERADO AUTOMATICAMENTE - NAO EDITE.\n" +
  "// Gerado por prisma/use-local-schema.mjs a partir de schema.prisma.\n" +
  "// Versao para desenvolvimento local (SQLite). Edite o schema.prisma.\n\n";

const local = header + schema.replace('provider = "postgresql"', 'provider = "sqlite"');

writeFileSync(target, local);
console.log("[use-local-schema] schema.local.prisma gerado (provider = sqlite)");
