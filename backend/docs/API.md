# Documentação da API - TokenSync

## 📋 Visão Geral

Esta documentação descreve todos os endpoints da API REST do TokenSync. A API segue os padrões RESTful e utiliza JSON para comunicação.

## 🔐 Autenticação

Todas as requisições (exceto rotas públicas) requerem autenticação via Bearer Token.

```http
Authorization: Bearer <access_token>
```

### Obter Token de Acesso

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "sua_senha"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## 📁 Módulo: Auth

### POST /api/auth/register
Registra um novo usuário.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "User Name"
}
```

### POST /api/auth/login
Autentica um usuário.

### POST /api/auth/refresh
Renova o token de acesso.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/logout
Invalida o refresh token.

### GET /api/auth/figma
Inicia o fluxo OAuth2 com Figma.

### GET /api/auth/figma/callback
Callback do OAuth2 do Figma.

---

## 👤 Módulo: Users

### GET /api/users/me
Retorna o usuário autenticado.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": "https://...",
  "figmaConnected": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### PATCH /api/users/me
Atualiza o perfil do usuário.

**Request Body:**
```json
{
  "name": "New Name",
  "avatarUrl": "https://..."
}
```

### DELETE /api/users/me
Exclui a conta do usuário.

---

## 📂 Módulo: Projects

### GET /api/projects
Lista todos os projetos do usuário.

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página atual (default: 1) |
| limit | number | Itens por página (default: 10) |
| status | string | Filtro por status: active, archived |
| search | string | Busca por nome |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Design System Principal",
      "description": "Sistema principal da empresa",
      "status": "active",
      "figmaFileId": "abc123",
      "stats": {
        "tokensCount": 247,
        "componentsCount": 46,
        "divergences": 2
      },
      "lastSyncAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### POST /api/projects
Cria um novo projeto.

**Request Body:**
```json
{
  "name": "Novo Projeto",
  "description": "Descrição do projeto",
  "figmaFileId": "abc123"
}
```

### GET /api/projects/:id
Retorna detalhes de um projeto.

### PATCH /api/projects/:id
Atualiza um projeto.

### DELETE /api/projects/:id
Exclui um projeto (soft delete).

### POST /api/projects/:id/archive
Arquiva um projeto.

### POST /api/projects/:id/restore
Restaura um projeto arquivado.

---

## 🎨 Módulo: Tokens

### GET /api/projects/:projectId/tokens
Lista todos os tokens de um projeto.

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| type | string | Filtro por tipo: color, spacing, typography, border, shadow, animation, zIndex, opacity |
| category | string | Filtro por categoria |
| search | string | Busca por nome ou valor |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "color/primary-500",
      "value": "#6BA5E7",
      "type": "color",
      "category": "Colors",
      "description": "Cor primária principal",
      "figmaVariableId": "V:123",
      "usedBy": {
        "components": ["Button", "Badge", "Alert"],
        "count": 12
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 247,
    "byType": {
      "color": 48,
      "spacing": 24,
      "typography": 32,
      "border": 16,
      "shadow": 12
    }
  }
}
```

### POST /api/projects/:projectId/tokens
Cria um novo token.

**Request Body:**
```json
{
  "name": "color/success-500",
  "value": "#10B981",
  "type": "color",
  "category": "Colors",
  "description": "Cor de sucesso"
}
```

### GET /api/projects/:projectId/tokens/:id
Retorna detalhes de um token.

### PATCH /api/projects/:projectId/tokens/:id
Atualiza um token.

### DELETE /api/projects/:projectId/tokens/:id
Exclui um token.

### POST /api/projects/:projectId/tokens/bulk
Cria múltiplos tokens de uma vez.

**Request Body:**
```json
{
  "tokens": [
    {
      "name": "color/gray-100",
      "value": "#F3F4F6",
      "type": "color",
      "category": "Colors"
    },
    {
      "name": "color/gray-200",
      "value": "#E5E7EB",
      "type": "color",
      "category": "Colors"
    }
  ]
}
```

