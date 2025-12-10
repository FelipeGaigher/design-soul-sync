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
        'Authorization': `Bearer ${accessToken}`,
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
    // Figma API doesn't have a direct endpoint to list all user's files
    // The files:read scope and /v1/me/files endpoint are not available for OAuth apps
    // Users need to provide file URLs directly or use team projects endpoint
    
    // For now, we'll verify the token is valid by calling /v1/me
    // and return an empty array, letting users import files by URL
    try {
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error('Failed to verify Figma token:', error);
        throw new Error('Failed to verify Figma connection');
      }

      // Token is valid, but we can't list files without team/project access
      // Return empty array - users should import files by URL
      this.logger.log('Figma connection verified, but file listing requires manual URL input');
      return [];
    } catch (error) {
      this.logger.error('Error verifying Figma connection:', error);
      throw new Error('Failed to verify Figma connection');
    }
  }

  async getFileInfo(accessToken: string, fileKey: string): Promise<any> {
    this.logger.log(`Fetching file ${fileKey} with token: ${accessToken.substring(0, 20)}...`);
    
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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

  async getFileComponents(accessToken: string, fileKey: string): Promise<Array<any>> {
    this.logger.log(`Fetching components for file ${fileKey}...`);

    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Failed to fetch Figma file for components (${response.status}):`, errorText);
      const error = new Error(`Figma API error: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();

    const components: Array<any> = [];

    // Traverse document tree recursively to find COMPONENT and COMPONENT_SET nodes
    function traverse(node: any, parent?: any) {
      if (!node) return;

      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        const comp: any = {
          id: node.id,
          name: node.name || (node.componentId || node.id),
          type: node.type,
          children: Array.isArray(node.children) ? node.children.map((c: any) => ({ id: c.id, name: c.name, type: c.type })) : [],
        };

        components.push(comp);
      }

      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) traverse(child, node);
      }
    }

    // The file root is in data.document
    traverse(data.document);

    this.logger.log(`Found ${components.length} components in file ${fileKey}`);
    return components;
  }

  async getFileVariables(accessToken: string, fileKey: string): Promise<any> {
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
}
