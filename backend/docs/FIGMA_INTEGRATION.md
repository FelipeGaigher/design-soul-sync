# Integração com Figma - TokenSync

## 📋 Visão Geral

Este documento descreve a integração do TokenSync com a API do Figma, incluindo autenticação OAuth2, sincronização de variáveis e detecção de divergências.

## 🔐 Autenticação OAuth2

### Fluxo de Autenticação

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  Figma OAuth │
│  Click Login │     │  /auth/figma │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Backend    │◀────│   Callback   │
                     │   Save Token │     │   with code  │
                     └──────────────┘     └──────────────┘
```

### Configuração no Figma

1. Acesse [Figma Developers](https://www.figma.com/developers)
2. Crie um novo App
3. Configure:
   - **App Name**: TokenSync
   - **Website URL**: https://tokensync.com
   - **Callback URL**: https://api.tokensync.com/auth/figma/callback
   - **Scopes**: `file_read`, `file_variables:read`, `file_variables:write`

### Variáveis de Ambiente

```env
FIGMA_CLIENT_ID=your_client_id
FIGMA_CLIENT_SECRET=your_client_secret
FIGMA_REDIRECT_URI=https://api.tokensync.com/auth/figma/callback
```

### Implementação

```typescript
// src/modules/auth/strategies/figma-oauth.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FigmaOAuthStrategy extends PassportStrategy(Strategy, 'figma') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: 'https://www.figma.com/oauth',
      tokenURL: 'https://www.figma.com/api/oauth/token',
      clientID: configService.get('FIGMA_CLIENT_ID'),
      clientSecret: configService.get('FIGMA_CLIENT_SECRET'),
      callbackURL: configService.get('FIGMA_REDIRECT_URI'),
      scope: ['file_read', 'file_variables:read', 'file_variables:write'],
    });
  }

  async validate(accessToken: string, refreshToken: string): Promise<any> {
    // Fetch user info from Figma
    const response = await fetch('https://api.figma.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await response.json();

    return {
      figmaId: user.id,
      email: user.email,
      name: user.handle,
      avatarUrl: user.img_url,
      accessToken,
      refreshToken,
    };
  }
}
```

## 🔄 Sincronização de Variáveis

### API do Figma - Variables

#### Obter Variáveis de um Arquivo

```typescript
// src/modules/figma/figma.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FigmaService {
  private readonly baseUrl = 'https://api.figma.com/v1';

  constructor(private httpService: HttpService) {}

  async getFileVariables(fileId: string, accessToken: string) {
    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/files/${fileId}/variables/local`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }

  async getFileVariableCollections(fileId: string, accessToken: string) {
    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/files/${fileId}/variable_collections`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }
}
```

### Estrutura de Dados do Figma

```typescript
// Resposta da API de Variáveis
interface FigmaVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, FigmaVariableCollection>;
  };
}

interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, FigmaVariableValue>;
  remote: boolean;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: string[];
  codeSyntax: {
    WEB: string;
    ANDROID: string;
    iOS: string;
  };
}

interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: Array<{ modeId: string; name: string }>;
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
}

type FigmaVariableValue = 
  | boolean 
  | number 
  | string 
  | { r: number; g: number; b: number; a: number }  // Color
  | { type: 'VARIABLE_ALIAS'; id: string };         // Alias
```

### Mapeamento Figma → TokenSync

```typescript
// src/modules/figma/figma-mapper.service.ts
import { Injectable } from '@nestjs/common';
import { TokenType } from '@prisma/client';

