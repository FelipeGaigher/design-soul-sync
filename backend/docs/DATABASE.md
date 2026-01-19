# Schema do Banco de Dados - TokenSync

## 📋 Visão Geral

O banco de dados utiliza PostgreSQL com Prisma ORM. Este documento descreve todas as tabelas e relacionamentos.

## 🗃️ Diagrama ER (Simplificado)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │────┤│     Project     │────┤│     Token       │
│                 │  1:N│                 │  1:N│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               │1:N                     │
                               ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   Component     │────┤│  TokenHistory   │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
                               │
                               │1:N
                               ▼
                        ┌─────────────────┐
                        │ComponentVariant │
                        │                 │
                        └─────────────────┘
```

## 📝 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  MEMBER
  VIEWER
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
}

enum TokenType {
  COLOR
  SPACING
  TYPOGRAPHY
  BORDER
  SHADOW
  ANIMATION
  Z_INDEX
  OPACITY
}

enum ComponentCategory {
  FUNDAMENTAIS
  FEEDBACK
  LAYOUT
  NAVEGACAO
  DADOS
}

enum ChangeOrigin {
  MANUAL
  FIGMA
  AUTOMATION
  AI
}

enum ChangeType {
  TOKEN_CREATED
  TOKEN_EDITED
  TOKEN_REMOVED
  COMPONENT_UPDATED
  FIGMA_SYNC
  DIVERGENCE_RESOLVED
  ROLLBACK
}

enum DivergenceStatus {
  PENDING
  RESOLVED_LOCAL
  RESOLVED_FIGMA
}

enum ScenarioStatus {
  DRAFT
  SIMULATED
  APPLIED
  DISCARDED
}

enum BenchmarkType {
  COMPETITOR
  REFERENCE
}

// ============================================
// MODELS
// ============================================

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String?   // Null quando usa OAuth
  name              String
  avatarUrl         String?
  
  // OAuth
  googleId          String?   @unique
  githubId          String?   @unique
  
  // Figma Integration
  figmaAccessToken  String?
  figmaRefreshToken String?
  figmaUserId       String?
  figmaExpiresAt    DateTime?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?
  
  // Relations
  projects          ProjectMember[]
  ownedProjects     Project[]       @relation("ProjectOwner")
  changes           VersionHistory[]
  aiConversations   AIConversation[]
  
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@map("refresh_tokens")
}

model Project {
  id              String        @id @default(uuid())
  name            String
  description     String?
  status          ProjectStatus @default(ACTIVE)
  
  // Figma
  figmaFileId     String?
  figmaFileName   String?
  figmaLastSyncAt DateTime?
  
  // Settings (JSON)
  settings        Json          @default("{}")
  
  // Owner
  ownerId         String
  owner           User          @relation("ProjectOwner", fields: [ownerId], references: [id])
  
  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Relations
  members         ProjectMember[]
  tokens          Token[]
  components      Component[]
  versionHistory  VersionHistory[]
  divergences     Divergence[]
  scenarios       Scenario[]
  automations     Automation[]
  benchmarks      Benchmark[]
  aiConversations AIConversation[]
  
  @@map("projects")
}

model ProjectMember {
  id        String   @id @default(uuid())
  role      UserRole @default(MEMBER)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([userId, projectId])
  @@map("project_members")
}

model Token {
  id               String    @id @default(uuid())
  name             String
  value            String
  type             TokenType
  category         String
  description      String?
  
  // Figma
  figmaVariableId  String?
  figmaLastValue   String?   // Último valor conhecido do Figma
  
  // Metadata (JSON)
  metadata         Json      @default("{}")
  
  // Project
  projectId        String
  project          Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  history          TokenHistory[]
  componentTokens  ComponentToken[]
  divergences      Divergence[]
  scenarioChanges  ScenarioChange[]
  
  @@unique([projectId, name])
  @@index([projectId, type])
  @@index([projectId, category])
  @@map("tokens")
}

model TokenHistory {
  id          String       @id @default(uuid())
  action      String       // created, updated, deleted
  
  // Changes (JSON)
  changes     Json         // { field: { before, after } }
  
  origin      ChangeOrigin
  
  tokenId     String
  token       Token        @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  
  userId      String?
  user        User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime     @default(now())
  
  @@index([tokenId])
  @@map("token_history")
}

model Component {
  id              String            @id @default(uuid())
  name            String
  description     String?
  category        ComponentCategory
  
  // Figma
  figmaComponentId String?
  figmaNodeId      String?
  
  // Preview
  previewUrl      String?
  
  // Project
  projectId       String
  project         Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  // Relations
  variants        ComponentVariant[]
  tokens          ComponentToken[]
  
  @@unique([projectId, name])
  @@index([projectId, category])
  @@map("components")
}

model ComponentVariant {
  id          String    @id @default(uuid())
  name        String
  
  // Tokens used (JSON)
  tokens      Json      @default("{}")
  
  // Props/States (JSON)
  props       Json      @default("{}")
  
  // Preview
  previewUrl  String?
  
  componentId String
  component   Component @relation(fields: [componentId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([componentId, name])
  @@map("component_variants")
}

model ComponentToken {
  id          String    @id @default(uuid())
  property    String    // backgroundColor, color, padding, etc.
  
  componentId String
  component   Component @relation(fields: [componentId], references: [id], onDelete: Cascade)
  
  tokenId     String
  token       Token     @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  
  @@unique([componentId, property])
  @@map("component_tokens")
}

model Divergence {
  id          String           @id @default(uuid())
  status      DivergenceStatus @default(PENDING)
  
  localValue  String
  figmaValue  String
  
  resolvedAt  DateTime?
  resolution  String?          // keep_local, use_figma
  
  tokenId     String
  token       Token            @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  
  projectId   String
  project     Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  @@index([projectId, status])
  @@map("divergences")
}

model VersionHistory {
  id              String       @id @default(uuid())
  type            ChangeType
  summary         String
  
  // Changes details (JSON)
  changes         Json         @default("{}")
  
  // Affected items
  affectedItems   String[]     @default([])
  
  origin          ChangeOrigin
  
  projectId       String
  project         Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  userId          String?
  user            User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  createdAt       DateTime     @default(now())
  
  @@index([projectId])
  @@index([projectId, type])
  @@map("version_history")
}

model Scenario {
  id          String         @id @default(uuid())
  name        String
  description String?
  status      ScenarioStatus @default(DRAFT)
  
  // Impact analysis (JSON)
  impact      Json?
  
  // Simulation results (JSON)
  simulation  Json?
  
  projectId   String
  project     Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  appliedAt   DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  
  // Relations
  changes     ScenarioChange[]
  
  @@index([projectId, status])
  @@map("scenarios")
}

model ScenarioChange {
  id            String   @id @default(uuid())
  proposedValue String
  
  scenarioId    String
  scenario      Scenario @relation(fields: [scenarioId], references: [id], onDelete: Cascade)
  
  tokenId       String
  token         Token    @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime @default(now())
  
  @@unique([scenarioId, tokenId])
  @@map("scenario_changes")
}

model Automation {
  id          String   @id @default(uuid())
  name        String
  description String?
  category    String   // sync, accessibility, consistency, cleanup
  enabled     Boolean  @default(false)
  
  // Configuration (JSON)
  config      Json     @default("{}")
  
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  lastRunAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([projectId, name])
  @@map("automations")
}

model Benchmark {
  id           String        @id @default(uuid())
  name         String
  type         BenchmarkType
  competitor   String?
  
  // Image
  imageUrl     String
  thumbnailUrl String?
  
  // AI Analysis (JSON)
  analysis     Json?
  
  projectId    String
  project      Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  analyzedAt   DateTime?
  createdAt    DateTime      @default(now())
  
  @@index([projectId, type])
  @@map("benchmarks")
}

model AIConversation {
  id        String      @id @default(uuid())
  
  projectId String
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  // Relations
  messages  AIMessage[]
  
  @@index([projectId, userId])
  @@map("ai_conversations")
}

model AIMessage {
  id             String         @id @default(uuid())
  role           String         // user, assistant
  content        String
  
  // Context (JSON)
  context        Json?
  
  // Suggestions (JSON)
  suggestions    Json?
  
  conversationId String
  conversation   AIConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime       @default(now())
  
  @@index([conversationId])
  @@map("ai_messages")
}

// ============================================
// AUDIT & SYSTEM
// ============================================

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  entity    String
  entityId  String
  userId    String?
  ipAddress String?
  userAgent String?
  details   Json?
  createdAt DateTime @default(now())
  
  @@index([entity, entityId])
  @@index([userId])
  @@map("audit_logs")
}

model SystemSetting {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
  
  @@map("system_settings")
}
```

