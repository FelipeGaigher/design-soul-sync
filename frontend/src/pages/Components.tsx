import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Layers, MessageSquare, LayoutGrid, Navigation, Database, Loader2 } from "lucide-react";
import { ComponentCard } from "@/components/components/ComponentCard";
import { useProject } from "@/contexts/ProjectContext";
import { componentsService, Folder } from "@/services/components.service";

type Category = "FOUNDATION" | "BUTTONS" | "FORM_CONTROLS" | "FEEDBACK" | "NAVIGATION" | "LAYOUT" | "DATA_DISPLAY" | "MEDIA";

const categoryConfig: Record<Category, { label: string; icon: typeof Layers }> = {
  FOUNDATION: { label: "Fundamentais", icon: Layers },
  BUTTONS: { label: "Botões", icon: Layers },
  FORM_CONTROLS: { label: "Formulários", icon: Layers },
  FEEDBACK: { label: "Feedback", icon: MessageSquare },
  NAVIGATION: { label: "Navegação", icon: Navigation },
  LAYOUT: { label: "Layout", icon: LayoutGrid },
  DATA_DISPLAY: { label: "Dados", icon: Database },
  MEDIA: { label: "Mídia", icon: Layers },
};

export default function Components() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("FOUNDATION");
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const { activeProject } = useProject();

  useEffect(() => {
    async function load() {
      if (!activeProject?.id) return;
      setLoading(true);
      try {
        const data = await componentsService.getProjectComponents(activeProject.id);
        setFolders(data.folders || []);
        // Set first available category as active
        if (data.folders?.length > 0) {
          setActiveCategory(data.folders[0].name as Category);
        }
      } catch (err) {
        console.error('Failed to load components', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [activeProject]);

  // Get categories that have components
  const availableCategories = folders.map(f => ({
    id: f.name as Category,
    label: categoryConfig[f.name as Category]?.label || f.name,
    icon: categoryConfig[f.name as Category]?.icon || Layers,
    count: f.components.length,
  }));

  // Get current folder components
  const currentFolder = folders.find(f => f.name === activeCategory);
  const currentComponents = currentFolder?.components || [];

  // Map to UI format
  const mappedComponents = currentComponents.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    variants: 0,
    tokens: 0,
    category: activeCategory,
    previewUrl: c.previewUrl,
  }));

  const filteredComponents = mappedComponents.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalComponents = folders.reduce((acc, f) => acc + f.components.length, 0);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum projeto selecionado</h3>
          <p className="text-muted-foreground">
            Selecione um projeto na página de Projetos para ver seus componentes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl">Componentes</h1>
          <p className="text-muted-foreground">
            Biblioteca de componentes do Design System - {activeProject.name}
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
            <div className="text-3xl font-semibold mb-1">{totalComponents}</div>
            <p className="text-sm text-muted-foreground">Componentes Totais</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-3xl font-semibold mb-1">{availableCategories.length}</div>
            <p className="text-sm text-muted-foreground">Categorias</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-3xl font-semibold mb-1">{activeProject.componentsCount || 0}</div>
            <p className="text-sm text-muted-foreground">Importados do Figma</p>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableCategories.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum componente encontrado</h3>
              <p className="text-muted-foreground">
                Importe componentes do Figma para começar
              </p>
            </div>
          ) : (
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
              <TabsList className="flex flex-wrap gap-1 mb-6 h-auto">
                {availableCategories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                    <cat.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{cat.label}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {cat.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableCategories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id}>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredComponents.map((component) => (
                      <ComponentCard
                        key={component.id}
                        component={component}
                        onClick={() => {}}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
