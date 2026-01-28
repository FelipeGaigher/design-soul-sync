import { Injectable } from '@nestjs/common';

interface FillStyle {
  type: string;
  color?: string;
  opacity?: number;
}

interface StrokeStyle {
  type: string;
  color?: string;
  weight?: number;
}

interface EffectStyle {
  type: string;
  color?: string;
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
}

interface TypographyStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number | 'AUTO';
  letterSpacing?: number;
}

interface TextContent {
  characters: string;
  style: TypographyStyle;
  nodeId: string;
}

interface ChildElement {
  name: string;
  type: string;
  nodeId: string;
  visible: boolean;
  fills?: FillStyle[];
  strokes?: StrokeStyle[];
  effects?: EffectStyle[];
  typography?: TypographyStyle;
  text?: string;
  cornerRadius?: number | number[];
  width?: number;
  height?: number;
  layoutMode?: string;
  children?: ChildElement[];
}

interface ComponentProperties {
  fills?: FillStyle[];
  strokes?: StrokeStyle[];
  effects?: EffectStyle[];
  width?: number;
  height?: number;
  cornerRadius?: number;
  cornerRadii?: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };
  layoutMode?: string;
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  textContents?: TextContent[];
  childElements?: ChildElement[];
}

interface ComponentData {
  name: string;
  category: string;
  variants?: Array<{ name: string; properties: ComponentProperties }>;
  properties: ComponentProperties;
}

@Injectable()
export class CodeGeneratorService {
  generate(component: ComponentData, framework: 'react' | 'vue' | 'angular'): string {
    switch (framework) {
      case 'react':
        return this.generateReact(component);
      case 'vue':
        return this.generateVue(component);
      case 'angular':
        return this.generateAngular(component);
    }
  }