## 🔑 Índices Importantes

### Performance
- `tokens(projectId, type)` - Filtragem por tipo
- `tokens(projectId, category)` - Filtragem por categoria
- `version_history(projectId)` - Timeline do projeto
- `divergences(projectId, status)` - Divergências pendentes

### Unicidade
- `users(email)` - Email único
- `tokens(projectId, name)` - Nome único por projeto
- `components(projectId, name)` - Nome único por projeto
- `project_members(userId, projectId)` - Membro único por projeto

## 📊 Queries Comuns

### Buscar Tokens com Uso em Componentes
```sql
SELECT 
  t.id,
  t.name,
  t.value,
  t.type,
  COUNT(ct.id) as usage_count,
  array_agg(DISTINCT c.name) as used_by_components
FROM tokens t
LEFT JOIN component_tokens ct ON ct.token_id = t.id
LEFT JOIN components c ON c.id = ct.component_id
WHERE t.project_id = $1
GROUP BY t.id
ORDER BY usage_count DESC;
```

### Timeline de Alterações
```sql
SELECT 
  vh.*,
  u.name as user_name
FROM version_history vh
LEFT JOIN users u ON u.id = vh.user_id
WHERE vh.project_id = $1
ORDER BY vh.created_at DESC
LIMIT 50;
```

