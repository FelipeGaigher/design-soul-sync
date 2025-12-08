import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Edit, Trash2, Box, GitBranch } from "lucide-react";

interface TokenDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: {
    name: string;
    value: string;
    type: string;
    category: string;
  } | null;
}

export function TokenDetailDialog({ open, onOpenChange, token }: TokenDetailDialogProps) {
  if (!token) return null;

  const mockComponents = [
    "Button Primary",
    "Card Header",
    "Navigation Menu",
    "Alert Success",
  ];

  const mockStates = [
    { name: "Default", value: token.value },
    { name: "Hover", value: "#5A94D6" },
    { name: "Pressed", value: "#4A84C6" },
    { name: "Disabled", value: "#B3D4F2" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-mono">{token.name}</DialogTitle>
              <DialogDescription className="mt-2">
                Detalhes e uso deste token no sistema
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Valor</p>
              <div className="flex items-center gap-3">
                {token.type === "Color" && (
                  <div 
                    className="h-10 w-10 rounded border border-border shadow-subtle"
                    style={{ backgroundColor: token.value }}
                  />
                )}
                <span className="font-mono text-sm font-medium">{token.value}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tipo</p>
              <Badge variant="secondary">{token.type}</Badge>
            </div>
          </div>

          <Separator />

          {/* States */}
          {token.type === "Color" && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Estados de Interação</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {mockStates.map((state) => (
                    <div 
                      key={state.name}
                      className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{state.name}</span>
                        <div 
                          className="h-6 w-6 rounded border border-border"
                          style={{ backgroundColor: state.value }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {state.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Components Using */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Componentes que Usam</h3>
              <Badge variant="secondary" className="ml-auto">
                {mockComponents.length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {mockComponents.map((component) => (
                <div 
                  key={component}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {component}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Metadados</h3>
            <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria</span>
                <span className="font-medium">{token.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em</span>
                <span className="font-medium">15 Jan 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última atualização</span>
                <span className="font-medium">2 horas atrás</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Sync</span>
                <Badge variant="secondary" className="text-xs">
                  <div className="h-2 w-2 rounded-full bg-primary mr-1" />
                  Sincronizado
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
