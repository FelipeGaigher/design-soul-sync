import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum OAuthProvider {
  FIGMA = 'figma',
  GITHUB = 'github',
  GOOGLE = 'google',
}

export class OAuthCallbackDto {
  @ApiProperty({ description: 'Authorization code from OAuth provider' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'State parameter for CSRF protection', required: false })
  @IsString()
  @IsOptional()
  state?: string;
}

export class OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: OAuthProvider;
  providerUserId: string;
  accessToken: string;
  refreshToken?: string;
}
