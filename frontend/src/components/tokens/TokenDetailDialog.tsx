import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Edit, Trash2, Box, GitBranch, Save, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { tokensService, Token } from "@/services/tokens.service";

interface TokenDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: Token | null;
  projectId?: string;
}

export function TokenDetailDialog({ open, onOpenChange, token, projectId }: TokenDetailDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", value: "", description: "", category: "" });

  if (!token) return null;

  const handleStartEdit = () => {
    setEditData({
      name: token.name,
      value: token.value,
      description: token.description || "",
      category: token.category || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({ name: "", value: "", description: "", category: "" });
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!projectId) throw new Error("Projeto não selecionado");
      return tokensService.update(projectId, token.id, editData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast({ title: "Token atualizado!" });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(token.value);
    toast({ title: "Valor copiado!", description: token.value });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      COLOR: "Cor",
      SPACING: "Espaçamento",
      TYPOGRAPHY: "Tipografia",
      BORDER_RADIUS: "Border Radius",
      SHADOW: "Sombra",
      FONT_SIZE: "Tamanho Fonte",
      FONT_WEIGHT: "Peso Fonte",
      LINE_HEIGHT: "Altura Linha",
      OPACITY: "Opacidade",
      Z_INDEX: "Z-Index",
      OTHER: "Outro",
    };
    return labels[type] || type;
  };

  const mockComponents = [
    "Button Primary",
    "Card Header",
    "Navigation Menu",
    "Alert Success",
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
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              {!isEditing ? (
                <Button variant="ghost" size="icon" onClick={handleStartEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Info */}
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  value={editData.value}
                  onChange={(e) => setEditData({ ...editData, value: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Valor</p>
                <div className="flex items-center gap-3">
                  {token.type === "COLOR" && (
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
                <Badge variant="secondary">{getTypeLabel(token.type)}</Badge>
              </div>
            </div>
          )}

          {!isEditing && (
            <>
              <Separator />
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
                    <span className="font-medium">{token.category || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criado em</span>
                    <span className="font-medium">{new Date(token.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última atualização</span>
                    <span className="font-medium">{new Date(token.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {token.description && (
                    <div className="flex flex-col gap-1 pt-2 border-t border-border">
                      <span className="text-muted-foreground">Descrição</span>
                      <span className="font-medium">{token.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
