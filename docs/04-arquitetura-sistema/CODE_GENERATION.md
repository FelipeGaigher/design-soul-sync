# Geração de Código - TokenSync

## 📋 Visão Geral

O módulo de geração de código transforma Design Tokens e Componentes em código pronto para produção em múltiplos formatos e frameworks.

## 🎯 Formatos Suportados

| Formato | Extensão | Descrição |
|---------|----------|-----------|
| JSON | `.json` | Design Tokens Format (DTF) |
| CSS | `.css` | CSS Custom Properties |
| Tailwind | `.js/.ts` | Configuração Tailwind CSS |
| React | `.tsx` | Componentes React + TypeScript |
| TypeScript | `.d.ts` | Type definitions |

## 🏗️ Arquitetura do Gerador

```
┌─────────────────────────────────────────────────────────────────┐
│                    Code Generator Service                        │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │   Fetch     │──▶│   Process   │──▶│   Generate  │          │
│  │   Data      │   │   Options   │   │   Files     │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│                                            │                    │
│         ┌──────────────────────────────────┼──────────────┐    │
│         ▼              ▼              ▼              ▼         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │   JSON    │  │   CSS     │  │ Tailwind  │  │   React   │  │
│  │ Generator │  │ Generator │  │ Generator │  │ Generator │  │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘  │
│                                                                 │
│                           │                                     │
│                           ▼                                     │
│                    ┌─────────────┐                             │
│                    │   Bundle    │                             │
│                    │   as ZIP    │                             │
│                    └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

## 📄 Gerador JSON

### Design Tokens Format (DTF)

```typescript
// src/modules/code-generator/generators/json.generator.ts
import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';

interface DTFToken {
  $value: string;
  $type: string;
  $description?: string;
}

interface DTFOutput {
  [category: string]: {
    [name: string]: DTFToken | { [key: string]: DTFToken };
  };
}

@Injectable()
export class JsonGenerator {
  generate(tokens: Token[], options: GeneratorOptions): string {
    const output: DTFOutput = {};

    for (const token of tokens) {
      const path = this.parsePath(token.name, options.naming);
      this.setNestedValue(output, path, {
        $value: token.value,
        $type: this.mapType(token.type),
        ...(token.description && { $description: token.description }),
      });
    }

    return JSON.stringify(output, null, 2);
  }

  private parsePath(name: string, naming: NamingConvention): string[] {
    // "color/primary-500" => ["color", "primary", "500"]
    return name
      .split('/')
      .flatMap(part => part.split('-'))
      .map(part => this.applyNaming(part, naming));
  }

  private applyNaming(str: string, naming: NamingConvention): string {
    switch (naming) {
      case 'camelCase':
        return str.charAt(0).toLowerCase() + str.slice(1);
      case 'snake_case':
        return str.toLowerCase();
      case 'kebab-case':
      default:
        return str.toLowerCase();
    }
  }

  private mapType(type: string): string {
    const typeMap: Record<string, string> = {
      COLOR: 'color',
      SPACING: 'dimension',
      TYPOGRAPHY: 'fontFamily',
      BORDER: 'borderRadius',
      SHADOW: 'shadow',
      ANIMATION: 'duration',
      Z_INDEX: 'number',
      OPACITY: 'number',
    };
    return typeMap[type] || 'string';
  }

  private setNestedValue(obj: any, path: string[], value: any): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }
}
```

### Exemplo de Output JSON

```json
{
  "color": {
    "primary": {
      "500": {
        "$value": "#6BA5E7",
        "$type": "color",
        "$description": "Cor primária principal"
      },
      "400": {
        "$value": "#85B6EC",
        "$type": "color"
      }
    },
    "accent": {
      "400": {
        "$value": "#F0E4C8",
        "$type": "color"
      }
    }
  },
  "spacing": {
    "md": {
      "$value": "16px",
      "$type": "dimension"
    },
    "lg": {
      "$value": "24px",
      "$type": "dimension"
    }
  }
}
```

## 🎨 Gerador CSS

```typescript
// src/modules/code-generator/generators/css.generator.ts
import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';

