import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, AlertCircle, Download, Upload } from "lucide-react";

interface DivergencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "colors" | "typography" | "spacing" | "effects" | null;
}

const mockDivergences = {
  colors: [
    { 
      name: "color/primary-500",
      figmaValue: "#6BA5E7",
      localValue: "#5A94D6",
      affectedComponents: ["Button", "Link", "Badge"]
    },
    { 
      name: "color/accent-400",
      figmaValue: "#F0E4C8",
      localValue: "#E8D9B8",
      affectedComponents: ["Alert", "Toast"]
    }
  ],
  typography: [
    { 
      name: "font/heading",
      figmaValue: "Inter Semi Bold",
      localValue: "Inter Medium",
      affectedComponents: ["H1", "H2", "H3"]
    }
  ],
  spacing: [
    { 
      name: "spacing/md",
      figmaValue: "16px",
      localValue: "20px",
      affectedComponents: ["Card", "Button", "Input"]
    }
  ],
  effects: [
    { 
      name: "shadow/soft",
      figmaValue: "0 4px 12px rgba(0,0,0,0.06)",
      localValue: "0 2px 8px rgba(0,0,0,0.08)",
      affectedComponents: ["Card", "Dialog", "Popover"]
    }
  ]
};

export function DivergencesDialog({ open, onOpenChange, type }: DivergencesDialogProps) {
  if (!type) return null;

  const divergences = mockDivergences[type] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Divergências Encontradas</DialogTitle>
          <DialogDescription>
            Diferenças entre valores locais e do Figma em {type}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-accent/20 border border-accent p-4">
            <AlertCircle className="h-5 w-5 text-accent-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {divergences.length} {divergences.length === 1 ? 'divergência encontrada' : 'divergências encontradas'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Escolha qual valor deseja manter em cada caso
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {divergences.map((item, index) => (
              <div 
                key={index}
                className="rounded-lg border border-border bg-card p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-mono text-sm font-medium mb-1">{item.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      {item.affectedComponents.map((comp) => (
                        <Badge key={comp} variant="secondary" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Local Value */}
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground mb-2">Valor Local</p>
                    <div className="flex items-center gap-2">
                      {type === "colors" && (
                        <div 
                          className="h-8 w-8 rounded border border-border"
                          style={{ backgroundColor: item.localValue }}
                        />
                      )}
                      <span className="font-mono text-sm">{item.localValue}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-3 gap-2"
                    >
                      <Download className="h-3 w-3" />
                      Manter Local
                    </Button>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Figma Value */}
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <p className="text-xs text-muted-foreground mb-2">Valor Figma</p>
                    <div className="flex items-center gap-2">
                      {type === "colors" && (
                        <div 
                          className="h-8 w-8 rounded border border-border"
                          style={{ backgroundColor: item.figmaValue }}
                        />
                      )}
                      <span className="font-mono text-sm">{item.figmaValue}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-3 gap-2"
                    >
                      <Upload className="h-3 w-3" />
                      Usar Figma
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button>
              Aplicar Todas as Mudanças
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
