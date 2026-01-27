import { Injectable } from '@nestjs/common';

@Injectable()
export class CodeGeneratorService {
  generate(component: any, framework: 'react' | 'vue' | 'angular'): string {
    switch (framework) {
      case 'react':
        return this.generateReact(component);
      case 'vue':
        return this.generateVue(component);
      case 'angular':
        return this.generateAngular(component);
    }
  }

  private generateReact(component: any): string {
    const name = this.sanitizeName(component.name);
    const variants = component.variants || [];

    const variantType = variants.length > 0
      ? `variant?: ${variants.map(v => `'${v.name}'`).join(' | ')};`
      : '';

    return `import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
  ${variantType}
  className?: string;
}

export const ${name}: React.FC<${name}Props> = ({
  children,
  ${variants.length > 0 ? `variant = '${variants[0]?.name}',` : ''}
  className = '',
}) => {
  return (
    <div className={\`\${className} \${variant}\`}>
      {children}
    </div>
  );
};`;
  }

  private generateVue(component: any): string {
    const name = this.sanitizeName(component.name);
    const variants = component.variants || [];

    const variantProps = variants.length > 0
      ? `variant: {
      type: String as PropType<${variants.map(v => `'${v.name}'`).join(' | ')}>,
      default: '${variants[0]?.name}',
    },`
      : '';

    return `<template>
  <div :class="[\`\${className}\`, variant]">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

interface Props {
  ${variantProps}
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
});
</script>`;
  }

  private generateAngular(component: any): string {
    const name = this.sanitizeName(component.name);
    const variants = component.variants || [];

    const variantType = variants.length > 0
      ? variants.map(v => `'${v.name}'`).join(' | ')
      : 'string';

    return `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${name.toLowerCase()}',
  template: \`
    <div [ngClass]="[className, variant]">
      <ng-content></ng-content>
    </div>
  \`,
})
export class ${name}Component {
  @Input() variant: ${variantType} = '${variants[0]?.name || 'default'}';
  @Input() className: string = '';
}`;
  }

  private sanitizeName(name: string): string {
    // Remove caracteres especiais e espaços
    return name.replace(/[^a-zA-Z0-9]/g, '');
  }
}
