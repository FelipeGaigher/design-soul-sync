import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FigmaOAuthService } from './oauth/figma-oauth.service';
import { GitHubOAuthService } from './oauth/github-oauth.service';
import { OAuthController } from './oauth/oauth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'tokensync-secret-key',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, OAuthController],
  providers: [AuthService, JwtStrategy, FigmaOAuthService, GitHubOAuthService],
  exports: [AuthService, JwtModule, FigmaOAuthService],
})
export class AuthModule {}
