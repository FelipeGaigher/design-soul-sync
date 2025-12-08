import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Box, GitBranch, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { CreateTokenDialog } from "@/components/tokens/CreateTokenDialog";

export default function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const stats = [
    { label: "Tokens Ativos", value: "247", icon: Coins, change: "+12%" },
    { label: "Componentes", value: "38", icon: Box, change: "+5%" },
    { label: "Versões", value: "14", icon: GitBranch, change: "+2%" },
    { label: "Taxa de Sync", value: "98%", icon: TrendingUp, change: "+3%" },
  ];

  const recentActivity = [
    { action: "Token color/primary-500 atualizado", time: "2 min atrás" },
    { action: "Componente Button exportado", time: "15 min atrás" },
    { action: "Sync com Figma concluído", time: "1 hora atrás" },
    { action: "Nova versão v2.3.0 criada", time: "3 horas atrás" },
  ];

  return (
    <>
      <CreateTokenDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />

      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do seu Design System sincronizado
            </p>
          </div>
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            Criar Token
          </Button>
        </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label}
            className="shadow-soft transition-smooth hover:shadow-elevated"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stat.value}</div>
              <p className="text-xs text-accent-foreground mt-1">
                <span className="text-primary font-medium">{stat.change}</span> desde último mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acelere seu fluxo de trabalho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between group"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Criar novo Token
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" className="w-full justify-between group">
              Sincronizar com Figma
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" className="w-full justify-between group">
              Exportar Design System
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" className="w-full justify-between group">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
                Perguntar ao Assistente IA
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas mudanças no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0 border-border"
                >
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Projetos Ativos</CardTitle>
          <CardDescription>Design Systems em desenvolvimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {["Design System Principal", "Landing Pages", "Mobile App"].map((project, index) => (
              <div 
                key={project}
                className="rounded-lg border border-border bg-muted/30 p-4 transition-smooth hover:border-primary hover:shadow-soft"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Folder className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {Math.floor(Math.random() * 30) + 70}% completo
                  </span>
                </div>
                <h3 className="font-medium mb-1">{project}</h3>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(Math.random() * 50) + 20} componentes
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}

function Folder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}
