# TokenSync

> **Conecte Design System ao Código**

TokenSync é uma plataforma completa para sincronização de Design Systems com código, transformando tokens e componentes do Figma em código pronto para produção.

## 📋 Visão Geral

TokenSync elimina a lacuna entre design e desenvolvimento, permitindo que equipes sincronizem automaticamente seus Design Systems do Figma para múltiplos formatos de código. Com recursos empresariais como versionamento, automação e assistente IA, TokenSync garante consistência e qualidade em toda a stack de desenvolvimento.

### Principais Benefícios

- 🔄 **Sincronização Bidirecional**: Mantenha Figma e código sempre sincronizados
- 🎨 **Gerenciamento de Tokens**: Gerencie 247+ tokens em 8 categorias (cores, tipografia, espaçamento, efeitos)
- 🧩 **Biblioteca de Componentes**: 46+ componentes com 127+ variantes
- 📦 **Exportação Multi-Framework**: React, Vue, Angular e Vanilla JS
- 🤖 **IA Integrada**: Assistente inteligente e análise automatizada
- 📊 **Versionamento Completo**: Histórico completo com capacidade de rollback
- 🎯 **Cenários de Teste**: Simule mudanças antes de aplicar
- 🔍 **Benchmark de Concorrentes**: Analise UIs de competidores com IA

## 🚀 Funcionalidades

### 1. Gerenciamento de Tokens

Crie, edite e organize tokens de design de forma visual e intuitiva:

- **Categorias Suportadas**: Cores, Tipografia, Espaçamento, Bordas, Sombras, Animações, Z-index, Opacidade
- **Visualizações**: Cards visuais ou tabela detalhada
- **Busca e Filtros**: Encontre tokens rapidamente
- **Cobertura**: 98% dos componentes mapeados para tokens

### 2. Sincronização com Figma

Mantenha design e código em perfeita harmonia:

- Importação automática de variáveis do Figma
- Detecção de divergências em tempo real
- Resolução visual de conflitos
- Suporte para múltiplos projetos
- Rastreamento de mudanças

### 3. Biblioteca de Componentes

Organize e gerencie seus componentes:

**Categorias Disponíveis:**
- **Fundamentais**: Button, Input, Checkbox, Radio, Select, Switch, Slider
- **Feedback**: Alert, Toast, Badge, Progress, Skeleton, Spinner
- **Layout**: Card, Dialog, Drawer, Sheet, Accordion, Tabs, Separator
- **Navegação**: Breadcrumb, Menu, Sidebar, Pagination, Command
- **Dados**: Table, DataGrid, Chart, Avatar, Calendar

### 4. Geração de Código

Exporte seu Design System em múltiplos formatos:

**Formatos de Exportação:**
- 📄 JSON (Design Tokens)
- 🎨 CSS Variables
- ⚙️ Tailwind Config
- ⚛️ React Components
- 📘 TypeScript Types

**Frameworks Suportados:**
- React
- Vue
- Angular
- Vanilla JavaScript

**Convenções de Nomenclatura:**
- camelCase
- kebab-case
- snake_case

### 5. Versionamento e Histórico

Rastreie todas as mudanças no seu Design System:

- Timeline completa de alterações
- Comparações antes/após
- Rastreamento de origem (Manual, Figma, Automação, IA)
- Visualização de impacto em componentes
- Capacidade de rollback

### 6. Cenários e Automação

**Cenários:**
- Simule mudanças antes de aplicar
- Análise de impacto com IA
- Validação de acessibilidade
- Visualização before/after

**Regras de Automação:**
- 🔄 **Sincronização**: Auto-sync com Figma, propagação de mudanças
- ♿ **Acessibilidade**: Validação WCAG, contraste, tamanhos mínimos
- ✅ **Consistência**: Detecção de duplicatas, tokens órfãos
- 🧹 **Limpeza**: Remoção de tokens não utilizados, consolidação

### 7. Benchmark de Concorrentes

Analise UIs de competidores com IA:

