import { Controller, Get, Query, Res, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { FigmaOAuthService } from './figma-oauth.service';
import { GitHubOAuthService } from './github-oauth.service';
import { OAuthProvider, OAuthUserInfo } from '../dto/oauth.dto';

@ApiTags('OAuth')
@Controller('auth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);
  private readonly frontendUrl: string;

  constructor(
    private authService: AuthService,
    private figmaOAuth: FigmaOAuthService,
    private githubOAuth: GitHubOAuthService,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8080';
  }

  // ==================== FIGMA ====================

  @Get('figma')
  @ApiOperation({ summary: 'Redirect to Figma OAuth' })
  @ApiQuery({ name: 'state', required: false })
  figmaAuth(@Query('state') state: string, @Res() res: Response) {
    const url = this.figmaOAuth.getAuthorizationUrl(state);
    this.logger.log('Redirecting to Figma OAuth');
    return res.redirect(url);
  }

  @Get('figma/callback')
  @ApiOperation({ summary: 'Figma OAuth callback' })
  async figmaCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      this.logger.error('Figma OAuth error:', error);
      return res.redirect(`${this.frontendUrl}/login?error=figma_auth_failed`);
    }

    if (!code) {
      return res.redirect(`${this.frontendUrl}/login?error=no_code`);
    }

    try {
      this.logger.log('Figma OAuth callback - exchanging code for tokens...');
      const oauthUser = await this.figmaOAuth.authenticate(code);
      this.logger.log(`Figma OAuth - got user: ${oauthUser.email}, has accessToken: ${!!oauthUser.accessToken}, has refreshToken: ${!!oauthUser.refreshToken}`);
      
      const result = await this.authService.handleOAuthLogin(oauthUser);
      this.logger.log(`Figma OAuth - user logged in: ${result.user.id}`);
      
      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: result.user.id,
        provider: OAuthProvider.FIGMA,
      });

      return res.redirect(`${this.frontendUrl}/oauth/callback?${params.toString()}`);
    } catch (err) {
      this.logger.error('Figma OAuth callback error:', err);
      return res.redirect(`${this.frontendUrl}/login?error=figma_auth_failed`);
    }
  }

  // ==================== GITHUB ====================

  @Get('github')
  @ApiOperation({ summary: 'Redirect to GitHub OAuth' })
  @ApiQuery({ name: 'state', required: false })
  githubAuth(@Query('state') state: string, @Res() res: Response) {
    const url = this.githubOAuth.getAuthorizationUrl(state);
    this.logger.log('Redirecting to GitHub OAuth');
    return res.redirect(url);
  }

  @Get('github/callback')
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      this.logger.error('GitHub OAuth error:', error);
      return res.redirect(`${this.frontendUrl}/login?error=github_auth_failed`);
    }

    if (!code) {
      return res.redirect(`${this.frontendUrl}/login?error=no_code`);
    }

    try {
      const oauthUser = await this.githubOAuth.authenticate(code);
      const result = await this.authService.handleOAuthLogin(oauthUser);
      
      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: result.user.id,
        provider: OAuthProvider.GITHUB,
      });

      return res.redirect(`${this.frontendUrl}/oauth/callback?${params.toString()}`);
    } catch (err) {
      this.logger.error('GitHub OAuth callback error:', err);
      return res.redirect(`${this.frontendUrl}/login?error=github_auth_failed`);
    }
  }

  // ==================== URL GENERATORS ====================

  @Get('oauth/urls')
  @ApiOperation({ summary: 'Get OAuth authorization URLs' })
  getOAuthUrls() {
    return {
      figma: this.figmaOAuth.getAuthorizationUrl(),
      github: this.githubOAuth.getAuthorizationUrl(),
    };
  }
}
