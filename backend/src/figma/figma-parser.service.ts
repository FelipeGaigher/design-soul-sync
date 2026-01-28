import { Injectable, Logger } from '@nestjs/common';
import { ComponentCategory } from '@prisma/client';

export interface ParsedVariant {
  name: string;
  nodeId: string;
  properties: Record<string, any>;
}

export interface FillStyle {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'IMAGE';
  color?: string;
  opacity?: number;
  gradientStops?: Array<{ color: string; position: number }>;
  imageRef?: string;
}

export interface StrokeStyle {
  type: 'SOLID' | 'GRADIENT_LINEAR';
  color?: string;
  opacity?: number;
  weight?: number;
  position?: 'CENTER' | 'INSIDE' | 'OUTSIDE';
  dashPattern?: number[];
}

export interface EffectStyle {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  color?: string;
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
  visible?: boolean;
}

export interface TypographyStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  lineHeight?: number | 'AUTO';
  lineHeightUnit?: 'PIXELS' | 'PERCENT' | 'AUTO';
  letterSpacing?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
}

export interface TextContent {
  characters: string;
  style: TypographyStyle;
  nodeId: string;
  nodeName: string;
}

export interface IconInfo {
  name: string;
  nodeId: string;
  width: number;
  height: number;
  fills: FillStyle[];
}

export interface ComponentPropertyDefinition {
  type: 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT';
  defaultValue: any;
  preferredValues?: any[];
  variantOptions?: string[];
}

export interface ChildElement {
  name: string;
  type: string;
  nodeId: string;
  visible: boolean;
  locked: boolean;
  fills?: FillStyle[];
  strokes?: StrokeStyle[];
  effects?: EffectStyle[];
  typography?: TypographyStyle;
  text?: string;
  cornerRadius?: number | number[];
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  rotation?: number;
  opacity?: number;
  blendMode?: string;
  constraints?: { horizontal: string; vertical: string };
  layoutMode?: string;
  children?: ChildElement[];
  // Component instance properties
  componentProperties?: Record<string, any>;
}

export interface ComponentProperties {
  // Visual properties
  fills?: FillStyle[];
  strokes?: StrokeStyle[];
  effects?: EffectStyle[];

  // Dimensions
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  // Corner radius
  cornerRadius?: number;
  cornerRadii?: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };

  // Layout (Auto Layout)
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
  layoutGrow?: number;
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;

  // Constraints
  constraints?: { horizontal: string; vertical: string };

  // Blend/Opacity
  opacity?: number;
  blendMode?: string;

  // Children elements
  textContents?: TextContent[];
  icons?: IconInfo[];
  childElements?: ChildElement[];

  // Component property definitions (for variants)
  componentPropertyDefinitions?: Record<string, ComponentPropertyDefinition>;
  variantProperties?: Record<string, string>;
}

export interface ParsedComponent {
  name: string;
  nodeId: string;
  figmaComponentId: string;
  category: ComponentCategory;
  variants: ParsedVariant[];
  properties: ComponentProperties;
  description?: string;
}

@Injectable()
export class FigmaParserService {
  private readonly logger = new Logger(FigmaParserService.name);

  parseComponents(fileData: any): ParsedComponent[] {
    const components: ParsedComponent[] = [];

    if (!fileData || !fileData.document) {
      this.logger.warn('No document found in Figma file data');
      this.logger.warn(`File data structure: ${JSON.stringify(Object.keys(fileData || {}))}`);
      return components;
    }

    this.logger.log(`Document found. Pages: ${fileData.document.children?.length || 0}`);

    // Percorrer todas as páginas
    if (fileData.document.children) {
      for (const page of fileData.document.children) {
        this.logger.log(`Processing page: ${page.name} (type: ${page.type})`);
        this.traverseNode(page, components, page.name);
      }
    }

    this.logger.log(`Parsed ${components.length} components from Figma file`);
    if (components.length === 0) {
      this.logger.warn('No components found. Make sure components are published in Figma.');
    }
    return components;
  }