- Upload de screenshots
- Detecção automática de componentes
- Análise de padrões e cores
- Organização por concorrente
- Geração de diagramas de fluxo

### 8. Assistente IA

Chat inteligente integrado:

- Responde dúvidas sobre Design System
- Contextualizado com seu projeto
- Sugestões de ações rápidas
- Guia workflows complexos

## 🛠️ Stack Tecnológica

### Core

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Linguagem**: TypeScript 5.8.3
- **Roteamento**: React Router DOM 6.30.1

### UI & Styling

- **CSS Framework**: Tailwind CSS 3.4.17
- **Componentes**: shadcn/ui (Radix UI)
- **Ícones**: Lucide React 0.462.0
- **Tema**: next-themes 0.3.0
- **Notificações**: Sonner 1.7.4

### Data & Forms

- **State Management**: TanStack React Query 5.83.0
- **Formulários**: React Hook Form 7.61.1
- **Validação**: Zod 3.25.76
- **Gráficos**: Recharts 2.15.4
- **Datas**: date-fns 3.6.0

### Development

- **Linting**: ESLint 9.32.0
- **Compiler**: SWC
- **Package Manager**: npm/bun

## 📁 Estrutura do Projeto

```
design-soul-sync/
├── src/
│   ├── components/
│   │   ├── ui/              # 50+ componentes shadcn/ui
│   │   ├── layout/          # AppLayout, Sidebar, TopBar
│   │   ├── tokens/          # Gerenciamento de tokens
│   │   ├── components/      # Biblioteca de componentes
│   │   ├── figma/           # Sincronização Figma
│   │   └── benchmark/       # Análise de concorrentes
│   ├── pages/               # 14 páginas principais
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilitários e helpers
│   ├── App.tsx              # Configuração de rotas
│   ├── main.tsx             # Entry point
│   └── index.css            # Tokens CSS
├── public/                  # Assets estáticos
├── docs/                    # Documentação
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── components.json
```

## 🚦 Como Funciona

### Fluxo Completo: Figma → Código

```
1. Conectar Projeto Figma
   ↓
2. Importar Variáveis do Figma
   ↓
3. Gerenciar Tokens Localmente
   ↓
4. Detectar & Resolver Divergências
   ↓
5. Mapear Componentes → Tokens
   ↓
6. (Opcional) Criar Cenário de Teste
   ↓
7. Exportar Código
   ↓
8. Integrar no Projeto
```

### Passo a Passo Detalhado

#### 1. Conectar Figma
- Acesse a página de Variáveis Figma
- Selecione ou conecte seu projeto Figma
- Sistema importa automaticamente todas as variáveis

#### 2. Gerenciar Tokens
- Visualize tokens importados na página Tokens
- Crie novos tokens manualmente
- Edite valores e metadados
- Organize por categorias

#### 3. Sincronização
- Sistema monitora mudanças no Figma
- Detecta divergências automaticamente
- Resolva conflitos via interface visual
- Escolha manter versão local ou Figma

#### 4. Componentes
- Veja todos os componentes mapeados
- Verifique quais tokens cada componente usa
- Analise impacto de mudanças
- Gerencie variantes

#### 5. Versionamento
- Todas as mudanças são registradas
- Visualize histórico completo
- Compare before/after
- Rollback quando necessário

#### 6. Cenários (Opcional)
- Crie cenário para testar mudanças
- IA analisa impacto e acessibilidade
- Visualize preview
- Aplique ou descarte

#### 7. Gerar Código
- Acesse o Gerador de Código
- Selecione o que exportar
- Escolha framework e convenção
- Copie ou baixe como ZIP

## 💻 Instalação e Uso

### Pré-requisitos

- Node.js 18+ ou Bun
- npm ou yarn ou bun

### Instalação

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>

# Entre no diretório
cd design-soul-sync

# Instale as dependências
npm install
# ou
bun install

# Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

A aplicação estará disponível em `http://localhost:8080`

### Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento (porta 8080)
npm run build        # Build de produção
npm run build:dev    # Build de desenvolvimento
npm run lint         # Executa linting
npm run preview      # Preview do build de produção
```

### Configuração

1. **Conexão com Figma**: Configure suas credenciais do Figma nas configurações
2. **Projetos**: Adicione seus projetos na página de projetos
3. **Tokens**: Importe ou crie seus tokens iniciais
4. **Componentes**: Configure sua biblioteca de componentes

## 🎨 Design System Integrado

TokenSync já vem com um Design System completo:

### Paleta de Cores (Modo Claro)

- **Primary**: `#6BA5E7` (azul suave)
- **Accent**: `#F0E4C8` (dourado pastel)
- **Background**: `#F7F9FB` (off-white)
- **Foreground**: Cinza azulado escuro

### Tipografia

- **Fonte**: Inter (Google Fonts)
- **Escala**: h1 (text-4xl), h2 (text-2xl), h3 (text-xl)

### Espaçamento

Sistema de espaçamento baseado em 8px grid com CSS variables customizadas.

### Componentes UI

50+ componentes prontos para uso baseados em shadcn/ui e Radix UI, incluindo:
- Button, Input, Checkbox, Select, Switch
- Dialog, Drawer, Sheet, Popover
- Card, Badge, Avatar, Separator
- Table, Calendar, Command Palette
- E muito mais...

## 📊 Projetos de Exemplo

TokenSync inclui dados de projetos reais como referência:

- **Fotus**: Sistema de saúde
- **Litoral Têxtil**: E-commerce têxtil
- **Onix**: Plataforma financeira
- **CPAPS**: Sistema de gestão
- **UmClique**: Marketplace
- **UserFlow**: Ferramenta de analytics

## 🎯 Casos de Uso

### Para Designers
- Mantenha controle total sobre tokens de design
- Veja impacto de mudanças antes de aplicar
- Sincronize automaticamente com o código
- Garanta consistência visual

### Para Desenvolvedores
- Exporte código pronto para usar
- Múltiplos formatos (CSS, Tailwind, React, etc.)
- TypeScript types gerados automaticamente
- Integração fácil com projetos existentes

### Para Times
- Fonte única de verdade para o Design System
- Histórico completo de mudanças
- Benchmark contra concorrentes
- Automação e validações

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga o padrão de código TypeScript/React
- Adicione testes quando aplicável
- Atualize a documentação
- Use commits semânticos

## 📝 Roadmap

- [ ] Integração com outras ferramentas de design (Sketch, Adobe XD)
- [ ] Suporte para mais frameworks (Svelte, Solid)
- [ ] API pública para integração
- [ ] Plugin do Figma nativo
- [ ] Exportação para React Native
- [ ] Suporte para Design Tokens W3C Community Group
- [ ] Integração com Storybook
- [ ] CLI para automação
- [ ] Testes visuais automatizados
- [ ] Suporte para temas múltiplos

## 🔧 Desenvolvido com Lovable

Este projeto foi desenvolvido usando [Lovable](https://lovable.dev), uma plataforma de desenvolvimento assistida por IA.

**Project URL**: https://lovable.dev/projects/17c6fd19-4140-41bc-b42f-dafaf375082a

### Deploy

Para fazer deploy do projeto:

1. Abra [Lovable](https://lovable.dev/projects/17c6fd19-4140-41bc-b42f-dafaf375082a)
2. Clique em Share → Publish

### Domínio Personalizado

Para conectar um domínio customizado:
- Navegue até Project > Settings > Domains
- Clique em Connect Domain
- Veja mais em: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🐛 Reportar Issues

Encontrou um bug ou tem uma sugestão? Abra uma issue no repositório.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Gabriel Souza**

## 🌟 Agradecimentos

- shadcn/ui pela incrível biblioteca de componentes
- Radix UI pelas primitivas acessíveis
- Figma pela inspiração e possibilidades
- Lovable pela plataforma de desenvolvimento
- Comunidade open source

---

**TokenSync** - Conectando Design e Código, um token por vez.
