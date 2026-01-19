# Arquitetura do Backend - TokenSync

## 📋 Visão Geral

O TokenSync Backend é uma API RESTful construída para gerenciar a sincronização bidirecional entre o Figma e código de Design Systems. A arquitetura segue os princípios de Clean Architecture com separação clara de responsabilidades.

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                    Consome API via REST/WebSocket                    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                  │
│              Rate Limiting, Auth, Request Validation                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│   Auth        │        │   Core API    │        │   AI Service  │
│   Service     │        │   Service     │        │   (Optional)  │
└───────────────┘        └───────────────┘        └───────────────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
│            PostgreSQL + Redis Cache + File Storage                   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                │
│                  Figma API, OpenAI API, Storage                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔧 Stack Tecnológica Recomendada

### Core Framework
- **Runtime**: Node.js 20+ LTS
- **Framework**: NestJS 10+ (TypeScript)
- **ORM**: Prisma
- **Validação**: class-validator + class-transformer

### Banco de Dados
- **Principal**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Busca**: PostgreSQL Full-Text Search (ou Elasticsearch para escala)

### Autenticação
- **JWT**: Tokens de acesso e refresh
- **OAuth2**: Login social (Google, GitHub)
- **Figma OAuth**: Integração com Figma API

### Infraestrutura
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoramento**: Prometheus + Grafana
- **Logs**: Winston + Logstash

## 📁 Estrutura de Diretórios

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/            # Custom decorators
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Auth guards
│   │   ├── interceptors/          # Request/Response interceptors
│   │   ├── pipes/                 # Validation pipes
│   │   └── utils/                 # Helper functions
│   │
│   ├── config/                    # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── auth.config.ts
│   │   ├── figma.config.ts
│   │   └── ai.config.ts
│   │
│   ├── modules/
│   │   ├── auth/                  # Authentication
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── figma-oauth.strategy.ts
│   │   │   │   └── google-oauth.strategy.ts
│   │   │   └── dto/
│   │   │
│   │   ├── users/                 # User management
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── projects/              # Project management
│   │   │   ├── projects.module.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   ├── entities/
│   │   │   │   └── project.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── tokens/                # Design Tokens
│   │   │   ├── tokens.module.ts
│   │   │   ├── tokens.controller.ts
│   │   │   ├── tokens.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── token.entity.ts
│   │   │   │   └── token-history.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── components/            # Component Library
│   │   │   ├── components.module.ts
│   │   │   ├── components.controller.ts
│   │   │   ├── components.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── component.entity.ts
│   │   │   │   └── component-variant.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── figma/                 # Figma Integration
│   │   │   ├── figma.module.ts
│   │   │   ├── figma.controller.ts
│   │   │   ├── figma.service.ts
│   │   │   ├── figma-sync.service.ts
│   │   │   ├── figma-webhook.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── code-generator/        # Code Generation
│   │   │   ├── code-generator.module.ts
│   │   │   ├── code-generator.controller.ts
│   │   │   ├── code-generator.service.ts
│   │   │   ├── generators/
│   │   │   │   ├── json.generator.ts
│   │   │   │   ├── css.generator.ts
│   │   │   │   ├── tailwind.generator.ts
│   │   │   │   ├── react.generator.ts
│   │   │   │   └── typescript.generator.ts
│   │   │   └── templates/
│   │   │
│   │   ├── versioning/            # Version Control
│   │   │   ├── versioning.module.ts
│   │   │   ├── versioning.controller.ts
│   │   │   ├── versioning.service.ts
│   │   │   └── entities/
│   │   │
│   │   ├── scenarios/             # Scenarios & Automation
│   │   │   ├── scenarios.module.ts
│   │   │   ├── scenarios.controller.ts
│   │   │   ├── scenarios.service.ts
│   │   │   ├── automation.service.ts
│   │   │   └── entities/
│   │   │
│   │   ├── benchmark/             # Competitor Analysis
│   │   │   ├── benchmark.module.ts
│   │   │   ├── benchmark.controller.ts
│   │   │   ├── benchmark.service.ts
│   │   │   ├── image-analysis.service.ts
│   │   │   └── entities/
│   │   │
│   │   └── ai-assistant/          # AI Chat
│   │       ├── ai-assistant.module.ts
│   │       ├── ai-assistant.controller.ts
│   │       ├── ai-assistant.service.ts
│   │       └── dto/
│   │
│   └── infrastructure/
│       ├── database/
│       │   ├── prisma/
│       │   │   └── schema.prisma
│       │   └── migrations/
│       ├── cache/
│       │   └── redis.service.ts
│       ├── queue/
│       │   └── bull.config.ts
│       └── storage/
│           └── s3.service.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Fluxos Principais

