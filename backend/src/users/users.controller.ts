import { Controller, Put, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Put('me/figma-token')
  async saveFigmaToken(@Request() req, @Body() body: { token: string }) {
    const userId = req.user.sub;

    if (!body.token || !body.token.trim()) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }

    // Validate token format (Figma Personal Access Tokens start with 'figd_')
    const token = body.token.trim();
    if (!token.startsWith('figd_')) {
      throw new HttpException(
        'Invalid Figma token format. Personal Access Tokens should start with "figd_"',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update user's Figma token
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        figmaAccessToken: token,
        figmaRefreshToken: null, // Clear OAuth tokens
        figmaId: null,
      },
    });

    return { success: true, message: 'Figma token saved successfully' };
  }
}
