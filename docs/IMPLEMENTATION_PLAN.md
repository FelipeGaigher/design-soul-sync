# 📋 Plano de Implementação - TokenSync

## Visão Geral

Este documento detalha o plano de implementação completo do TokenSync, organizado em fases incrementais. Cada fase entrega valor funcional e pode ser testada independentemente.

---

## 📊 Status Atual

### ✅ Já Implementado
- [x] Estrutura do projeto (Frontend + Backend)
- [x] Autenticação (Login/Register com JWT)
- [x] Proteção de rotas
- [x] Schema do banco de dados (Prisma)
- [x] Seed com dados de exemplo
- [x] UI base com shadcn/ui

### 🔄 Módulos do Backend Necessários
| Módulo | Status | Prioridade |
|--------|--------|------------|
| Auth | ✅ Completo | - |
| Users | ✅ Básico | - |
| Projects | ⬜ Pendente | Alta |
| Tokens | ⬜ Pendente | Alta |
| Components | ⬜ Pendente | Média |
| Figma | ⬜ Pendente | Alta |
| Code Generator | ⬜ Pendente | Média |
| Versioning | ⬜ Pendente | Média |
| Scenarios | ⬜ Pendente | Baixa |
| Automations | ⬜ Pendente | Baixa |
| Benchmark | ⬜ Pendente | Baixa |
| AI Assistant | ⬜ Pendente | Baixa |

---

## 🚀 Fase 1: Fundação (Semana 1-2)

### 1.1 Módulo de Projetos
**Backend:**
```
src/projects/
├── projects.module.ts
├── projects.controller.ts
├── projects.service.ts
└── dto/
    ├── create-project.dto.ts
    ├── update-project.dto.ts
    └── project-response.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects` | Listar projetos do usuário |
| GET | `/projects/:id` | Obter projeto por ID |
| POST | `/projects` | Criar novo projeto |
| PATCH | `/projects/:id` | Atualizar projeto |
| DELETE | `/projects/:id` | Deletar projeto |
| POST | `/projects/:id/members` | Adicionar membro |
| DELETE | `/projects/:id/members/:userId` | Remover membro |

**Frontend:**
- [ ] Conectar página `Projects.tsx` com API
- [ ] CRUD completo de projetos
- [ ] Seletor de projeto no sidebar/topbar
- [ ] Context de projeto ativo

---

### 1.2 Módulo de Tokens
**Backend:**
```
src/tokens/
├── tokens.module.ts
├── tokens.controller.ts
├── tokens.service.ts
└── dto/
    ├── create-token.dto.ts
    ├── update-token.dto.ts
    ├── bulk-tokens.dto.ts
    └── token-filters.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects/:projectId/tokens` | Listar tokens (com filtros) |
| GET | `/projects/:projectId/tokens/:id` | Obter token por ID |
| POST | `/projects/:projectId/tokens` | Criar token |
| POST | `/projects/:projectId/tokens/bulk` | Criar múltiplos tokens |
| PATCH | `/projects/:projectId/tokens/:id` | Atualizar token |
| DELETE | `/projects/:projectId/tokens/:id` | Deletar token |
| GET | `/projects/:projectId/tokens/stats` | Estatísticas de tokens |
| GET | `/projects/:projectId/tokens/history` | Histórico de mudanças |

**Frontend:**
- [ ] Conectar página `Tokens.tsx` com API
- [ ] CRUD de tokens
- [ ] Filtros por tipo/categoria
- [ ] Visualização em cards e tabela
- [ ] Dialog de detalhes do token
- [ ] Histórico de alterações

---

## 🎨 Fase 2: Integração Figma (Semana 3-4)

### 2.1 OAuth com Figma
**Backend:**
```
src/figma/
├── figma.module.ts
├── figma.controller.ts
├── figma.service.ts
├── figma-api.service.ts      # Cliente HTTP para API Figma
├── figma-mapper.service.ts   # Converte variáveis Figma → Tokens
└── dto/
    ├── figma-auth.dto.ts
    ├── figma-project.dto.ts
    └── sync-options.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/auth/figma` | Iniciar OAuth Figma |
