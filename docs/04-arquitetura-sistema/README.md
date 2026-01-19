# Arquitetura do Sistema

Documentos de arquitetura e decisoes tecnicas do TokenSync.

## ADR - Architecture Decision Records

Cada decisao de arquitetura segue o padrao: `ADR-{NUMERO}-{titulo}.md`

### Estrutura de um ADR

1. **Titulo**: Decisao tomada
2. **Status**: Proposto | Aceito | Depreciado | Substituido
3. **Contexto**: Problema ou necessidade
4. **Decisao**: O que foi decidido
5. **Consequencias**: Impactos positivos e negativos
6. **Alternativas Consideradas**: Outras opcoes avaliadas

## Diagramas

- Diagramas C4 (Contexto, Container, Componente)
- Diagramas de sequencia
- Diagramas de implantacao

## Stack Tecnologico

### Backend
- NestJS (Node.js)
- Prisma ORM
- PostgreSQL
- Redis (cache)
- JWT Authentication

### Frontend
- React + Vite
- shadcn/ui
- TailwindCSS
- React Query
