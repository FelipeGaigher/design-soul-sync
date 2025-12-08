import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Clock } from "lucide-react";
import { useState } from "react";

interface ProjectSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProject: (project: any) => void;
}

const mockProjects = [
  { 
    id: "1", 
    name: "Design System Principal", 
    tokensCount: 247, 
    lastSync: "2 horas atrás",
    status: "synced"
  },
  { 
    id: "2", 
    name: "Landing Pages", 
    tokensCount: 142, 
    lastSync: "1 dia atrás",
    status: "pending"
  },
  { 
    id: "3", 
    name: "Mobile App", 
    tokensCount: 189, 
    lastSync: "3 dias atrás",
    status: "divergent"
  },
  { 
    id: "4", 
    name: "Dashboard Admin", 
    tokensCount: 98, 
    lastSync: "1 semana atrás",
    status: "synced"
  },
];

export function ProjectSelectDialog({ open, onOpenChange, onSelectProject }: ProjectSelectDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = mockProjects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      synced: { label: "Sincronizado", color: "bg-primary/10 text-primary" },
      pending: { label: "Pendente", color: "bg-accent/30 text-accent-foreground" },
      divergent: { label: "Divergente", color: "bg-destructive/10 text-destructive" }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Selecionar Projeto Figma</DialogTitle>
          <DialogDescription>
            Escolha qual projeto você deseja conectar
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar projeto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => {
                  onSelectProject(project);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{project.tokensCount} tokens</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.lastSync}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(project.status)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://figma.com/file/${project.id}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
