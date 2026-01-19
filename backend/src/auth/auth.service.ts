import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import { OAuthUserInfo, OAuthProvider } from './dto/oauth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar se usuário tem senha (não é OAuth)
    if (!user.password) {
      throw new UnauthorizedException('Este usuário usa login social. Tente entrar com Google, GitHub ou Figma.');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Gerar tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return tokens;
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // ==================== OAuth ====================

  async handleOAuthLogin(oauthUser: OAuthUserInfo) {
    // Check if user exists with this OAuth provider
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: oauthUser.email },
          {
            AND: [
              { [`${oauthUser.provider}Id`]: oauthUser.providerUserId },
            ],
          },
        ],
      },
    });

    if (user) {
      // Update OAuth tokens and provider ID
      const updateData: any = {
        [`${oauthUser.provider}Id`]: oauthUser.providerUserId,
        [`${oauthUser.provider}AccessToken`]: oauthUser.accessToken,
      };

      if (oauthUser.refreshToken) {
        updateData[`${oauthUser.provider}RefreshToken`] = oauthUser.refreshToken;
      }

      // Update avatar if user doesn't have one
      if (!user.avatarUrl && oauthUser.avatarUrl) {
        updateData.avatarUrl = oauthUser.avatarUrl;
      }

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    } else {
      // Create new user
      const createData: any = {
        email: oauthUser.email,
        name: oauthUser.name,
        avatarUrl: oauthUser.avatarUrl,
        [`${oauthUser.provider}Id`]: oauthUser.providerUserId,
        [`${oauthUser.provider}AccessToken`]: oauthUser.accessToken,
      };

      if (oauthUser.refreshToken) {
        createData[`${oauthUser.provider}RefreshToken`] = oauthUser.refreshToken;
      }

      user = await this.prisma.user.create({
        data: createData,
      });
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async getFigmaAccessToken(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { figmaAccessToken: true },
    });
    return user?.figmaAccessToken || null;
  }

  async getGitHubAccessToken(userId: string): Promise<string | null> {
    // TODO: Regenerate Prisma Client to enable this
    // The githubAccessToken field exists in schema but client needs regeneration
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { githubId: true },
    });
    // Return null for now - GitHub OAuth not yet implemented
    return null;
  }
}
