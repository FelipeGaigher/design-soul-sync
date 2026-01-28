import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FigmaOAuthService } from '../auth/oauth/figma-oauth.service';
import { FigmaParserService } from './figma-parser.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// Figma Variable Types
interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, any>;
  description?: string;
}

interface FigmaVariableCollection {
  id: string;
  name: string;
  defaultModeId: string;
}

interface FigmaVariablesResponse {
  meta?: {
    variableCollections?: Record<string, FigmaVariableCollection>;
    variables?: Record<string, FigmaVariable>;
  };
}

@Controller('figma')
@UseGuards(JwtAuthGuard)
export class FigmaController {
  private readonly logger = new Logger(FigmaController.name);

  constructor(
    private figmaOAuthService: FigmaOAuthService,
    private figmaParserService: FigmaParserService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) { }

  private async getUserAccessToken(userId: string): Promise<string> {
    // Use token fixo da variável de ambiente
    const token = this.configService.get<string>('FIGMA_ACCESS_TOKEN');

    if (!token) {
      this.logger.error('FIGMA_ACCESS_TOKEN not configured in environment');
      throw new HttpException(
        'Figma integration not configured. Please contact administrator.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    this.logger.log(`Using system Figma token (prefix: ${token.substring(0, 10)}...)`);
    return token;
  }

  private async callWithTokenRefresh<T>(
    userId: string,
    apiCall: (token: string) => Promise<T>,
  ): Promise<T> {
    const accessToken = await this.getUserAccessToken(userId);
    return await apiCall(accessToken);
  }

  @Get('status')
  async getConnectionStatus(@Request() req) {
    // Sempre retorna true pois o token está configurado no sistema
    const token = this.configService.get<string>('FIGMA_ACCESS_TOKEN');
    return {
      connected: !!token,
    };
  }

  @Get('teams')
  async getTeams(@Request() req) {
    const accessToken = await this.getUserAccessToken(req.user.sub);

    try {
      // Figma API doesn't have a direct teams endpoint for regular OAuth
      // We need to get user info which includes team memberships
      const userInfo = await this.figmaOAuthService.getUserInfo(accessToken);

      // For now, return a mock response since teams require enterprise API
      // In production, you would use the Enterprise API for team listing
      return {
        teams: [
          {
            id: 'default',
            name: userInfo.handle || 'My Team',
          },
        ],
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch Figma teams',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('projects')
  async getProjects(@Request() req) {
    try {
      const accessToken = await this.getUserAccessToken(req.user.sub);
      const projects = await this.figmaOAuthService.getProjects(accessToken);
      return { projects };
    } catch (error) {
      // If token not found, return empty array (user needs to configure token)
      if (error.message?.includes('not connected')) {
        return { projects: [] };
      }
      throw new HttpException(
        'Failed to fetch Figma projects',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('files/:fileKey')
  async getFileInfo(@Request() req, @Param('fileKey') fileKey: string) {
    this.logger.log(`Getting file info for fileKey: ${fileKey}`);

    try {
      const fileInfo = await this.callWithTokenRefresh(
        req.user.sub,
        (token) => this.figmaOAuthService.getFileInfo(token, fileKey),
      );
      this.logger.log(`Got file info: ${JSON.stringify(fileInfo)}`);
      return fileInfo;
    } catch (error) {
      this.logger.error(`Error fetching file info: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to fetch Figma file: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('files/:fileKey/variables')
  async getFileVariables(@Request() req, @Param('fileKey') fileKey: string) {
    try {
      const variables = await this.callWithTokenRefresh(
        req.user.sub,
        (token) => this.figmaOAuthService.getFileVariables(token, fileKey),
      );
      return variables;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to fetch variables from file: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('import/:projectId')
  async importVariables(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() body: { fileKey: string },
  ) {
    const accessToken = await this.getUserAccessToken(req.user.sub);

    try {
      // Verify project belongs to user
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          members: {
            some: {
              userId: req.user.sub,
            },
          },
        },
      });

      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }

      // Get variables from Figma
      const figmaData: FigmaVariablesResponse = await this.figmaOAuthService.getFileVariables(
        accessToken,
        body.fileKey,
      );

      const imported: string[] = [];
      const updated: string[] = [];
      const errors: string[] = [];

      // Process variable collections
      const collections: Record<string, FigmaVariableCollection> = figmaData.meta?.variableCollections || {};
      const variables: Record<string, FigmaVariable> = figmaData.meta?.variables || {};

      for (const [varId, variable] of Object.entries(variables) as [string, FigmaVariable][]) {
        try {
          // Determine token type based on Figma variable type
          let tokenType = 'OTHER';
          switch (variable.resolvedType) {
            case 'COLOR':
              tokenType = 'COLOR';
              break;
            case 'FLOAT':
              // Could be spacing, border-radius, etc.
              if (variable.name.toLowerCase().includes('spacing')) {
                tokenType = 'SPACING';
              } else if (variable.name.toLowerCase().includes('radius')) {
                tokenType = 'BORDER_RADIUS';
              } else if (variable.name.toLowerCase().includes('opacity')) {
                tokenType = 'OPACITY';
              } else if (variable.name.toLowerCase().includes('z-index') || variable.name.toLowerCase().includes('zindex')) {
                tokenType = 'Z_INDEX';
              }
              break;
            case 'STRING':
              if (variable.name.toLowerCase().includes('font')) {
                tokenType = 'TYPOGRAPHY';
              }
              break;
          }

          // Get the default mode value
          const collection = collections[variable.variableCollectionId];
          const defaultModeId = collection?.defaultModeId;
          const value = defaultModeId
            ? variable.valuesByMode[defaultModeId]
            : Object.values(variable.valuesByMode)[0];

          // Convert value to string
          let stringValue = String(value);
          if (typeof value === 'object' && value !== null) {
            if ('r' in value && 'g' in value && 'b' in value) {
              // Color value
              const r = Math.round((value as any).r * 255);
              const g = Math.round((value as any).g * 255);
              const b = Math.round((value as any).b * 255);
              const a = (value as any).a ?? 1;
              stringValue =
                a < 1
                  ? `rgba(${r}, ${g}, ${b}, ${a})`
                  : `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            } else {
              stringValue = JSON.stringify(value);
            }
          }

          // Check if token already exists
          const existingToken = await this.prisma.token.findFirst({
            where: {
              projectId,
              name: variable.name,
            },
          });

          if (existingToken) {
            // Update existing token
            await this.prisma.token.update({
              where: { id: existingToken.id },
              data: {
                value: stringValue,
                figmaVariableId: varId,
                updatedAt: new Date(),
              },
            });
            updated.push(variable.name);
          } else {
            // Create new token
            await this.prisma.token.create({
              data: {
                name: variable.name,
                value: stringValue,
                type: tokenType as any,
                category: collection?.name || 'Imported',
                description: variable.description || `Imported from Figma`,
                figmaVariableId: varId,
                projectId,
              },
            });
            imported.push(variable.name);
          }
        } catch (error) {
          errors.push(`${variable.name}: ${error.message}`);
        }
      }

      // Update project with Figma file key
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          figmaFileId: body.fileKey,
          figmaLastSyncAt: new Date(),
        },
      });

      return {
        imported: imported.length,
        updated: updated.length,
        errors,
        details: {
          importedTokens: imported,
          updatedTokens: updated,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to import variables: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('sync/:projectId')
  async syncVariables(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() body: { fileKey: string },
  ) {
    const accessToken = await this.getUserAccessToken(req.user.sub);

    try {
      // Verify project belongs to user
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          members: {
            some: {
              userId: req.user.sub,
            },
          },
        },
        include: {
          tokens: true,
        },
      });

      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }

      // Get variables from Figma
      const figmaData: FigmaVariablesResponse = await this.figmaOAuthService.getFileVariables(
        accessToken,
        body.fileKey,
      );

      const divergences: Array<{
        tokenName: string;
        localValue: string;
        figmaValue: string;
        type: 'added' | 'removed' | 'modified';
      }> = [];

      const collections: Record<string, FigmaVariableCollection> = figmaData.meta?.variableCollections || {};
      const variables: Record<string, FigmaVariable> = figmaData.meta?.variables || {};

      // Create a map of local tokens by Figma ID
      const localTokensByFigmaId = new Map(
        project.tokens
          .filter((t) => t.figmaVariableId)
          .map((t) => [t.figmaVariableId, t]),
      );

      // Create a map of local tokens by name (for tokens without Figma ID)
      const localTokensByName = new Map(
        project.tokens.map((t) => [t.name, t]),
      );

      const processedFigmaIds = new Set<string>();

      for (const [varId, variable] of Object.entries(variables) as [string, FigmaVariable][]) {
        processedFigmaIds.add(varId);

        const collection = collections[variable.variableCollectionId];
        const defaultModeId = collection?.defaultModeId;
        const value = defaultModeId
          ? variable.valuesByMode[defaultModeId]
          : Object.values(variable.valuesByMode)[0];

        // Convert value to string
        let figmaValue = String(value);
        if (typeof value === 'object' && value !== null) {
          if ('r' in value && 'g' in value && 'b' in value) {
            const r = Math.round((value as any).r * 255);
            const g = Math.round((value as any).g * 255);
            const b = Math.round((value as any).b * 255);
            const a = (value as any).a ?? 1;
            figmaValue =
              a < 1
                ? `rgba(${r}, ${g}, ${b}, ${a})`
                : `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          } else {
            figmaValue = JSON.stringify(value);
          }
        }

        // Check if token exists locally
        const localToken =
          localTokensByFigmaId.get(varId) || localTokensByName.get(variable.name);

        if (!localToken) {
          // Token exists in Figma but not locally
          divergences.push({
            tokenName: variable.name,
            localValue: '',
            figmaValue,
            type: 'added',
          });
        } else if (localToken.value !== figmaValue) {
          // Token value differs
          divergences.push({
            tokenName: variable.name,
            localValue: localToken.value,
            figmaValue,
            type: 'modified',
          });
        }
      }

      // Check for tokens that exist locally but not in Figma
      for (const token of project.tokens) {
        if (token.figmaVariableId && !processedFigmaIds.has(token.figmaVariableId)) {
          divergences.push({
            tokenName: token.name,
            localValue: token.value,
            figmaValue: '',
            type: 'removed',
          });
        }
      }

      return { divergences };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to sync variables: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('import-components/:projectId')
  async importComponents(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() body: { fileKey: string },
  ) {
    const userId = req.user.sub;

    try {
      // Verify project belongs to user (owner or member)
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
      });

      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }

      // Get file nodes from Figma using token refresh pattern
      this.logger.log(`Fetching file nodes for project ${projectId}, fileKey: ${body.fileKey}`);
      const fileData = await this.callWithTokenRefresh(
        userId,
        (token) => this.figmaOAuthService.getFileNodes(token, body.fileKey),
      );

      // Parse components
      this.logger.log('Parsing components from file data');
      const parsedComponents = this.figmaParserService.parseComponents(fileData);
      this.logger.log(`Parsed ${parsedComponents.length} components`);

      if (parsedComponents.length === 0) {
        return {
          imported: 0,
          updated: 0,
          errors: ['No components found in the Figma file'],
        };
      }

      // Extract node IDs for images
      const nodeIds = parsedComponents.flatMap(comp => [
        comp.nodeId,
        ...comp.variants.map(v => v.nodeId),
      ]);

      this.logger.log(`Fetching images for ${nodeIds.length} nodes`);

      // Fetch images in batches
      const images = await this.callWithTokenRefresh(
        userId,
        (token) => this.figmaOAuthService.getComponentImages(token, body.fileKey, nodeIds),
      );

      this.logger.log(`Fetched ${Object.keys(images).length} images`);

      // Save components to database
      const imported: string[] = [];
      const updated: string[] = [];
      const errors: string[] = [];

      for (const parsed of parsedComponents) {
        try {
          // Check if component already exists
          const existing = await this.prisma.component.findFirst({
            where: { projectId, figmaNodeId: parsed.nodeId },
          });

          if (existing) {
            // Update existing component
            await this.prisma.component.update({
              where: { id: existing.id },
              data: {
                name: parsed.name,
                category: parsed.category,
                previewUrl: images[parsed.nodeId] || null,
              },
            });

            // Update/create variants
            for (const variant of parsed.variants) {
              const existingVariant = await this.prisma.componentVariant.findFirst({
                where: { componentId: existing.id, name: variant.name },
              });

              if (existingVariant) {
                await this.prisma.componentVariant.update({
                  where: { id: existingVariant.id },
                  data: {
                    props: variant.properties as any,
                    previewUrl: images[variant.nodeId] || null,
                  },
                });
              } else {
                await this.prisma.componentVariant.create({
                  data: {
                    componentId: existing.id,
                    name: variant.name,
                    props: variant.properties as any,
                    previewUrl: images[variant.nodeId] || null,
                  },
                });
              }
            }

            updated.push(parsed.name);
          } else {
            // Create new component
            const newComponent = await this.prisma.component.create({
              data: {
                name: parsed.name,
                category: parsed.category,
                figmaComponentId: parsed.figmaComponentId,
                figmaNodeId: parsed.nodeId,
                previewUrl: images[parsed.nodeId] || null,
                projectId,
              },
            });

            // Create variants
            for (const variant of parsed.variants) {
              await this.prisma.componentVariant.create({
                data: {
                  componentId: newComponent.id,
                  name: variant.name,
                  props: variant.properties as any,
                  previewUrl: images[variant.nodeId] || null,
                },
              });
            }

            imported.push(parsed.name);
          }
        } catch (error) {
          this.logger.error(`Error processing component ${parsed.name}:`, error.message);
          errors.push(`${parsed.name}: ${error.message}`);
        }
      }

      // Update project stats
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          figmaFileId: body.fileKey,
          figmaLastSyncAt: new Date(),
          componentsCount: imported.length + updated.length,
        },
      });

      this.logger.log(`Import complete: ${imported.length} imported, ${updated.length} updated, ${errors.length} errors`);

      return {
        imported: imported.length,
        updated: updated.length,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to import components:`, error.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to import components: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
