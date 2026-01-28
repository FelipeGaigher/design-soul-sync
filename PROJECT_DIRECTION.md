# TokenSync - Direção do Projeto

## Visão Geral

O TokenSync é uma plataforma para **gerenciar Design Systems**, importar projetos do Figma, visualizar componentes organizados por categorias, e **gerar código** para diferentes frameworks (React, Vue, Angular).

---

## Módulos do Sistema

### 1. Dashboard
Visão geral do sistema com informações principais:
- Componentes novos adicionados recentemente
- Variações detectadas em projetos
- Última alteração (quem fez + cargo: UX/Frontend)
- Projeto mais consistente (menos divergências)
- Alertas e notificações

### 2. Projetos
Gestão de projetos divididos por empresas:
- Lista de projetos por empresa
- Visualização de componentes por categoria:
  - Navbar
  - Menu
  - Buttons
  - Colors
  - Typography
  - Inputs
  - Dropdown
  - Cards
  - Modals
  - Tables
  - Forms
  - Icons
- Código de cada componente (React, Vue, Angular)
- Importação do Figma

### 3. Usuários
Cadastro e gestão de usuários:
- CRUD de usuários
- Cargos (UX Designer, Frontend Developer, Admin)
- Permissões:
  - Visualizar componentes
  - Editar componentes
  - Excluir componentes
  - Importar do Figma
  - Gerenciar usuários

### 4. Configurações
- Tema: Light / Dark mode
- Preferências do usuário
- Configurações da empresa

---

## Estrutura de Navegação

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] TokenSync                      [Theme] [User Menu]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sidebar:                                                   │
│  ─────────                                                  │
│  📊 Dashboard                                               │
│  📁 Projetos                                                │
│  👥 Usuários                                                │
│  ⚙️ Configurações                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Telas

### Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 12           │ │ 3            │ │ 98%          │        │
│  │ Novos Comp.  │ │ Variações    │ │ Consistência │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  Última Alteração                                           │
│  ─────────────────────────────────────────────────────────  │
│  👤 João Silva (Frontend) alterou Button/Primary            │
│     há 2 horas | Projeto: DS Principal                      │
│                                                             │
│  👤 Maria Santos (UX Designer) adicionou Card/Header        │
│     há 5 horas | Projeto: E-commerce                        │
│                                                             │
│  Projeto Mais Consistente                                   │
│  ─────────────────────────────────────────────────────────  │
│  🏆 DS Principal - 98% dos componentes sincronizados        │
│                                                             │
│  Alertas                                                    │
│  ─────────────────────────────────────────────────────────  │
│  ⚠️ 2 componentes com divergência no projeto Mobile         │
│  🔴 1 componente quebrado no projeto E-commerce             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Projetos
```
┌─────────────────────────────────────────────────────────────┐
│  Projetos                            [+ Importar Figma]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Empresa: [Todas ▼]                                         │
│                                                             │
│  🏢 Empresa A                                               │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────────┐ ┌─────────────────┐                   │
│  │ DS Principal    │ │ DS Mobile       │                   │
│  │ 24 componentes  │ │ 18 componentes  │                   │
│  │ ✅ 98%          │ │ ⚠️ 85%          │                   │
│  └─────────────────┘ └─────────────────┘                   │
│                                                             │
│  🏢 Empresa B                                               │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────────┐                                       │
│  │ E-commerce DS   │                                       │
│  │ 32 componentes  │                                       │
│  │ ✅ 95%          │                                       │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visualização do Projeto
```
┌─────────────────────────────────────────────────────────────┐
│  ← DS Principal                          [Sincronizar]      │
│  🏢 Empresa A                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Categorias          │  Componente: Button                  │
│  ─────────────────── │  ──────────────────────────────────  │
│  ▼ Buttons (4)       │                                      │
│    • Primary    ←    │  ┌────────────────────────────────┐  │
│    • Secondary       │  │      [Preview do botão]        │  │
│    • Outline         │  └────────────────────────────────┘  │
│    • Ghost           │                                      │
│  ▶ Typography (8)    │  Framework: [React ▼]                │
│  ▶ Colors (12)       │                                      │
│  ▶ Inputs (6)        │  ┌────────────────────────────────┐  │
│  ▶ Navbar (2)        │  │ export const Button = () => {} │  │
│  ▶ Menu (3)          │  └────────────────────────────────┘  │
│  ▶ Dropdown (2)      │                        [Copiar]      │
│  ▶ Cards (5)         │                                      │
│  ▶ Modals (3)        │  Última alteração:                   │
│  ▶ Tables (2)        │  João Silva (Frontend) - 2h atrás    │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### Usuários
```
┌─────────────────────────────────────────────────────────────┐
│  Usuários                                [+ Novo Usuário]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 👤 João Silva                                           ││
│  │    Frontend Developer                                   ││
│  │    joao@empresa.com                                     ││
│  │    Permissões: Visualizar, Editar                       ││
│  │                                         [Editar] [🗑️]   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 👤 Maria Santos                                         ││
│  │    UX Designer                                          ││
│  │    maria@empresa.com                                    ││
│  │    Permissões: Visualizar, Editar, Importar             ││
│  │                                         [Editar] [🗑️]   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 👤 Admin                                                ││
│  │    Administrador                                        ││
│  │    admin@empresa.com                                    ││
│  │    Permissões: Todas                                    ││
│  │                                         [Editar]        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Categorias de Componentes

| Categoria | Descrição | Exemplos |
|-----------|-----------|----------|
| Navbar | Barras de navegação | TopNav, BottomNav |
| Menu | Menus e navegação | SideMenu, DropdownMenu |
| Buttons | Botões | Primary, Secondary, Ghost, Icon |
| Colors | Paleta de cores | Primary, Secondary, Neutral, Semantic |
| Typography | Tipografia | Headings, Body, Labels |
| Inputs | Campos de entrada | Text, Number, Password, Search |
| Dropdown | Seletores | Select, Combobox, MultiSelect |
| Cards | Cartões | Card, CardHeader, CardContent |
| Modals | Janelas modais | Dialog, Alert, Confirm |
| Tables | Tabelas | Table, DataGrid |
| Forms | Formulários | Form, FormField, FormActions |
| Icons | Ícones | IconButton, IconSet |

---

## Cargos e Permissões

### Cargos
| Cargo | Descrição |
|-------|-----------|
| Admin | Acesso total ao sistema |
| UX Designer | Foco em design e importação |
| Frontend Developer | Foco em código e componentes |
| Viewer | Apenas visualização |

### Permissões
| Permissão | Admin | UX Designer | Frontend | Viewer |
|-----------|-------|-------------|----------|--------|
| Visualizar componentes | ✅ | ✅ | ✅ | ✅ |
| Editar componentes | ✅ | ✅ | ✅ | ❌ |
| Excluir componentes | ✅ | ❌ | ❌ | ❌ |
| Importar do Figma | ✅ | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ |
| Gerenciar empresas | ✅ | ❌ | ❌ | ❌ |

---

## Rotas da Aplicação

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Dashboard | Visão geral do sistema |
| `/projects` | Projetos | Lista de projetos por empresa |
| `/projects/:id` | Projeto | Visualização de componentes |
| `/users` | Usuários | Gestão de usuários |
| `/settings` | Configurações | Tema e preferências |
| `/login` | Login | Autenticação |

---

## Tema: Light / Dark Mode

O sistema suporta dois temas:

### Light Mode
- Background: `#ffffff`
- Text: `#1a1a1a`
- Primary: `#3b82f6`
- Muted: `#f5f5f5`

### Dark Mode
- Background: `#0a0a0a`
- Text: `#fafafa`
- Primary: `#3b82f6`
- Muted: `#262626`

Toggle no header para alternar entre os temas.

---

## API Endpoints

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/stats` | Estatísticas gerais |
| GET | `/api/dashboard/recent-changes` | Últimas alterações |
| GET | `/api/dashboard/alerts` | Alertas ativos |

### Projetos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/projects` | Listar projetos |
| POST | `/api/projects` | Criar projeto |
| GET | `/api/projects/:id` | Detalhes do projeto |
| GET | `/api/projects/:id/components` | Componentes do projeto |
| POST | `/api/projects/:id/import` | Importar do Figma |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listar usuários |
| POST | `/api/users` | Criar usuário |
| PATCH | `/api/users/:id` | Atualizar usuário |
| DELETE | `/api/users/:id` | Excluir usuário |
| PATCH | `/api/users/:id/permissions` | Atualizar permissões |

