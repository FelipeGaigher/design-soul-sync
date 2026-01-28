import { api } from '@/lib/api';

export interface Component {
  id: string;
  name: string;
  nodeId: string;
  previewUrl?: string;
  description?: string;
  status: 'ok' | 'modified' | 'broken' | 'unauthorized';
  variantsCount?: number;
}

export interface Folder {
  name: string;
  components: Component[];
}

export interface ProjectComponents {
  id: string;
  name: string;
  figmaUrl: string;
  folders: Folder[];
  lastImportedAt: string;
  companyName?: string;
  alertsCount: number;
}

// Detailed property types
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

// Component property definition (for component sets with variants)
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
  itemSpacing?: number;
  children?: ChildElement[];
  componentProperties?: Record<string, any>;
}

export interface ComponentProperties {
  fills?: FillStyle[];
  strokes?: StrokeStyle[];
  effects?: EffectStyle[];
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  cornerRadius?: number;
  cornerRadii?: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };
  layoutMode?: string;
  layoutAlign?: string;
  layoutGrow?: number;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  opacity?: number;
  blendMode?: string;
  textContents?: TextContent[];
  icons?: IconInfo[];
  childElements?: ChildElement[];
  // Component property definitions (for variants like "Show Icon Left", "Text", etc.)
  componentPropertyDefinitions?: Record<string, ComponentPropertyDefinition>;
  variantProperties?: Record<string, string>;
}

export interface ComponentVariant {
  id: string;
  name: string;
  previewUrl?: string;
  properties: ComponentProperties;
}

export interface ComponentDetail {
  id: string;
  name: string;
  description?: string;
  category: string;
  nodeId: string;
  figmaComponentId?: string;
  previewUrl?: string;
  status: 'ok' | 'modified' | 'broken' | 'unauthorized';
  properties: ComponentProperties;
  variants: ComponentVariant[];
  createdAt: string;
  updatedAt: string;
}

export const componentsService = {
  async getProjectComponents(projectId: string): Promise<ProjectComponents> {
    const response = await api.get<ProjectComponents>(
      `/projects/${projectId}/components`
    );
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getComponentDetail(projectId: string, componentId: string): Promise<ComponentDetail> {
    const response = await api.get<ComponentDetail>(
      `/projects/${projectId}/components/${componentId}`
    );
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getComponentCode(
    projectId: string,
    componentId: string,
    framework: 'react' | 'vue' | 'angular',
  ): Promise<{ code: string; language: string }> {
    const response = await api.get<{ code: string; language: string }>(
      `/projects/${projectId}/components/${componentId}/code?framework=${framework}`
    );
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async importComponents(projectId: string, fileKey: string) {
    const response = await api.post<{
      imported: number;
      updated: number;
      errors: string[];
    }>(`/figma/import-components/${projectId}`, { fileKey });
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  // Parse variant name to extract properties (e.g., "Variant=full default, Show icon left=true")
  parseVariantName(name: string): Record<string, string> {
    const props: Record<string, string> = {};
    const parts = name.split(',').map(p => p.trim());

    for (const part of parts) {
      const eqIndex = part.indexOf('=');
      if (eqIndex > 0) {
        const key = part.substring(0, eqIndex).trim();
        const value = part.substring(eqIndex + 1).trim();
        props[key] = value;
      }
    }

    return props;
  },

  // Get available variant options from component property definitions
  getVariantOptions(componentDetail: ComponentDetail): Record<string, string[]> {
    const options: Record<string, string[]> = {};

    if (componentDetail.properties.componentPropertyDefinitions) {
      for (const [key, def] of Object.entries(componentDetail.properties.componentPropertyDefinitions)) {
        if (def.type === 'VARIANT' && def.variantOptions) {
          options[key] = def.variantOptions;
        } else if (def.type === 'BOOLEAN') {
          options[key] = ['true', 'false'];
        }
      }
    }

    return options;
  },

  // Find variant by property values
  findVariant(
    componentDetail: ComponentDetail,
    propertyValues: Record<string, string>
  ): ComponentVariant | undefined {
    if (!componentDetail.variants) return undefined;

    return componentDetail.variants.find(variant => {
      const variantProps = this.parseVariantName(variant.name);
      return Object.entries(propertyValues).every(
        ([key, value]) => variantProps[key]?.toLowerCase() === value.toLowerCase()
      );
    });
  },

  // Group variants by a specific property (e.g., group by "Variant" to get "full default", "stroke default", etc.)
  groupVariantsByProperty(
    variants: ComponentVariant[],
    propertyName: string
  ): Record<string, ComponentVariant[]> {
    const groups: Record<string, ComponentVariant[]> = {};

    for (const variant of variants) {
      const props = this.parseVariantName(variant.name);
      const value = props[propertyName] || 'default';

      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(variant);
    }

    return groups;
  },

  // Get unique property values from variants
  getUniquePropertyValues(variants: ComponentVariant[], propertyName: string): string[] {
    const values = new Set<string>();

    for (const variant of variants) {
      const props = this.parseVariantName(variant.name);
      if (props[propertyName]) {
        values.add(props[propertyName]);
      }
    }

    return Array.from(values);
  },
};