  private buildStylesFromProperties(props: ComponentProperties): Record<string, string> {
    const styles: Record<string, string> = {};

    if (props.width) styles.width = `${Math.round(props.width)}px`;
    if (props.height) styles.height = `${Math.round(props.height)}px`;

    if (props.cornerRadius) {
      styles.borderRadius = `${props.cornerRadius}px`;
    } else if (props.cornerRadii) {
      const { topLeft, topRight, bottomRight, bottomLeft } = props.cornerRadii;
      styles.borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
    }

    if (props.fills?.length && props.fills[0]?.color) {
      styles.backgroundColor = props.fills[0].color;
    }

    if (props.strokes?.length && props.strokes[0]?.color) {
      const stroke = props.strokes[0];
      styles.border = `${stroke.weight || 1}px solid ${stroke.color}`;
    }

    if (props.effects?.length) {
      const shadows = props.effects
        .filter(e => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')
        .map(e => {
          const x = e.offset?.x || 0;
          const y = e.offset?.y || 0;
          const blur = e.radius || 0;
          const spread = e.spread || 0;
          const color = e.color || 'rgba(0,0,0,0.25)';
          const inset = e.type === 'INNER_SHADOW' ? 'inset ' : '';
          return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
        });
      if (shadows.length) styles.boxShadow = shadows.join(', ');
    }

    if (props.layoutMode && props.layoutMode !== 'NONE') {
      styles.display = 'flex';
      styles.flexDirection = props.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
      if (props.itemSpacing) styles.gap = `${props.itemSpacing}px`;
    }

    if (props.paddingTop || props.paddingRight || props.paddingBottom || props.paddingLeft) {
      styles.padding = `${props.paddingTop || 0}px ${props.paddingRight || 0}px ${props.paddingBottom || 0}px ${props.paddingLeft || 0}px`;
    }

    return styles;
  }

  private buildElementStyles(element: ChildElement): Record<string, string> {
    const styles: Record<string, string> = {};

    if (element.width) styles.width = `${Math.round(element.width)}px`;
    if (element.height) styles.height = `${Math.round(element.height)}px`;

    if (element.cornerRadius !== undefined) {
      if (Array.isArray(element.cornerRadius)) {
        styles.borderRadius = element.cornerRadius.map(v => `${v}px`).join(' ');
      } else {
        styles.borderRadius = `${element.cornerRadius}px`;
      }
    }

    if (element.fills?.length && element.fills[0]?.color) {
      styles.backgroundColor = element.fills[0].color;
    }

    if (element.strokes?.length && element.strokes[0]?.color) {
      const stroke = element.strokes[0];
      styles.border = `${stroke.weight || 1}px solid ${stroke.color}`;
    }

    if (element.effects?.length) {
      const shadows = element.effects
        .filter(e => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')
        .map(e => {
          const x = e.offset?.x || 0;
          const y = e.offset?.y || 0;
          const blur = e.radius || 0;
          const color = e.color || 'rgba(0,0,0,0.25)';
          const inset = e.type === 'INNER_SHADOW' ? 'inset ' : '';
          return `${inset}${x}px ${y}px ${blur}px ${color}`;
        });
      if (shadows.length) styles.boxShadow = shadows.join(', ');
    }

    if (element.typography) {
      const typo = element.typography;
      if (typo.fontFamily) styles.fontFamily = typo.fontFamily;
      if (typo.fontSize) styles.fontSize = `${typo.fontSize}px`;
      if (typo.fontWeight) styles.fontWeight = `${typo.fontWeight}`;
      if (typo.letterSpacing) styles.letterSpacing = `${typo.letterSpacing}px`;
      if (typo.lineHeight && typo.lineHeight !== 'AUTO') {
        styles.lineHeight = `${typo.lineHeight}px`;
      }
    }

    if (element.layoutMode && element.layoutMode !== 'NONE') {
      styles.display = 'flex';
      styles.flexDirection = element.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    }

    return styles;
  }

  private styleObjectToJsx(styles: Record<string, string>, indent: string = '  '): string {
    if (Object.keys(styles).length === 0) return '{}';
    const entries = Object.entries(styles)
      .map(([key, value]) => `${indent}  ${key}: '${value}'`)
      .join(',\n');
    return `{\n${entries}\n${indent}}`;
  }

  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.toKebab(key)}: ${value};`)
      .join(' ');
  }

  private toKebab(value: string): string {
    return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
  }

  private generateReact(component: ComponentData): string {
    const name = this.sanitizeName(component.name);
    const variants = component.variants || [];
    const props = component.properties;

    const styles = this.buildStylesFromProperties(props);

    const variantType = variants.length > 0
      ? variants.map(v => `'${this.sanitizeName(v.name)}'`).join(' | ')
      : "'default'";

    // Generate children code from childElements
    const generateChildrenCode = (children?: ChildElement[], indent: string = '      '): string => {
      if (!children || children.length === 0) {
        // Use textContents if available
        if (props.textContents?.length) {
          return props.textContents.map(t => {
            const textStyles: Record<string, string> = {};
            if (t.style.fontFamily) textStyles.fontFamily = t.style.fontFamily;
            if (t.style.fontSize) textStyles.fontSize = `${t.style.fontSize}px`;
            if (t.style.fontWeight) textStyles.fontWeight = `${t.style.fontWeight}`;
            return `${indent}<span style={${this.styleObjectToJsx(textStyles, indent)}}>${t.characters}</span>`;
          }).join('\n');
        }
        return `${indent}{children}`;
      }

      return children.map(child => {
        const childStyles = this.buildElementStyles(child);
        const tag = child.type === 'TEXT' ? 'span' : 'div';
        const content = child.text || '';

        if (child.children?.length) {
          const nestedCode = generateChildrenCode(child.children, indent + '  ');
          return `${indent}<${tag} style={${this.styleObjectToJsx(childStyles, indent)}}>\n${nestedCode}\n${indent}</${tag}>`;
        }

        if (Object.keys(childStyles).length > 0) {
          return `${indent}<${tag} style={${this.styleObjectToJsx(childStyles, indent)}}>${content}</${tag}>`;
        }
        return `${indent}<${tag}>${content}</${tag}>`;
      }).join('\n');
    };

    const childrenCode = generateChildrenCode(props.childElements);

    return `import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
  variant?: ${variantType};
  className?: string;
  onClick?: () => void;
}

const ${name}Styles: React.CSSProperties = ${this.styleObjectToJsx(styles)};

export const ${name}: React.FC<${name}Props> = ({
  children,
  variant = '${this.sanitizeName(variants[0]?.name || 'default')}',
  className = '',
  onClick,
}) => {
  return (
    <div
      style={${name}Styles}
      className={className}
      onClick={onClick}
    >
${childrenCode}
    </div>
  );
};

export default ${name};`;
  }

  private generateVue(component: ComponentData): string {
    const name = this.sanitizeName(component.name);
    const variants = component.variants || [];
    const props = component.properties;

    const styles = this.buildStylesFromProperties(props);

    const variantType = variants.length > 0
      ? variants.map(v => `'${v.name}'`).join(' | ')
      : "'default'";

    // Generate children template
    const generateChildrenTemplate = (children?: ChildElement[], indent: string = '    '): string => {
      if (!children || children.length === 0) {
        if (props.textContents?.length) {
          return props.textContents.map(t => {
            const textStyle = [
              t.style.fontFamily ? `font-family: ${t.style.fontFamily}` : '',
              t.style.fontSize ? `font-size: ${t.style.fontSize}px` : '',
              t.style.fontWeight ? `font-weight: ${t.style.fontWeight}` : '',
            ].filter(Boolean).join('; ');
            return `${indent}<span style="${textStyle}">${t.characters}</span>`;
          }).join('\n');
        }
        return `${indent}<slot />`;
      }

      return children.map(child => {
        const childStyles = this.buildElementStyles(child);
        const styleStr = this.styleObjectToCss(childStyles);
        const tag = child.type === 'TEXT' ? 'span' : 'div';
        const content = child.text || '';

        if (child.children?.length) {
          const nestedCode = generateChildrenTemplate(child.children, indent + '  ');
          return `${indent}<${tag} style="${styleStr}">\n${nestedCode}\n${indent}</${tag}>`;
        }

        return `${indent}<${tag} style="${styleStr}">${content}</${tag}>`;
      }).join('\n');
    };

    const childrenTemplate = generateChildrenTemplate(props.childElements);

    return `<template>
  <div :style="rootStyles" :class="className" @click="$emit('click')">
${childrenTemplate}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: ${variantType};
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: '${variants[0]?.name || 'default'}',
  className: '',
});

