import { Module } from '@nestjs/common';
import { FigmaController } from './figma.controller';
import { FigmaOAuthService } from '../auth/oauth/figma-oauth.service';
import { FigmaParserService } from './figma-parser.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FigmaController],
  providers: [FigmaOAuthService, FigmaParserService],
  exports: [FigmaOAuthService, FigmaParserService],
})
export class FigmaModule {}
