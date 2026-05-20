# Deploy do DealNote AI no Railway

Deploy de **serviço único**: o backend serve a API **e** o frontend na mesma URL.
Banco de dados: **PostgreSQL** do Railway.

---

## 1. Subir o código para o GitHub

Na pasta `dealnote-ai`:

```bash
git init
git add .
git commit -m "DealNote AI - versao para deploy"
```

Crie um repositório no GitHub e envie:

```bash
git remote add origin https://github.com/SEU-USUARIO/dealnote-ai.git
git branch -M main
git push -u origin main
```

> O `.gitignore` já evita subir `node_modules`, `.env` e o banco local.

## 2. Criar o projeto no Railway

1. Acesse **railway.app** e faça login
2. **New Project** → **Deploy from GitHub repo** → escolha o repositório
3. O Railway lê o `railway.json` e usa o Nixpacks para buildar (`npm run build`)

## 3. Adicionar o PostgreSQL

1. Dentro do projeto: **New** → **Database** → **Add PostgreSQL**
2. O Railway cria o banco e disponibiliza a variável `DATABASE_URL`

## 4. Configurar as variáveis de ambiente

No **serviço do app** (não no do banco), aba **Variables**, adicione:

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referência ao banco) |
| `GROQ_API_KEY` | sua chave da Groq (`gsk_...`) |
| `JWT_SECRET` | uma frase aleatória longa |
| `NODE_ENV` | `production` |

`PORT` o Railway define sozinho — não precisa criar.

## 5. Deploy

O Railway builda e sobe o app. Em **Settings → Networking**, gere um
**domínio público** (`Generate Domain`). A URL é **HTTPS** — então o PWA fica
**instalável no celular** (menu do navegador → "Adicionar à tela inicial").

O `start` roda `prisma db push`, que cria as tabelas no primeiro deploy.

## 6. Conta de demonstração (opcional)

Para criar a conta demo, use o shell do Railway no serviço do app:

```bash
cd server && npm run seed
```

Ou simplesmente crie uma conta pela tela de cadastro.

---

## Rodar localmente depois desta mudança

O banco agora é PostgreSQL — o ambiente local também precisa de uma URL Postgres:

1. No Railway, abra o serviço **Postgres** → aba **Connect** → copie a URL de
   **Public Network**
2. Cole em `server/.env`:
   ```
   DATABASE_URL="postgresql://...a-url-publica..."
   ```
3. Rode:
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   npm run dev
   ```
4. Em outro terminal, o frontend: `cd web && npm run dev`

> Local e produção passam a usar o mesmo banco. Para separar, basta criar um
> segundo PostgreSQL no Railway só para desenvolvimento.
