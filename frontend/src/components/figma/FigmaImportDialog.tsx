import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Check,
  AlertCircle,
  Layers,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { projectsService } from "@/services/projects.service";
import { companiesService } from "@/services/companies.service";
import { componentsService } from "@/services/components.service";
import { authService } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";

interface FigmaImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function FigmaImportDialog({ open, onOpenChange }: FigmaImportDialogProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [companyMode, setCompanyMode] = useState<"none" | "existing" | "new">("none");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [showSuccessPreview, setShowSuccessPreview] = useState(false);
  const [importedProject, setImportedProject] = useState<any>(null);
  const [componentPreviews, setComponentPreviews] = useState<any[]>([]);

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesService.getAll,
    enabled: open,
  });

  const extractFileKey = (url: string): string => {
    // Extract file key from Figma URL
    // https://www.figma.com/file/ABC123/File-Name or https://www.figma.com/design/ABC123/File-Name
    const match = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
    return match ? match[2] : url;
  };

  // Create project and import from Figma
  const importMutation = useMutation({
    mutationFn: async ({ name, url }: { name: string; url: string }) => {
      const fileKey = extractFileKey(url);
      let companyId: string | undefined;

      if (companyMode === "new") {
        const trimmed = newCompanyName.trim();
        if (!trimmed) {
          throw new Error("Informe o nome da empresa");
        }
        const created = await companiesService.create({ name: trimmed });
        companyId = created.id;
      } else if (companyMode === "existing") {
        if (!selectedCompanyId) {
          throw new Error("Selecione uma empresa");
        }
        companyId = selectedCompanyId;
      }

      const figmaFileUrl = url.trim();

      // 1. Create project
      const project = await projectsService.create({
        name,
        description: `Importado do Figma`,
        figmaFileId: fileKey,
        figmaFileUrl,
        companyId,
      });

      // 2. Import variables from Figma
      try {
        await projectsService.importVariables(project.id, fileKey);
      } catch (error) {
        console.warn('Could not import variables:', error);
      }

      // 3. Import components from Figma
      try {
        await componentsService.importComponents(project.id, fileKey);
      } catch (error) {
        console.warn('Could not import components:', error);
      }

      return project;
    },
    onSuccess: async (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });

      // Fetch component previews for confirmation
      try {
        const componentsData = await componentsService.getProjectComponents(project.id);
        const allComponents = componentsData.folders.flatMap(f => f.components);
        setComponentPreviews(allComponents.slice(0, 6)); // Show first 6 components
      } catch (error) {
        console.warn('Could not fetch component previews:', error);
        setComponentPreviews([]);
      }

      setImportedProject(project);
      setShowSuccessPreview(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao importar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setProjectName("");
    setUrlInput("");
    setCompanyMode("none");
    setSelectedCompanyId("");
    setNewCompanyName("");
    setShowSuccessPreview(false);
    setImportedProject(null);
    setComponentPreviews([]);
    onOpenChange(false);
  };

  const handleImport = () => {
    const url = urlInput.trim();
    const name = projectName.trim() || "Projeto Figma";

    if (!url) {
      toast({
        title: "Erro",
        description: "Insira a URL do projeto Figma",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate({ name, url });
  };

  useEffect(() => {
    if (!open) {
      setProjectName("");
      setUrlInput("");
      setCompanyMode("none");
      setSelectedCompanyId("");
      setNewCompanyName("");
      setShowSuccessPreview(false);
      setImportedProject(null);
      setComponentPreviews([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (companyMode === "none" && companies.length > 0) {
      setCompanyMode("existing");
    }
  }, [open, companies.length, companyMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FigmaIcon className="h-5 w-5" />
            {showSuccessPreview ? "Importação Concluída!" : "Importar do Figma"}
          </DialogTitle>
          <DialogDescription>
            {showSuccessPreview
              ? "Confira os componentes importados do Figma"
              : "Cole a URL do projeto Figma e configure as opções"}
          </DialogDescription>
        </DialogHeader>

        {showSuccessPreview ? (
          // Success Preview Screen
          <div className="space-y-4">
            {/* Project Info */}
            <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    {importedProject?.name}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Projeto importado com sucesso do Figma
                  </p>
                </div>
              </div>
            </div>

            {/* Component Previews */}
            {componentPreviews.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Componentes importados ({componentPreviews.length}+):
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {componentPreviews.map((component) => (
                    <div
                      key={component.id}
                      className="rounded-lg border p-2 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      {component.previewUrl ? (
                        <img
                          src={component.previewUrl}
                          alt={component.name}
                          className="w-full h-20 object-contain rounded"
                        />
                      ) : (
                        <div className="w-full h-20 bg-muted rounded flex items-center justify-center">
                          <Layers className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-xs font-medium mt-2 truncate text-center">
                        {component.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {componentPreviews.length === 0 && (
              <div className="rounded-lg border p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  Nenhum componente visual encontrado. Variáveis foram importadas.
                </p>
              </div>
            )}
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <div className="text-center">
              <p className="font-medium">Você precisa estar logado</p>
              <p className="text-sm text-muted-foreground">
                Faça login para importar projetos do Figma
              </p>
            </div>
            <Button onClick={() => {
              onOpenChange(false);
              navigate('/login');
            }}>
              Ir para Login
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="figmaUrl">URL do Figma *</Label>
              <Input
                id="figmaUrl"
                placeholder="https://www.figma.com/design/ABC123/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cole a URL completa do arquivo Figma
              </p>
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">Nome do Projeto *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Design System Principal"
              />
            </div>

            {/* Company Selection */}
            <div className="space-y-3">
              <Label>Empresa (Opcional)</Label>
              <RadioGroup
                value={companyMode}
                onValueChange={(value) => setCompanyMode(value as "none" | "existing" | "new")}
                className="gap-3"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="company-none" value="none" />
                  <Label htmlFor="company-none">Projeto pessoal</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="company-existing" value="existing" />
                  <Label htmlFor="company-existing">Usar empresa existente</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="company-new" value="new" />
                  <Label htmlFor="company-new">Criar nova empresa</Label>
                </div>
              </RadioGroup>

              {companyMode === "existing" && (
                <div className="space-y-2">
                  <Select
                    value={selectedCompanyId}
                    onValueChange={setSelectedCompanyId}
                    disabled={loadingCompanies || companies.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCompanies ? "Carregando..." : "Selecione uma empresa"} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!loadingCompanies && companies.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhuma empresa cadastrada. Crie uma nova empresa.
                    </p>
                  )}
                </div>
              )}

              {companyMode === "new" && (
                <div className="space-y-2">
                  <Input
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
              <p className="text-sm font-medium">O que será importado:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Variáveis (cores, espaçamento, tipografia)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Componentes visuais (buttons, cards, etc)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Previews e variantes de componentes
                </li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          {showSuccessPreview ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  handleClose();
                  navigate(`/design-system/${importedProject?.id}`);
                }}
              >
                <Layers className="h-4 w-4 mr-2" />
                Ver Componentes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              {isAuthenticated && (
                <Button
                  onClick={handleImport}
                  disabled={importMutation.isPending || !urlInput.trim() || !projectName.trim()}
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <FigmaIcon className="h-4 w-4 mr-2" />
                      Importar Projeto
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
