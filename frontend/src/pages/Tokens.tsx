import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  Edit, 
  Trash2, 
  LayoutGrid, 
  List,
  AlertCircle,
  Loader2,
  FolderOpen,
  Coins,
} from "lucide-react";
import { CreateTokenDialog } from "@/components/tokens/CreateTokenDialog";
import { TokenDetailDialog } from "@/components/tokens/TokenDetailDialog";
import { TokenCard } from "@/components/tokens/TokenCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { tokensService, Token } from "@/services/tokens.service";
import { useProject } from "@/contexts/ProjectContext";

const TOKEN_TYPES = [
  "COLOR",
  "SPACING",
  "TYPOGRAPHY",
  "BORDER_RADIUS",
  "SHADOW",
  "FONT_SIZE",
  "FONT_WEIGHT",
  "LINE_HEIGHT",
  "OPACITY",
  "Z_INDEX",
  "OTHER",
];

export default function Tokens() {
  const queryClient = useQueryClient();
  const { activeProject } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenToDelete, setTokenToDelete] = useState<Token | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch tokens with filters
  const { data: tokensData, isLoading, error } = useQuery({
    queryKey: ['tokens', activeProject?.id, searchQuery, typeFilter],
    queryFn: () => tokensService.getAll(activeProject?.id || '', {
      search: searchQuery || undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
    }),
    enabled: !!activeProject?.id,
  });

  // Fetch token stats
  const { data: stats } = useQuery({
    queryKey: ['tokens-stats', activeProject?.id],
    queryFn: () => tokensService.getStats(activeProject?.id || ''),
    enabled: !!activeProject?.id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (tokenId: string) => tokensService.delete(activeProject?.id || '', tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      queryClient.invalidateQueries({ queryKey: ['tokens-stats'] });
      setTokenToDelete(null);
      toast({ title: "Token deletado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao deletar token", description: error.message, variant: "destructive" });
    },
  });

  const tokens = tokensData?.data || [];

  const handleCopyValue = (token: Token, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token.value);
    toast({ title: "Valor copiado!", description: token.value });
  };

  const handleDelete = () => {
    if (tokenToDelete) {
      deleteMutation.mutate(tokenToDelete.id);
    }
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

  // If no project selected
  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Selecione um projeto</h3>
          <p className="text-muted-foreground">
            Você precisa selecionar um projeto para ver os tokens
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar tokens</h3>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateTokenDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        projectId={activeProject.id}
      />
      <TokenDetailDialog
        open={selectedToken !== null}
        onOpenChange={(open) => !open && setSelectedToken(null)}
        token={selectedToken}
        projectId={activeProject.id}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={tokenToDelete !== null} onOpenChange={(open) => !open && setTokenToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar token?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O token "{tokenToDelete?.name}" será permanentemente deletado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl">Tokens</h1>
            <p className="text-muted-foreground">
              Gerencie os tokens do projeto <span className="font-medium">{activeProject.name}</span>
            </p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Novo Token
          </Button>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {TOKEN_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1 border border-border rounded-lg p-1">
                <Button 
                  variant={viewMode === "table" ? "secondary" : "ghost"} 
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "cards" ? "secondary" : "ghost"} 
                  size="icon"
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {isLoading ? (
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          ) : tokens.length === 0 ? (
            <CardContent className="py-12 text-center">
              <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || typeFilter !== "all" ? "Nenhum token encontrado" : "Nenhum token ainda"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all"
                  ? "Tente ajustar seus filtros"
                  : "Crie seu primeiro token para começar"}
              </p>
              {!searchQuery && typeFilter === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Token
                </Button>
              )}
            </CardContent>
          ) : viewMode === "table" ? (
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow 
                      key={token.id}
                      className="group transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedToken(token)}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {token.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {token.type === "COLOR" && (
                            <div 
                              className="h-6 w-6 rounded border border-border shadow-subtle"
                              style={{ backgroundColor: token.value }}
                            />
                          )}
                          <span className="font-mono text-xs">{token.value}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {getTypeLabel(token.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {token.category || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => handleCopyValue(token, e)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedToken(token);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTokenToDelete(token);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tokens.map((token) => (
                  <TokenCard 
                    key={token.id}
                    token={{
                      name: token.name,
                      value: token.value,
                      type: getTypeLabel(token.type),
                      category: token.category || "Geral",
                    }}
                    onClick={() => setSelectedToken(token)}
                  />
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Total de Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats?.total || tokens.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.byType ? Object.keys(stats.byType).length : 0} tipos diferentes
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Última Atualização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {tokens.length > 0 
                  ? new Date(tokens[0].updatedAt).toLocaleDateString('pt-BR')
                  : "-"
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {tokens.length > 0 ? tokens[0].name : "Nenhum token"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Status Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                <span className="text-lg font-semibold">Sincronizado</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Com Figma</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
