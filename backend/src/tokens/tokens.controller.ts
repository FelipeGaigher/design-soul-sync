import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { CreateTokenDto, UpdateTokenDto, TokenFiltersDto, BulkCreateTokensDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tokens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tokens do projeto' })
  @ApiResponse({ status: 200, description: 'Lista de tokens' })
  findAll(
    @Param('projectId') projectId: string,
    @Query() filters: TokenFiltersDto,
    @Request() req,
  ) {
    return this.tokensService.findAll(projectId, req.user.sub, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de tokens' })
  @ApiResponse({ status: 200, description: 'Estatísticas' })
  getStats(@Param('projectId') projectId: string, @Request() req) {
    return this.tokensService.getStats(projectId, req.user.sub);
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de alterações' })
  @ApiResponse({ status: 200, description: 'Histórico' })
  getHistory(
    @Param('projectId') projectId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req,
  ) {
    return this.tokensService.getHistory(projectId, req.user.sub, page, limit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias de tokens' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  getCategories(@Param('projectId') projectId: string, @Request() req) {
    return this.tokensService.getCategories(projectId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter token por ID' })
  @ApiResponse({ status: 200, description: 'Token encontrado' })
  @ApiResponse({ status: 404, description: 'Token não encontrado' })
  findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.tokensService.findOne(projectId, id, req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo token' })
  @ApiResponse({ status: 201, description: 'Token criado' })
  create(
    @Param('projectId') projectId: string,
    @Body() createTokenDto: CreateTokenDto,
    @Request() req,
  ) {
    return this.tokensService.create(projectId, createTokenDto, req.user.sub);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Criar múltiplos tokens' })
  @ApiResponse({ status: 201, description: 'Tokens criados' })
  bulkCreate(
    @Param('projectId') projectId: string,
    @Body() bulkDto: BulkCreateTokensDto,
    @Request() req,
  ) {
    return this.tokensService.bulkCreate(projectId, bulkDto, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar token' })
  @ApiResponse({ status: 200, description: 'Token atualizado' })
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateTokenDto: UpdateTokenDto,
    @Request() req,
  ) {
    return this.tokensService.update(projectId, id, updateTokenDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar token' })
  @ApiResponse({ status: 200, description: 'Token deletado' })
  remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.tokensService.remove(projectId, id, req.user.sub);
  }
}
