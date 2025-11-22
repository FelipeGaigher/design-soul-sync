import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, GitCommit, FileEdit, Package, RefreshCw, GitBranch, AlertCircle, Sparkles, User, Calendar } from "lucide-react";

interface VersionDetail {
  id: string;
  type: "token-created" | "token-edited" | "token-removed" | "component-updated" | "figma-sync" | "divergence-resolved" | "rollback";
  summary: string;
  date: string;
  time: string;
  user: string;
  origin: "Manual" | "Figma" | "Automação" | "IA";
  affectedItems?: string[];
  before?: { [key: string]: string };
  after?: { [key: string]: string };
}

const typeConfig = {
  "token-created": { label: "Token criado", icon: GitCommit, color: "bg-primary/10 text-primary" },
  "token-edited": { label: "Token editado", icon: FileEdit, color: "bg-accent/30 text-accent-foreground" },
  "token-removed": { label: "Token removido", icon: AlertCircle, color: "bg-destructive/10 text-destructive" },
  "component-updated": { label: "Componente atualizado", icon: Package, color: "bg-secondary text-secondary-foreground" },
  "figma-sync": { label: "Sincronização do Figma", icon: RefreshCw, color: "bg-primary/10 text-primary" },
  "divergence-resolved": { label: "Divergência resolvida", icon: GitBranch, color: "bg-accent/30 text-accent-foreground" },
  "rollback": { label: "Rollback aplicado", icon: AlertCircle, color: "bg-muted text-muted-foreground" },
};

export default function Versioning() {
  const [selectedVersion, setSelectedVersion] = useState<VersionDetail | null>(null);

  const stats = [
    { label: "Alterações Recentes", value: "47", icon: Clock },
    { label: "Tokens Modificados", value: "23", icon: GitCommit },
    { label: "Componentes Atualizados", value: "12", icon: Package },
    { label: "Rollbacks Realizados", value: "3", icon: RefreshCw },
  ];

  const timeline: VersionDetail[] = [
    {
      id: "1",
      type: "token-edited",
      summary: "Token color/primary-500 alterado",
      date: "23 Jan 2025",
      time: "14:32",
      user: "Ana Silva",
      origin: "Manual",
      before: { "color/primary-500": "#3B82F6" },
      after: { "color/primary-500": "#6BA5E7" },
      affectedItems: ["Button", "Badge", "Alert", "Card Header"],
    },
    {
      id: "2",
      type: "figma-sync",
      summary: "Variáveis de Typography sincronizadas com Figma",
      date: "23 Jan 2025",
      time: "12:15",
      user: "Sistema",
      origin: "Figma",
      affectedItems: ["Heading", "Body", "Caption", "Label"],
    },
    {
      id: "3",
      type: "component-updated",
      summary: "Button/Primary recebeu novo estado hover",
      date: "22 Jan 2025",
      time: "16:45",
      user: "Carlos Mendes",
      origin: "Manual",
      before: { hover: "bg-primary/90" },
      after: { hover: "bg-primary-hover" },
    },
    {
      id: "4",
      type: "token-created",
      summary: "Novo token spacing/layout-gap criado",
      date: "22 Jan 2025",
      time: "10:20",
      user: "IA Assistant",
      origin: "IA",
      after: { "spacing/layout-gap": "1.5rem" },
    },
    {
      id: "5",
      type: "divergence-resolved",
      summary: "Conflito de color/secondary resolvido",
      date: "21 Jan 2025",
      time: "09:30",
      user: "Ana Silva",
      origin: "Manual",
      before: { "Local": "#E5E7EB", "Figma": "#F3F4F6" },
      after: { "Resolvido": "#F3F4F6" },
    },
    {
      id: "6",
      type: "rollback",
      summary: "Revertida alteração no token radius/base",
      date: "20 Jan 2025",
      time: "18:00",
      user: "Carlos Mendes",
      origin: "Manual",
      before: { "radius/base": "0.75rem" },
      after: { "radius/base": "0.5rem" },
    },
  ];

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="mb-2 text-3xl">Versionamento</h1>
          <p className="text-muted-foreground">
            Acompanhe as mudanças do seu Design System ao longo do tempo
          </p>
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Histórico de Alterações</CardTitle>
            <CardDescription>Timeline completa das mudanças do Design System</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-6">
              {/* Vertical line */}
              <div className="absolute left-6 top-3 bottom-3 w-px bg-border" />

              {timeline.map((item, index) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;

                return (
                  <div 
                    key={item.id} 
                    className="relative flex gap-6 animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-background bg-card shadow-soft">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <Card className="shadow-subtle hover:shadow-soft transition-smooth cursor-pointer group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {config.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.origin}
                                </Badge>
                              </div>
                              <h3 className="font-medium mb-2">{item.summary}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {item.date}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {item.time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {item.user}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedVersion(item)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Ver Detalhes
                            </Button>
                          </div>

                          {item.affectedItems && item.affectedItems.length > 0 && (
                            <div className="pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-2">
                                Itens afetados: {item.affectedItems.length}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {item.affectedItems.slice(0, 4).map((affectedItem) => (
                                  <Badge key={affectedItem} variant="outline" className="text-xs">
                                    {affectedItem}
                                  </Badge>
                                ))}
                                {item.affectedItems.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.affectedItems.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version Detail Modal */}
      <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedVersion && (
                <Badge variant="secondary">
                  {typeConfig[selectedVersion.type].label}
                </Badge>
              )}
              <Badge variant="outline">
                {selectedVersion?.origin}
              </Badge>
            </div>
            <DialogTitle className="text-2xl">{selectedVersion?.summary}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-4 text-sm pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {selectedVersion?.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedVersion?.time}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {selectedVersion?.user}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Before vs After */}
            {selectedVersion?.before && selectedVersion?.after && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="shadow-subtle">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Antes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(selectedVersion.before).map(([key, value]) => (
                        <div key={key} className="rounded-md bg-muted p-3">
                          <p className="text-xs text-muted-foreground mb-1">{key}</p>
                          <p className="font-mono text-sm font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-subtle border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Depois</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(selectedVersion.after).map(([key, value]) => (
                        <div key={key} className="rounded-md bg-primary/10 p-3 border border-primary/20">
                          <p className="text-xs text-muted-foreground mb-1">{key}</p>
                          <p className="font-mono text-sm font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Affected Items */}
            {selectedVersion?.affectedItems && selectedVersion.affectedItems.length > 0 && (
              <Card className="shadow-subtle">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Componentes Afetados ({selectedVersion.affectedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedVersion.affectedItems.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview Visual */}
            <Card className="shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview Visual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Antes</p>
                    <div className="rounded-lg border border-border p-4 bg-muted/30">
                      <div className="h-10 rounded-md bg-[#3B82F6] flex items-center justify-center text-white text-sm font-medium">
                        Button Primary (Antes)
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Depois</p>
                    <div className="rounded-lg border border-primary/20 p-4 bg-primary/5">
                      <div className="h-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        Button Primary (Depois)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedVersion(null)}>
              Fechar
            </Button>
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Criar nova versão baseada nesta
            </Button>
            <Button variant="destructive" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reverter alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
