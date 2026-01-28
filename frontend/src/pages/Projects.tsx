import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Folder,
  AlertCircle,
  CheckCircle2,
  Clock,
  Box,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { projectsService, Project } from "@/services/projects.service";
import { FigmaImportDialog } from "@/components/figma/FigmaImportDialog";
import { useNavigate } from "react-router-dom";

// Ícone do Figma
const FigmaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M8 24C10.208 24 12 22.208 12 20V16H8C5.792 16 4 17.792 4 20C4 22.208 5.792 24 8 24Z" fill="#0ACF83"/>
    <path d="M4 12C4 9.792 5.792 8 8 8H12V16H8C5.792 16 4 14.208 4 12Z" fill="#A259FF"/>
    <path d="M4 4C4 1.792 5.792 0 8 0H12V8H8C5.792 8 4 6.208 4 4Z" fill="#F24E1E"/>
    <path d="M12 0H16C18.208 0 20 1.792 20 4C20 6.208 18.208 8 16 8H12V0Z" fill="#FF7262"/>
    <path d="M20 12C20 14.208 18.208 16 16 16C13.792 16 12 14.208 12 12C12 9.792 13.792 8 16 8C18.208 8 20 9.792 20 12Z" fill="#1ABCFE"/>
  </svg>
);
import { useProject } from "@/contexts/ProjectContext";

export default function Projects() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setActiveProject, activeProject } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFigmaImportOpen, setIsFigmaImportOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Fetch projects
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateOpen(false);
      setFormData({ name: "", description: "" });
      toast({ title: "Projeto criado com sucesso!" });
      // Se é o primeiro projeto, defini-lo como ativo
      if (projects.length === 0) {
        setActiveProject(newProject);
      }
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar projeto", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsEditOpen(false);
      setSelectedProject(null);
      toast({ title: "Projeto atualizado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: projectsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDeleteOpen(false);
      setSelectedProject(null);
      toast({ title: "Projeto deletado!" });
      // Se deletou o projeto ativo, limpar
      if (activeProject?.id === selectedProject?.id) {
        setActiveProject(null);
      }
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    },
  });

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (project: Project) => {
    const divergences = project.divergencesCount || 0;
    if (divergences > 3) {
      return { icon: AlertCircle, label: "Crítico", className: "bg-destructive/10 text-destructive" };
    }
    if (divergences > 0) {
      return { icon: AlertCircle, label: "Atenção", className: "bg-accent/30 text-accent-foreground" };
    }
    return { icon: CheckCircle2, label: "Saudável", className: "bg-primary/10 text-primary" };
  };

  const totalStats = {
    projects: projects.length,
    components: projects.reduce((acc, p) => acc + (p.componentsCount || 0), 0),
    divergences: projects.reduce((acc, p) => acc + (p.divergencesCount || 0), 0),
    synced: projects.filter(p => p.figmaLastSyncAt).length,
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!selectedProject || !formData.name.trim()) return;
    updateMutation.mutate({ id: selectedProject.id, data: formData });
  };

  const handleDelete = () => {
    if (!selectedProject) return;
    deleteMutation.mutate(selectedProject.id);
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({ name: project.name, description: project.description || "" });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    toast({ title: `Projeto "${project.name}" selecionado` });
  };

  const handleViewProject = (project: Project) => {
    setActiveProject(project);
    navigate(`/design-system/${project.id}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar projetos</h3>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus Design Systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsFigmaImportOpen(true)}>
            <FigmaIcon className="h-4 w-4" />
            Importar do Figma
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
                <DialogDescription>
                  Crie um novo projeto para gerenciar seu Design System
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Design System Principal"
                    value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o projeto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Projeto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
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
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{totalStats.synced}</div>
                <p className="text-xs text-muted-foreground">Sincronizados Figma</p>
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
                <div className="text-2xl font-semibold">{totalStats.divergences}</div>
                <p className="text-xs text-muted-foreground">Divergências</p>
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
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-soft">
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-6 w-32 mt-3" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "Nenhum projeto encontrado" : "Nenhum projeto ainda"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Tente ajustar sua busca"
                : "Crie seu primeiro projeto para começar"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Projeto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const statusConfig = getStatusConfig(project);
            const StatusIcon = statusConfig.icon;
            const isActive = activeProject?.id === project.id;

            return (
              <Card 
                key={project.id}
                className={`shadow-soft hover:shadow-elevated transition-smooth group cursor-pointer ${
                  isActive ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectProject(project)}
              >
                <CardHeader className="border-b border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
                    >
                      <Folder className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Badge variant="default" className="bg-primary">
                          Ativo
                        </Badge>
                      )}
                      <Badge variant="secondary" className={statusConfig.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewProject(project); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(project); }}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => { e.stopPropagation(); openDeleteDialog(project); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-muted-foreground text-xs mb-1">Componentes</p>
                      <p className="font-semibold text-lg">{project.componentsCount || 0}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-muted-foreground text-xs mb-1">Divergências</p>
                      <p className={`font-semibold text-lg ${(project.divergencesCount || 0) > 0 ? 'text-destructive' : 'text-primary'}`}>
                        {project.divergencesCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize as informações do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Projeto</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O projeto "{selectedProject?.name}" e todos os seus tokens e componentes serão permanentemente deletados.
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

      {/* Figma Import Dialog */}
      <FigmaImportDialog open={isFigmaImportOpen} onOpenChange={setIsFigmaImportOpen} />
    </div>
  );
}
