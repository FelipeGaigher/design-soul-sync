import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.company.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            componentsCount: true,
            lastImportedAt: true,
            importStatus: true,
          },
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa nao encontrada');
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException('Sem permissao para acessar esta empresa');
    }

    return company;
  }

  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    return this.prisma.company.create({
      data: {
        ...createCompanyDto,
        ownerId: userId,
      },
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });

    if (!company) {
      throw new NotFoundException('Empresa nao encontrada');
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException('Sem permissao para editar esta empresa');
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });

    if (!company) {
      throw new NotFoundException('Empresa nao encontrada');
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException('Sem permissao para excluir esta empresa');
    }

    return this.prisma.company.delete({ where: { id } });
  }
}