defineEmits(['click']);

const rootStyles = computed(() => ({
  ${Object.entries(styles).map(([k, v]) => `${k}: '${v}'`).join(',\n  ')}
}));
</script>`;
  }

  private generateAngular(component: ComponentData): string {
    const name = this.sanitizeName(component.name);
    const variants = component.variants || [];
    const props = component.properties;

    const styles = this.buildStylesFromProperties(props);

    const variantType = variants.length > 0
      ? variants.map(v => `'${v.name}'`).join(' | ')
      : 'string';

    // Generate children template
    const generateChildrenTemplate = (children?: ChildElement[], indent: string = '      '): string => {
      if (!children || children.length === 0) {
        if (props.textContents?.length) {
          return props.textContents.map(t => {
            const textStyle = [
              t.style.fontFamily ? `font-family: ${t.style.fontFamily}` : '',
              t.style.fontSize ? `font-size: ${t.style.fontSize}px` : '',
              t.style.fontWeight ? `font-weight: ${t.style.fontWeight}` : '',
            ].filter(Boolean).join('; ');
            return `${indent}<span style="${textStyle}">${t.characters}</span>`;
          }).join('\n');
        }
        return `${indent}<ng-content />`;
      }

      return children.map(child => {
        const childStyles = this.buildElementStyles(child);
        const styleStr = this.styleObjectToCss(childStyles);
        const tag = child.type === 'TEXT' ? 'span' : 'div';
        const content = child.text || '';

        return `${indent}<${tag} style="${styleStr}">${content}</${tag}>`;
      }).join('\n');
    };

    const childrenTemplate = generateChildrenTemplate(props.childElements);

    return `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${name.toLowerCase()}',
  standalone: true,
  template: \`
    <div [ngStyle]="rootStyles" [class]="className" (click)="onClick.emit()">
${childrenTemplate}
    </div>
  \`,
})
export class ${name}Component {
  @Input() variant: ${variantType} = '${variants[0]?.name || 'default'}';
  @Input() className: string = '';
  @Output() onClick = new EventEmitter<void>();

  rootStyles = {
    ${Object.entries(styles).map(([k, v]) => `'${this.toKebab(k)}': '${v}'`).join(',\n    ')}
  };
}`;
  }

  private sanitizeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '');
  }
}
