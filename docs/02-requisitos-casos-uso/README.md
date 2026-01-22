# Requisitos e Casos de Uso

Casos de uso detalhados do sistema TokenSync.

## Convencao de Nomenclatura

Os casos de uso seguem o padrao: `UC-{DOMINIO}-{NUMERO}-{nome-descritivo}.md`

Dominios do TokenSync:
- **AUTH**: Autenticacao e autorizacao
- **PROJ**: Gerenciamento de projetos
- **TOKEN**: Gerenciamento de tokens
- **FIGMA**: Integracao com Figma
- **COMP**: Componentes do Design System
- **CODE**: Geracao de codigo
- **VER**: Versionamento
- **AI**: Assistente IA

Exemplo: `UC-TOKEN-001-criar-design-token.md`

## Estrutura de um Caso de Uso

Cada caso de uso deve conter:

1. Informacoes Gerais (ID, Nome, Prioridade)
2. Descricao
3. Atores
4. Pre-condicoes
5. Pos-condicoes
6. Fluxo Principal (com diagrama Mermaid)
7. Fluxos Alternativos
8. Excecoes
9. Regras de Negocio
10. Requisitos Nao-Funcionais
11. Casos de Teste
12. Dependencias

## Template

Use o comando `/create-use-case` para criar um novo caso de uso.