### 1. Sincronização com Figma

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  Figma API   │
│  (Trigger)   │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Compare    │
                     │   & Detect   │
                     │  Divergences │
                     └──────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │  Update  │   │  Create  │   │  Flag    │
      │  Tokens  │   │  History │   │ Conflict │
      └──────────┘   └──────────┘   └──────────┘
```

### 2. Geração de Código

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Request    │────▶│   Validate   │────▶│   Fetch      │
│   Config     │     │   Options    │     │   Tokens     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                     ┌───────────────────────────────────┐
                     │         Code Generator            │
                     │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │
                     │  │JSON │ │ CSS │ │ TW  │ │React│ │
                     │  └─────┘ └─────┘ └─────┘ └─────┘ │
                     └───────────────────────────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │   ZIP File   │
                            │   or JSON    │
                            └──────────────┘
```

### 3. Análise de Benchmark (IA)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Upload     │────▶│   Store in   │────▶│   Queue for  │
│   Image      │     │   S3/Storage │     │   Analysis   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                    ┌──────────────────────┐
                                    │   AI Vision API      │
                                    │   (OpenAI GPT-4V     │
                                    │    or similar)       │
                                    └──────────────────────┘
                                                 │
                                                 ▼
                            ┌────────────────────────────────┐
                            │   Extract:                      │
                            │   - Components                  │
                            │   - Colors                      │
                            │   - Patterns                    │
                            │   - Layout                      │
                            └────────────────────────────────┘
```

## 🔐 Segurança

### Autenticação Multi-Layer

1. **JWT Tokens**
   - Access Token: 15 minutos
   - Refresh Token: 7 dias
   - Armazenamento seguro no HttpOnly Cookie

2. **OAuth2 Providers**
   - Google OAuth2
   - GitHub OAuth2
   - Figma OAuth2 (para acesso à API)

3. **API Keys**
   - Para integrações externas
   - Rate limiting por chave

### Rate Limiting

```typescript
// Configuração de rate limiting
{
  global: {
    ttl: 60,      // 60 segundos
    limit: 100,   // 100 requisições
  },
  figmaSync: {
    ttl: 60,
    limit: 10,    // Sync pesado
  },
  codeGeneration: {
    ttl: 60,
    limit: 20,
  },
  aiAssistant: {
    ttl: 60,
    limit: 30,
  }
}
```

## 📊 Modelo de Dados (Principais Entidades)

### User
```typescript
User {
  id: UUID
  email: string
  name: string
  avatarUrl?: string
  figmaAccessToken?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Project
```typescript
Project {
  id: UUID
  name: string
  description?: string
  figmaFileId?: string
  ownerId: UUID
  status: enum(active, archived)
  settings: JSON
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Token
```typescript
Token {
  id: UUID
  projectId: UUID
  name: string
  value: string
  type: enum(color, spacing, typography, border, shadow, animation, zIndex, opacity)
  category: string
  description?: string
  figmaVariableId?: string
  metadata: JSON
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Component
```typescript
Component {
  id: UUID
  projectId: UUID
  name: string
  description?: string
  category: enum(fundamentais, feedback, layout, navegacao, dados)
  figmaComponentId?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### ComponentVariant
```typescript
ComponentVariant {
  id: UUID
  componentId: UUID
  name: string
  tokens: JSON  // { tokenId: value }
  props: JSON
  preview?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🚀 Próximos Passos para Implementação

1. **Fase 1: Core Setup**
   - Configurar projeto NestJS
   - Configurar Prisma + PostgreSQL
   - Implementar autenticação JWT

2. **Fase 2: Módulos Base**
   - CRUD de Projects
   - CRUD de Tokens
   - CRUD de Components

3. **Fase 3: Integração Figma**
   - OAuth2 com Figma
   - Sync de variáveis
   - Detecção de divergências

4. **Fase 4: Code Generation**
   - Generators para cada formato
   - Templates customizáveis
   - ZIP export

5. **Fase 5: Features Avançadas**
   - AI Assistant
   - Benchmark Analysis
   - Scenarios & Automation

---

*Documento atualizado em: Dezembro 2024*