### Divergências Pendentes
```sql
SELECT 
  d.*,
  t.name as token_name,
  t.type as token_type
FROM divergences d
JOIN tokens t ON t.id = d.token_id
WHERE d.project_id = $1
  AND d.status = 'PENDING'
ORDER BY d.created_at DESC;
```

## 🔄 Migrations

### Criar Migration
```bash
npx prisma migrate dev --name <migration_name>
```

### Aplicar em Produção
```bash
npx prisma migrate deploy
```

### Reset (Desenvolvimento)
```bash
npx prisma migrate reset
```

## 🌱 Seeds

### seed.ts
```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tokensync.com' },
    update: {},
    create: {
      email: 'admin@tokensync.com',
      password: adminPassword,
      name: 'Admin User',
    },
  });

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-id' },
    update: {},
    create: {
      id: 'sample-project-id',
      name: 'Design System Principal',
      description: 'Sistema de design principal',
      ownerId: admin.id,
    },
  });

  // Create sample tokens
  const tokenTypes = [
    { name: 'color/primary-500', value: '#6BA5E7', type: 'COLOR', category: 'Colors' },
    { name: 'color/accent-400', value: '#F0E4C8', type: 'COLOR', category: 'Colors' },
    { name: 'spacing/md', value: '16px', type: 'SPACING', category: 'Layout' },
    { name: 'spacing/lg', value: '24px', type: 'SPACING', category: 'Layout' },
    { name: 'font/heading', value: 'Inter', type: 'TYPOGRAPHY', category: 'Typography' },
    { name: 'radius/md', value: '0.75rem', type: 'BORDER', category: 'Borders' },
    { name: 'shadow/soft', value: '0 4px 12px rgba(0,0,0,0.06)', type: 'SHADOW', category: 'Effects' },
  ];

  for (const token of tokenTypes) {
    await prisma.token.upsert({
      where: { projectId_name: { projectId: project.id, name: token.name } },
      update: {},
      create: {
        ...token,
        type: token.type as any,
        projectId: project.id,
      },
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Executar Seeds
```bash
npx prisma db seed
```

---

*Documento atualizado em: Dezembro 2024*
