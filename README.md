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

## Stack

| Camada    | Tecnologia                                  |
| --------- | ------------------------------------------- |
| Frontend  | React + Vite + TypeScript + Tailwind        |
| Backend   | Node + Express + TypeScript                 |
| Banco     | SQLite via Prisma                           |
| IA        | OpenAI (Whisper + GPT) — arquitetura plugável |

## Rodando localmente

Pré-requisito: Node 18+.

### 1. Backend

```bash
cd server
npm install
copy .env.example .env      # no Windows; use "cp" no Linux/Mac
npx prisma db push          # cria o banco SQLite
npm run seed                # (opcional) cria conta demo@dealnote.ai / demo123
npm run dev                 # http://localhost:4000
```

### 2. Frontend (em outro terminal)

```bash
cd web
npm install
npm run dev                 # http://localhost:5173
```

Abra **http://localhost:5173**, crie uma conta e comece.

## Modo mock vs IA real

O app roda **sem chave de API**: se `OPENAI_API_KEY` estiver vazio no
`server/.env`, ele usa provedores _mock_ (transcrição e análise de exemplo,
sem custo) e o fluxo inteiro funciona para testes.

Para ativar a **IA real**, edite `server/.env`:

```env
OPENAI_API_KEY="sua-chave-aqui"
```

Reinicie o backend. O console mostra qual modo está ativo.

## Arquitetura plugável (trocar a IA depois)

A transcrição e a análise ficam atrás de interfaces. Para usar outro serviço
(Groq, AssemblyAI, etc.):

- **Transcrição:** crie uma classe que implemente `TranscriptionProvider`
  em `server/src/services/transcription/` e registre em `index.ts`.
- **Análise:** mesma ideia em `server/src/services/analysis/`.

Nenhuma outra parte do código precisa mudar.

## Estrutura

```
dealnote-ai/
├── server/
│   ├── prisma/schema.prisma        # User, Meeting, Report
│   └── src/
│       ├── routes/                 # /api/auth, /api/meetings
│       ├── controllers/
│       ├── services/
│       │   ├── transcription/      # provider plugável (Whisper / mock)
│       │   ├── analysis/           # análise em 2 passadas (triagem + relatório)
│       │   └── pipeline.ts         # transcrever → analisar → salvar
│       └── index.ts
└── web/
    └── src/
        ├── pages/                  # Login, Dashboard, Nova reunião, Relatório
        ├── components/
        ├── context/AuthContext.tsx
        └── lib/                    # api, types, format
```

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
