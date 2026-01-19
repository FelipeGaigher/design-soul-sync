import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';
import { ProjectStatus, UserRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    // Retorna projetos onde o usuário é dono ou membro
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { tokens: true, components: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return projects.map(project => ({
      ...project,
      tokensCount: project._count.tokens,
      componentsCount: project._count.components,
      _count: undefined,
    }));
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { tokens: true, components: true, divergences: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar acesso
    await this.checkAccess(id, userId);

    return {
      ...project,
      tokensCount: project._count.tokens,
      componentsCount: project._count.components,
      divergencesCount: project._count.divergences,
      _count: undefined,
    };
  }

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    await this.checkOwnership(id, userId);

    const project = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return project;
  }

  async remove(id: string, userId: string) {
    await this.checkOwnership(id, userId);

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Projeto deletado com sucesso' };
  }

  async addMember(projectId: string, addMemberDto: AddMemberDto, userId: string) {
    await this.checkOwnership(projectId, userId);

    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: addMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Adicionar membro
    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: addMemberDto.userId,
        role: addMemberDto.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return member;
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    await this.checkOwnership(projectId, userId);

    await this.prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
    });

    return { message: 'Membro removido com sucesso' };
  }

  async getStats(projectId: string, userId: string) {
    await this.checkAccess(projectId, userId);

    const [tokensCount, componentsCount, divergencesCount, tokensByType] = await Promise.all([
      this.prisma.token.count({ where: { projectId } }),
      this.prisma.component.count({ where: { projectId } }),
      this.prisma.divergence.count({ where: { projectId, status: 'PENDING' } }),
      this.prisma.token.groupBy({
        by: ['type'],
        where: { projectId },
        _count: true,
      }),
    ]);

    return {
      tokensCount,
      componentsCount,
      divergencesCount,
      tokensByType: tokensByType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getComponents(projectId: string, userId: string) {
    await this.checkAccess(projectId, userId);

    const components = await this.prisma.component.findMany({
      where: { projectId },
      include: {
        variants: true,
        tokens: {
          include: {
            token: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return components;
  }

  // Helper: verificar se é dono do projeto
  private async checkOwnership(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Apenas o dono pode realizar esta ação');
    }
  }

  // Helper: verificar se tem acesso ao projeto
  private async checkAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      throw new ForbiddenException('Você não tem acesso a este projeto');
    }

    return project;
  }
}
