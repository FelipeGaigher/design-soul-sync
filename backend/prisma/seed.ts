import { PrismaClient, TokenType, ComponentCategory, ChangeOrigin } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // Create Admin User
  // ============================================
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tokensync.com' },
    update: {},
    create: {
      email: 'admin@tokensync.com',
      password: adminPassword,
      name: 'Admin User',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ============================================
  // Create Demo User
  // ============================================
  const demoPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@tokensync.com' },
    update: {},
    create: {
      email: 'demo@tokensync.com',
      password: demoPassword,
      name: 'Demo User',
    },
  });
  console.log('✅ Demo user created:', demoUser.email);

  // ============================================
  // Create TokenSync Design System Project
  // ============================================
  const project = await prisma.project.upsert({
    where: {
      id: 'tokensync-ds-001'
    },
    update: {
      componentsCount: 30,
      colorsCount: 24,
      typographyCount: 12,
    },
    create: {
      id: 'tokensync-ds-001',
      name: 'TokenSync Design System',
      description: 'Design System oficial do TokenSync - inclui todos os componentes, cores, tipografia e padrões utilizados na aplicação.',
      ownerId: admin.id,
      componentsCount: 30,
      colorsCount: 24,
      typographyCount: 12,
      settings: {
        defaultFramework: 'react',
        namingConvention: 'PascalCase',
        autoSync: false,
      },
    },
  });
  console.log('✅ TokenSync Design System created:', project.name);

  // Add demo user as member
  await prisma.projectMember.upsert({
    where: {
      userId_projectId: {
        userId: demoUser.id,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      projectId: project.id,
      role: 'MEMBER',
    },
  });

  // ============================================
  // Create Design Tokens
  // ============================================
  const tokens = [
    // Colors - Primary
    { name: 'color/primary-50', value: '#EBF5FF', type: TokenType.COLOR, category: 'Colors', description: 'Primary lightest' },
    { name: 'color/primary-100', value: '#D6EBFF', type: TokenType.COLOR, category: 'Colors', description: 'Primary lighter' },
    { name: 'color/primary-200', value: '#ADD6FF', type: TokenType.COLOR, category: 'Colors', description: 'Primary light' },
    { name: 'color/primary-300', value: '#85C1FF', type: TokenType.COLOR, category: 'Colors', description: 'Primary medium light' },
    { name: 'color/primary-400', value: '#5CACFF', type: TokenType.COLOR, category: 'Colors', description: 'Primary medium' },
    { name: 'color/primary-500', value: '#6BA5E7', type: TokenType.COLOR, category: 'Colors', description: 'Primary - Main brand color' },
    { name: 'color/primary-600', value: '#5A94D6', type: TokenType.COLOR, category: 'Colors', description: 'Primary dark' },
    { name: 'color/primary-700', value: '#4A83C5', type: TokenType.COLOR, category: 'Colors', description: 'Primary darker' },
    { name: 'color/primary-800', value: '#3A72B4', type: TokenType.COLOR, category: 'Colors', description: 'Primary darkest' },
    { name: 'color/primary-900', value: '#2A61A3', type: TokenType.COLOR, category: 'Colors', description: 'Primary deep' },

    // Colors - Accent
    { name: 'color/accent-400', value: '#F0E4C8', type: TokenType.COLOR, category: 'Colors', description: 'Accent - Golden pastel' },
    { name: 'color/accent-500', value: '#E6D4A8', type: TokenType.COLOR, category: 'Colors', description: 'Accent medium' },

    // Colors - Neutral
    { name: 'color/gray-50', value: '#F9FAFB', type: TokenType.COLOR, category: 'Colors', description: 'Gray lightest' },
    { name: 'color/gray-100', value: '#F3F4F6', type: TokenType.COLOR, category: 'Colors', description: 'Gray lighter' },
    { name: 'color/gray-200', value: '#E5E7EB', type: TokenType.COLOR, category: 'Colors', description: 'Gray light' },
    { name: 'color/gray-300', value: '#D1D5DB', type: TokenType.COLOR, category: 'Colors', description: 'Gray medium' },
    { name: 'color/gray-400', value: '#9CA3AF', type: TokenType.COLOR, category: 'Colors', description: 'Gray' },
    { name: 'color/gray-500', value: '#6B7280', type: TokenType.COLOR, category: 'Colors', description: 'Gray dark' },
    { name: 'color/gray-600', value: '#4B5563', type: TokenType.COLOR, category: 'Colors', description: 'Gray darker' },
    { name: 'color/gray-700', value: '#374151', type: TokenType.COLOR, category: 'Colors', description: 'Gray darkest' },
    { name: 'color/gray-800', value: '#1F2937', type: TokenType.COLOR, category: 'Colors', description: 'Gray deep' },
    { name: 'color/gray-900', value: '#111827', type: TokenType.COLOR, category: 'Colors', description: 'Gray deepest' },

    // Colors - Semantic
    { name: 'color/success', value: '#10B981', type: TokenType.COLOR, category: 'Colors', description: 'Success state' },
    { name: 'color/warning', value: '#F59E0B', type: TokenType.COLOR, category: 'Colors', description: 'Warning state' },
    { name: 'color/error', value: '#EF4444', type: TokenType.COLOR, category: 'Colors', description: 'Error state' },
    { name: 'color/info', value: '#3B82F6', type: TokenType.COLOR, category: 'Colors', description: 'Info state' },

    // Spacing
    { name: 'spacing/xs', value: '4px', type: TokenType.SPACING, category: 'Layout', description: 'Extra small spacing' },
    { name: 'spacing/sm', value: '8px', type: TokenType.SPACING, category: 'Layout', description: 'Small spacing' },
    { name: 'spacing/md', value: '16px', type: TokenType.SPACING, category: 'Layout', description: 'Medium spacing' },
    { name: 'spacing/lg', value: '24px', type: TokenType.SPACING, category: 'Layout', description: 'Large spacing' },
    { name: 'spacing/xl', value: '32px', type: TokenType.SPACING, category: 'Layout', description: 'Extra large spacing' },
    { name: 'spacing/2xl', value: '48px', type: TokenType.SPACING, category: 'Layout', description: '2X large spacing' },
    { name: 'spacing/3xl', value: '64px', type: TokenType.SPACING, category: 'Layout', description: '3X large spacing' },

    // Typography
    { name: 'font/family-heading', value: 'Inter', type: TokenType.TYPOGRAPHY, category: 'Typography', description: 'Heading font family' },
    { name: 'font/family-body', value: 'Inter', type: TokenType.TYPOGRAPHY, category: 'Typography', description: 'Body font family' },
    { name: 'font/family-mono', value: 'JetBrains Mono', type: TokenType.TYPOGRAPHY, category: 'Typography', description: 'Monospace font family' },
    { name: 'font/size-xs', value: '0.75rem', type: TokenType.TYPOGRAPHY, category: 'Typography', description: '12px' },
    { name: 'font/size-sm', value: '0.875rem', type: TokenType.TYPOGRAPHY, category: 'Typography', description: '14px' },
    { name: 'font/size-base', value: '1rem', type: TokenType.TYPOGRAPHY, category: 'Typography', description: '16px' },
    { name: 'font/size-lg', value: '1.125rem', type: TokenType.TYPOGRAPHY, category: 'Typography', description: '18px' },
    { name: 'font/size-xl', value: '1.25rem', type: TokenType.TYPOGRAPHY, category: 'Typography', description: '20px' },
    { name: 'font/size-2xl', value: '1.5rem', type: TokenType.TYPOGRAPHY, category: 'Typography', description: '24px' },
    { name: 'font/size-3xl', value: '1.875rem', type: TokenType.TYPOGRAPHY, category: 'Typography', description: '30px' },
    { name: 'font/size-4xl', value: '2.25rem', type: TokenType.TYPOGRAPHY, category: 'Typography', description: '36px' },
    { name: 'font/weight-normal', value: '400', type: TokenType.TYPOGRAPHY, category: 'Typography', description: 'Normal weight' },
    { name: 'font/weight-medium', value: '500', type: TokenType.TYPOGRAPHY, category: 'Typography', description: 'Medium weight' },
    { name: 'font/weight-semibold', value: '600', type: TokenType.TYPOGRAPHY, category: 'Typography', description: 'Semibold weight' },
    { name: 'font/weight-bold', value: '700', type: TokenType.TYPOGRAPHY, category: 'Typography', description: 'Bold weight' },

    // Border Radius
    { name: 'radius/none', value: '0', type: TokenType.BORDER_RADIUS, category: 'Borders', description: 'No radius' },
    { name: 'radius/sm', value: '0.25rem', type: TokenType.BORDER_RADIUS, category: 'Borders', description: 'Small radius' },
    { name: 'radius/md', value: '0.5rem', type: TokenType.BORDER_RADIUS, category: 'Borders', description: 'Medium radius' },
    { name: 'radius/lg', value: '0.75rem', type: TokenType.BORDER_RADIUS, category: 'Borders', description: 'Large radius' },
    { name: 'radius/xl', value: '1rem', type: TokenType.BORDER_RADIUS, category: 'Borders', description: 'Extra large radius' },
    { name: 'radius/full', value: '9999px', type: TokenType.BORDER_RADIUS, category: 'Borders', description: 'Full radius' },

    // Shadows
    { name: 'shadow/subtle', value: '0 1px 2px rgba(0,0,0,0.05)', type: TokenType.SHADOW, category: 'Effects', description: 'Subtle shadow' },
    { name: 'shadow/soft', value: '0 4px 12px rgba(0,0,0,0.06)', type: TokenType.SHADOW, category: 'Effects', description: 'Soft shadow' },
    { name: 'shadow/elevated', value: '0 8px 24px rgba(0,0,0,0.08)', type: TokenType.SHADOW, category: 'Effects', description: 'Elevated shadow' },
    { name: 'shadow/modal', value: '0 16px 48px rgba(0,0,0,0.12)', type: TokenType.SHADOW, category: 'Effects', description: 'Modal shadow' },
  ];

  for (const token of tokens) {
    await prisma.token.upsert({
      where: {
        projectId_name: {
          projectId: project.id,
          name: token.name
        }
      },
      update: {},
      create: {
        ...token,
        projectId: project.id,
      },
    });
  }
  console.log(`✅ ${tokens.length} tokens created`);

  // ============================================
  // Create Components with detailed properties
  // ============================================
  const components = [
    // BUTTONS
    {
      name: 'Button',
      description: 'Botao de acao principal com variantes para diferentes contextos',
      category: ComponentCategory.BUTTONS,
      variants: [
        {
          name: 'Primary',
          props: {
            fills: [{ type: 'SOLID', color: '#6BA5E7', opacity: 1 }],
            width: 120,
            height: 40,
            cornerRadius: 8,
            layoutMode: 'HORIZONTAL',
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 10,
            paddingBottom: 10,
            textContents: [{
              characters: 'Button',
              nodeName: 'Label',
              nodeId: 'btn-label-1',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, textAlignHorizontal: 'CENTER' }
            }],
            variantProperties: { variant: 'primary', size: 'default' }
          }
        },
        {
          name: 'Secondary',
          props: {
            fills: [{ type: 'SOLID', color: '#F3F4F6', opacity: 1 }],
            width: 120,
            height: 40,
            cornerRadius: 8,
            textContents: [{
              characters: 'Button',
              nodeName: 'Label',
              nodeId: 'btn-label-2',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, textAlignHorizontal: 'CENTER' }
            }],
            variantProperties: { variant: 'secondary', size: 'default' }
          }
        },
        {
          name: 'Outline',
          props: {
            fills: [],
            strokes: [{ type: 'SOLID', color: '#6BA5E7', weight: 1, position: 'INSIDE' }],
            width: 120,
            height: 40,
            cornerRadius: 8,
            textContents: [{
              characters: 'Button',
              nodeName: 'Label',
              nodeId: 'btn-label-3',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, textAlignHorizontal: 'CENTER' }
            }],
            variantProperties: { variant: 'outline', size: 'default' }
          }
        },
        {
          name: 'Ghost',
          props: {
            fills: [],
            width: 120,
            height: 40,
            cornerRadius: 8,
            textContents: [{
              characters: 'Button',
              nodeName: 'Label',
              nodeId: 'btn-label-4',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, textAlignHorizontal: 'CENTER' }
            }],
            variantProperties: { variant: 'ghost', size: 'default' }
          }
        },
        {
          name: 'Destructive',
          props: {
            fills: [{ type: 'SOLID', color: '#EF4444', opacity: 1 }],
            width: 120,
            height: 40,
            cornerRadius: 8,
            textContents: [{
              characters: 'Delete',
              nodeName: 'Label',
              nodeId: 'btn-label-5',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, textAlignHorizontal: 'CENTER' }
            }],
            variantProperties: { variant: 'destructive', size: 'default' }
          }
        }
      ]
    },
    // FORM CONTROLS
    {
      name: 'Input',
      description: 'Campo de entrada de texto com suporte a label, placeholder e estados de validacao',
      category: ComponentCategory.FORM_CONTROLS,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 320,
            height: 40,
            cornerRadius: 8,
            paddingLeft: 12,
            paddingRight: 12,
            textContents: [{
              characters: 'Enter text...',
              nodeName: 'Placeholder',
              nodeId: 'input-ph-1',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400 }
            }],
            variantProperties: { state: 'default' }
          }
        },
        {
          name: 'Focused',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#6BA5E7', weight: 2, position: 'INSIDE' }],
            width: 320,
            height: 40,
            cornerRadius: 8,
            effects: [{ type: 'DROP_SHADOW', color: '#6BA5E733', radius: 4, spread: 0, offset: { x: 0, y: 0 } }],
            variantProperties: { state: 'focused' }
          }
        },
        {
          name: 'Error',
          props: {
            fills: [{ type: 'SOLID', color: '#FEF2F2', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#EF4444', weight: 1, position: 'INSIDE' }],
            width: 320,
            height: 40,
            cornerRadius: 8,
            variantProperties: { state: 'error' }
          }
        }
      ]
    },
    {
      name: 'Checkbox',
      description: 'Caixa de selecao para multiplas opcoes',
      category: ComponentCategory.FORM_CONTROLS,
      variants: [
        {
          name: 'Unchecked',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#D1D5DB', weight: 2, position: 'INSIDE' }],
            width: 20,
            height: 20,
            cornerRadius: 4,
            variantProperties: { checked: 'false' }
          }
        },
        {
          name: 'Checked',
          props: {
            fills: [{ type: 'SOLID', color: '#6BA5E7', opacity: 1 }],
            width: 20,
            height: 20,
            cornerRadius: 4,
            icons: [{ name: 'Check', nodeId: 'check-icon', width: 12, height: 12, fills: [{ type: 'SOLID', color: '#FFFFFF' }] }],
            variantProperties: { checked: 'true' }
          }
        }
      ]
    },
    {
      name: 'Switch',
      description: 'Alternador de estado on/off',
      category: ComponentCategory.FORM_CONTROLS,
      variants: [
        {
          name: 'Off',
          props: {
            fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }],
            width: 44,
            height: 24,
            cornerRadius: 12,
            variantProperties: { state: 'off' }
          }
        },
        {
          name: 'On',
          props: {
            fills: [{ type: 'SOLID', color: '#6BA5E7', opacity: 1 }],
            width: 44,
            height: 24,
            cornerRadius: 12,
            variantProperties: { state: 'on' }
          }
        }
      ]
    },
    {
      name: 'Select',
      description: 'Dropdown de selecao unica',
      category: ComponentCategory.FORM_CONTROLS,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 320,
            height: 40,
            cornerRadius: 8,
            layoutMode: 'HORIZONTAL',
            paddingLeft: 12,
            paddingRight: 12,
            itemSpacing: 8,
            textContents: [{
              characters: 'Select option',
              nodeName: 'Placeholder',
              nodeId: 'select-ph',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400 }
            }],
            icons: [{ name: 'ChevronDown', nodeId: 'chevron', width: 16, height: 16, fills: [{ type: 'SOLID', color: '#6B7280' }] }],
            variantProperties: { state: 'default' }
          }
        }
      ]
    },
    {
      name: 'Radio',
      description: 'Botao de selecao unica',
      category: ComponentCategory.FORM_CONTROLS,
      variants: [
        {
          name: 'Unchecked',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#D1D5DB', weight: 2, position: 'INSIDE' }],
            width: 20,
            height: 20,
            cornerRadius: 10,
            variantProperties: { selected: 'false' }
          }
        },
        {
          name: 'Checked',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#6BA5E7', weight: 2, position: 'INSIDE' }],
            width: 20,
            height: 20,
            cornerRadius: 10,
            variantProperties: { selected: 'true' }
          }
        }
      ]
    },
    // FEEDBACK
    {
      name: 'Alert',
      description: 'Mensagem de alerta contextual',
      category: ComponentCategory.FEEDBACK,
      variants: [
        {
          name: 'Info',
          props: {
            fills: [{ type: 'SOLID', color: '#EFF6FF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#3B82F6', weight: 1, position: 'INSIDE' }],
            width: 400,
            height: 64,
            cornerRadius: 8,
            layoutMode: 'HORIZONTAL',
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 12,
            paddingBottom: 12,
            itemSpacing: 12,
            icons: [{ name: 'Info', nodeId: 'info-icon', width: 20, height: 20, fills: [{ type: 'SOLID', color: '#3B82F6' }] }],
            textContents: [{
              characters: 'This is an informational message.',
              nodeName: 'Message',
              nodeId: 'alert-msg',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400 }
            }],
            variantProperties: { type: 'info' }
          }
        },
        {
          name: 'Success',
          props: {
            fills: [{ type: 'SOLID', color: '#ECFDF5', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#10B981', weight: 1, position: 'INSIDE' }],
            width: 400,
            height: 64,
            cornerRadius: 8,
            variantProperties: { type: 'success' }
          }
        },
        {
          name: 'Warning',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFBEB', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#F59E0B', weight: 1, position: 'INSIDE' }],
            width: 400,
            height: 64,
            cornerRadius: 8,
            variantProperties: { type: 'warning' }
          }
        },
        {
          name: 'Error',
          props: {
            fills: [{ type: 'SOLID', color: '#FEF2F2', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#EF4444', weight: 1, position: 'INSIDE' }],
            width: 400,
            height: 64,
            cornerRadius: 8,
            variantProperties: { type: 'error' }
          }
        }
      ]
    },
    {
      name: 'Badge',
      description: 'Etiqueta de status ou contador',
      category: ComponentCategory.FEEDBACK,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#F3F4F6', opacity: 1 }],
            width: 60,
            height: 22,
            cornerRadius: 11,
            paddingLeft: 8,
            paddingRight: 8,
            textContents: [{
              characters: 'Badge',
              nodeName: 'Label',
              nodeId: 'badge-label',
              style: { fontFamily: 'Inter', fontSize: 12, fontWeight: 500 }
            }],
            variantProperties: { variant: 'default' }
          }
        },
        {
          name: 'Primary',
          props: {
            fills: [{ type: 'SOLID', color: '#6BA5E7', opacity: 1 }],
            width: 60,
            height: 22,
            cornerRadius: 11,
            textContents: [{
              characters: 'Badge',
              nodeName: 'Label',
              nodeId: 'badge-label-p',
              style: { fontFamily: 'Inter', fontSize: 12, fontWeight: 500 }
            }],
            variantProperties: { variant: 'primary' }
          }
        },
        {
          name: 'Destructive',
          props: {
            fills: [{ type: 'SOLID', color: '#EF4444', opacity: 1 }],
            width: 60,
            height: 22,
            cornerRadius: 11,
            variantProperties: { variant: 'destructive' }
          }
        }
      ]
    },
    {
      name: 'Toast',
      description: 'Notificacao temporaria',
      category: ComponentCategory.FEEDBACK,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#1F2937', opacity: 1 }],
            width: 356,
            height: 56,
            cornerRadius: 8,
            effects: [{ type: 'DROP_SHADOW', color: '#00000033', radius: 16, spread: 0, offset: { x: 0, y: 8 } }],
            layoutMode: 'HORIZONTAL',
            paddingLeft: 16,
            paddingRight: 16,
            itemSpacing: 12,
            textContents: [{
              characters: 'This is a notification message',
              nodeName: 'Message',
              nodeId: 'toast-msg',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400 }
            }],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Progress',
      description: 'Barra de progresso',
      category: ComponentCategory.FEEDBACK,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }],
            width: 200,
            height: 8,
            cornerRadius: 4,
            variantProperties: { progress: '50' }
          }
        }
      ]
    },
    {
      name: 'Spinner',
      description: 'Indicador de carregamento',
      category: ComponentCategory.FEEDBACK,
      variants: [
        {
          name: 'Default',
          props: {
            strokes: [{ type: 'SOLID', color: '#6BA5E7', weight: 2, position: 'CENTER' }],
            width: 24,
            height: 24,
            cornerRadius: 12,
            variantProperties: { size: 'default' }
          }
        }
      ]
    },
    // LAYOUT
    {
      name: 'Card',
      description: 'Container de conteudo com borda e sombra',
      category: ComponentCategory.LAYOUT,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 384,
            height: 200,
            cornerRadius: 12,
            effects: [{ type: 'DROP_SHADOW', color: '#0000000D', radius: 12, spread: 0, offset: { x: 0, y: 4 } }],
            layoutMode: 'VERTICAL',
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 24,
            paddingBottom: 24,
            textContents: [
              { characters: 'Card Title', nodeName: 'Title', nodeId: 'card-title', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600 } },
              { characters: 'Supporting description for the card', nodeName: 'Description', nodeId: 'card-desc', style: { fontFamily: 'Inter', fontSize: 13, fontWeight: 400 } }
            ],
            childElements: [
              { name: 'Card Header', type: 'FRAME', nodeId: 'card-header', width: 336, height: 32, layoutMode: 'HORIZONTAL' },
              { name: 'Title', type: 'TEXT', nodeId: 'card-title', text: 'Card Title', typography: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600 } },
              { name: 'Description', type: 'TEXT', nodeId: 'card-desc', text: 'Supporting description for the card', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 400 } },
              { name: 'Card Body', type: 'FRAME', nodeId: 'card-body', width: 336, height: 96, layoutMode: 'VERTICAL' },
              { name: 'Primary Button', type: 'BUTTON', nodeId: 'card-btn-primary', width: 100, height: 32, cornerRadius: 8, fills: [{ type: 'SOLID', color: '#6BA5E7', opacity: 1 }], text: 'Primary', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 600 } },
              { name: 'Ghost Button', type: 'BUTTON', nodeId: 'card-btn-ghost', width: 80, height: 32, cornerRadius: 8, text: 'Ghost', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 600 } }
            ],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Project Card',
      description: 'Card de projeto com status, avatar e acoes',
      category: ComponentCategory.LAYOUT,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 420,
            height: 220,
            cornerRadius: 16,
            effects: [{ type: 'DROP_SHADOW', color: '#0000000D', radius: 16, spread: 0, offset: { x: 0, y: 6 } }],
            layoutMode: 'VERTICAL',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            paddingBottom: 20,
            itemSpacing: 12,
            childElements: [
              { name: 'Status Tag', type: 'TAG', nodeId: 'project-status', width: 64, height: 22, cornerRadius: 9999, fills: [{ type: 'SOLID', color: '#ECFDF5', opacity: 1 }], strokes: [{ type: 'SOLID', color: '#10B981', weight: 1, position: 'INSIDE' }], text: 'Ativo', typography: { fontFamily: 'Inter', fontSize: 12, fontWeight: 500 } },
              { name: 'Avatar', type: 'AVATAR', nodeId: 'project-avatar', width: 40, height: 40, cornerRadius: 20, fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }] },
              { name: 'Project Title', type: 'TEXT', nodeId: 'project-title', text: 'Projeto Atlas', typography: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600 } },
              { name: 'Project Subtitle', type: 'TEXT', nodeId: 'project-subtitle', text: 'Ultima sync ha 2 horas', typography: { fontFamily: 'Inter', fontSize: 12, fontWeight: 400 } },
              { name: 'Primary Button', type: 'BUTTON', nodeId: 'project-open', width: 88, height: 32, cornerRadius: 8, fills: [{ type: 'SOLID', color: '#6BA5E7', opacity: 1 }], text: 'Abrir', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 600 } },
              { name: 'Secondary Button', type: 'BUTTON', nodeId: 'project-settings', width: 96, height: 32, cornerRadius: 8, strokes: [{ type: 'SOLID', color: '#D1D5DB', weight: 1, position: 'INSIDE' }], text: 'Configurar', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 600 } }
            ],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Stats Card',
      description: 'Card de metricas com numero e status',
      category: ComponentCategory.LAYOUT,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 280,
            height: 140,
            cornerRadius: 14,
            effects: [{ type: 'DROP_SHADOW', color: '#0000000D', radius: 12, spread: 0, offset: { x: 0, y: 4 } }],
            layoutMode: 'VERTICAL',
            paddingLeft: 18,
            paddingRight: 18,
            paddingTop: 18,
            paddingBottom: 18,
            itemSpacing: 8,
            childElements: [
              { name: 'Metric Label', type: 'TEXT', nodeId: 'metric-label', text: 'Componentes', typography: { fontFamily: 'Inter', fontSize: 12, fontWeight: 500 } },
              { name: 'Metric Value', type: 'TEXT', nodeId: 'metric-value', text: '128', typography: { fontFamily: 'Inter', fontSize: 24, fontWeight: 700 } },
              { name: 'Trend Tag', type: 'TAG', nodeId: 'metric-trend', width: 68, height: 22, cornerRadius: 9999, fills: [{ type: 'SOLID', color: '#EFF6FF', opacity: 1 }], strokes: [{ type: 'SOLID', color: '#3B82F6', weight: 1, position: 'INSIDE' }], text: '+12%', typography: { fontFamily: 'Inter', fontSize: 12, fontWeight: 600 } }
            ],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Dialog',
      description: 'Modal de dialogo',
      category: ComponentCategory.LAYOUT,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            width: 480,
            height: 320,
            cornerRadius: 16,
            effects: [{ type: 'DROP_SHADOW', color: '#00000033', radius: 48, spread: 0, offset: { x: 0, y: 16 } }],
            layoutMode: 'VERTICAL',
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 24,
            paddingBottom: 24,
            itemSpacing: 16,
            textContents: [
              { characters: 'Dialog Title', nodeName: 'Title', nodeId: 'dialog-title', style: { fontFamily: 'Inter', fontSize: 18, fontWeight: 600 } },
              { characters: 'Dialog description goes here', nodeName: 'Description', nodeId: 'dialog-desc', style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400 } }
            ],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Tabs',
      description: 'Abas de navegacao',
      category: ComponentCategory.LAYOUT,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#F3F4F6', opacity: 1 }],
            width: 400,
            height: 40,
            cornerRadius: 8,
            layoutMode: 'HORIZONTAL',
            paddingLeft: 4,
            paddingRight: 4,
            paddingTop: 4,
            paddingBottom: 4,
            itemSpacing: 4,
            childElements: [
              { name: 'Tab - Visao Geral', type: 'TAB', nodeId: 'tabs-overview', width: 120, height: 32, cornerRadius: 6, fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }], text: 'Visao Geral', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 500 } },
              { name: 'Tab - Componentes', type: 'TAB', nodeId: 'tabs-components', width: 120, height: 32, cornerRadius: 6, fills: [{ type: 'SOLID', color: '#F3F4F6', opacity: 1 }], text: 'Componentes', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 500 } },
              { name: 'Tab - Tokens', type: 'TAB', nodeId: 'tabs-tokens', width: 80, height: 32, cornerRadius: 6, fills: [{ type: 'SOLID', color: '#F3F4F6', opacity: 1 }], text: 'Tokens', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 500 } }
            ],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Accordion',
      description: 'Lista expansivel',
      category: ComponentCategory.LAYOUT,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 400,
            height: 56,
            cornerRadius: 8,
            layoutMode: 'HORIZONTAL',
            paddingLeft: 16,
            paddingRight: 16,
            textContents: [{
              characters: 'Accordion Item',
              nodeName: 'Title',
              nodeId: 'accordion-title',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 500 }
            }],
            variantProperties: { state: 'collapsed' }
          }
        }
      ]
    },
    {
      name: 'Separator',
      description: 'Divisor visual',
      category: ComponentCategory.LAYOUT,
      variants: [
        {
          name: 'Horizontal',
          props: {
            fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }],
            width: 200,
            height: 1,
            variantProperties: { orientation: 'horizontal' }
          }
        },
        {
          name: 'Vertical',
          props: {
            fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }],
            width: 1,
            height: 200,
            variantProperties: { orientation: 'vertical' }
          }
        }
      ]
    },
    // NAVIGATION
    {
      name: 'Breadcrumb',
      description: 'Navegacao hierarquica',
      category: ComponentCategory.NAVIGATION,
      variants: [
        {
          name: 'Default',
          props: {
            width: 300,
            height: 24,
            layoutMode: 'HORIZONTAL',
            itemSpacing: 8,
            textContents: [
              { characters: 'Home', nodeName: 'Item1', nodeId: 'bc-1', style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400 } },
              { characters: '/', nodeName: 'Separator', nodeId: 'bc-sep', style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400 } },
              { characters: 'Settings', nodeName: 'Item2', nodeId: 'bc-2', style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 500 } }
            ],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Sidebar',
      description: 'Menu lateral de navegacao',
      category: ComponentCategory.NAVIGATION,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 256,
            height: 600,
            layoutMode: 'VERTICAL',
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 16,
            paddingBottom: 16,
            itemSpacing: 4,
            childElements: [
              { name: 'Logo', type: 'TEXT', nodeId: 'sidebar-logo', text: 'TokenSync', typography: { fontFamily: 'Inter', fontSize: 16, fontWeight: 700 } },
              { name: 'Nav Item - Dashboard', type: 'TEXT', nodeId: 'sidebar-item-dashboard', text: 'Dashboard', typography: { fontFamily: 'Inter', fontSize: 14, fontWeight: 500 } },
              { name: 'Nav Item - Projects', type: 'TEXT', nodeId: 'sidebar-item-projects', text: 'Projetos', typography: { fontFamily: 'Inter', fontSize: 14, fontWeight: 500 } },
              { name: 'Nav Item - Users', type: 'TEXT', nodeId: 'sidebar-item-users', text: 'Usuarios', typography: { fontFamily: 'Inter', fontSize: 14, fontWeight: 500 } },
              { name: 'Nav Item - Settings', type: 'TEXT', nodeId: 'sidebar-item-settings', text: 'Configuracoes', typography: { fontFamily: 'Inter', fontSize: 14, fontWeight: 500 } }
            ],
            variantProperties: { state: 'expanded' }
          }
        },
        {
          name: 'Collapsed',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 64,
            height: 600,
            variantProperties: { state: 'collapsed' }
          }
        }
      ]
    },
    {
      name: 'Topbar',
      description: 'Barra superior de navegacao',
      category: ComponentCategory.NAVIGATION,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 1024,
            height: 64,
            layoutMode: 'HORIZONTAL',
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 12,
            paddingBottom: 12,
            itemSpacing: 16,
            childElements: [
              { name: 'Brand', type: 'TEXT', nodeId: 'topbar-brand', text: 'TokenSync', typography: { fontFamily: 'Inter', fontSize: 16, fontWeight: 700 } },
              { name: 'Search', type: 'INPUT', nodeId: 'topbar-search', width: 260, height: 36, cornerRadius: 8, fills: [{ type: 'SOLID', color: '#F3F4F6', opacity: 1 }], text: 'Buscar', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 400 } },
              { name: 'Notification Button', type: 'BUTTON', nodeId: 'topbar-bell', width: 36, height: 36, cornerRadius: 8, fills: [{ type: 'SOLID', color: '#F3F4F6', opacity: 1 }] },
              { name: 'Avatar', type: 'AVATAR', nodeId: 'topbar-avatar', width: 32, height: 32, cornerRadius: 16, fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }] }
            ],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Pagination',
      description: 'Controle de paginacao',
      category: ComponentCategory.NAVIGATION,
      variants: [
        {
          name: 'Default',
          props: {
            width: 300,
            height: 40,
            layoutMode: 'HORIZONTAL',
            itemSpacing: 8,
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Menu',
      description: 'Menu dropdown',
      category: ComponentCategory.NAVIGATION,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 200,
            height: 160,
            cornerRadius: 8,
            effects: [{ type: 'DROP_SHADOW', color: '#0000001A', radius: 16, spread: 0, offset: { x: 0, y: 8 } }],
            layoutMode: 'VERTICAL',
            paddingTop: 4,
            paddingBottom: 4,
            childElements: [
              { name: 'Menu Item - Editar', type: 'MENU_ITEM', nodeId: 'menu-item-edit', width: 180, height: 32, text: 'Editar', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 500 } },
              { name: 'Menu Item - Duplicar', type: 'MENU_ITEM', nodeId: 'menu-item-duplicate', width: 180, height: 32, text: 'Duplicar', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 500 } },
              { name: 'Menu Item - Excluir', type: 'MENU_ITEM', nodeId: 'menu-item-delete', width: 180, height: 32, text: 'Excluir', typography: { fontFamily: 'Inter', fontSize: 13, fontWeight: 500 } }
            ],
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    // DATA DISPLAY
    {
      name: 'Table',
      description: 'Tabela de dados',
      category: ComponentCategory.DATA_DISPLAY,
      variants: [
        {
          name: 'Default',
          props: {
            fills: [{ type: 'SOLID', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ type: 'SOLID', color: '#E5E7EB', weight: 1, position: 'INSIDE' }],
            width: 600,
            height: 300,
            cornerRadius: 8,
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    {
      name: 'Avatar',
      description: 'Imagem de perfil',
      category: ComponentCategory.DATA_DISPLAY,
      variants: [
        {
          name: 'Small',
          props: {
            fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }],
            width: 32,
            height: 32,
            cornerRadius: 16,
            variantProperties: { size: 'small' }
          }
        },
        {
          name: 'Medium',
          props: {
            fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }],
            width: 40,
            height: 40,
            cornerRadius: 20,
            variantProperties: { size: 'medium' }
          }
        },
        {
          name: 'Large',
          props: {
            fills: [{ type: 'SOLID', color: '#E5E7EB', opacity: 1 }],
            width: 64,
            height: 64,
            cornerRadius: 32,
            variantProperties: { size: 'large' }
          }
        }
      ]
    },
    {
      name: 'List',
      description: 'Lista de itens',
      category: ComponentCategory.DATA_DISPLAY,
      variants: [
        {
          name: 'Default',
          props: {
            width: 300,
            height: 200,
            layoutMode: 'VERTICAL',
            itemSpacing: 0,
            variantProperties: { variant: 'default' }
          }
        }
      ]
    },
    // MEDIA
    {
      name: 'Icon',
      description: 'Icone SVG',
      category: ComponentCategory.MEDIA,
      variants: [
        {
          name: 'Default',
          props: {
            width: 24,
            height: 24,
            fills: [{ type: 'SOLID', color: '#374151', opacity: 1 }],
            variantProperties: { size: 'default' }
          }
        }
      ]
    },
    // FOUNDATION
    {
      name: 'Typography/Heading',
      description: 'Estilos de titulo',
      category: ComponentCategory.FOUNDATION,
      variants: [
        {
          name: 'H1',
          props: {
            width: 400,
            height: 48,
            textContents: [{
              characters: 'Heading 1',
              nodeName: 'H1',
              nodeId: 'h1',
              style: { fontFamily: 'Inter', fontSize: 36, fontWeight: 700, lineHeight: 48 }
            }],
            variantProperties: { level: 'h1' }
          }
        },
        {
          name: 'H2',
          props: {
            width: 400,
            height: 40,
            textContents: [{
              characters: 'Heading 2',
              nodeName: 'H2',
              nodeId: 'h2',
              style: { fontFamily: 'Inter', fontSize: 30, fontWeight: 600, lineHeight: 40 }
            }],
            variantProperties: { level: 'h2' }
          }
        },
        {
          name: 'H3',
          props: {
            width: 400,
            height: 32,
            textContents: [{
              characters: 'Heading 3',
              nodeName: 'H3',
              nodeId: 'h3',
              style: { fontFamily: 'Inter', fontSize: 24, fontWeight: 600, lineHeight: 32 }
            }],
            variantProperties: { level: 'h3' }
          }
        }
      ]
    },
    {
      name: 'Typography/Body',
      description: 'Estilos de texto corpo',
      category: ComponentCategory.FOUNDATION,
      variants: [
        {
          name: 'Large',
          props: {
            width: 400,
            height: 28,
            textContents: [{
              characters: 'Body text large',
              nodeName: 'Body',
              nodeId: 'body-lg',
              style: { fontFamily: 'Inter', fontSize: 18, fontWeight: 400, lineHeight: 28 }
            }],
            variantProperties: { size: 'large' }
          }
        },
        {
          name: 'Default',
          props: {
            width: 400,
            height: 24,
            textContents: [{
              characters: 'Body text default',
              nodeName: 'Body',
              nodeId: 'body-default',
              style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: 24 }
            }],
            variantProperties: { size: 'default' }
          }
        },
        {
          name: 'Small',
          props: {
            width: 400,
            height: 20,
            textContents: [{
              characters: 'Body text small',
              nodeName: 'Body',
              nodeId: 'body-sm',
              style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, lineHeight: 20 }
            }],
            variantProperties: { size: 'small' }
          }
        }
      ]
    }
  ];

  for (const componentData of components) {
    const { variants, ...componentInfo } = componentData;

    const created = await prisma.component.upsert({
      where: {
        projectId_name: {
          projectId: project.id,
          name: componentInfo.name
        }
      },
      update: {},
      create: {
        ...componentInfo,
        projectId: project.id,
      },
    });

    // Add variants with detailed props
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await prisma.componentVariant.upsert({
          where: {
            componentId_name: {
              componentId: created.id,
              name: variant.name,
            },
          },
          update: {
            props: variant.props,
          },
          create: {
            name: variant.name,
            props: variant.props,
            tokens: {},
            componentId: created.id,
          },
        });
      }
    }
  }
  console.log(`✅ ${components.length} components created with variants`);

  // ============================================
  // Create Version History
  // ============================================
  await prisma.versionHistory.create({
    data: {
      type: 'TOKEN_CREATED',
      summary: 'TokenSync Design System - Versao inicial criada',
      origin: ChangeOrigin.MANUAL,
      projectId: project.id,
      userId: admin.id,
      changes: { tokensCreated: tokens.length, componentsCreated: components.length },
      affectedItems: [...tokens.map(t => t.name), ...components.map(c => c.name)],
    },
  });
  console.log('✅ Version history entry created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('   Admin: admin@tokensync.com / admin123');
  console.log('   Demo:  demo@tokensync.com / demo123');
  console.log('\n📦 TokenSync Design System criado com:');
  console.log(`   - ${tokens.length} tokens`);
  console.log(`   - ${components.length} componentes`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