| GET | `/auth/figma/callback` | Callback OAuth |
| GET | `/figma/projects` | Listar projetos Figma |
| GET | `/figma/projects/:fileId/variables` | Obter variáveis do arquivo |
| POST | `/figma/sync` | Sincronizar variáveis |
| GET | `/figma/status` | Status da conexão |

**Frontend:**
- [ ] Botão "Conectar Figma" no login e settings
- [ ] Página `FigmaVariables.tsx` funcional
- [ ] Seletor de projeto Figma
- [ ] Importação de variáveis
- [ ] Preview das variáveis antes de importar

---

### 2.2 Detecção de Divergências
**Backend:**
```
src/divergences/
├── divergences.module.ts
├── divergences.controller.ts
├── divergences.service.ts
└── dto/
    ├── resolve-divergence.dto.ts
    └── divergence-response.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects/:projectId/divergences` | Listar divergências |
| POST | `/projects/:projectId/divergences/:id/resolve` | Resolver divergência |
| POST | `/projects/:projectId/divergences/resolve-all` | Resolver todas |
| POST | `/projects/:projectId/sync/check` | Verificar divergências |

**Frontend:**
- [ ] Dialog de divergências (`DivergencesDialog.tsx`)
- [ ] Comparação visual local vs Figma
- [ ] Resolução individual ou em lote
- [ ] Notificações de divergências

---

## 🧩 Fase 3: Componentes & Código (Semana 5-6)

### 3.1 Módulo de Componentes
**Backend:**
```
src/components/
├── components.module.ts
├── components.controller.ts
├── components.service.ts
└── dto/
    ├── create-component.dto.ts
    ├── update-component.dto.ts
    ├── component-variant.dto.ts
    └── map-tokens.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects/:projectId/components` | Listar componentes |
| GET | `/projects/:projectId/components/:id` | Obter componente |
| POST | `/projects/:projectId/components` | Criar componente |
| PATCH | `/projects/:projectId/components/:id` | Atualizar componente |
| DELETE | `/projects/:projectId/components/:id` | Deletar componente |
| POST | `/projects/:projectId/components/:id/variants` | Adicionar variante |
| POST | `/projects/:projectId/components/:id/tokens` | Mapear tokens |
| GET | `/projects/:projectId/components/stats` | Estatísticas |

**Frontend:**
- [ ] Conectar página `Components.tsx` com API
- [ ] CRUD de componentes
- [ ] Gerenciamento de variantes
- [ ] Mapeamento visual de tokens
- [ ] Preview de componentes

---

### 3.2 Gerador de Código
**Backend:**
```
src/code-generator/
├── code-generator.module.ts
├── code-generator.controller.ts
├── code-generator.service.ts
├── generators/
│   ├── json.generator.ts
│   ├── css.generator.ts
│   ├── tailwind.generator.ts
│   ├── react.generator.ts
│   ├── typescript.generator.ts
│   └── base.generator.ts
└── dto/
    ├── generate-code.dto.ts
    └── export-options.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/projects/:projectId/generate` | Gerar código |
| POST | `/projects/:projectId/generate/preview` | Preview do código |
| GET | `/projects/:projectId/export` | Exportar pacote ZIP |
| GET | `/generate/formats` | Listar formatos disponíveis |

**Formatos Suportados:**
- JSON (Design Tokens Format)
- CSS Variables
- SCSS Variables
- Tailwind Config
- React Components (styled-components / CSS Modules)
- TypeScript Types/Interfaces

**Frontend:**
- [ ] Conectar página `CodeGenerator.tsx` com API
- [ ] Seletor de formato e opções
- [ ] Preview de código com syntax highlight
- [ ] Botão de copiar/download
- [ ] Exportação em ZIP

---

## 📚 Fase 4: Versionamento (Semana 7)

### 4.1 Histórico de Versões
**Backend:**
```
src/versioning/
├── versioning.module.ts
├── versioning.controller.ts
├── versioning.service.ts
└── dto/
    ├── version-filters.dto.ts
    └── rollback.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects/:projectId/versions` | Listar histórico |
