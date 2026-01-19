# Guia de Setup do Backend - TokenSync

## 📋 Pré-requisitos

- **Node.js** 18.x ou superior (recomendado 20.x LTS)
- **npm** 9.x ou superior (ou **Bun** 1.x)
- **PostgreSQL** 15.x ou superior
- **Redis** 7.x ou superior
- **Docker** e **Docker Compose** (opcional, mas recomendado)

## 🚀 Quick Start

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/design-soul-sync.git
cd design-soul-sync/backend
```

### 2. Instale as Dependências

```bash
npm install
# ou
bun install
```

### 3. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Aplicação
NODE_ENV=development
PORT=3000
API_PREFIX=api
CORS_ORIGINS=http://localhost:8080,http://localhost:5173

# Banco de Dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tokensync?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Figma OAuth
FIGMA_CLIENT_ID=your-figma-client-id
FIGMA_CLIENT_SECRET=your-figma-client-secret
FIGMA_REDIRECT_URI=http://localhost:3000/api/auth/figma/callback

# OpenAI (para AI Assistant e Benchmark)
OPENAI_API_KEY=sk-your-openai-api-key

# Storage (S3 ou MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=tokensync
S3_REGION=us-east-1

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

### 4. Inicie os Serviços com Docker (Recomendado)

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Redis na porta 6379
- MinIO (S3 compatível) na porta 9000

### 5. Execute as Migrations

```bash
npx prisma migrate dev
```

### 6. Seed do Banco de Dados (Opcional)

```bash
npx prisma db seed
```

### 7. Inicie o Servidor de Desenvolvimento

```bash
npm run start:dev
# ou
bun run start:dev
```

O servidor estará disponível em `http://localhost:3000`

---

## 🐳 Docker Setup Completo

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Aplicação Backend
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/tokensync?schema=public
      - REDIS_HOST=redis
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    command: npm run start:dev

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tokensync
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO (S3 compatível)
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Dockerfile.dev

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache openssl

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
```

### Dockerfile (Produção)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl dumb-init

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

---

## 📁 Estrutura Inicial do Projeto

Execute estes comandos para criar a estrutura inicial:

```bash
# Criar projeto NestJS
npx @nestjs/cli new backend --package-manager npm

# Instalar dependências principais
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @prisma/client @nestjs/throttler
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install bcrypt
npm install ioredis
npm install archiver
npm install @aws-sdk/client-s3
npm install openai

# Dependências de desenvolvimento
npm install -D prisma @types/passport-jwt @types/bcrypt @types/archiver
```

---

## 🔧 Configuração do Prisma

### prisma/schema.prisma (base)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Veja DATABASE.md para o schema completo
```

### Comandos úteis do Prisma

```bash
# Criar migration
npx prisma migrate dev --name init

# Aplicar migrations em produção
npx prisma migrate deploy

# Reset do banco (CUIDADO!)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Gerar Prisma Client
npx prisma generate
```

---

## 📝 Scripts Disponíveis

```json
{
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  }
}
```

---

## 🔐 Configuração do Figma OAuth

### 1. Criar App no Figma

1. Acesse [Figma Developers](https://www.figma.com/developers)
2. Clique em "Create a new app"
3. Preencha:
   - **App name**: TokenSync
   - **App URL**: http://localhost:3000
   - **Callback URL**: http://localhost:3000/api/auth/figma/callback

### 2. Obter Credenciais

Após criar o app, copie:
- **Client ID**
- **Client Secret**

### 3. Configurar no .env

```env
FIGMA_CLIENT_ID=xxxxx
FIGMA_CLIENT_SECRET=xxxxx
FIGMA_REDIRECT_URI=http://localhost:3000/api/auth/figma/callback
```

---

## 🧪 Testando a API

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Swagger Documentation

Acesse: `http://localhost:3000/api/docs`

### Criar Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🚀 Deploy em Produção

### Variáveis de Ambiente Obrigatórias

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_HOST=...
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<different-strong-random-secret>
```

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Migrations aplicadas (`prisma migrate deploy`)
- [ ] SSL/TLS configurado
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente
- [ ] Logs configurados
- [ ] Monitoramento configurado (opcional)
- [ ] Backup do banco configurado

### Deploy com Docker

```bash
# Build da imagem
docker build -t tokensync-api .

# Run
docker run -d \
  --name tokensync-api \
  -p 3000:3000 \
  --env-file .env.production \
  tokensync-api
```

---

## 🔍 Troubleshooting

### Prisma Client não encontrado

```bash
npx prisma generate
```

### Erro de conexão com PostgreSQL

Verifique se o PostgreSQL está rodando:
```bash
docker-compose ps
# ou
sudo systemctl status postgresql
```

### Erro de conexão com Redis

Verifique se o Redis está rodando:
```bash
redis-cli ping
```

### Migrations não aplicadas

```bash
npx prisma migrate dev
```

### Limpar cache do NestJS

```bash
rm -rf dist
npm run build
```

---

## 📚 Próximos Passos

1. Criar os módulos básicos (auth, users, projects)
2. Implementar autenticação JWT
3. Criar CRUD de tokens
4. Integrar com Figma OAuth
5. Implementar sincronização com Figma
6. Criar geradores de código
7. Implementar AI Assistant
8. Adicionar testes automatizados

---

*Documento atualizado em: Dezembro 2024*
