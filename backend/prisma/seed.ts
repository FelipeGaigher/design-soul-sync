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
  // Create Sample Project
  // ============================================
  const project = await prisma.project.upsert({
    where: { 
      id: 'sample-project-001'
    },
    update: {},
    create: {
      id: 'sample-project-001',
      name: 'Design System Principal',
      description: 'Sistema de design principal para demonstração',
      ownerId: admin.id,
      settings: {
        defaultFramework: 'react',
        namingConvention: 'kebab-case',
        autoSync: true,
      },
    },
  });
  console.log('✅ Sample project created:', project.name);

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
    
    // Z-Index
    { name: 'z-index/dropdown', value: '1000', type: TokenType.Z_INDEX, category: 'Layout', description: 'Dropdown z-index' },
    { name: 'z-index/sticky', value: '1020', type: TokenType.Z_INDEX, category: 'Layout', description: 'Sticky z-index' },
    { name: 'z-index/modal', value: '1050', type: TokenType.Z_INDEX, category: 'Layout', description: 'Modal z-index' },
    { name: 'z-index/tooltip', value: '1070', type: TokenType.Z_INDEX, category: 'Layout', description: 'Tooltip z-index' },
    
    // Animations
    { name: 'animation/duration-fast', value: '150ms', type: TokenType.OTHER, category: 'Animation', description: 'Fast animation' },
    { name: 'animation/duration-normal', value: '300ms', type: TokenType.OTHER, category: 'Animation', description: 'Normal animation' },
    { name: 'animation/duration-slow', value: '500ms', type: TokenType.OTHER, category: 'Animation', description: 'Slow animation' },
    { name: 'animation/easing-default', value: 'cubic-bezier(0.4, 0, 0.2, 1)', type: TokenType.OTHER, category: 'Animation', description: 'Default easing' },
    
    // Opacity
    { name: 'opacity/disabled', value: '0.5', type: TokenType.OPACITY, category: 'Effects', description: 'Disabled state opacity' },
    { name: 'opacity/hover', value: '0.8', type: TokenType.OPACITY, category: 'Effects', description: 'Hover state opacity' },
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
  // Create Components
  // ============================================
  const components = [
    // Fundamentais
    { name: 'Button', description: 'Botão de ação primária ou secundária', category: ComponentCategory.FUNDAMENTAIS },
    { name: 'Input', description: 'Campo de entrada de texto', category: ComponentCategory.FUNDAMENTAIS },
    { name: 'Checkbox', description: 'Caixa de seleção múltipla', category: ComponentCategory.FUNDAMENTAIS },
    { name: 'Radio', description: 'Botão de seleção única', category: ComponentCategory.FUNDAMENTAIS },
    { name: 'Switch', description: 'Alternador de estado', category: ComponentCategory.FUNDAMENTAIS },
    { name: 'Select', description: 'Seletor dropdown', category: ComponentCategory.FUNDAMENTAIS },
    
    // Feedback
    { name: 'Alert', description: 'Mensagem de alerta contextual', category: ComponentCategory.FEEDBACK },
    { name: 'Toast', description: 'Notificação temporária', category: ComponentCategory.FEEDBACK },
    { name: 'Badge', description: 'Etiqueta de status', category: ComponentCategory.FEEDBACK },
    { name: 'Progress', description: 'Barra de progresso', category: ComponentCategory.FEEDBACK },
    { name: 'Skeleton', description: 'Placeholder de carregamento', category: ComponentCategory.FEEDBACK },
    { name: 'Spinner', description: 'Indicador de carregamento', category: ComponentCategory.FEEDBACK },
    
    // Layout
    { name: 'Card', description: 'Contêiner de conteúdo', category: ComponentCategory.LAYOUT },
    { name: 'Dialog', description: 'Modal de diálogo', category: ComponentCategory.LAYOUT },
    { name: 'Drawer', description: 'Painel lateral deslizante', category: ComponentCategory.LAYOUT },
    { name: 'Accordion', description: 'Lista expansível', category: ComponentCategory.LAYOUT },
    { name: 'Tabs', description: 'Abas de navegação', category: ComponentCategory.LAYOUT },
    { name: 'Separator', description: 'Divisor visual', category: ComponentCategory.LAYOUT },
    
    // Navegação
    { name: 'Breadcrumb', description: 'Navegação hierárquica', category: ComponentCategory.NAVEGACAO },
    { name: 'Menu', description: 'Menu de navegação', category: ComponentCategory.NAVEGACAO },
    { name: 'Pagination', description: 'Controle de paginação', category: ComponentCategory.NAVEGACAO },
    { name: 'Sidebar', description: 'Menu lateral', category: ComponentCategory.NAVEGACAO },
    { name: 'Navbar', description: 'Barra de navegação superior', category: ComponentCategory.NAVEGACAO },
    
    // Dados
    { name: 'Table', description: 'Tabela de dados', category: ComponentCategory.DADOS },
    { name: 'DataGrid', description: 'Grade de dados avançada', category: ComponentCategory.DADOS },
    { name: 'List', description: 'Lista de itens', category: ComponentCategory.DADOS },
    { name: 'Avatar', description: 'Imagem de perfil', category: ComponentCategory.DADOS },
    { name: 'Chart', description: 'Gráfico de visualização', category: ComponentCategory.DADOS },
  ];

  for (const component of components) {
    const created = await prisma.component.upsert({
      where: { 
        projectId_name: { 
          projectId: project.id, 
          name: component.name 
        } 
      },
      update: {},
      create: {
        ...component,
        projectId: project.id,
      },
    });

    // Add variants for Button component
    if (component.name === 'Button') {
      const variants = [
        { name: 'Primary', tokens: { backgroundColor: 'color/primary-500', textColor: 'color/white' } },
        { name: 'Secondary', tokens: { backgroundColor: 'color/gray-200', textColor: 'color/gray-900' } },
        { name: 'Outline', tokens: { backgroundColor: 'transparent', borderColor: 'color/primary-500', textColor: 'color/primary-500' } },
        { name: 'Ghost', tokens: { backgroundColor: 'transparent', textColor: 'color/gray-700' } },
        { name: 'Destructive', tokens: { backgroundColor: 'color/error', textColor: 'color/white' } },
      ];

      for (const variant of variants) {
        await prisma.componentVariant.upsert({
          where: {
            componentId_name: {
              componentId: created.id,
              name: variant.name,
            },
          },
          update: {},
          create: {
            name: variant.name,
            tokens: variant.tokens,
            componentId: created.id,
          },
        });
      }
    }
  }
  console.log(`✅ ${components.length} components created`);

  // ============================================
  // Create Sample Automations
  // ============================================
  const automations = [
    { name: 'Sincronizar tokens com Figma', description: 'Atualiza automaticamente quando detectar mudanças', category: 'sync', enabled: true },
    { name: 'Atualizar componentes ao alterar tokens', description: 'Propaga alterações para componentes derivados', category: 'sync', enabled: true },
    { name: 'Verificação de contraste', description: 'Valida WCAG AA/AAA em todas as cores', category: 'accessibility', enabled: true },
    { name: 'Detectar tokens duplicados', description: 'Encontra valores idênticos com nomes diferentes', category: 'consistency', enabled: true },
    { name: 'Tokens sem uso', description: 'Identifica tokens não utilizados em componentes', category: 'consistency', enabled: false },
  ];

  for (const automation of automations) {
    await prisma.automation.upsert({
      where: {
        projectId_name: {
          projectId: project.id,
          name: automation.name,
        },
      },
      update: {},
      create: {
        ...automation,
        projectId: project.id,
      },
    });
  }
  console.log(`✅ ${automations.length} automations created`);

  // ============================================
  // Create Sample Version History
  // ============================================
  await prisma.versionHistory.create({
    data: {
      type: 'TOKEN_CREATED',
      summary: 'Tokens iniciais criados via seed',
      origin: ChangeOrigin.MANUAL,
      projectId: project.id,
      userId: admin.id,
      changes: { tokensCreated: tokens.length },
      affectedItems: tokens.map(t => t.name),
    },
  });
  console.log('✅ Version history entry created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('   Admin: admin@tokensync.com / admin123');
  console.log('   Demo:  demo@tokensync.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
