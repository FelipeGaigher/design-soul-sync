import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodeGeneratorService } from './code-generator.service';
import { ComponentCategory } from '@prisma/client';
import {
  ComponentResponseDto,
  FolderResponseDto,
  ProjectComponentsResponseDto,
} from './dto/component-response.dto';
import { GeneratedCodeResponseDto } from './dto/code-generation.dto';

@Injectable()
export class ComponentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGeneratorService: CodeGeneratorService,
  ) {}

  async findByProject(projectId: string): Promise<ProjectComponentsResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        company: true,
        components: { include: { variants: true } },
        divergences: { where: { status: 'PENDING' } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Agrupar componentes por categoria
    const folders: FolderResponseDto[] = Object.values(ComponentCategory)
      .map(category => ({
        name: category,
        components: project.components
          .filter(comp => comp.category === category)
          .map(comp => ({
            id: comp.id,
            name: comp.name,
            nodeId: comp.figmaNodeId,
            previewUrl: comp.previewUrl,
            description: comp.description,
            status: 'ok' as const,
          })),
      }))
      .filter(folder => folder.components.length > 0);

    return {
      id: project.id,
      name: project.name,
      figmaUrl: project.figmaFileUrl || '',
      folders,
      lastImportedAt: project.figmaLastSyncAt?.toISOString() || '',
      companyName: project.company?.name,
      alertsCount: project.divergences.length,
    };
  }

  async findOne(componentId: string) {
    const component = await this.prisma.component.findUnique({
      where: { id: componentId },
      include: {
        variants: true,
        tokens: { include: { token: true } },
      },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    return component;
  }

  async generateCode(
    componentId: string,
    framework: 'react' | 'vue' | 'angular',
  ): Promise<GeneratedCodeResponseDto> {
    const component = await this.findOne(componentId);

    const code = this.codeGeneratorService.generate(component, framework);

    return {
      code,
      language: framework === 'vue' ? 'vue' : 'typescript',
    };
  }
}