@Injectable()
export class CssGenerator {
  generate(tokens: Token[], options: GeneratorOptions): string {
    const lines: string[] = [
      '/* ==========================================================================',
      '   Design Tokens - Generated by TokenSync',
      '   ========================================================================== */',
      '',
      ':root {',
    ];

    // Agrupar por categoria
    const grouped = this.groupByCategory(tokens);

    for (const [category, categoryTokens] of Object.entries(grouped)) {
      lines.push(`  /* ${category} */`);
      
      for (const token of categoryTokens) {
        const varName = this.toVariableName(token.name, options.naming);
        lines.push(`  --${varName}: ${token.value};`);
      }
      
      lines.push('');
    }

    lines.push('}');

    // Adicionar classes utilitárias se solicitado
    if (options.includeUtilities) {
      lines.push(...this.generateUtilityClasses(tokens, options));
    }

    return lines.join('\n');
  }

  private toVariableName(name: string, naming: NamingConvention): string {
    // "color/primary-500" => "color-primary-500" (kebab-case)
    const base = name.replace(/\//g, '-');
    
    switch (naming) {
      case 'camelCase':
        return base.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      case 'snake_case':
        return base.replace(/-/g, '_');
      case 'kebab-case':
      default:
        return base;
    }
  }

  private groupByCategory(tokens: Token[]): Record<string, Token[]> {
    return tokens.reduce((acc, token) => {
      const category = token.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(token);
      return acc;
    }, {} as Record<string, Token[]>);
  }

  private generateUtilityClasses(tokens: Token[], options: GeneratorOptions): string[] {
    const lines: string[] = [
      '',
      '/* ==========================================================================',
      '   Utility Classes',
      '   ========================================================================== */',
      '',
    ];

    for (const token of tokens) {
      const varName = this.toVariableName(token.name, options.naming);
      const className = varName.replace(/^color-/, 'text-');

      if (token.type === 'COLOR') {
        lines.push(`.text-${varName.replace('color-', '')} { color: var(--${varName}); }`);
        lines.push(`.bg-${varName.replace('color-', '')} { background-color: var(--${varName}); }`);
      } else if (token.type === 'SPACING') {
        lines.push(`.p-${varName.replace('spacing-', '')} { padding: var(--${varName}); }`);
        lines.push(`.m-${varName.replace('spacing-', '')} { margin: var(--${varName}); }`);
      }
    }

    return lines;
  }
}
```

### Exemplo de Output CSS

```css
/* ==========================================================================
   Design Tokens - Generated by TokenSync
   ========================================================================== */

:root {
  /* Colors */
  --color-primary-500: #6BA5E7;
  --color-primary-400: #85B6EC;
  --color-primary-600: #5A94D6;
  --color-accent-400: #F0E4C8;

  /* Spacing */
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* Typography */
  --font-heading: Inter, sans-serif;
  --font-weight-heading: 600;

  /* Borders */
  --radius-md: 0.75rem;

  /* Effects */
  --shadow-soft: 0 4px 12px rgba(0,0,0,0.06);
}
```

## ⚡ Gerador Tailwind

```typescript
// src/modules/code-generator/generators/tailwind.generator.ts
import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';

@Injectable()
export class TailwindGenerator {
  generate(tokens: Token[], options: GeneratorOptions): string {
    const config = {
      colors: {},
      spacing: {},
      fontFamily: {},
      borderRadius: {},
      boxShadow: {},
      animation: {},
      opacity: {},
      zIndex: {},
    };

    for (const token of tokens) {
      this.addToConfig(config, token, options);
    }

    return this.formatConfig(config, options);
  }

  private addToConfig(config: any, token: Token, options: GeneratorOptions): void {
    const pathParts = token.name.split('/');
    const key = this.formatKey(pathParts.slice(1).join('-'), options.naming);

    switch (token.type) {
      case 'COLOR':
        this.setNestedColor(config.colors, pathParts.slice(1), token.value);
        break;
      case 'SPACING':
        config.spacing[key] = token.value;
        break;
      case 'TYPOGRAPHY':
        if (token.name.includes('font-family') || token.name.includes('fontFamily')) {
          config.fontFamily[key] = [token.value, 'sans-serif'];
        }
        break;
      case 'BORDER':
        config.borderRadius[key] = token.value;
        break;
      case 'SHADOW':
        config.boxShadow[key] = token.value;
        break;
      case 'OPACITY':
        config.opacity[key] = token.value;
        break;
      case 'Z_INDEX':
        config.zIndex[key] = token.value.replace('px', '');
        break;
    }
  }

