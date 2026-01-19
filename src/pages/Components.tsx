import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Layers, MessageSquare, LayoutGrid, Navigation, Database } from "lucide-react";
import { ComponentCard } from "@/components/components/ComponentCard";

type Category = "fundamentais" | "feedback" | "layout" | "navegacao" | "dados";

export default function Components() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("fundamentais");

  const categories = [
    { id: "fundamentais" as Category, label: "Fundamentais", icon: Layers, count: 12 },
    { id: "feedback" as Category, label: "Feedback", icon: MessageSquare, count: 8 },
    { id: "layout" as Category, label: "Layout", icon: LayoutGrid, count: 10 },
    { id: "navegacao" as Category, label: "Navegação", icon: Navigation, count: 7 },
    { id: "dados" as Category, label: "Dados", icon: Database, count: 9 }
  ];

  const components = {
    fundamentais: [
      { name: "Button", description: "Botão de ação primária ou secundária", variants: 8, tokens: 12, category: "Fundamentais" },
      { name: "Input", description: "Campo de entrada de texto", variants: 5, tokens: 8, category: "Fundamentais" },
      { name: "Checkbox", description: "Caixa de seleção múltipla", variants: 4, tokens: 6, category: "Fundamentais" },
      { name: "Radio", description: "Botão de seleção única", variants: 3, tokens: 5, category: "Fundamentais" },
      { name: "Switch", description: "Alternador de estado", variants: 3, tokens: 7, category: "Fundamentais" },
      { name: "Select", description: "Seletor dropdown", variants: 4, tokens: 10, category: "Fundamentais" },
    ],
    feedback: [
      { name: "Alert", description: "Mensagem de alerta contextual", variants: 4, tokens: 8, category: "Feedback" },
      { name: "Toast", description: "Notificação temporária", variants: 4, tokens: 7, category: "Feedback" },
      { name: "Badge", description: "Etiqueta de status", variants: 6, tokens: 5, category: "Feedback" },
      { name: "Progress", description: "Barra de progresso", variants: 3, tokens: 6, category: "Feedback" },
      { name: "Skeleton", description: "Placeholder de carregamento", variants: 2, tokens: 4, category: "Feedback" },
      { name: "Spinner", description: "Indicador de carregamento", variants: 3, tokens: 5, category: "Feedback" },
    ],
    layout: [
      { name: "Card", description: "Contêiner de conteúdo", variants: 5, tokens: 10, category: "Layout" },
      { name: "Dialog", description: "Modal de diálogo", variants: 3, tokens: 12, category: "Layout" },
      { name: "Drawer", description: "Painel lateral deslizante", variants: 2, tokens: 8, category: "Layout" },
      { name: "Accordion", description: "Lista expansível", variants: 2, tokens: 7, category: "Layout" },
      { name: "Tabs", description: "Abas de navegação", variants: 3, tokens: 9, category: "Layout" },
      { name: "Separator", description: "Divisor visual", variants: 2, tokens: 3, category: "Layout" },
    ],
    navegacao: [
      { name: "Breadcrumb", description: "Navegação hierárquica", variants: 2, tokens: 5, category: "Navegação" },
      { name: "Menu", description: "Menu de navegação", variants: 4, tokens: 8, category: "Navegação" },
      { name: "Pagination", description: "Controle de paginação", variants: 2, tokens: 6, category: "Navegação" },
      { name: "Sidebar", description: "Menu lateral", variants: 3, tokens: 12, category: "Navegação" },
      { name: "Navbar", description: "Barra de navegação superior", variants: 3, tokens: 10, category: "Navegação" },
    ],
    dados: [
      { name: "Table", description: "Tabela de dados", variants: 3, tokens: 15, category: "Dados" },
      { name: "DataGrid", description: "Grade de dados avançada", variants: 4, tokens: 18, category: "Dados" },
      { name: "List", description: "Lista de itens", variants: 3, tokens: 7, category: "Dados" },
      { name: "Avatar", description: "Imagem de perfil", variants: 4, tokens: 6, category: "Dados" },
      { name: "Chart", description: "Gráfico de visualização", variants: 5, tokens: 12, category: "Dados" },
    ]
  };

  const currentComponents = components[activeCategory];
  const filteredComponents = currentComponents.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl">Componentes</h1>
          <p className="text-muted-foreground">
            Biblioteca de componentes do Design System
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Componente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-3xl font-semibold mb-1">46</div>
            <p className="text-sm text-muted-foreground">Componentes Totais</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-3xl font-semibold mb-1">127</div>
            <p className="text-sm text-muted-foreground">Variantes Criadas</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-3xl font-semibold mb-1">98%</div>
            <p className="text-sm text-muted-foreground">Cobertura de Tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-soft">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar componentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <cat.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{cat.label}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {cat.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredComponents.map((component, index) => (
                    <ComponentCard
                      key={index}
                      component={component}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Alert Variants Example */}
      {activeCategory === "feedback" && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Alert - Variantes</CardTitle>
            <CardDescription>Exemplo de variantes do componente Alert</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { variant: "Success", color: "bg-primary/10 border-primary/20 text-primary", icon: "✓" },
              { variant: "Warning", color: "bg-accent/20 border-accent text-accent-foreground", icon: "⚠" },
              { variant: "Danger", color: "bg-destructive/10 border-destructive/20 text-destructive", icon: "✕" },
              { variant: "Info", color: "bg-muted border-border", icon: "ℹ" }
            ].map((alert) => (
              <div key={alert.variant} className="space-y-2">
                <p className="text-sm font-medium">{alert.variant}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className={`rounded-lg border p-4 ${alert.color}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{alert.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Alert {alert.variant}</p>
                        <p className="text-xs opacity-80 mt-1">Mensagem de exemplo para este tipo de alerta</p>
                      </div>
                    </div>
                  </div>
                  <div className={`rounded-lg border p-4 ${alert.color}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{alert.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Alert {alert.variant} com botão</p>
                        <p className="text-xs opacity-80 mt-1">Mensagem de exemplo</p>
                        <Button size="sm" variant="outline" className="mt-3 h-7 text-xs">
                          Ação
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
