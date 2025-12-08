import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Folder,
  AlertCircle,
  CheckCircle2,
  Clock,
  Box,
  Coins,
  ExternalLink
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  componentsCount: number;
  tokensCount: number;
  pendencies: number;
  divergences: number;
  lastUpdate: string;
  status: "healthy" | "warning" | "error";
  color: string;
}

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");

  const projects: Project[] = [
    {
      id: "1",
      name: "Fotus",
      componentsCount: 42,
      tokensCount: 247,
      pendencies: 0,
      divergences: 0,
      lastUpdate: "2 horas atrás",
      status: "healthy",
      color: "#6BA5E7"
    },
    {
      id: "2",
      name: "Litoral Têxtil",
      componentsCount: 38,
      tokensCount: 198,
      pendencies: 3,
      divergences: 2,
      lastUpdate: "1 dia atrás",
      status: "warning",
      color: "#F0E4C8"
    },
    {
      id: "3",
      name: "Onix",
      componentsCount: 52,
      tokensCount: 312,
      pendencies: 0,
      divergences: 0,
      lastUpdate: "3 horas atrás",
      status: "healthy",
      color: "#2D3748"
    },
    {
      id: "4",
      name: "CPAPS",
      componentsCount: 28,
      tokensCount: 156,
      pendencies: 5,
      divergences: 4,
      lastUpdate: "2 dias atrás",
      status: "error",
      color: "#E53E3E"
    },
    {
      id: "5",
      name: "UmClique",
      componentsCount: 35,
      tokensCount: 203,
      pendencies: 1,
      divergences: 0,
      lastUpdate: "5 horas atrás",
      status: "warning",
      color: "#38B2AC"
    },
    {
      id: "6",
      name: "UserFlow",
      componentsCount: 46,
      tokensCount: 278,
      pendencies: 0,
      divergences: 1,
      lastUpdate: "1 hora atrás",
      status: "warning",
      color: "#805AD5"
    }
  ];

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    const configs = {
      healthy: {
        icon: CheckCircle2,
        label: "Saudável",
        className: "bg-primary/10 text-primary"
      },
      warning: {
        icon: AlertCircle,
        label: "Atenção",
        className: "bg-accent/30 text-accent-foreground"
      },
      error: {
        icon: AlertCircle,
        label: "Crítico",
        className: "bg-destructive/10 text-destructive"
      }
    };
    return configs[status as keyof typeof configs];
  };

  const totalStats = {
    projects: projects.length,
    components: projects.reduce((acc, p) => acc + p.componentsCount, 0),
    tokens: projects.reduce((acc, p) => acc + p.tokensCount, 0),
    pendencies: projects.reduce((acc, p) => acc + p.pendencies, 0)
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus Design Systems
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{totalStats.projects}</div>
                <p className="text-xs text-muted-foreground">Projetos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Box className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{totalStats.components}</div>
                <p className="text-xs text-muted-foreground">Componentes Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{totalStats.tokens}</div>
                <p className="text-xs text-muted-foreground">Tokens Gerenciados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{totalStats.pendencies}</div>
                <p className="text-xs text-muted-foreground">Pendências</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => {
          const statusConfig = getStatusConfig(project.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card 
              key={project.id}
              className="shadow-soft hover:shadow-elevated transition-smooth group cursor-pointer"
            >
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${project.color}15` }}
                  >
                    <Folder 
                      className="h-6 w-6"
                      style={{ color: project.color }}
                    />
                  </div>
                  <Badge variant="secondary" className={statusConfig.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {project.lastUpdate}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-muted-foreground text-xs mb-1">Componentes</p>
                    <p className="font-semibold text-lg">{project.componentsCount}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-muted-foreground text-xs mb-1">Tokens</p>
                    <p className="font-semibold text-lg">{project.tokensCount}</p>
                  </div>
                </div>

                {(project.pendencies > 0 || project.divergences > 0) && (
                  <div className="space-y-2">
                    {project.pendencies > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pendências</span>
                        <Badge variant="secondary" className="bg-accent/30">
                          {project.pendencies}
                        </Badge>
                      </div>
                    )}
                    {project.divergences > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Divergências Figma</span>
                        <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                          {project.divergences}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="flex-1">
                    Abrir Projeto
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
