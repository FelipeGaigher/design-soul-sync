import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodeGeneratorService } from './code-generator.service';
import { ComponentCategory } from '@prisma/client';
import {
  ComponentResponseDto,
  FolderResponseDto,
  ProjectComponentsResponseDto,
  ComponentDetailDto,
  ComponentPropertiesDto,
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

    // Agrupar componentes por categoria e/ou prefixo no nome (ex: "Cards/Project")
    const foldersMap = new Map<string, FolderResponseDto>();

    for (const comp of project.components) {
      const [prefix, suffix] = comp.name.includes('/')
        ? comp.name.split('/', 2)
        : [null, null];
      const folderName = prefix || this.getFolderName(comp.category, comp.name);
      const displayName = suffix || comp.name;

      if (!foldersMap.has(folderName)) {
        foldersMap.set(folderName, { name: folderName, components: [] });
      }

      foldersMap.get(folderName)!.components.push({
        id: comp.id,
        name: displayName,
        nodeId: comp.figmaNodeId,
        previewUrl: comp.previewUrl,
        description: comp.description,
        status: 'ok' as const,
        variantsCount: comp.variants?.length || 0,
      });
    }

    const folders: FolderResponseDto[] = Array.from(foldersMap.values());

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

  private getFolderName(category: ComponentCategory, name: string): string {
    const lower = name.toLowerCase();

    if (lower.includes('card')) return 'Cards';
    if (lower.includes('menu') || lower.includes('sidebar') || lower.includes('navbar') || lower.includes('topbar')) return 'Menus';
    if (lower.includes('tab')) return 'Tabs';
    if (lower.includes('table')) return 'Tables';
    if (lower.includes('avatar')) return 'Avatars';
    if (lower.includes('badge') || lower.includes('tag')) return 'Badges';
    if (lower.includes('alert') || lower.includes('toast')) return 'Alerts';
    if (lower.includes('input') || lower.includes('select') || lower.includes('checkbox') || lower.includes('switch') || lower.includes('radio')) {
      return 'Form Controls';
    }
    if (lower.includes('breadcrumb') || lower.includes('pagination')) return 'Navigation';
    if (lower.includes('typography') || lower.includes('heading') || lower.includes('body')) return 'Typography';
    if (lower.includes('icon')) return 'Icons';

    return category;
  }

  async findOne(componentId: string): Promise<ComponentDetailDto> {
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

    // Parse properties from variants JSON if available
    const properties = this.parseComponentProperties(component);

    return {
      id: component.id,
      name: component.name,
      description: component.description,
      category: component.category,
      nodeId: component.figmaNodeId,
      figmaComponentId: component.figmaComponentId,
      previewUrl: component.previewUrl,
      status: 'ok',
      properties,
      variants: component.variants.map(v => ({
        id: v.id,
        name: v.name,
        previewUrl: v.previewUrl,
        properties: this.parseVariantProperties(v),
      })),
      createdAt: component.createdAt.toISOString(),
      updatedAt: component.updatedAt.toISOString(),
    };
  }

  private parseComponentProperties(component: any): ComponentPropertiesDto {
    // Try to get properties from the first variant or from component itself
    const props: ComponentPropertiesDto = {};

    if (component.variants && component.variants.length > 0) {
      const firstVariant = component.variants[0];
      const variantProps = typeof firstVariant.props === 'string'
        ? JSON.parse(firstVariant.props)
        : firstVariant.props || {};

      // Extract properties from variant props if available
      if (variantProps.fills) props.fills = variantProps.fills;
      if (variantProps.strokes) props.strokes = variantProps.strokes;
      if (variantProps.effects) props.effects = variantProps.effects;
      if (variantProps.width) props.width = variantProps.width;
      if (variantProps.height) props.height = variantProps.height;
      if (variantProps.cornerRadius !== undefined) props.cornerRadius = variantProps.cornerRadius;
      if (variantProps.cornerRadii) props.cornerRadii = variantProps.cornerRadii;
      if (variantProps.layoutMode) props.layoutMode = variantProps.layoutMode;
      if (variantProps.layoutAlign) props.layoutAlign = variantProps.layoutAlign;
      if (variantProps.paddingLeft !== undefined) props.paddingLeft = variantProps.paddingLeft;
      if (variantProps.paddingRight !== undefined) props.paddingRight = variantProps.paddingRight;
      if (variantProps.paddingTop !== undefined) props.paddingTop = variantProps.paddingTop;
      if (variantProps.paddingBottom !== undefined) props.paddingBottom = variantProps.paddingBottom;
      if (variantProps.itemSpacing !== undefined) props.itemSpacing = variantProps.itemSpacing;
      if (variantProps.opacity !== undefined) props.opacity = variantProps.opacity;
      if (variantProps.textContents) props.textContents = variantProps.textContents;
      if (variantProps.icons) props.icons = variantProps.icons;
      if (variantProps.childElements) props.childElements = variantProps.childElements;
    }

    return props;
  }

  private parseVariantProperties(variant: any): ComponentPropertiesDto {
    const props: ComponentPropertiesDto = {};

    const variantProps = typeof variant.props === 'string'
      ? JSON.parse(variant.props)
      : variant.props || {};

    if (variantProps.fills) props.fills = variantProps.fills;
    if (variantProps.strokes) props.strokes = variantProps.strokes;
    if (variantProps.effects) props.effects = variantProps.effects;
    if (variantProps.width) props.width = variantProps.width;
    if (variantProps.height) props.height = variantProps.height;
    if (variantProps.cornerRadius !== undefined) props.cornerRadius = variantProps.cornerRadius;
    if (variantProps.cornerRadii) props.cornerRadii = variantProps.cornerRadii;
    if (variantProps.layoutMode) props.layoutMode = variantProps.layoutMode;
    if (variantProps.paddingLeft !== undefined) props.paddingLeft = variantProps.paddingLeft;
    if (variantProps.paddingRight !== undefined) props.paddingRight = variantProps.paddingRight;
    if (variantProps.paddingTop !== undefined) props.paddingTop = variantProps.paddingTop;
    if (variantProps.paddingBottom !== undefined) props.paddingBottom = variantProps.paddingBottom;
    if (variantProps.itemSpacing !== undefined) props.itemSpacing = variantProps.itemSpacing;
    if (variantProps.textContents) props.textContents = variantProps.textContents;
    if (variantProps.icons) props.icons = variantProps.icons;
    if (variantProps.childElements) props.childElements = variantProps.childElements;
    if (variantProps.variantProperties) props.variantProperties = variantProps.variantProperties;

    return props;
  }

  async generateCode(
    componentId: string,
    framework: 'react' | 'vue' | 'angular',
  ): Promise<GeneratedCodeResponseDto> {
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

    // Build ComponentData object for code generator
    const componentData = {
      name: component.name,
      category: component.category,
      properties: this.parseComponentProperties(component),
      variants: component.variants.map(v => ({
        name: v.name,
        properties: this.parseVariantProperties(v),
      })),
    };

    const code = this.codeGeneratorService.generate(componentData, framework);

    return {
      code,
      language: framework === 'vue' ? 'vue' : 'typescript',
    };
  }
}
