import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Type, 
  Ruler, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Settings
} from "lucide-react";
import { ProjectSelectDialog } from "@/components/figma/ProjectSelectDialog";
import { DivergencesDialog } from "@/components/figma/DivergencesDialog";

type CategoryType = "colors" | "typography" | "spacing" | "effects";

export default function FigmaVariables() {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isDivergencesDialogOpen, setIsDivergencesDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [currentProject, setCurrentProject] = useState({
    name: "Design System Principal",
    tokensCount: 247
  });

  const categories = [
    {
      id: "colors" as CategoryType,
      title: "Colors",
      icon: Palette,
      variables: 48,
      components: 32,
      status: "synced",
      divergences: 2
    },
    {
      id: "typography" as CategoryType,
      title: "Typography",
      icon: Type,
      variables: 24,
      components: 18,
      status: "synced",
      divergences: 0
    },
    {
      id: "spacing" as CategoryType,
      title: "Spacing",
      icon: Ruler,
      variables: 16,
      components: 45,
      status: "pending",
      divergences: 1
    },
    {
      id: "effects" as CategoryType,
      title: "Effects",
      icon: Sparkles,
      variables: 12,
      components: 28,
      status: "synced",
      divergences: 0
    }
  ];

  const handleCategoryClick = (category: CategoryType, divergences: number) => {
    if (divergences > 0) {
      setSelectedCategory(category);
      setIsDivergencesDialogOpen(true);
    }
  };

  const getStatusInfo = (status: string, divergences: number) => {
    if (divergences > 0) {
      return {
        icon: AlertCircle,
        label: "Divergente",
        className: "bg-destructive/10 text-destructive"
      };
    }
    if (status === "pending") {
      return {
        icon: RefreshCw,
        label: "Pendente",
        className: "bg-accent/30 text-accent-foreground"
      };
    }
    return {
      icon: CheckCircle2,
      label: "Sincronizado",
      className: "bg-primary/10 text-primary"
    };
  };

  return (
    <>
      <ProjectSelectDialog 
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        onSelectProject={(project) => setCurrentProject(project)}
      />
      <DivergencesDialog
        open={isDivergencesDialogOpen}
        onOpenChange={setIsDivergencesDialogOpen}
        type={selectedCategory}
      />

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl">Variáveis do Figma</h1>
            <p className="text-muted-foreground">
              Sincronize e gerencie variáveis do Figma
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setIsProjectDialogOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Alterar Projeto
            </Button>
          </div>
        </div>

        {/* Current Project Info */}
        <Card className="shadow-soft border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Projeto Conectado</p>
                <h2 className="text-2xl font-semibold">{currentProject.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentProject.tokensCount} tokens sincronizados
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => setIsProjectDialogOpen(true)}
              >
                Trocar Projeto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => {
            const statusInfo = getStatusInfo(category.status, category.divergences);
            const StatusIcon = statusInfo.icon;

            return (
              <Card 
                key={category.id}
                className="shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group"
                onClick={() => handleCategoryClick(category.id, category.divergences)}
              >
                <CardHeader className="border-b border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {category.variables} variáveis
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusInfo.className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Componentes Afetados</span>
                      <span className="font-medium">{category.components}</span>
                    </div>
                    {category.divergences > 0 && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">
                            {category.divergences} {category.divergences === 1 ? 'divergência' : 'divergências'}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-3 border-destructive/20 hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category.id);
                            setIsDivergencesDialogOpen(true);
                          }}
                        >
                          Resolver Divergências
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Histórico de Sincronização</CardTitle>
            <CardDescription>Últimas alterações sincronizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "48 cores sincronizadas", time: "2 horas atrás", status: "success" },
                { action: "2 divergências em colors resolvidas", time: "5 horas atrás", status: "warning" },
                { action: "24 estilos de texto atualizados", time: "1 dia atrás", status: "success" },
                { action: "Projeto alterado para Design System Principal", time: "2 dias atrás", status: "info" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0 border-border"
                >
                  <div className={`h-2 w-2 rounded-full mt-1.5 ${
                    item.status === 'success' ? 'bg-primary' :
                    item.status === 'warning' ? 'bg-accent' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
