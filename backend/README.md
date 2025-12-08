# TokenSync Backend

API Backend para o TokenSync - Plataforma de sincronização de Design Systems com código.

## 📋 Visão Geral

O TokenSync Backend é uma API RESTful que permite:

- 🔐 Autenticação via JWT e OAuth (Figma, Google)
- 📂 Gerenciamento de projetos e tokens
- 🔄 Sincronização bidirecional com Figma
- 💻 Geração de código em múltiplos formatos
- 🤖 Assistente IA para Design Systems
- 📊 Benchmark de concorrentes

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar serviços (PostgreSQL, Redis)
docker-compose up -d

# Rodar migrations
npx prisma migrate dev

# Iniciar servidor
npm run start:dev
```

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitetura geral do sistema |
| [API.md](./docs/API.md) | Documentação completa da API |
| [DATABASE.md](./docs/DATABASE.md) | Schema do banco de dados |
| [FIGMA_INTEGRATION.md](./docs/FIGMA_INTEGRATION.md) | Integração com Figma |
| [CODE_GENERATION.md](./docs/CODE_GENERATION.md) | Sistema de geração de código |
| [SETUP.md](./docs/SETUP.md) | Guia completo de setup |

## 🛠️ Stack Tecnológica

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10+
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Autenticação**: JWT + OAuth2
- **Validação**: class-validator + Zod
- **Documentação**: Swagger/OpenAPI

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Root module
│   ├── common/                 # Shared utilities
│   ├── config/                 # Configuration
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── users/              # User management
│   │   ├── projects/           # Projects
│   │   ├── tokens/             # Design Tokens
│   │   ├── components/         # Components
│   │   ├── figma/              # Figma integration
│   │   ├── code-generator/     # Code generation
│   │   ├── versioning/         # Version control
│   │   ├── scenarios/          # Scenarios & automation
│   │   ├── benchmark/          # Competitor analysis
│   │   └── ai-assistant/       # AI chat
│   └── infrastructure/         # Database, cache, storage
├── prisma/                     # Prisma schema & migrations
├── test/                       # Tests
├── docker/                     # Docker files
└── docs/                       # Documentation
```

## 🔧 Scripts Disponíveis

```bash
npm run start:dev     # Desenvolvimento com hot-reload
npm run start:prod    # Produção
npm run build         # Build
npm run test          # Testes unitários
npm run test:e2e      # Testes E2E
npm run lint          # Linting
npm run prisma:studio # Prisma Studio
```

## 🔐 Variáveis de Ambiente

```env
# Veja .env.example para a lista completa
DATABASE_URL=
REDIS_HOST=
JWT_SECRET=
FIGMA_CLIENT_ID=
FIGMA_CLIENT_SECRET=
```

## 📖 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro |
| GET | `/api/projects` | Listar projetos |
| GET | `/api/projects/:id/tokens` | Listar tokens |
| POST | `/api/projects/:id/figma/sync` | Sincronizar Figma |
| POST | `/api/projects/:id/code/export` | Exportar código |

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 🐳 Docker

```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker build -t tokensync-api .
docker run -p 3000:3000 tokensync-api
```

## 📝 License

MIT

## 👤 Autor

Gabriel Souza