  private setNestedColor(obj: any, path: string[], value: string): void {
    if (path.length === 1) {
      obj[path[0]] = value;
      return;
    }

    const [first, ...rest] = path;
    if (!obj[first]) {
      obj[first] = {};
    }

    if (rest.length === 1) {
      obj[first][rest[0]] = value;
    } else {
      this.setNestedColor(obj[first], rest, value);
    }
  }

  private formatKey(str: string, naming: NamingConvention): string {
    switch (naming) {
      case 'camelCase':
        return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      case 'snake_case':
        return str.replace(/-/g, '_');
      case 'kebab-case':
      default:
        return str;
    }
  }

  private formatConfig(config: any, options: GeneratorOptions): string {
    const useTypeScript = options.typescript !== false;
    const ext = useTypeScript ? 'ts' : 'js';

    // Remover objetos vazios
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([_, v]) => Object.keys(v as any).length > 0)
    );

    const configString = JSON.stringify(cleanConfig, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
      .replace(/"/g, "'"); // Use single quotes

    if (useTypeScript) {
      return `import type { Config } from 'tailwindcss';

const config: Partial<Config> = {
  theme: {
    extend: ${configString},
  },
};

export default config;`;
    }

    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: ${configString},
  },
};`;
  }
}
```

### Exemplo de Output Tailwind

```typescript
import type { Config } from 'tailwindcss';

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6BA5E7',
          400: '#85B6EC',
          600: '#5A94D6',
        },
        accent: {
          400: '#F0E4C8',
        },
      },
      spacing: {
        md: '16px',
        lg: '24px',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        md: '0.75rem',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.06)',
      },
    },
  },
};

export default config;
```

## ⚛️ Gerador React

```typescript
// src/modules/code-generator/generators/react.generator.ts
import { Injectable } from '@nestjs/common';
import { Component, ComponentVariant, Token } from '@prisma/client';

interface ComponentWithVariants extends Component {
  variants: ComponentVariant[];
}

@Injectable()
export class ReactGenerator {
  generate(
    components: ComponentWithVariants[],
    tokens: Token[],
    options: GeneratorOptions,
  ): Map<string, string> {
    const files = new Map<string, string>();

    // Gerar index.ts
    files.set(
      'index.ts',
      this.generateIndex(components),
    );

    // Gerar cada componente
    for (const component of components) {
      const fileName = `${component.name}.tsx`;
      files.set(fileName, this.generateComponent(component, tokens, options));
    }

    // Gerar types
    files.set('types.ts', this.generateTypes(components));

    return files;
  }

  private generateIndex(components: ComponentWithVariants[]): string {
    return components
      .map(c => `export { ${c.name} } from './${c.name}';`)
      .join('\n');
  }

  private generateComponent(
    component: ComponentWithVariants,
    tokens: Token[],
    options: GeneratorOptions,
  ): string {
    const { name, description, variants } = component;

    // Extrair variantes únicas
    const variantNames = variants.map(v => v.name.toLowerCase());
    const hasVariants = variantNames.length > 1;

    // Determinar props baseado nas variantes
    const propsInterface = this.generatePropsInterface(name, variants);

    // Gerar estilos baseados nos tokens usados
    const styles = this.generateStyles(variants, tokens);

    return `import { ${this.getReactImports(component)} } from 'react';
import { cn } from '../lib/utils';

${propsInterface}

/**
 * ${description || name + ' component'}
 */
export function ${name}({
  ${hasVariants ? 'variant = "primary",' : ''}
  size = 'md',
  className,
  children,
  ...props
}: ${name}Props) {
  return (
    <${this.getElement(component)}
      className={cn(
        ${this.generateClassNames(name, variants, options)}
      )}
      {...props}
    >
      {children}
    </${this.getElement(component)}>
  );
}

${name}.displayName = '${name}';
`;
  }

  private generatePropsInterface(name: string, variants: ComponentVariant[]): string {
    const variantTypes = variants
      .map(v => `'${v.name.toLowerCase()}'`)
      .join(' | ');

    return `export interface ${name}Props extends React.HTMLAttributes<HTMLElement> {
  /** Visual variant of the component */
  variant?: ${variantTypes || "'primary'"};
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Component children */
  children?: React.ReactNode;
}`;
  }

  private generateStyles(variants: ComponentVariant[], tokens: Token[]): string {
    // Mapear tokens para classes CSS
    return '';
  }

  private generateClassNames(
    name: string,
    variants: ComponentVariant[],
    options: GeneratorOptions,
  ): string {
    const base = this.getBaseClasses(name);
    const variantClasses = this.getVariantClasses(variants);
    const sizeClasses = this.getSizeClasses();

    return `'${base}',
        ${variantClasses},
        ${sizeClasses},
        className`;
  }

  private getBaseClasses(name: string): string {
    const classMap: Record<string, string> = {
      Button: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
      Input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
      Card: 'rounded-lg border bg-card text-card-foreground shadow-sm',
      Badge: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
    };
    return classMap[name] || 'block';
  }

  private getVariantClasses(variants: ComponentVariant[]): string {
    if (variants.length === 0) return "''";

    const classes = variants.map(v => {
      const variantName = v.name.toLowerCase();
      const tokens = v.tokens as Record<string, string>;
      
      // Converter tokens para classes Tailwind
      let classStr = '';
      if (tokens.backgroundColor) {
        classStr += `bg-${tokens.backgroundColor.replace('color/', '')} `;
      }
      if (tokens.textColor) {
        classStr += `text-${tokens.textColor.replace('color/', '')} `;
      }

      return `${variantName}: '${classStr.trim()}'`;
    });

    return `{
          ${classes.join(',\n          ')}
        }[variant]`;
  }

  private getSizeClasses(): string {
    return `{
          sm: 'h-8 px-3 text-xs',
          md: 'h-10 px-4 text-sm',
          lg: 'h-12 px-6 text-base',
        }[size]`;
  }

  private getReactImports(component: Component): string {
    return 'HTMLAttributes';
  }

  private getElement(component: Component): string {
    const elementMap: Record<string, string> = {
      Button: 'button',
      Input: 'input',
      Card: 'div',
      Badge: 'span',
    };
    return elementMap[component.name] || 'div';
  }

  private generateTypes(components: ComponentWithVariants[]): string {
    const types = components.map(c => {
      return `export type ${c.name}Variant = ${
        c.variants.map(v => `'${v.name.toLowerCase()}'`).join(' | ') || "'default'"
      };`;
    });

    return `// Auto-generated types for components

${types.join('\n\n')}

export type ComponentSize = 'sm' | 'md' | 'lg';
`;
  }
}
```

### Exemplo de Output React

```tsx
import { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual variant of the component */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Component children */
  children?: React.ReactNode;
}

/**
 * Button component for user actions
 */
export function Button({
  variant = "primary",
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
        {
          primary: 'bg-primary-500 text-white hover:bg-primary-600',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
        }[variant],
        {
          sm: 'h-8 px-3 text-xs',
          md: 'h-10 px-4 text-sm',
          lg: 'h-12 px-6 text-base',
        }[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

Button.displayName = 'Button';
```

## 📦 Gerador TypeScript Types

```typescript
// src/modules/code-generator/generators/typescript.generator.ts
import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';

@Injectable()
export class TypeScriptGenerator {
  generate(tokens: Token[], options: GeneratorOptions): string {
    const lines: string[] = [
      '// Auto-generated TypeScript definitions for Design Tokens',
      '// Generated by TokenSync',
      '',
    ];

    // Gerar interface de tokens
    lines.push(...this.generateTokensInterface(tokens, options));

    // Gerar tipos de cores
    lines.push(...this.generateColorTypes(tokens, options));

    // Gerar tipos de spacing
    lines.push(...this.generateSpacingTypes(tokens, options));

    // Gerar tipo geral
    lines.push(...this.generateTokenType(tokens));

    return lines.join('\n');
  }

  private generateTokensInterface(tokens: Token[], options: GeneratorOptions): string[] {
    const lines: string[] = ['export interface DesignTokens {'];

    const grouped = this.groupByType(tokens);

    for (const [type, typeTokens] of Object.entries(grouped)) {
      const typeName = this.formatTypeName(type);
      lines.push(`  ${typeName}: {`);

      const nested = this.nestTokens(typeTokens);
      lines.push(...this.formatNestedObject(nested, 4));

      lines.push('  };');
    }

    lines.push('}', '');
    return lines;
  }

  private generateColorTypes(tokens: Token[], options: GeneratorOptions): string[] {
    const colorTokens = tokens.filter(t => t.type === 'COLOR');
    const colorNames = [...new Set(colorTokens.map(t => {
      const parts = t.name.split('/');
      return parts[1]?.split('-')[0] || parts[0];
    }))];

    return [
      `export type ColorToken = ${colorNames.map(n => `'${n}'`).join(' | ')};`,
      '',
    ];
  }

  private generateSpacingTypes(tokens: Token[], options: GeneratorOptions): string[] {
    const spacingTokens = tokens.filter(t => t.type === 'SPACING');
    const spacingNames = spacingTokens.map(t => {
      const parts = t.name.split('/');
      return parts[parts.length - 1];
    });

    return [
      `export type SpacingToken = ${spacingNames.map(n => `'${n}'`).join(' | ')};`,
      '',
    ];
  }

  private generateTokenType(tokens: Token[]): string[] {
    const allNames = tokens.map(t => t.name);

    return [
      `export type TokenName = ${allNames.map(n => `'${n}'`).join(' | ')};`,
      '',
      'export interface TokenValue {',
      '  name: TokenName;',
      '  value: string;',
      '  type: TokenType;',
      '}',
      '',
      `export type TokenType = ${[...new Set(tokens.map(t => `'${t.type.toLowerCase()}'`))].join(' | ')};`,
    ];
  }

  private groupByType(tokens: Token[]): Record<string, Token[]> {
    return tokens.reduce((acc, token) => {
      const type = token.type.toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(token);
      return acc;
    }, {} as Record<string, Token[]>);
  }

  private nestTokens(tokens: Token[]): any {
    const result: any = {};

    for (const token of tokens) {
      const parts = token.name.split('/').slice(1); // Remove o tipo do início
      let current = result;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = 'string';
    }

    return result;
  }

  private formatNestedObject(obj: any, indent: number): string[] {
    const lines: string[] = [];
    const spaces = ' '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object') {
        lines.push(`${spaces}${key}: {`);
        lines.push(...this.formatNestedObject(value, indent + 2));
        lines.push(`${spaces}};`);
      } else {
        lines.push(`${spaces}${key}: ${value};`);
      }
    }

    return lines;
  }

  private formatTypeName(type: string): string {
    return type.charAt(0).toLowerCase() + type.slice(1);
  }
}
```

### Exemplo de Output TypeScript

```typescript
// Auto-generated TypeScript definitions for Design Tokens
// Generated by TokenSync

export interface DesignTokens {
  color: {
    primary: {
      500: string;
      400: string;
      600: string;
    };
    accent: {
      400: string;
    };
  };
  spacing: {
    md: string;
    lg: string;
  };
  typography: {
    heading: {
      fontFamily: string;
      fontWeight: string;
    };
  };
}

export type ColorToken = 'primary' | 'accent';

export type SpacingToken = 'md' | 'lg';

export type TokenName = 'color/primary-500' | 'color/primary-400' | 'color/accent-400' | 'spacing/md' | 'spacing/lg';

export interface TokenValue {
  name: TokenName;
  value: string;
  type: TokenType;
}

export type TokenType = 'color' | 'spacing' | 'typography' | 'border' | 'shadow';
```

## 📁 Serviço Principal

```typescript
// src/modules/code-generator/code-generator.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { JsonGenerator } from './generators/json.generator';
import { CssGenerator } from './generators/css.generator';
import { TailwindGenerator } from './generators/tailwind.generator';
import { ReactGenerator } from './generators/react.generator';
import { TypeScriptGenerator } from './generators/typescript.generator';
import * as archiver from 'archiver';
import { S3Service } from '@/infrastructure/storage/s3.service';

export interface GeneratorOptions {
  formats: ('json' | 'css' | 'tailwind' | 'react' | 'typescript')[];
  naming: 'camelCase' | 'kebab-case' | 'snake_case';
  typescript?: boolean;
  includeTokens?: boolean;
  includeComponents?: boolean;
  includeUtilities?: boolean;
  framework?: 'react' | 'vue' | 'angular' | 'vanilla';
}

@Injectable()
export class CodeGeneratorService {
  constructor(
    private prisma: PrismaService,
    private jsonGenerator: JsonGenerator,
    private cssGenerator: CssGenerator,
    private tailwindGenerator: TailwindGenerator,
    private reactGenerator: ReactGenerator,
    private typescriptGenerator: TypeScriptGenerator,
    private s3Service: S3Service,
  ) {}

  async generatePreview(
    projectId: string,
    format: string,
    options: Partial<GeneratorOptions>,
  ): Promise<{ content: string; stats: any }> {
    const tokens = await this.prisma.token.findMany({
      where: { projectId },
    });

    const fullOptions: GeneratorOptions = {
      formats: [format as any],
      naming: options.naming || 'kebab-case',
      ...options,
    };

    let content: string;

    switch (format) {
      case 'json':
        content = this.jsonGenerator.generate(tokens, fullOptions);
        break;
      case 'css':
        content = this.cssGenerator.generate(tokens, fullOptions);
        break;
      case 'tailwind':
        content = this.tailwindGenerator.generate(tokens, fullOptions);
        break;
      case 'typescript':
        content = this.typescriptGenerator.generate(tokens, fullOptions);
        break;
      default:
        throw new Error(`Unknown format: ${format}`);
    }

    return {
      content,
      stats: {
        tokens: tokens.length,
        lines: content.split('\n').length,
      },
    };
  }

  async generateExport(
    projectId: string,
    options: GeneratorOptions,
  ): Promise<{ downloadUrl: string; expiresAt: Date; files: string[] }> {
    const tokens = await this.prisma.token.findMany({
      where: { projectId },
    });

    const components = await this.prisma.component.findMany({
      where: { projectId },
      include: { variants: true },
    });

    const files: Map<string, string> = new Map();

    // Gerar arquivos para cada formato
    for (const format of options.formats) {
      switch (format) {
        case 'json':
          files.set('tokens.json', this.jsonGenerator.generate(tokens, options));
          break;
        case 'css':
          files.set('tokens.css', this.cssGenerator.generate(tokens, options));
          break;
        case 'tailwind':
          const ext = options.typescript ? 'ts' : 'js';
          files.set(`tailwind.config.${ext}`, this.tailwindGenerator.generate(tokens, options));
          break;
        case 'react':
          if (options.includeComponents) {
            const reactFiles = this.reactGenerator.generate(components, tokens, options);
            for (const [name, content] of reactFiles) {
              files.set(`components/${name}`, content);
            }
          }
          break;
        case 'typescript':
          files.set('types/tokens.d.ts', this.typescriptGenerator.generate(tokens, options));
          break;
      }
    }

    // Criar ZIP
    const zipBuffer = await this.createZipBuffer(files);

    // Upload para S3
    const fileName = `exports/${projectId}/${Date.now()}.zip`;
    const downloadUrl = await this.s3Service.upload(fileName, zipBuffer, 'application/zip');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    return {
      downloadUrl,
      expiresAt,
      files: Array.from(files.keys()),
    };
  }

  private async createZipBuffer(files: Map<string, string>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      for (const [name, content] of files) {
        archive.append(content, { name });
      }

      archive.finalize();
    });
  }
}
```

---

*Documento atualizado em: Dezembro 2024*