| GET | `/projects/:projectId/versions/:id` | Detalhes da versão |
| GET | `/projects/:projectId/versions/:id/diff` | Diff da versão |
| POST | `/projects/:projectId/versions/:id/rollback` | Fazer rollback |
| GET | `/projects/:projectId/versions/compare` | Comparar versões |

**Frontend:**
- [ ] Conectar página `Versioning.tsx` com API
- [ ] Timeline de mudanças
- [ ] Filtros por tipo/origem/usuário
- [ ] Visualização de diff
- [ ] Funcionalidade de rollback
- [ ] Impacto em componentes

---

## 🎯 Fase 5: Cenários & Automação (Semana 8)

### 5.1 Cenários de Teste
**Backend:**
```
src/scenarios/
├── scenarios.module.ts
├── scenarios.controller.ts
├── scenarios.service.ts
├── scenario-simulator.service.ts
└── dto/
    ├── create-scenario.dto.ts
    ├── scenario-change.dto.ts
    └── apply-scenario.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects/:projectId/scenarios` | Listar cenários |
| POST | `/projects/:projectId/scenarios` | Criar cenário |
| POST | `/projects/:projectId/scenarios/:id/changes` | Adicionar mudanças |
| POST | `/projects/:projectId/scenarios/:id/simulate` | Simular cenário |
| POST | `/projects/:projectId/scenarios/:id/apply` | Aplicar cenário |
| DELETE | `/projects/:projectId/scenarios/:id` | Descartar cenário |

**Frontend:**
- [ ] Conectar página `ScenariosAutomation.tsx` com API
- [ ] Criar cenários de teste
- [ ] Adicionar mudanças propostas
- [ ] Simulação com preview
- [ ] Análise de impacto
- [ ] Aplicar ou descartar

---

### 5.2 Regras de Automação
**Backend:**
```
src/automations/
├── automations.module.ts
├── automations.controller.ts
├── automations.service.ts
├── runners/
│   ├── sync-runner.ts
│   ├── accessibility-runner.ts
│   ├── consistency-runner.ts
│   └── cleanup-runner.ts
└── dto/
    ├── create-automation.dto.ts
    └── automation-config.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects/:projectId/automations` | Listar automações |
| POST | `/projects/:projectId/automations` | Criar automação |
| PATCH | `/projects/:projectId/automations/:id` | Atualizar config |
| POST | `/projects/:projectId/automations/:id/toggle` | Ativar/desativar |
| POST | `/projects/:projectId/automations/:id/run` | Executar manualmente |
| GET | `/projects/:projectId/automations/:id/logs` | Ver logs |

**Tipos de Automação:**
- 🔄 Sincronização automática com Figma
- ♿ Validação de acessibilidade (WCAG)
- ✅ Checagem de consistência
- 🧹 Limpeza de tokens não utilizados

**Frontend:**
- [ ] Lista de automações disponíveis
- [ ] Configuração de cada automação
- [ ] Toggle ativar/desativar
- [ ] Logs de execução
- [ ] Notificações de problemas

---

## 🔍 Fase 6: Benchmark & IA (Semana 9-10)

### 6.1 Benchmark de Concorrentes
**Backend:**
```
src/benchmark/
├── benchmark.module.ts
├── benchmark.controller.ts
├── benchmark.service.ts
├── image-analyzer.service.ts   # Integração com OpenAI Vision
└── dto/
    ├── upload-benchmark.dto.ts
    └── analysis-result.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects/:projectId/benchmarks` | Listar benchmarks |
| POST | `/projects/:projectId/benchmarks` | Upload de screenshot |
| POST | `/projects/:projectId/benchmarks/:id/analyze` | Analisar com IA |
| GET | `/projects/:projectId/benchmarks/:id` | Ver análise |
| DELETE | `/projects/:projectId/benchmarks/:id` | Deletar |

**Análise com IA:**
- Detecção de componentes
- Extração de cores
- Análise de tipografia
- Padrões de layout
- Sugestões de melhorias

**Frontend:**
- [ ] Conectar página `Benchmark.tsx` com API
- [ ] Upload de screenshots
- [ ] Organização por concorrente
- [ ] Visualização de análise
- [ ] Comparação com seu DS

---

