import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Get()
  @ApiOperation({ summary: 'Listar projetos do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de projetos' })
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter projeto por ID' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.sub);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estatísticas do projeto' })
  @ApiResponse({ status: 200, description: 'Estatísticas' })
  getStats(@Param('id') id: string, @Request() req) {
    return this.projectsService.getStats(id, req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar projeto' })
  @ApiResponse({ status: 200, description: 'Projeto deletado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.sub);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Adicionar membro ao projeto' })
  @ApiResponse({ status: 201, description: 'Membro adicionado' })
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req,
  ) {
    return this.projectsService.addMember(id, addMemberDto, req.user.sub);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remover membro do projeto' })
  @ApiResponse({ status: 200, description: 'Membro removido' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.projectsService.removeMember(id, userId, req.user.sub);
  }
}
