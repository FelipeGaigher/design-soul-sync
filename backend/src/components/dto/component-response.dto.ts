import {
  FillStyle,
  StrokeStyle,
  EffectStyle,
  TypographyStyle,
  TextContent,
  IconInfo,
  ChildElement,
} from '../../figma/figma-parser.service';

export interface ComponentResponseDto {
  id: string;
  name: string;
  nodeId: string | null;
  previewUrl?: string | null;
  description?: string | null;
  status: 'ok' | 'modified' | 'broken' | 'unauthorized';
  variantsCount?: number;
}

export interface FolderResponseDto {
  name: string;
  components: ComponentResponseDto[];
}

export interface ProjectComponentsResponseDto {
  id: string;
  name: string;
  figmaUrl: string;
  folders: FolderResponseDto[];
  lastImportedAt: string;
  companyName?: string;
  alertsCount: number;
}

// Detailed component properties for viewing
export interface ComponentPropertiesDto {
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
  layoutMode?: string;
  layoutAlign?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;

  // Blend/Opacity
  opacity?: number;
  blendMode?: string;

  // Children elements
  textContents?: TextContent[];
  icons?: IconInfo[];
  childElements?: ChildElement[];

  // Component specifics
  variantProperties?: Record<string, string>;
}

export interface ComponentVariantDto {
  id: string;
  name: string;
  previewUrl?: string | null;
  properties: ComponentPropertiesDto;
}

export interface ComponentDetailDto {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  nodeId: string | null;
  figmaComponentId?: string | null;
  previewUrl?: string | null;
  status: 'ok' | 'modified' | 'broken' | 'unauthorized';
  properties: ComponentPropertiesDto;
  variants: ComponentVariantDto[];
  createdAt: string;
  updatedAt: string;
}
