import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const tokenSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  value: z.string().min(1, { message: "Valor é obrigatório" }),
  type: z.string().min(1, { message: "Tipo é obrigatório" }),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
});

const figmaApiSchema = z.object({
  url: z.string().url({ message: "URL inválida" }),
  token: z.string().min(1, { message: "Token de acesso é obrigatório" }),
});

interface CreateTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTokenDialog({ open, onOpenChange }: CreateTokenDialogProps) {
  const [activeTab, setActiveTab] = useState("manual");

  const tokenForm = useForm<z.infer<typeof tokenSchema>>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      name: "",
      value: "",
      type: "",
      category: "",
    },
  });

  const figmaForm = useForm<z.infer<typeof figmaApiSchema>>({
    resolver: zodResolver(figmaApiSchema),
    defaultValues: {
      url: "",
      token: "",
    },
  });

  const onTokenSubmit = (data: z.infer<typeof tokenSchema>) => {
    toast({
      title: "Token criado com sucesso!",
      description: `${data.name} foi adicionado aos seus tokens`,
      variant: "success",
    });
    onOpenChange(false);
  };

  const onFigmaSubmit = (data: z.infer<typeof figmaApiSchema>) => {
    toast({
      title: "Conectando ao Figma...",
      description: "Importando tokens do projeto",
      variant: "info",
    });
    onOpenChange(false);
  };

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

              <Form {...tokenForm}>
                <form onSubmit={tokenForm.handleSubmit(onTokenSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={tokenForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Token</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: color/primary-500" className="font-mono" {...field} />
                        </FormControl>
                        <FormDescription>
                          Use nomenclatura: categoria/nome-variante
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={tokenForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: #6BA5E7" className="font-mono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={tokenForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={tokenForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Colors" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Criar Token
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </Form>
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

              <Form {...figmaForm}>
                <form onSubmit={figmaForm.handleSubmit(onFigmaSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={figmaForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Projeto Figma</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.figma.com/file/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={figmaForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token de Acesso</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="figd_••••••••••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Gere um token em: Figma → Settings → Personal Access Tokens
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg bg-accent/20 border border-accent p-4">
                    <p className="text-sm font-medium mb-2">O que será importado:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Variáveis de cores</li>
                      <li>• Estilos de texto (tipografia)</li>
                      <li>• Espaçamentos e grid</li>
                      <li>• Efeitos e sombras</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full">
                    Conectar e Importar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </Form>
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