  private traverseNode(node: any, components: ParsedComponent[], pageName: string): void {
    if (!node) return;

    // Identificar tipo de componente
    if (node.type === 'COMPONENT') {
      this.logger.debug(`Found COMPONENT: ${node.name} (id: ${node.id})`);
      const component = this.extractComponent(node, pageName);
      if (component) {
        components.push(component);
        this.logger.log(`Added component: ${component.name} (category: ${component.category})`);
      }
    } else if (node.type === 'COMPONENT_SET') {
      this.logger.debug(`Found COMPONENT_SET: ${node.name} (id: ${node.id})`);
      const component = this.extractComponentSet(node, pageName);
      if (component) {
        components.push(component);
        this.logger.log(`Added component set: ${component.name} with ${component.variants.length} variants (category: ${component.category})`);

        // Log component property definitions if present
        if (component.properties.componentPropertyDefinitions) {
          const propNames = Object.keys(component.properties.componentPropertyDefinitions);
          this.logger.log(`  Component properties: ${propNames.join(', ')}`);
        }
      }
    }

    // Recursivamente percorrer filhos
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.traverseNode(child, components, pageName);
      }
    }
  }

  private extractComponent(node: any, pageName: string): ParsedComponent | null {
    if (!node.id || !node.name) {
      return null;
    }

    // Use page name as folder prefix
    const fullName = pageName ? `${pageName}/${node.name}` : node.name;

    return {
      name: fullName,
      nodeId: node.id,
      figmaComponentId: node.id,
      category: this.categorizeComponent(node.name),
      variants: [],
      properties: this.extractProperties(node),
      description: node.description || undefined,
    };
  }

  private extractComponentSet(node: any, pageName: string): ParsedComponent | null {
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

    // Use page name as folder prefix
    const fullName = pageName ? `${pageName}/${node.name}` : node.name;

    return {
      name: fullName,
      nodeId: node.id,
      figmaComponentId: node.id,
      category: this.categorizeComponent(node.name),
      variants,
      properties: this.extractProperties(node),
      description: node.description || undefined,
    };
  }

  private categorizeComponent(name: string): ComponentCategory {
    const nameLower = name.toLowerCase();

    // BUTTONS: Todos os tipos de botões
    if (
      nameLower.includes('button') ||
      nameLower.includes('btn')
    ) {
      return ComponentCategory.BUTTONS;
    }

    // FOUNDATION: Tipografia, Cores
    if (
      nameLower.includes('tipografia') ||
      nameLower.includes('typography') ||
      nameLower.includes('font') ||
      nameLower.includes('heading') ||
      nameLower.includes('text') ||
      nameLower.includes('color') ||
      nameLower.includes('cor') ||
      nameLower.includes('palette')
    ) {
      return ComponentCategory.FOUNDATION;
    }

    // FORM_CONTROLS: Input, Checkbox, Switch, Dropdown
    if (
      nameLower.includes('input') ||
      nameLower.includes('checkbox') ||
      nameLower.includes('radio') ||
      nameLower.includes('switch') ||
      nameLower.includes('toggle') ||
      nameLower.includes('select') ||
      nameLower.includes('dropdown') ||
      nameLower.includes('textarea') ||
      nameLower.includes('slider') ||
      nameLower.includes('range')
    ) {
      return ComponentCategory.FORM_CONTROLS;
    }

    // FEEDBACK: Alert, Loading, Tags
    if (
      nameLower.includes('alert') ||
      nameLower.includes('toast') ||
      nameLower.includes('notification') ||
      nameLower.includes('snackbar') ||
      nameLower.includes('badge') ||
      nameLower.includes('spinner') ||
      nameLower.includes('loader') ||
      nameLower.includes('loading') ||
      nameLower.includes('skeleton') ||
      nameLower.includes('progress') ||
      nameLower.includes('tag') ||
      nameLower.includes('chip')
    ) {
      return ComponentCategory.FEEDBACK;
    }

    // NAVIGATION: Breadcrumb, Navbar, Menu Lateral, Menu Topo, Steps
    if (
      nameLower.includes('nav') ||
      nameLower.includes('menu') ||
      nameLower.includes('breadcrumb') ||
      nameLower.includes('link') ||
      nameLower.includes('sidebar') ||
      nameLower.includes('pagination') ||
      nameLower.includes('stepper') ||
      nameLower.includes('step') ||
      nameLower.includes('wizard')
    ) {
      return ComponentCategory.NAVIGATION;
    }

    // LAYOUT: Cards, Modal, Calendar
    if (
      nameLower.includes('card') ||
      nameLower.includes('container') ||
      nameLower.includes('grid') ||
      nameLower.includes('dialog') ||
      nameLower.includes('modal') ||
      nameLower.includes('drawer') ||
      nameLower.includes('accordion') ||
      nameLower.includes('tab') ||
      nameLower.includes('panel') ||
      nameLower.includes('calendar') ||
      nameLower.includes('date')
    ) {
      return ComponentCategory.LAYOUT;
    }

    // DATA_DISPLAY: Tables, Product Display, Contador, Filter
    if (
      nameLower.includes('table') ||
      nameLower.includes('list') ||
      nameLower.includes('chart') ||
      nameLower.includes('graph') ||
      nameLower.includes('tree') ||
      nameLower.includes('data') ||
      nameLower.includes('product') ||
      nameLower.includes('contador') ||
      nameLower.includes('counter') ||
      nameLower.includes('filter') ||
      nameLower.includes('search') ||
      nameLower.includes('avatar')
    ) {
      return ComponentCategory.DATA_DISPLAY;
    }

    // MEDIA: Icons, Logos
    if (
      nameLower.includes('icon') ||
      nameLower.includes('logo') ||
      nameLower.includes('image') ||
      nameLower.includes('img') ||
      nameLower.includes('picture') ||
      nameLower.includes('photo')
    ) {
      return ComponentCategory.MEDIA;
    }

    // Default: FORM_CONTROLS (mais genérico)
    return ComponentCategory.FORM_CONTROLS;
  }

  private extractProperties(node: any): ComponentProperties {
    const properties: ComponentProperties = {};

    // Extrair fills detalhados
    if (node.fills && Array.isArray(node.fills)) {
      properties.fills = this.extractFills(node.fills);
    }

    // Extrair strokes detalhados
    if (node.strokes && Array.isArray(node.strokes)) {
      properties.strokes = this.extractStrokes(node.strokes, node);
    }

    // Extrair effects detalhados
    if (node.effects && Array.isArray(node.effects)) {
      properties.effects = this.extractEffects(node.effects);
    }

    // Corner radius
    if (node.cornerRadius !== undefined) {
      properties.cornerRadius = node.cornerRadius;
    }
    if (node.rectangleCornerRadii) {
      properties.cornerRadii = {
        topLeft: node.rectangleCornerRadii[0] || 0,
        topRight: node.rectangleCornerRadii[1] || 0,
        bottomRight: node.rectangleCornerRadii[2] || 0,
        bottomLeft: node.rectangleCornerRadii[3] || 0,
      };
    }

    // Dimensões
    if (node.absoluteBoundingBox) {
      properties.width = node.absoluteBoundingBox.width;
      properties.height = node.absoluteBoundingBox.height;
    }
    if (node.minWidth !== undefined) properties.minWidth = node.minWidth;
    if (node.maxWidth !== undefined) properties.maxWidth = node.maxWidth;
    if (node.minHeight !== undefined) properties.minHeight = node.minHeight;
    if (node.maxHeight !== undefined) properties.maxHeight = node.maxHeight;

    // Layout (Auto Layout)
    if (node.layoutMode) properties.layoutMode = node.layoutMode;
    if (node.layoutAlign) properties.layoutAlign = node.layoutAlign;
    if (node.layoutGrow !== undefined) properties.layoutGrow = node.layoutGrow;
    if (node.primaryAxisSizingMode) properties.primaryAxisSizingMode = node.primaryAxisSizingMode;
    if (node.counterAxisSizingMode) properties.counterAxisSizingMode = node.counterAxisSizingMode;
    if (node.primaryAxisAlignItems) properties.primaryAxisAlignItems = node.primaryAxisAlignItems;
    if (node.counterAxisAlignItems) properties.counterAxisAlignItems = node.counterAxisAlignItems;
    if (node.paddingLeft !== undefined) properties.paddingLeft = node.paddingLeft;
    if (node.paddingRight !== undefined) properties.paddingRight = node.paddingRight;
    if (node.paddingTop !== undefined) properties.paddingTop = node.paddingTop;
    if (node.paddingBottom !== undefined) properties.paddingBottom = node.paddingBottom;
    if (node.itemSpacing !== undefined) properties.itemSpacing = node.itemSpacing;

    // Constraints
    if (node.constraints) {
      properties.constraints = {
        horizontal: node.constraints.horizontal,
        vertical: node.constraints.vertical,
      };
    }

    // Blend/Opacity
    if (node.opacity !== undefined) properties.opacity = node.opacity;
    if (node.blendMode) properties.blendMode = node.blendMode;

    // Component property definitions (for component sets)
    // This includes properties like "Show Icon Left", "Icon Left", "Show Text", "Text", etc.
    if (node.componentPropertyDefinitions) {
      properties.componentPropertyDefinitions = this.extractComponentPropertyDefinitions(node.componentPropertyDefinitions);
    }

    // Variant properties (name=value pairs)
    if (node.name && node.name.includes('=')) {
      properties.variantProperties = this.parseVariantName(node.name);
    }

    // Extrair textos filhos
    properties.textContents = this.extractTextContents(node);

    // Extrair ícones filhos
    properties.icons = this.extractIcons(node);

    // Extrair estrutura completa de filhos
    properties.childElements = this.extractChildElements(node);

    return properties;
  }

  private extractComponentPropertyDefinitions(definitions: any): Record<string, ComponentPropertyDefinition> {
    const result: Record<string, ComponentPropertyDefinition> = {};

    for (const [key, def] of Object.entries(definitions) as [string, any][]) {
      result[key] = {
        type: def.type,
        defaultValue: def.defaultValue,
        preferredValues: def.preferredValues,
        variantOptions: def.variantOptions,
      };
    }

    return result;
  }

  private extractFills(fills: any[]): FillStyle[] {
    return fills
      .filter(fill => fill.visible !== false)
      .map(fill => {
        const fillStyle: FillStyle = {
          type: fill.type,
        };

        if (fill.type === 'SOLID' && fill.color) {
          fillStyle.color = this.rgbaToHex(fill.color, fill.opacity);
          fillStyle.opacity = fill.opacity ?? 1;
        } else if (fill.type?.includes('GRADIENT') && fill.gradientStops) {
          fillStyle.gradientStops = fill.gradientStops.map((stop: any) => ({
            color: this.rgbaToHex(stop.color),
            position: stop.position,
          }));
        } else if (fill.type === 'IMAGE') {
          fillStyle.imageRef = fill.imageRef;
        }

        return fillStyle;
      });
  }

  private extractStrokes(strokes: any[], node: any): StrokeStyle[] {
    return strokes
      .filter(stroke => stroke.visible !== false)
      .map(stroke => {
        const strokeStyle: StrokeStyle = {
          type: stroke.type,
        };

        if (stroke.type === 'SOLID' && stroke.color) {
          strokeStyle.color = this.rgbaToHex(stroke.color, stroke.opacity);
          strokeStyle.opacity = stroke.opacity ?? 1;
        }

        if (node.strokeWeight !== undefined) {
          strokeStyle.weight = node.strokeWeight;
        }
        if (node.strokeAlign) {
          strokeStyle.position = node.strokeAlign;
        }
        if (node.dashPattern && node.dashPattern.length > 0) {
          strokeStyle.dashPattern = node.dashPattern;
        }

        return strokeStyle;
      });
  }

  private extractEffects(effects: any[]): EffectStyle[] {
    return effects
      .filter(effect => effect.visible !== false)
      .map(effect => {
        const effectStyle: EffectStyle = {
          type: effect.type,
          visible: effect.visible ?? true,
        };

        if (effect.color) {
          effectStyle.color = this.rgbaToHex(effect.color);
        }
        if (effect.offset) {
          effectStyle.offset = { x: effect.offset.x, y: effect.offset.y };
        }
        if (effect.radius !== undefined) {
          effectStyle.radius = effect.radius;
        }
        if (effect.spread !== undefined) {
          effectStyle.spread = effect.spread;
        }

        return effectStyle;
      });
  }

  private extractTextContents(node: any): TextContent[] {
    const textContents: TextContent[] = [];

    const traverseForText = (n: any) => {
      if (n.type === 'TEXT') {
        const textContent: TextContent = {
          characters: n.characters || '',
          nodeId: n.id,
          nodeName: n.name,
          style: this.extractTypography(n),
        };
        textContents.push(textContent);
      }

      if (n.children && Array.isArray(n.children)) {
        for (const child of n.children) {
          traverseForText(child);
        }
      }
    };

    if (node.children) {
      for (const child of node.children) {
        traverseForText(child);
      }
    }

    return textContents;
  }

  private extractTypography(node: any): TypographyStyle {
    const style: TypographyStyle = {};

    // Extrair do style object
    if (node.style) {
      if (node.style.fontFamily) style.fontFamily = node.style.fontFamily;
      if (node.style.fontSize) style.fontSize = node.style.fontSize;
      if (node.style.fontWeight) style.fontWeight = node.style.fontWeight;
      if (node.style.italic) style.fontStyle = 'italic';
      if (node.style.lineHeightPx) style.lineHeight = node.style.lineHeightPx;
      if (node.style.lineHeightUnit) style.lineHeightUnit = node.style.lineHeightUnit;
      if (node.style.letterSpacing) style.letterSpacing = node.style.letterSpacing;
      if (node.style.textAlignHorizontal) style.textAlignHorizontal = node.style.textAlignHorizontal;
      if (node.style.textAlignVertical) style.textAlignVertical = node.style.textAlignVertical;
      if (node.style.textDecoration) style.textDecoration = node.style.textDecoration;
      if (node.style.textCase) style.textCase = node.style.textCase;
    }

    return style;
  }

  private extractIcons(node: any): IconInfo[] {
    const icons: IconInfo[] = [];

    const traverseForIcons = (n: any) => {
      // Identificar ícones por tipo ou convenção de nome
      const isIcon = (
        n.type === 'VECTOR' ||
        n.type === 'BOOLEAN_OPERATION' ||
        (n.type === 'INSTANCE' && (n.name?.toLowerCase().includes('icon') || n.name?.toLowerCase().includes('icone'))) ||
        (n.type === 'COMPONENT' && (n.name?.toLowerCase().includes('icon') || n.name?.toLowerCase().includes('icone')))
      );

      if (isIcon && n.absoluteBoundingBox) {
        icons.push({
          name: n.name,
          nodeId: n.id,
          width: n.absoluteBoundingBox.width,
          height: n.absoluteBoundingBox.height,
          fills: n.fills ? this.extractFills(n.fills) : [],
        });
      }

      if (n.children && Array.isArray(n.children)) {
        for (const child of n.children) {
          traverseForIcons(child);
        }
      }
    };

    if (node.children) {
      for (const child of node.children) {
        traverseForIcons(child);
      }
    }

    return icons;
  }

  private extractChildElements(node: any, depth: number = 0): ChildElement[] {
    const children: ChildElement[] = [];
    const maxDepth = 10; // Increased depth for better component capture

    if (depth >= maxDepth || !node.children || !Array.isArray(node.children)) {
      return children;
    }

    for (const child of node.children) {
      const element: ChildElement = {
        name: child.name,
        type: child.type,
        nodeId: child.id,
        visible: child.visible !== false,
        locked: child.locked || false,
      };

      // Extrair propriedades visuais básicas
      if (child.fills && Array.isArray(child.fills)) {
        element.fills = this.extractFills(child.fills);
      }
      if (child.strokes && Array.isArray(child.strokes)) {
        element.strokes = this.extractStrokes(child.strokes, child);
      }
      if (child.effects && Array.isArray(child.effects)) {
        element.effects = this.extractEffects(child.effects);
      }

      // Texto
      if (child.type === 'TEXT') {
        element.typography = this.extractTypography(child);
        element.text = child.characters;
      }

      // Corner radius
      if (child.cornerRadius !== undefined) {
        element.cornerRadius = child.cornerRadius;
      } else if (child.rectangleCornerRadii) {
        element.cornerRadius = child.rectangleCornerRadii;
      }

      // Dimensões e posição
      if (child.absoluteBoundingBox) {
        element.width = child.absoluteBoundingBox.width;
        element.height = child.absoluteBoundingBox.height;
        element.x = child.absoluteBoundingBox.x;
        element.y = child.absoluteBoundingBox.y;
      }

      // Rotação
      if (child.rotation !== undefined) element.rotation = child.rotation;

      // Opacity e Blend
      if (child.opacity !== undefined) element.opacity = child.opacity;
      if (child.blendMode) element.blendMode = child.blendMode;

      // Constraints
      if (child.constraints) {
        element.constraints = {
          horizontal: child.constraints.horizontal,
          vertical: child.constraints.vertical,
        };
      }

      // Layout mode
      if (child.layoutMode) element.layoutMode = child.layoutMode;

      // Component properties for instances
      if (child.componentProperties) {
        element.componentProperties = child.componentProperties;
      }

      // Filhos recursivamente
      if (child.children && Array.isArray(child.children)) {
        element.children = this.extractChildElements(child, depth + 1);
      }

      children.push(element);
    }

    return children;
  }

  private parseVariantName(name: string): Record<string, string> {
    const props: Record<string, string> = {};
    const parts = name.split(',').map(p => p.trim());

    for (const part of parts) {
      const [key, value] = part.split('=').map(s => s.trim());
      if (key && value) {
        props[key] = value;
      }
    }

    return props;
  }

  private rgbaToHex(color: any, opacity?: number): string {
    if (!color) return '#000000';

    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    const a = opacity ?? color.a ?? 1;

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    if (a < 1) {
      const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
      return `${hex}${alphaHex}`;
    }

    return hex;
  }
}
