# Definicao de APIs

Contratos e especificacoes de APIs do TokenSync.

## Subdiretorios

| Diretorio | Tipo | Descricao |
|-----------|------|-----------|
| [REST](./REST/) | REST APIs | Especificacoes OpenAPI/Swagger |
| [gRPC](./gRPC/) | gRPC | Definicoes Protobuf |
| [WEBHOOKS](./WEBHOOKS/) | Webhooks | Contratos de webhooks (Figma) |
| [MESSAGING](./MESSAGING/) | Mensageria | Schemas de eventos |

## Convencoes

- REST: `{module}-api.md` ou `{module}-openapi.yaml`
- gRPC: `{service}.proto.md`
- Webhooks: `{provider}-webhooks.md`
- Messaging: `{queue}-schemas.md`

## Modulos de API do TokenSync

- Auth API
- Projects API
- Tokens API
- Components API
- Figma Integration API
- Code Generator API
- Versioning API
- AI Assistant API
