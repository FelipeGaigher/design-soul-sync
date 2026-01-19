import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTokenDto, UpdateTokenDto, TokenFiltersDto, BulkCreateTokensDto } from './dto';
import { ChangeOrigin } from '@prisma/client';

@Injectable()
export class TokensService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId: string, userId: string, filters: TokenFiltersDto) {
    await this.checkProjectAccess(projectId, userId);

    const { type, category, search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { projectId };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tokens, total] = await Promise.all([
      this.prisma.token.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ type: 'asc' }, { category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.token.count({ where }),
    ]);

    return {
      data: tokens,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(projectId: string, tokenId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    const token = await this.prisma.token.findFirst({
      where: { id: tokenId, projectId },
      include: {
        history: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        componentTokens: {
          include: {
            component: {
              select: { id: true, name: true, category: true },
            },
          },
        },
      },
    });

    if (!token) {
      throw new NotFoundException('Token não encontrado');
    }

    return token;
  }

  async create(projectId: string, createTokenDto: CreateTokenDto, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    // Verificar se já existe token com mesmo nome
    const existing = await this.prisma.token.findFirst({
      where: { projectId, name: createTokenDto.name },
    });

    if (existing) {
      throw new ConflictException(`Token "${createTokenDto.name}" já existe neste projeto`);
    }

    const token = await this.prisma.token.create({
      data: {
        ...createTokenDto,
        projectId,
      },
    });

    // Registrar no histórico
    await this.prisma.tokenHistory.create({
      data: {
        tokenId: token.id,
        action: 'created',
        changes: JSON.parse(JSON.stringify({ created: createTokenDto })),
        origin: ChangeOrigin.MANUAL,
        userId,
      },
    });

    return token;
  }

  async bulkCreate(projectId: string, bulkDto: BulkCreateTokensDto, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    const results = {
      created: [] as any[],
      errors: [] as any[],
    };

    for (const tokenDto of bulkDto.tokens) {
      try {
        const existing = await this.prisma.token.findFirst({
          where: { projectId, name: tokenDto.name },
        });

        if (existing) {
          results.errors.push({
            name: tokenDto.name,
            error: 'Token já existe',
          });
          continue;
        }

        const token = await this.prisma.token.create({
          data: {
            ...tokenDto,
            projectId,
          },
        });

        await this.prisma.tokenHistory.create({
          data: {
            tokenId: token.id,
            action: 'created',
            changes: JSON.parse(JSON.stringify({ created: tokenDto })),
            origin: ChangeOrigin.MANUAL,
            userId,
          },
        });

        results.created.push(token);
      } catch (error) {
        results.errors.push({
          name: tokenDto.name,
          error: error.message,
        });
      }
    }

    return results;
  }

  async update(projectId: string, tokenId: string, updateTokenDto: UpdateTokenDto, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    const token = await this.prisma.token.findFirst({
      where: { id: tokenId, projectId },
    });

    if (!token) {
      throw new NotFoundException('Token não encontrado');
    }

    // Verificar nome duplicado se estiver alterando
    if (updateTokenDto.name && updateTokenDto.name !== token.name) {
      const existing = await this.prisma.token.findFirst({
        where: { projectId, name: updateTokenDto.name, NOT: { id: tokenId } },
      });

      if (existing) {
        throw new ConflictException(`Token "${updateTokenDto.name}" já existe neste projeto`);
      }
    }

    // Calcular mudanças
    const changes: Record<string, { before: any; after: any }> = {};
    for (const [key, value] of Object.entries(updateTokenDto)) {
      if (token[key] !== value) {
        changes[key] = { before: token[key], after: value };
      }
    }

    const updatedToken = await this.prisma.token.update({
      where: { id: tokenId },
      data: updateTokenDto,
    });

    // Registrar no histórico se houve mudanças
    if (Object.keys(changes).length > 0) {
      await this.prisma.tokenHistory.create({
        data: {
          tokenId: token.id,
          action: 'updated',
          changes,
          origin: ChangeOrigin.MANUAL,
          userId,
        },
      });
    }

    return updatedToken;
  }

  async remove(projectId: string, tokenId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    const token = await this.prisma.token.findFirst({
      where: { id: tokenId, projectId },
    });

    if (!token) {
      throw new NotFoundException('Token não encontrado');
    }

    await this.prisma.token.delete({
      where: { id: tokenId },
    });

    return { message: 'Token deletado com sucesso' };
  }

  async getStats(projectId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    const [total, byType, byCategory, recentChanges] = await Promise.all([
      this.prisma.token.count({ where: { projectId } }),
      this.prisma.token.groupBy({
        by: ['type'],
        where: { projectId },
        _count: true,
      }),
      this.prisma.token.groupBy({
        by: ['category'],
        where: { projectId },
        _count: true,
      }),
      this.prisma.tokenHistory.findMany({
        where: { token: { projectId } },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          token: { select: { name: true, type: true } },
          user: { select: { name: true, avatarUrl: true } },
        },
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentChanges,
    };
  }

  async getHistory(projectId: string, userId: string, page = 1, limit = 20) {
    await this.checkProjectAccess(projectId, userId);

    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.tokenHistory.findMany({
        where: { token: { projectId } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          token: { select: { id: true, name: true, type: true } },
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.tokenHistory.count({
        where: { token: { projectId } },
      }),
    ]);

    return {
      data: history,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCategories(projectId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    const categories = await this.prisma.token.findMany({
      where: { projectId },
      select: { category: true },
      distinct: ['category'],
    });

    return categories.map(c => c.category);
  }

  private async checkProjectAccess(projectId: string, userId: string) {
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
