import { Injectable, Logger } from '@nestjs/common';
import { ComponentCategory } from '@prisma/client';

export interface ParsedVariant {
  name: string;
  nodeId: string;
  properties: Record<string, any>;
}

export interface ParsedComponent {
  name: string;
  nodeId: string;
  figmaComponentId: string;
  category: ComponentCategory;
  variants: ParsedVariant[];
  properties: ComponentProperties;
}

export interface ComponentProperties {
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  cornerRadius?: number;
  width?: number;
  height?: number;
  layoutMode?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

@Injectable()
export class FigmaParserService {
  private readonly logger = new Logger(FigmaParserService.name);

  parseComponents(fileData: any): ParsedComponent[] {
    const components: ParsedComponent[] = [];

    if (!fileData || !fileData.document) {
      this.logger.warn('No document found in Figma file data');
      return components;
    }

    // Percorrer todas as páginas
    if (fileData.document.children) {
      for (const page of fileData.document.children) {
        this.traverseNode(page, components);
      }
    }

    this.logger.log(`Parsed ${components.length} components from Figma file`);
    return components;
  }

  private traverseNode(node: any, components: ParsedComponent[]): void {
    if (!node) return;

    // Identificar tipo de componente
    if (node.type === 'COMPONENT') {
      const component = this.extractComponent(node);
      if (component) {
        components.push(component);
      }
    } else if (node.type === 'COMPONENT_SET') {
      const component = this.extractComponentSet(node);
      if (component) {
        components.push(component);
      }
    }

    // Recursivamente percorrer filhos
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.traverseNode(child, components);
      }
    }
  }

  private extractComponent(node: any): ParsedComponent | null {
    if (!node.id || !node.name) {
      return null;
    }

    return {
      name: node.name,
      nodeId: node.id,
      figmaComponentId: node.id, // Para componentes simples, o ID do nó é o mesmo
      category: this.categorizeComponent(node.name),
      variants: [], // Componente simples não tem variantes
      properties: this.extractProperties(node),
    };
  }

  private extractComponentSet(node: any): ParsedComponent | null {
    if (!node.id || !node.name) {
      return null;
    }

    const variants: ParsedVariant[] = [];

    // Extrair variantes dos children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child.type === 'COMPONENT') {
          variants.push({
            name: child.name,
            nodeId: child.id,
            properties: this.extractProperties(child),
          });
        }
      }
    }

    return {
      name: node.name,
      nodeId: node.id,
      figmaComponentId: node.id,
      category: this.categorizeComponent(node.name),
      variants,
      properties: this.extractProperties(node),
    };
  }

  private categorizeComponent(name: string): ComponentCategory {
    const nameLower = name.toLowerCase();

    // FUNDAMENTAIS: button, input, checkbox, radio, switch, toggle, select
    if (
      nameLower.includes('button') ||
      nameLower.includes('btn') ||
      nameLower.includes('input') ||
      nameLower.includes('checkbox') ||
      nameLower.includes('radio') ||
      nameLower.includes('switch') ||
      nameLower.includes('toggle') ||
      nameLower.includes('select') ||
      nameLower.includes('dropdown')
    ) {
      return ComponentCategory.FUNDAMENTAIS;
    }

    // FEEDBACK: alert, toast, notification, badge, spinner, skeleton
    if (
      nameLower.includes('alert') ||
      nameLower.includes('toast') ||
      nameLower.includes('notification') ||
      nameLower.includes('snackbar') ||
      nameLower.includes('badge') ||
      nameLower.includes('spinner') ||
      nameLower.includes('loader') ||
      nameLower.includes('skeleton') ||
      nameLower.includes('progress')
    ) {
      return ComponentCategory.FEEDBACK;
    }

    // LAYOUT: card, container, grid, dialog, modal, drawer, accordion, tabs
    if (
      nameLower.includes('card') ||
      nameLower.includes('container') ||
      nameLower.includes('grid') ||
      nameLower.includes('dialog') ||
      nameLower.includes('modal') ||
      nameLower.includes('drawer') ||
      nameLower.includes('accordion') ||
      nameLower.includes('tab') ||
      nameLower.includes('panel')
    ) {
      return ComponentCategory.LAYOUT;
    }

    // NAVEGACAO: nav, menu, breadcrumb, link, sidebar, pagination
    if (
      nameLower.includes('nav') ||
      nameLower.includes('menu') ||
      nameLower.includes('breadcrumb') ||
      nameLower.includes('link') ||
      nameLower.includes('sidebar') ||
      nameLower.includes('pagination') ||
      nameLower.includes('stepper')
    ) {
      return ComponentCategory.NAVEGACAO;
    }

    // DADOS: table, list, chart, graph, tree, data-grid, avatar
    if (
      nameLower.includes('table') ||
      nameLower.includes('list') ||
      nameLower.includes('chart') ||
      nameLower.includes('graph') ||
      nameLower.includes('tree') ||
      nameLower.includes('data') ||
      nameLower.includes('avatar') ||
      nameLower.includes('image')
    ) {
      return ComponentCategory.DADOS;
    }

    // Default: FUNDAMENTAIS
    return ComponentCategory.FUNDAMENTAIS;
  }

  private extractProperties(node: any): ComponentProperties {
    const properties: ComponentProperties = {};

    // Extrair propriedades visuais
    if (node.fills) properties.fills = node.fills;
    if (node.strokes) properties.strokes = node.strokes;
    if (node.effects) properties.effects = node.effects;
    if (node.cornerRadius !== undefined) properties.cornerRadius = node.cornerRadius;

    // Dimensões
    if (node.absoluteBoundingBox) {
      properties.width = node.absoluteBoundingBox.width;
      properties.height = node.absoluteBoundingBox.height;
    }

    // Layout (Auto Layout)
    if (node.layoutMode) properties.layoutMode = node.layoutMode;
    if (node.paddingLeft !== undefined) properties.paddingLeft = node.paddingLeft;
    if (node.paddingRight !== undefined) properties.paddingRight = node.paddingRight;
    if (node.paddingTop !== undefined) properties.paddingTop = node.paddingTop;
    if (node.paddingBottom !== undefined) properties.paddingBottom = node.paddingBottom;
    if (node.itemSpacing !== undefined) properties.itemSpacing = node.itemSpacing;

    return properties;
  }
}
