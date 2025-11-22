import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Upload, 
  Puzzle, 
  Sparkles,
  ArrowRight 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreateTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTokenDialog({ open, onOpenChange }: CreateTokenDialogProps) {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Criar Novo Token</DialogTitle>
          <DialogDescription>
            Escolha como você deseja criar seu token
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">
              <Plus className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="figma-api">
              <Upload className="h-4 w-4 mr-2" />
              API Figma
            </TabsTrigger>
            <TabsTrigger value="figma-plugin">
              <Puzzle className="h-4 w-4 mr-2" />
              Plugin Figma
            </TabsTrigger>
          </TabsList>

          {/* Manual Creation */}
          <TabsContent value="manual" className="space-y-6 mt-6">
            <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Criação Manual</h3>
                  <p className="text-sm text-muted-foreground">
                    Defina manualmente os valores e propriedades do seu token
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="token-name">Nome do Token</Label>
                  <Input 
                    id="token-name" 
                    placeholder="Ex: color/primary-500"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use nomenclatura: categoria/nome-variante
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-value">Valor</Label>
                    <Input 
                      id="token-value" 
                      placeholder="Ex: #6BA5E7"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="token-type">Tipo</Label>
                    <Input 
                      id="token-type" 
                      placeholder="Ex: Color"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token-category">Categoria</Label>
                  <Input 
                    id="token-category" 
                    placeholder="Ex: Colors"
                  />
                </div>

                <Button className="w-full">
                  Criar Token
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Figma API */}
          <TabsContent value="figma-api" className="space-y-6 mt-6">
            <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Importar via API do Figma</h3>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Automático
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Conecte-se ao Figma e importe todos os tokens de uma só vez
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="figma-url">URL do Projeto Figma</Label>
                  <Input 
                    id="figma-url" 
                    placeholder="https://www.figma.com/file/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="figma-token">Token de Acesso</Label>
                  <Input 
                    id="figma-token" 
                    type="password"
                    placeholder="figd_••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gere um token em: Figma → Settings → Personal Access Tokens
                  </p>
                </div>

                <div className="rounded-lg bg-accent/20 border border-accent p-4">
                  <p className="text-sm font-medium mb-2">O que será importado:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Variáveis de cores</li>
                    <li>• Estilos de texto (tipografia)</li>
                    <li>• Espaçamentos e grid</li>
                    <li>• Efeitos e sombras</li>
                  </ul>
                </div>

                <Button className="w-full">
                  Conectar e Importar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Figma Plugin */}
          <TabsContent value="figma-plugin" className="space-y-6 mt-6">
            <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Puzzle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Plugin do Figma</h3>
                    <Badge variant="secondary" className="text-xs">
                      Preciso
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Capture tokens de componentes específicos selecionados no Figma
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                  <p className="text-sm font-medium">Como funciona:</p>
                  <ol className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">1.</span>
                      Instale o plugin TokenSync no Figma
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">2.</span>
                      Selecione o componente desejado
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">3.</span>
                      Execute o plugin para capturar os tokens
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">4.</span>
                      Cole o JSON gerado aqui
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plugin-json">JSON do Plugin</Label>
                  <textarea
                    id="plugin-json"
                    placeholder='{ "tokens": [...] }'
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Instalar Plugin
                  </Button>
                  <Button className="flex-1">
                    Importar Tokens
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