### 6.2 Assistente IA
**Backend:**
```
src/ai-assistant/
├── ai-assistant.module.ts
├── ai-assistant.controller.ts
├── ai-assistant.service.ts
├── context-builder.service.ts  # Monta contexto do projeto
├── prompts/
│   ├── system-prompt.ts
│   └── action-prompts.ts
└── dto/
    ├── chat-message.dto.ts
    └── suggestion.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/projects/:projectId/ai/conversations` | Listar conversas |
| POST | `/projects/:projectId/ai/conversations` | Nova conversa |
| POST | `/projects/:projectId/ai/chat` | Enviar mensagem |
| GET | `/projects/:projectId/ai/suggestions` | Sugestões proativas |
| POST | `/projects/:projectId/ai/analyze` | Análise do DS |

**Capacidades:**
- Responder dúvidas sobre Design System
- Sugerir tokens e componentes
- Explicar divergências
- Guiar fluxos complexos
- Gerar código sob demanda

**Frontend:**
- [ ] Conectar página `AIAssistant.tsx` com API
- [ ] Interface de chat
- [ ] Sugestões de ações rápidas
- [ ] Histórico de conversas
- [ ] Feedback nas respostas

---

## 📦 Fase 7: Storage & Infra (Paralelo)

### 7.1 Upload de Arquivos
**Backend:**
```
src/storage/
├── storage.module.ts
├── storage.service.ts        # Abstração S3/MinIO
└── dto/
    └── upload.dto.ts
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/upload/image` | Upload de imagem |
| POST | `/upload/file` | Upload genérico |
| DELETE | `/upload/:key` | Deletar arquivo |

---

### 7.2 Cache com Redis
- Cache de tokens do projeto
- Cache de sessões
- Rate limiting
- Filas de jobs (sync, análise IA)

---

## 🔐 Fase 8: Segurança & Produção (Semana 11-12)

### 8.1 Melhorias de Segurança
- [ ] Rate limiting por IP/usuário
- [ ] Refresh token rotation
- [ ] Audit logs completos
- [ ] Validação de permissões por projeto
- [ ] Sanitização de inputs
- [ ] Headers de segurança (Helmet)

### 8.2 Preparação para Produção
- [ ] Variáveis de ambiente
- [ ] Docker multi-stage
- [ ] CI/CD pipeline
- [ ] Monitoramento (logs, métricas)
- [ ] Backup automatizado
- [ ] Documentação da API (Swagger)

---

## 📅 Cronograma Resumido

| Fase | Descrição | Duração | Prioridade |
|------|-----------|---------|------------|
| 1 | Projetos + Tokens | 2 semanas | 🔴 Alta |
| 2 | Integração Figma | 2 semanas | 🔴 Alta |
| 3 | Componentes + Código | 2 semanas | 🟡 Média |
| 4 | Versionamento | 1 semana | 🟡 Média |
| 5 | Cenários + Automação | 1 semana | 🟢 Baixa |
| 6 | Benchmark + IA | 2 semanas | 🟢 Baixa |
| 7 | Storage (paralelo) | - | 🟡 Média |
| 8 | Produção | 2 semanas | 🔴 Alta |

**Total estimado: 10-12 semanas**

---

## 🎯 Próximos Passos Imediatos

1. **Implementar módulo de Projetos** (Backend + Frontend)
2. **Implementar módulo de Tokens** (Backend + Frontend)
3. **Criar contexto de projeto ativo** no frontend
4. **Configurar OAuth do Figma** (obter credenciais)

---

## 📝 Notas Técnicas

### Padrões de Código
- **Backend**: NestJS com Clean Architecture
- **Frontend**: React com hooks e React Query
- **API**: RESTful com Swagger docs
- **Validação**: class-validator (backend) + Zod (frontend)

### Convenções
- Nomes de rotas em kebab-case
- DTOs com sufixos: `.dto.ts`
- Serviços com sufixo: `.service.ts`
- Responses padronizadas com paginação

### Variáveis de Ambiente Necessárias
```env
# Backend
DATABASE_URL=
JWT_SECRET=
FIGMA_CLIENT_ID=
FIGMA_CLIENT_SECRET=
OPENAI_API_KEY=
REDIS_URL=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=

# Frontend
VITE_API_URL=
```
