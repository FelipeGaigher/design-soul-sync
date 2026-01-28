import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProvider, OAuthUserInfo } from '../dto/oauth.dto';

interface FigmaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
}

interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

@Injectable()
export class FigmaOAuthService {
  private readonly logger = new Logger(FigmaOAuthService.name);

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('FIGMA_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('FIGMA_CLIENT_SECRET') || '';
    this.redirectUri = this.configService.get<string>('FIGMA_REDIRECT_URI') || 'http://localhost:3000/api/auth/figma/callback';
  }

  getAuthorizationUrl(state?: string): string {
    // Figma OAuth Scopes (must match what's enabled in Figma Developer Console):
    // - current_user:read: Read user's name, email, and profile image
    // - file_content:read: Read the contents of files
    // - file_metadata:read: Read metadata of files
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'current_user:read,file_content:read,file_metadata:read',
      state: state || '',
      response_type: 'code',
    });

    return `https://www.figma.com/oauth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<FigmaTokenResponse> {
    const response = await fetch('https://api.figma.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error('Figma token exchange failed:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    this.logger.log(`Token exchange successful - access_token prefix: ${tokens.access_token?.substring(0, 15)}..., refresh_token prefix: ${tokens.refresh_token?.substring(0, 15)}...`);
    return tokens;
  }

  async refreshAccessToken(refreshToken: string): Promise<FigmaTokenResponse> {
    this.logger.log(`Refreshing token with refresh_token prefix: ${refreshToken?.substring(0, 15)}...`);

    const response = await fetch('https://api.figma.com/v1/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Figma refresh token failed (${response.status}):`, error);
      throw new Error(`Failed to refresh Figma token: ${error}`);
    }

    const tokens = await response.json();
    this.logger.log(`Refresh successful - new access_token prefix: ${tokens.access_token?.substring(0, 15)}...`);
    return tokens;
  }

  async getUserInfo(accessToken: string): Promise<FigmaUser> {
    const response = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Figma user info');
    }

    return response.json();
  }

  async authenticate(code: string): Promise<OAuthUserInfo> {
    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code);

    // Get user info
    const figmaUser = await this.getUserInfo(tokens.access_token);

    return {
      id: figmaUser.id,
      email: figmaUser.email,
      name: figmaUser.handle,
      avatarUrl: figmaUser.img_url,
      provider: OAuthProvider.FIGMA,
      providerUserId: figmaUser.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  }

  async getProjects(accessToken: string): Promise<any[]> {
    // With Personal Access Token, we can list user's files
    try {
      // Get user's teams first
      const meResponse = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': accessToken,
        },
      });

      if (!meResponse.ok) {
        const error = await meResponse.text();
        this.logger.error('Failed to verify Figma token:', error);
        throw new Error('Failed to verify Figma connection');
      }

      // Get recent files
      const filesResponse = await fetch('https://api.figma.com/v1/me/files', {
        headers: {
          'X-Figma-Token': accessToken,
        },
      });

      if (!filesResponse.ok) {
        // If this endpoint is not available, return empty array
        this.logger.warn('Cannot list files - returning empty array');
        return [];
      }

      const data = await filesResponse.json();
      this.logger.log(`Found ${data.files?.length || 0} Figma files`);

      return data.files || [];
    } catch (error) {
      this.logger.error('Error fetching Figma projects:', error);
      throw new Error('Failed to fetch Figma projects');
    }
  }

  async getFileInfo(accessToken: string, fileKey: string): Promise<any> {
    this.logger.log(`Fetching file ${fileKey} with token: ${accessToken.substring(0, 20)}...`);

    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=1`, {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Failed to fetch Figma file (${response.status}):`, errorText);

      // Include status in error message for retry logic
      const error = new Error(`Figma API error: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    return {
      key: fileKey,
      name: data.name,
      lastModified: data.lastModified,
      thumbnailUrl: data.thumbnailUrl,
      version: data.version,
    };
  }

  async getFileVariables(accessToken: string, fileKey: string): Promise<any> {
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Failed to fetch Figma variables (${response.status}):`, errorText);

      const error = new Error(`Figma API error: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  }

  async getFileNodes(accessToken: string, fileKey: string): Promise<any> {
    this.logger.log(`Fetching file nodes for ${fileKey}`);

    // Use depth=10 to get full component structure including nested children
    // Also request component sets and component property definitions
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=10`, {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Failed to fetch Figma file nodes (${response.status}):`);
      this.logger.error(`Error details: ${errorText}`);
      this.logger.error(`File key: ${fileKey}`);
      this.logger.error(`Token prefix: ${accessToken.substring(0, 15)}...`);

      let errorMessage = `Figma API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.err || errorJson.message) {
          errorMessage = errorJson.err || errorJson.message || errorMessage;
        }
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  }

  async getComponentImages(
    accessToken: string,
    fileKey: string,
    nodeIds: string[],
  ): Promise<Record<string, string>> {
    if (nodeIds.length === 0) {
      return {};
    }

    // Figma API limita 100 node IDs por request
    const batchSize = 100;
    const batches: string[][] = [];

    for (let i = 0; i < nodeIds.length; i += batchSize) {
      batches.push(nodeIds.slice(i, i + batchSize));
    }

    const allImages: Record<string, string> = {};

    for (const batch of batches) {
      const ids = batch.join(',');
      this.logger.log(`Fetching images for ${batch.length} components`);

      const response = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=png&scale=2`,
        {
          headers: {
            'X-Figma-Token': accessToken,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to fetch component images (${response.status}):`, errorText);

        const error = new Error(`Figma API error: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      Object.assign(allImages, data.images);
    }

    return allImages;
  }
}
