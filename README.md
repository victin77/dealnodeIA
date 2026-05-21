# DealNote AI

**Não é um gravador de reunião. É um copiloto de fechamento de vendas.**

Analisa reuniões comerciais e entrega o que importa: score de fechamento,
objeções com resposta pronta, follow-up de WhatsApp e coaching de vendas —
adaptado automaticamente ao nicho da conversa.

## Como funciona a análise

A IA trabalha em **duas passadas** (é isso que evita o resultado genérico):

1. **Triagem** — lê a transcrição e identifica sozinha o contexto: tipo de
   call, setor, o que está sendo vendido, estágio da venda.
2. **Análise profunda** — usa esse contexto como "lente" para gerar o
   relatório com recomendações específicas para aquele tipo de venda.

## Funcionalidades

- **Upload de áudio** ou **gravação direto pelo navegador** (MediaRecorder).
- Relatório com **score de fechamento**, objeções, follow-up de WhatsApp e coaching.
- Organização por **Pastas** e **Clientes** (timeline de reuniões por cliente).
- Aba de **Desempenho** com analytics e insights.
- **Login com e-mail/senha ou Google**.
- **Tema claro/escuro** e **PWA instalável** (com uso offline básico).

## Stack

| Camada   | Tecnologia                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React + Vite + TypeScript + Tailwind                    |
| Backend  | Node + Express + TypeScript                             |
| Banco    | Prisma — PostgreSQL (produção) / SQLite (dev local)     |
| IA       | Groq (Whisper + Llama) ou OpenAI — arquitetura plugável |

## Rodando localmente

Pré-requisito: Node 20+.

### 1. Backend

```bash
cd server
npm install
copy .env.example .env      # no Windows; use "cp" no Linux/Mac
npm run dev                 # http://localhost:4000
```

O `npm run dev` cria e migra o banco **SQLite local automaticamente** — não
precisa rodar `prisma` na mão. O `schema.prisma` versionado é PostgreSQL (usado
na produção); o schema SQLite do dev é gerado a partir dele.

Conta de demonstração (opcional): `npm run seed` cria
`demo@dealnote.ai` / `demo123`.

### 2. Frontend (em outro terminal)

```bash
cd web
npm install
npm run dev                 # http://localhost:5173
```

Abra **http://localhost:5173**, crie uma conta e comece.

## Modo mock vs IA real

O app roda **sem nenhuma chave de API**: nesse caso usa provedores _mock_
(transcrição e análise de exemplo, sem custo) e o fluxo inteiro funciona
para testes.

Para ativar a **IA real**, preencha uma chave no `server/.env`:

```env
# Groq é grátis e sem cartão — recomendado. https://console.groq.com
GROQ_API_KEY="sua-chave-aqui"

# OpenAI é opcional (paga).
OPENAI_API_KEY=""
```

Os seletores `TRANSCRIPTION_PROVIDER` / `ANALYSIS_PROVIDER` aceitam `auto`
(usa Groq se houver chave, senão OpenAI, senão mock) ou forçam `groq`,
`openai` ou `mock`. Reinicie o backend — o console mostra o modo ativo.

## Arquitetura plugável (trocar a IA depois)

A transcrição e a análise ficam atrás de interfaces. Para usar outro serviço
(AssemblyAI, etc.):

- **Transcrição:** crie uma classe que implemente `TranscriptionProvider`
  em `server/src/services/transcription/` e registre em `index.ts`.
- **Análise:** mesma ideia em `server/src/services/analysis/`.

Nenhuma outra parte do código precisa mudar.

## Estrutura

```
dealnote-ai/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma           # PostgreSQL (produção)
│   │   ├── use-local-schema.mjs    # gera o schema SQLite para o dev
│   │   └── schema.local.prisma     # SQLite (dev, gerado — não versionado)
│   └── src/
│       ├── routes/                 # /api/auth, /api/meetings, ...
│       ├── controllers/
│       ├── services/
│       │   ├── transcription/      # provider plugável (Groq / OpenAI / mock)
│       │   ├── analysis/           # análise em 2 passadas (triagem + relatório)
│       │   └── pipeline.ts         # transcrever → analisar → salvar
│       └── index.ts
└── web/
    └── src/
        ├── pages/                  # Login, Início, Nova reunião, Histórico,
        │                           # Pastas, Clientes, Desempenho, Configurações
        ├── components/
        ├── context/                # Auth, Theme, NavMode
        └── lib/                    # api, types, format
```

Modelos do banco: `User`, `Meeting`, `Report`, `Folder`.

## Deploy

O app é publicado no Railway como serviço único — o backend serve o frontend
já buildado. Passo a passo em **[DEPLOY.md](DEPLOY.md)**.

## Roadmap (próximas fases)

- Captura do áudio da aba do navegador (`getDisplayMedia`)
- Assistente ao vivo durante a reunião
- Bot que entra automaticamente em Meet/Zoom/Teams (via Recall.ai)
- Memória do negócio entre várias reuniões do mesmo cliente
- Integração com CRM

## Privacidade

Antes de enviar qualquer reunião, o usuário precisa confirmar que os
participantes autorizaram a gravação/análise. O botão de envio fica
bloqueado sem essa confirmação.