### GET /api/projects/:projectId/tokens/:id/history
Retorna histórico de alterações de um token.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "action": "updated",
      "changes": {
        "value": {
          "before": "#3B82F6",
          "after": "#6BA5E7"
        }
      },
      "origin": "manual",
      "user": {
        "id": "uuid",
        "name": "User Name"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🧩 Módulo: Components

### GET /api/projects/:projectId/components
Lista todos os componentes de um projeto.

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| category | string | Filtro por categoria: fundamentais, feedback, layout, navegacao, dados |
| search | string | Busca por nome |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Button",
      "description": "Botão de ação primária ou secundária",
      "category": "fundamentais",
      "variants": [
        {
          "id": "uuid",
          "name": "Primary",
          "tokens": {
            "backgroundColor": "color/primary-500",
            "textColor": "color/white"
          }
        },
        {
          "id": "uuid",
          "name": "Secondary",
          "tokens": {
            "backgroundColor": "color/secondary-500",
            "textColor": "color/gray-900"
          }
        }
      ],
      "stats": {
        "variantsCount": 8,
        "tokensUsed": 12
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/projects/:projectId/components
Cria um novo componente.

### GET /api/projects/:projectId/components/:id
Retorna detalhes de um componente.

### PATCH /api/projects/:projectId/components/:id
Atualiza um componente.

### DELETE /api/projects/:projectId/components/:id
Exclui um componente.

### POST /api/projects/:projectId/components/:id/variants
Adiciona uma variante ao componente.

**Request Body:**
```json
{
  "name": "Outline",
  "tokens": {
    "backgroundColor": "transparent",
    "borderColor": "color/primary-500",
    "textColor": "color/primary-500"
  },
  "props": {
    "disabled": false
  }
}
```

---

## 🔗 Módulo: Figma Integration

### GET /api/projects/:projectId/figma/status
Retorna status da conexão com Figma.

**Response:**
```json
{
  "connected": true,
  "fileId": "abc123",
  "fileName": "Design System",
  "lastSyncAt": "2024-01-15T10:30:00Z",
  "pendingChanges": 3
}
```

### POST /api/projects/:projectId/figma/connect
Conecta um arquivo Figma ao projeto.

**Request Body:**
```json
{
  "fileUrl": "https://www.figma.com/file/abc123/Design-System"
}
```

### POST /api/projects/:projectId/figma/sync
Sincroniza variáveis do Figma.

**Response:**
```json
{
  "success": true,
  "summary": {
    "created": 5,
    "updated": 12,
    "unchanged": 230,
    "divergences": 3
  },
  "divergences": [
    {
      "tokenId": "uuid",
      "tokenName": "color/primary-500",
      "localValue": "#6BA5E7",
      "figmaValue": "#3B82F6",
      "type": "value_mismatch"
    }
  ]
}
```

### GET /api/projects/:projectId/figma/divergences
Lista todas as divergências detectadas.

### POST /api/projects/:projectId/figma/divergences/:id/resolve
Resolve uma divergência.

**Request Body:**
```json
{
  "resolution": "keep_local" | "use_figma"
}
```

### POST /api/projects/:projectId/figma/push
Envia alterações locais para o Figma.

---

## 💻 Módulo: Code Generator

### GET /api/projects/:projectId/code/preview
Gera preview do código em um formato específico.

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| format | string | Formato: json, css, tailwind, react, typescript |
| naming | string | Convenção: camelCase, kebab-case, snake_case |

**Response:**
```json
{
  "format": "css",
  "content": ":root {\n  --color-primary-500: #6BA5E7;\n  ...\n}",
  "stats": {
    "tokens": 247,
    "components": 46,
    "lines": 523
  }
}
```

### POST /api/projects/:projectId/code/export
Exporta código completo.

**Request Body:**
```json
{
  "formats": ["json", "css", "tailwind", "react", "typescript"],
  "options": {
    "includeTokens": true,
    "includeComponents": true,
    "naming": "camelCase",
    "framework": "react"
  }
}
```

**Response:**
```json
{
  "downloadUrl": "https://storage.../export-abc123.zip",
  "expiresAt": "2024-01-15T11:30:00Z",
  "files": [
    "tokens.json",
    "tokens.css",
    "tailwind.config.js",
    "components/Button.tsx",
    "types/tokens.d.ts"
  ]
}
```

---

## 📜 Módulo: Versioning

### GET /api/projects/:projectId/versions
Lista histórico de versões/alterações.

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página atual |
| limit | number | Itens por página |
| type | string | Filtro por tipo de alteração |
| origin | string | Filtro por origem: manual, figma, automation, ai |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "token-edited",
      "summary": "Token color/primary-500 alterado",
      "date": "2024-01-15",
      "time": "14:32",
      "user": {
        "id": "uuid",
        "name": "Ana Silva"
      },
      "origin": "manual",
      "changes": {
        "before": { "value": "#3B82F6" },
        "after": { "value": "#6BA5E7" }
      },
      "affectedComponents": ["Button", "Badge", "Alert"]
    }
  ]
}
```

### POST /api/projects/:projectId/versions/:id/rollback
Reverte para uma versão anterior.

### GET /api/projects/:projectId/versions/:id/diff
Compara duas versões.

---

## 🎯 Módulo: Scenarios

### GET /api/projects/:projectId/scenarios
Lista cenários do projeto.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Nova cor primária",
      "status": "simulated",
      "changes": [
        {
          "tokenId": "uuid",
          "tokenName": "color/primary-500",
          "currentValue": "#3B82F6",
          "proposedValue": "#6BA5E7"
        }
      ],
      "impact": {
        "componentsAffected": 48,
        "tokensChanged": 3
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/projects/:projectId/scenarios
Cria um novo cenário.

**Request Body:**
```json
{
  "name": "Ajuste do spacing base",
  "changes": [
    {
      "tokenId": "uuid",
      "proposedValue": "20px"
    }
  ]
}
```

### POST /api/projects/:projectId/scenarios/:id/simulate
Executa simulação do cenário.

**Response:**
```json
{
  "impact": {
    "componentsAffected": 32,
    "tokensChanged": 5
  },
  "preview": {
    "components": [
      {
        "id": "uuid",
        "name": "Card",
        "before": "...",
        "after": "..."
      }
    ]
  },
  "accessibility": {
    "issues": [],
    "score": 100
  }
}
```

### POST /api/projects/:projectId/scenarios/:id/apply
Aplica as mudanças do cenário.

### DELETE /api/projects/:projectId/scenarios/:id
Descarta um cenário.

---

## ⚙️ Módulo: Automation

### GET /api/projects/:projectId/automations
Lista regras de automação.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Sincronizar tokens com Figma",
      "category": "sync",
      "enabled": true,
      "description": "Atualiza automaticamente quando detectar mudanças",
      "lastRun": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### PATCH /api/projects/:projectId/automations/:id
Atualiza uma regra de automação.

**Request Body:**
```json
{
  "enabled": true
}
```

### POST /api/projects/:projectId/automations/:id/run
Executa uma automação manualmente.

---

## 📊 Módulo: Benchmark

### GET /api/projects/:projectId/benchmark
Lista análises de benchmark.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Login Screen - Competitor A",
      "type": "competitor",
      "competitor": "Competitor A",
      "imageUrl": "https://storage.../image.jpg",
      "analysis": {
        "components": ["Input", "Button", "Logo"],
        "patterns": ["Center Layout", "Card Container"],
        "colors": ["#3B82F6", "#FFFFFF", "#F3F4F6"]
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/projects/:projectId/benchmark
Upload de imagem para análise.

**Request:** `multipart/form-data`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| image | file | Imagem para análise |
| type | string | competitor ou reference |
| competitor | string | Nome do concorrente (opcional) |

### GET /api/projects/:projectId/benchmark/:id/analysis
Retorna análise detalhada de uma imagem.

### DELETE /api/projects/:projectId/benchmark/:id
Remove uma imagem de benchmark.

### POST /api/projects/:projectId/benchmark/generate-flowchart
Gera fluxograma a partir das análises.

---

## 🤖 Módulo: AI Assistant

### POST /api/projects/:projectId/ai/chat
Envia mensagem para o assistente IA.

**Request Body:**
```json
{
  "message": "Como criar um token de espaçamento?",
  "context": {
    "currentPage": "tokens"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "message": "Para criar um token de espaçamento, você pode seguir estes passos:\n\n1. Acesse a página de Tokens...",
  "suggestions": [
    {
      "action": "navigate",
      "label": "Ir para Tokens",
      "path": "/tokens"
    },
    {
      "action": "create",
      "label": "Criar Token",
      "data": {
        "type": "spacing"
      }
    }
  ]
}
```

### GET /api/projects/:projectId/ai/chat/history
Retorna histórico de conversas.

### POST /api/projects/:projectId/ai/analyze
Solicita análise de IA do Design System.

**Request Body:**
```json
{
  "type": "accessibility" | "consistency" | "suggestions"
}
```

**Response:**
```json
{
  "type": "accessibility",
  "findings": [
    {
      "severity": "warning",
      "title": "Contraste insuficiente",
      "description": "O token color/gray-400 (#9CA3AF) não atende WCAG AA quando usado sobre branco",
      "affected": ["Badge", "Caption"],
      "suggestion": "Considere usar color/gray-500 (#6B7280)"
    }
  ],
  "score": 85
}
```

---

## 🔔 WebSocket Events

### Conexão

```javascript
const socket = io('wss://api.tokensync.com', {
  auth: {
    token: 'Bearer <access_token>'
  }
});
```

### Eventos

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `figma:sync:started` | Server → Client | Sincronização iniciada |
| `figma:sync:progress` | Server → Client | Progresso da sincronização |
| `figma:sync:completed` | Server → Client | Sincronização concluída |
| `figma:divergence:detected` | Server → Client | Nova divergência detectada |
| `token:updated` | Server → Client | Token foi atualizado |
| `component:updated` | Server → Client | Componente foi atualizado |

---

## 📋 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito de dados |
| 422 | Unprocessable Entity - Validação falhou |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro interno |

**Formato de Erro:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/auth/register"
}
```

---

*Documentação atualizada em: Dezembro 2024*