### Empresas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/companies` | Listar empresas |
| POST | `/api/companies` | Criar empresa |
| PATCH | `/api/companies/:id` | Atualizar empresa |
| DELETE | `/api/companies/:id` | Excluir empresa |

---

## Próximos Passos

### Fase 1: Estrutura Base
- [x] Documento de direção atualizado
- [x] Sidebar com navegação correta
- [x] Dashboard com estatísticas
- [x] Tema light/dark mode

### Fase 2: Projetos
- [x] Lista de projetos por empresa
- [x] Visualização de componentes por categoria
- [x] Geração de código (React, Vue, Angular)
- [x] Importação do Figma
- [x] Ação de visualizar projeto (ver componentes e código)
- [x] Remover campo 'tokens' do card (Figma não permite ler tokens)
- [x] Visualização de propriedades detalhadas dos componentes

### Fase 3: Usuários
- [ ] CRUD de usuários
- [ ] Sistema de permissões
- [ ] Cargos

### Fase 4: Refinamentos
- [ ] Histórico de alterações
- [ ] Alertas e notificações
- [ ] Consistência de projetos

---

## Melhorias Implementadas (Janeiro 2026)

### 1. Ação de Visualizar Projetos
- Adicionada opção "Visualizar" no menu dropdown dos cards de projeto
- Redireciona para `/design-system/:id` com visualização completa dos componentes
- Mantém ações de Editar e Deletar existentes

### 2. Remoção do Campo Tokens
- Removido contador de tokens do card de projetos
- Substituído por contador de divergências (mais útil para monitoramento)
- Stats globais agora mostram: Projetos, Componentes, Sincronizados, Divergências

### 3. Parser do Figma Melhorado
O parser agora extrai propriedades completas dos componentes:

**Propriedades Visuais:**
- Fills (cores sólidas, gradientes, imagens)
- Strokes (cor, peso, posição, dash pattern)
- Effects (sombras, blur)

**Tipografia:**
- Font family, size, weight, style
- Line height, letter spacing
- Alinhamento, decoração, case

**Layout:**
- Dimensões (width, height, min/max)
- Corner radius (uniform ou individual)
- Auto Layout (direction, padding, spacing)
- Constraints

**Estrutura:**
- Textos filhos com estilos
- Ícones encontrados
- Elementos filhos (até 5 níveis de profundidade)
- Propriedades de variantes

### 4. Página de Visualização de Componentes
Nova visualização com 3 abas:
- **Preview**: Imagem do componente do Figma
- **Propriedades**: Todas as propriedades detalhadas
- **Código**: Código gerado (React, Vue, Angular)

Painel de propriedades mostra:
- Dimensões com valores em pixels
- Fills com preview de cor e valor hex
- Strokes com cor, peso e posição
- Effects com tipo, cor, offset, radius
- Border radius (uniform ou por canto)
- Auto Layout com direction, gap, padding
- Textos com fonte, tamanho, peso, espaçamento
- Ícones encontrados
- Variantes disponíveis
- Elementos filhos

### 5. Design System Interno do TokenSync
Criado projeto "TokenSync Design System" com:
- 57+ tokens (cores, spacing, typography, shadows)
- 27 componentes organizados por categoria
- Variantes com propriedades detalhadas
- Dados de exemplo para demonstração

**Componentes incluídos:**
- BUTTONS: Button (5 variantes)
- FORM_CONTROLS: Input, Checkbox, Switch, Select, Radio
- FEEDBACK: Alert, Badge, Toast, Progress, Spinner
- LAYOUT: Card, Dialog, Tabs, Accordion, Separator
- NAVIGATION: Breadcrumb, Sidebar, Pagination, Menu
- DATA_DISPLAY: Table, Avatar, List
- MEDIA: Icon
- FOUNDATION: Typography/Heading, Typography/Body

---

## Limitações Conhecidas

### Figma API
- **Tokens**: O Figma não expõe tokens/variáveis existentes via API REST
- **Apenas componentes publicados são detectados**
- **Imagens de preview podem não estar disponíveis para todos os componentes**

### Geração de Código
- O código gerado é um template baseado nas propriedades
- Não representa o código exato do componente
- Útil como ponto de partida para implementação