@Injectable()
export class FigmaMapperService {
  mapFigmaTypeToTokenType(figmaType: string, name: string): TokenType {
    // Mapeia tipos do Figma para tipos do TokenSync
    switch (figmaType) {
      case 'COLOR':
        return TokenType.COLOR;
      case 'FLOAT':
        // Analisa o nome para determinar o tipo
        if (name.includes('spacing') || name.includes('gap') || name.includes('padding')) {
          return TokenType.SPACING;
        }
        if (name.includes('radius') || name.includes('border')) {
          return TokenType.BORDER;
        }
        if (name.includes('opacity')) {
          return TokenType.OPACITY;
        }
        if (name.includes('z-index') || name.includes('zIndex')) {
          return TokenType.Z_INDEX;
        }
        return TokenType.SPACING; // Default para números
      case 'STRING':
        if (name.includes('font') || name.includes('typography')) {
          return TokenType.TYPOGRAPHY;
        }
        if (name.includes('shadow')) {
          return TokenType.SHADOW;
        }
        if (name.includes('animation') || name.includes('transition')) {
          return TokenType.ANIMATION;
        }
        return TokenType.TYPOGRAPHY; // Default para strings
      default:
        return TokenType.COLOR;
    }
  }

  convertFigmaColorToHex(color: { r: number; g: number; b: number; a: number }): string {
    const toHex = (value: number) => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
    
    if (color.a < 1) {
      return `${hex}${toHex(color.a)}`;
    }
    
    return hex.toUpperCase();
  }

  convertFigmaValueToString(value: any, type: string): string {
    if (type === 'COLOR' && typeof value === 'object' && 'r' in value) {
      return this.convertFigmaColorToHex(value);
    }
    
    if (typeof value === 'number') {
      return `${value}px`;
    }
    
    return String(value);
  }

