import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProvider, OAuthUserInfo } from '../dto/oauth.dto';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

@Injectable()
export class GitHubOAuthService {
  private readonly logger = new Logger(GitHubOAuthService.name);
  
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('GITHUB_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET') || '';
    this.redirectUri = this.configService.get<string>('GITHUB_REDIRECT_URI') || 'http://localhost:3000/api/auth/github/callback';
  }

  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user:email read:user',
      state: state || '',
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GitHubTokenResponse> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error('GitHub token exchange failed:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    
    if (data.error) {
      this.logger.error('GitHub OAuth error:', data.error_description);
      throw new Error(data.error_description || 'GitHub OAuth failed');
    }

    return data;
  }

  async getUserInfo(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get GitHub user info');
    }

    return response.json();
  }

  async getUserEmails(accessToken: string): Promise<GitHubEmail[]> {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get GitHub user emails');
    }

    return response.json();
  }

  async authenticate(code: string): Promise<OAuthUserInfo> {
    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code);
    
    // Get user info
    const githubUser = await this.getUserInfo(tokens.access_token);
    
    // Get primary email if not available in user info
    let email = githubUser.email;
    if (!email) {
      const emails = await this.getUserEmails(tokens.access_token);
      const primaryEmail = emails.find(e => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      throw new Error('No email found in GitHub account');
    }

    return {
      id: String(githubUser.id),
      email,
      name: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url,
      provider: OAuthProvider.GITHUB,
      providerUserId: String(githubUser.id),
      accessToken: tokens.access_token,
    };
  }
}
