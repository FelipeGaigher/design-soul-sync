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
import { PrismaService } from '../prisma/prisma.service';

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
    private prisma: PrismaService,
  ) {}

  private async getUserAccessToken(userId: string): Promise<string> {
    this.logger.log(`Getting access token for user: ${userId}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { figmaAccessToken: true, figmaRefreshToken: true },
    });

    this.logger.log(`User figma accessToken exists: ${!!user?.figmaAccessToken}, refreshToken exists: ${!!user?.figmaRefreshToken}`);
    if (user?.figmaAccessToken) {
      this.logger.log(`Access token prefix: ${user.figmaAccessToken.substring(0, 15)}...`);
    }
    if (user?.figmaRefreshToken) {
      this.logger.log(`Refresh token prefix: ${user.figmaRefreshToken.substring(0, 15)}...`);
    }

    if (!user?.figmaAccessToken) {
      throw new HttpException(
        'Figma not connected. Please connect your Figma account first.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Try to use current token, if it fails with 403, refresh it
    return user.figmaAccessToken;
  }

  private async refreshUserToken(userId: string): Promise<string> {
    this.logger.log(`Refreshing token for user: ${userId}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { figmaRefreshToken: true },
    });

    if (!user?.figmaRefreshToken) {
      throw new HttpException(
        'No refresh token available. Please reconnect your Figma account.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const newTokens = await this.figmaOAuthService.refreshAccessToken(user.figmaRefreshToken);
      
      this.logger.log(`New access token prefix: ${newTokens.access_token?.substring(0, 15)}...`);
      this.logger.log(`New refresh token prefix: ${newTokens.refresh_token?.substring(0, 15) || '(not returned)'}...`);
      
      // Update tokens in database - only update refresh token if a new one was provided
      const updateData: any = {
        figmaAccessToken: newTokens.access_token,
      };
      
      // Figma refresh doesn't always return a new refresh_token
      if (newTokens.refresh_token) {
        updateData.figmaRefreshToken = newTokens.refresh_token;
      }
      
      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      this.logger.log(`Token refreshed successfully for user: ${userId}`);
      return newTokens.access_token;
    } catch (error) {
      this.logger.error(`Failed to refresh token: ${error.message}`);
      throw new HttpException(
        'Failed to refresh Figma token. Please reconnect your Figma account.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async callWithTokenRefresh<T>(
    userId: string,
    apiCall: (token: string) => Promise<T>,
  ): Promise<T> {
    let accessToken = await this.getUserAccessToken(userId);

    try {
      return await apiCall(accessToken);
    } catch (error) {
      // If we get a 403 or 401, try refreshing the token
      const status = (error as any).status;
      const shouldRefresh = status === 403 || status === 401 || 
                           error.message?.includes('403') || 
                           error.message?.includes('401');
      
      if (shouldRefresh) {
        this.logger.log(`Got ${status || 'auth error'}, attempting token refresh...`);
        try {
          accessToken = await this.refreshUserToken(userId);
          return await apiCall(accessToken);
        } catch (refreshError) {
          this.logger.error('Token refresh failed:', refreshError.message);
          throw refreshError;
        }
      }
      throw error;
    }
  }

  @Get('status')
  async getConnectionStatus(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { figmaAccessToken: true },
    });

    return {
      connected: !!user?.figmaAccessToken,
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
    const accessToken = await this.getUserAccessToken(req.user.sub);

    try {
      const projects = await this.figmaOAuthService.getProjects(accessToken);
      return { projects };
    } catch (error) {
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
}