  inferCategoryFromName(name: string): string {
    const parts = name.split('/');
    if (parts.length > 1) {
      return this.capitalize(parts[0]);
    }
    
    // Inferir do nome
    if (name.includes('color')) return 'Colors';
    if (name.includes('spacing')) return 'Layout';
    if (name.includes('font') || name.includes('text')) return 'Typography';
    if (name.includes('radius') || name.includes('border')) return 'Borders';
    if (name.includes('shadow')) return 'Effects';
    
    return 'Other';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
```

### Serviço de Sincronização

```typescript
// src/modules/figma/figma-sync.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { FigmaService } from './figma.service';
import { FigmaMapperService } from './figma-mapper.service';

interface SyncResult {
  created: number;
  updated: number;
  unchanged: number;
  divergences: Divergence[];
}

interface Divergence {
  tokenId: string;
  tokenName: string;
  localValue: string;
  figmaValue: string;
  type: 'value_mismatch' | 'missing_local' | 'missing_figma';
}

@Injectable()
export class FigmaSyncService {
  constructor(
    private prisma: PrismaService,
    private figmaService: FigmaService,
    private mapper: FigmaMapperService,
  ) {}

  async syncProject(projectId: string, userId: string): Promise<SyncResult> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tokens: true },
    });

    if (!project?.figmaFileId) {
      throw new Error('Project not connected to Figma');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.figmaAccessToken) {
      throw new Error('User not connected to Figma');
    }

    // Buscar variáveis do Figma
    const figmaData = await this.figmaService.getFileVariables(
      project.figmaFileId,
      user.figmaAccessToken,
    );

    const figmaVariables = Object.values(figmaData.meta.variables);
    const localTokens = project.tokens;
    
    const result: SyncResult = {
      created: 0,
      updated: 0,
      unchanged: 0,
      divergences: [],
    };

    // Mapear variáveis do Figma por ID
    const figmaVarById = new Map(figmaVariables.map(v => [v.id, v]));
    const localTokenByFigmaId = new Map(
      localTokens.filter(t => t.figmaVariableId).map(t => [t.figmaVariableId, t])
    );

    // Processar variáveis do Figma
    for (const figmaVar of figmaVariables) {
      const figmaValue = this.getFigmaVariableValue(figmaVar);
      const mappedValue = this.mapper.convertFigmaValueToString(
        figmaValue,
        figmaVar.resolvedType,
      );

      const existingToken = localTokenByFigmaId.get(figmaVar.id);

      if (existingToken) {
        // Token existe localmente
        if (existingToken.value !== mappedValue) {
          // Detectar divergência
          result.divergences.push({
            tokenId: existingToken.id,
            tokenName: existingToken.name,
            localValue: existingToken.value,
            figmaValue: mappedValue,
            type: 'value_mismatch',
          });

          // Criar registro de divergência no banco
          await this.prisma.divergence.create({
            data: {
              tokenId: existingToken.id,
              projectId: projectId,
              localValue: existingToken.value,
              figmaValue: mappedValue,
              status: 'PENDING',
            },
          });
        } else {
          result.unchanged++;
        }
      } else {
        // Token não existe localmente - criar
        const tokenType = this.mapper.mapFigmaTypeToTokenType(
          figmaVar.resolvedType,
          figmaVar.name,
        );
        const category = this.mapper.inferCategoryFromName(figmaVar.name);

        await this.prisma.token.create({
          data: {
            name: figmaVar.name,
            value: mappedValue,
            type: tokenType,
            category,
            figmaVariableId: figmaVar.id,
            figmaLastValue: mappedValue,
            projectId,
          },
        });

        result.created++;
      }
    }

    // Verificar tokens locais que não existem no Figma
    for (const localToken of localTokens) {
      if (localToken.figmaVariableId && !figmaVarById.has(localToken.figmaVariableId)) {
        result.divergences.push({
          tokenId: localToken.id,
          tokenName: localToken.name,
          localValue: localToken.value,
          figmaValue: '',
          type: 'missing_figma',
        });
      }
    }

    // Atualizar timestamp de sincronização
    await this.prisma.project.update({
      where: { id: projectId },
      data: { figmaLastSyncAt: new Date() },
    });

    // Registrar no histórico
    await this.prisma.versionHistory.create({
      data: {
        type: 'FIGMA_SYNC',
        summary: `Sincronização com Figma: ${result.created} criados, ${result.updated} atualizados, ${result.divergences.length} divergências`,
        origin: 'FIGMA',
        projectId,
        userId,
        changes: {
          created: result.created,
          updated: result.updated,
          unchanged: result.unchanged,
          divergencesCount: result.divergences.length,
        },
      },
    });

    return result;
  }

  private getFigmaVariableValue(variable: any): any {
    // Pegar valor do modo default
    const defaultMode = Object.keys(variable.valuesByMode)[0];
    return variable.valuesByMode[defaultMode];
  }

  async resolveDivergence(
    divergenceId: string,
    resolution: 'keep_local' | 'use_figma',
    userId: string,
  ): Promise<void> {
    const divergence = await this.prisma.divergence.findUnique({
      where: { id: divergenceId },
      include: { token: true },
    });

    if (!divergence) {
      throw new Error('Divergence not found');
    }

    if (resolution === 'use_figma') {
      // Atualizar token com valor do Figma
      await this.prisma.token.update({
        where: { id: divergence.tokenId },
        data: { 
          value: divergence.figmaValue,
          figmaLastValue: divergence.figmaValue,
        },
      });

      // Registrar histórico
      await this.prisma.tokenHistory.create({
        data: {
          tokenId: divergence.tokenId,
          action: 'updated',
          changes: {
            value: {
              before: divergence.localValue,
              after: divergence.figmaValue,
            },
          },
          origin: 'FIGMA',
          userId,
        },
      });
    }

    // Marcar divergência como resolvida
    await this.prisma.divergence.update({
      where: { id: divergenceId },
      data: {
        status: resolution === 'keep_local' ? 'RESOLVED_LOCAL' : 'RESOLVED_FIGMA',
        resolution,
        resolvedAt: new Date(),
      },
    });

    // Registrar no histórico do projeto
    await this.prisma.versionHistory.create({
      data: {
        type: 'DIVERGENCE_RESOLVED',
        summary: `Divergência em ${divergence.token.name} resolvida (${resolution})`,
        origin: 'MANUAL',
        projectId: divergence.projectId,
        userId,
        changes: {
          tokenName: divergence.token.name,
          resolution,
          localValue: divergence.localValue,
          figmaValue: divergence.figmaValue,
        },
      },
    });
  }
}
```

## 📤 Push para o Figma

### Atualizar Variáveis no Figma

```typescript
// src/modules/figma/figma.service.ts (adicional)

async updateFileVariables(
  fileId: string,
  accessToken: string,
  updates: VariableUpdate[],
): Promise<void> {
  await this.httpService.axiosRef.post(
    `${this.baseUrl}/files/${fileId}/variables`,
    {
      variables: updates.map(update => ({
        action: 'UPDATE',
        id: update.variableId,
        name: update.name,
        variableCollectionId: update.collectionId,
        resolvedType: update.resolvedType,
        valuesByMode: update.valuesByMode,
      })),
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}

async createFileVariables(
  fileId: string,
  accessToken: string,
  variables: NewVariable[],
): Promise<void> {
  await this.httpService.axiosRef.post(
    `${this.baseUrl}/files/${fileId}/variables`,
    {
      variables: variables.map(v => ({
        action: 'CREATE',
        name: v.name,
        variableCollectionId: v.collectionId,
        resolvedType: v.resolvedType,
        valuesByMode: v.valuesByMode,
      })),
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}

interface VariableUpdate {
  variableId: string;
  name?: string;
  collectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, any>;
}

interface NewVariable {
  name: string;
  collectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, any>;
}
```

## 🪝 Webhooks (Futuro)

O Figma oferece webhooks para notificações em tempo real. Quando disponível:

```typescript
// src/modules/figma/figma-webhook.controller.ts
import { Controller, Post, Body, Headers } from '@nestjs/common';
import { FigmaSyncService } from './figma-sync.service';

@Controller('webhooks/figma')
export class FigmaWebhookController {
  constructor(private syncService: FigmaSyncService) {}

  @Post()
  async handleWebhook(
    @Body() payload: FigmaWebhookPayload,
    @Headers('X-Figma-Signature') signature: string,
  ) {
    // Verificar assinatura
    if (!this.verifySignature(payload, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    switch (payload.event_type) {
      case 'FILE_UPDATE':
        // Disparar sincronização automática
        await this.handleFileUpdate(payload);
        break;
      case 'LIBRARY_PUBLISH':
        // Lidar com publicação de biblioteca
        await this.handleLibraryPublish(payload);
        break;
    }

    return { received: true };
  }

  private verifySignature(payload: any, signature: string): boolean {
    // Implementar verificação HMAC
    return true;
  }

  private async handleFileUpdate(payload: FigmaWebhookPayload) {
    // Encontrar projeto pelo fileId
    // Disparar sync em background
  }

  private async handleLibraryPublish(payload: FigmaWebhookPayload) {
    // Lidar com publicação de biblioteca
  }
}

interface FigmaWebhookPayload {
  event_type: string;
  file_key: string;
  file_name: string;
  timestamp: string;
  triggered_by: {
    id: string;
    handle: string;
  };
}
```

## 🔒 Rate Limiting

A API do Figma tem limites de requisições:

- **Limite**: 120 requisições por minuto
- **Burst**: Até 10 requisições simultâneas

### Implementação

```typescript
// src/modules/figma/figma-rate-limiter.service.ts
import { Injectable } from '@nestjs/common';
import { Semaphore } from 'async-mutex';
import Bottleneck from 'bottleneck';

@Injectable()
export class FigmaRateLimiterService {
  private limiter: Bottleneck;

  constructor() {
    this.limiter = new Bottleneck({
      maxConcurrent: 10,      // Máximo 10 requisições simultâneas
      minTime: 500,           // Mínimo 500ms entre requisições
      reservoir: 120,         // 120 tokens
      reservoirRefreshAmount: 120,
      reservoirRefreshInterval: 60 * 1000, // Refresh a cada minuto
    });
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(fn);
  }
}
```

## 📊 Monitoramento

### Métricas Importantes

- Tempo de sincronização
- Taxa de erros da API do Figma
- Número de divergências detectadas
- Tokens criados/atualizados

```typescript
// Prometheus metrics
const figmaSyncDuration = new Histogram({
  name: 'figma_sync_duration_seconds',
  help: 'Duration of Figma sync operations',
  labelNames: ['project_id', 'status'],
});

const figmaDivergencesDetected = new Counter({
  name: 'figma_divergences_detected_total',
  help: 'Total number of divergences detected',
  labelNames: ['project_id', 'type'],
});
```

---

*Documento atualizado em: Dezembro 2024*
