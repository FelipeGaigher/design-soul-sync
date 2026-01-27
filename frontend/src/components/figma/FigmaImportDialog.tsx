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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  FileImage, 
  Check, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { figmaService, FigmaFile } from "@/services/figma.service";
import { projectsService } from "@/services/projects.service";
import { companiesService } from "@/services/companies.service";
import { componentsService } from "@/services/components.service";
import { settingsService } from "@/services/settings.service";
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
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);
  const [projectName, setProjectName] = useState("");
  const [step, setStep] = useState<'token' | 'select' | 'configure'>('select');
  const [manualFileKey, setManualFileKey] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isLoadingFileInfo, setIsLoadingFileInfo] = useState(false);
  const [companyMode, setCompanyMode] = useState<"none" | "existing" | "new">("none");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [savingToken, setSavingToken] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  // Check Figma connection status
  const { data: connectionStatus, isLoading: checkingConnection } = useQuery({
    queryKey: ['figma-status'],
    queryFn: figmaService.isConnected,
    enabled: open,
  });

  // Fetch Figma projects/files
  const { data: figmaFiles = [], isLoading: loadingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['figma-files'],
    queryFn: figmaService.getProjects,
    enabled: open && connectionStatus === true,
  });

  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesService.getAll,
    enabled: open,
  });

  // Create project and import from Figma
  const importMutation = useMutation({
    mutationFn: async ({ name, fileKey }: { name: string; fileKey: string }) => {
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

      const figmaFileUrl =
        urlInput?.trim() ||
        (fileKey ? `https://www.figma.com/file/${fileKey}` : undefined);

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
        await figmaService.importVariables(project.id, fileKey);
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
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Projeto importado com sucesso!",
        description: `O projeto "${project.name}" foi criado com variáveis e componentes do Figma.`,
      });
      handleClose();
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
    setSelectedFile(null);
    setProjectName("");
    setStep('select');
    setManualFileKey("");
    setUrlInput("");
    setCompanyMode("none");
    setSelectedCompanyId("");
    setNewCompanyName("");
    onOpenChange(false);
  };

  const handleSelectFile = (file: FigmaFile) => {
    setSelectedFile(file);
    setProjectName(file.name);
    setStep('configure');
  };

  const handleImport = () => {
    const fileKey = selectedFile?.key || manualFileKey;
    const name = projectName || selectedFile?.name || "Projeto Figma";

    if (!fileKey) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo ou insira a URL do Figma",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate({ name, fileKey });
  };

  const extractFileKey = (url: string): string => {
    // Extract file key from Figma URL
    // https://www.figma.com/file/ABC123/File-Name or https://www.figma.com/design/ABC123/File-Name
    const match = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
    return match ? match[2] : url;
  };

  const handleFetchFileInfo = async () => {
    if (!urlInput) return;
    
    const fileKey = extractFileKey(urlInput);
    setManualFileKey(fileKey);
    setIsLoadingFileInfo(true);

    try {
      const fileInfo = await figmaService.getFileInfo(fileKey);
      setSelectedFile({
        key: fileKey,
        name: fileInfo.name,
        thumbnail_url: fileInfo.thumbnail_url,
        last_modified: fileInfo.lastModified || fileInfo.last_modified,
      } as FigmaFile);
      setProjectName(fileInfo.name);
      setStep('configure');
    } catch (error) {
      toast({
        title: "Erro ao buscar arquivo",
        description: "Não foi possível acessar este arquivo. Verifique a URL e se você tem acesso.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFileInfo(false);
    }
  };

  const handleSaveFigmaToken = async () => {
    if (!figmaToken.trim()) {
      toast({
        title: "Erro",
        description: "Cole o token do Figma",
        variant: "destructive",
      });
      return;
    }

    setSavingToken(true);
    try {
      await settingsService.saveFigmaToken(figmaToken.trim());
      toast({
        title: "Token salvo!",
        description: "Agora você pode importar projetos do Figma",
      });
      // Refresh files list
      refetchFiles();
      setStep('select');
    } catch (error: any) {
      toast({
        title: "Erro ao salvar token",
        description: error.message || "Verifique se o token está correto",
        variant: "destructive",
      });
    } finally {
      setSavingToken(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setStep('select');
      setSelectedFile(null);
      setProjectName("");
      setManualFileKey("");
      setUrlInput("");
      setIsLoadingFileInfo(false);
      setCompanyMode("none");
      setSelectedCompanyId("");
      setNewCompanyName("");
      setFigmaToken("");
    }
  }, [open]);

  // Check if we need to show token setup
  useEffect(() => {
    if (open && !checkingConnection && connectionStatus === false && step !== 'configure') {
      setStep('token');
    }
  }, [open, checkingConnection, connectionStatus, step]);

  useEffect(() => {
    if (!open) return;
    if (companyMode === "none" && companies.length > 0) {
      setCompanyMode("existing");
    }
  }, [open, companies.length, companyMode]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FigmaIcon className="h-5 w-5" />
            Importar do Figma
          </DialogTitle>
          <DialogDescription>
            {step === 'token' && "Configure seu token do Figma para começar"}
            {step === 'select' && "Selecione um arquivo do Figma para criar um projeto"}
            {step === 'configure' && "Configure o projeto antes de importar"}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
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
        ) : checkingConnection ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : step === 'token' ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
              <h3 className="font-medium">Como obter seu token do Figma:</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Acesse: <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noreferrer" className="text-primary hover:underline">Figma Developers</a></li>
                <li>Clique em "Get personal access token"</li>
                <li>Copie o token (começa com "figd_")</li>
                <li>Cole abaixo e clique em Salvar</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label htmlFor="figmaToken">Personal Access Token</Label>
              <Input
                id="figmaToken"
                type="password"
                placeholder="figd_..."
                value={figmaToken}
                onChange={(e) => setFigmaToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveFigmaToken()}
              />
              <p className="text-xs text-muted-foreground">
                O token será salvo de forma segura e usado para importar seus projetos
              </p>
            </div>

            <Button
              onClick={handleSaveFigmaToken}
              disabled={savingToken || !figmaToken.trim()}
              className="w-full"
            >
              {savingToken ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Token
                </>
              )}
            </Button>
          </div>
        ) : step === 'select' ? (
          <div className="space-y-4">
            {/* Manual URL input */}
            <div className="space-y-2">
              <Label>Cole a URL do arquivo Figma</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.figma.com/design/ABC123/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchFileInfo()}
                />
                <Button 
                  variant="secondary"
                  disabled={!urlInput || isLoadingFileInfo}
                  onClick={handleFetchFileInfo}
                >
                  {isLoadingFileInfo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copie a URL do arquivo no Figma e cole aqui
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou selecione um arquivo recente
                </span>
              </div>
            </div>

            {/* Files list */}
            <div className="flex items-center justify-between">
              <Label>Arquivos recentes do Figma</Label>
              <Button variant="ghost" size="sm" onClick={() => refetchFiles()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {loadingFiles ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : figmaFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum arquivo encontrado</p>
                <p className="text-xs">Cole a URL do arquivo acima</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {figmaFiles.map((file) => (
                    <button
                      key={file.key || file.id}
                      onClick={() => handleSelectFile(file)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                    >
                      {file.thumbnail_url ? (
                        <img 
                          src={file.thumbnail_url} 
                          alt={file.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <FileImage className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.last_modified && new Date(file.last_modified).toLocaleDateString()}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              {selectedFile?.thumbnail_url ? (
                <img
                  src={selectedFile.thumbnail_url}
                  alt={selectedFile.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <FigmaIcon className="h-8 w-8" />
              )}
              <div>
                <p className="font-medium">{selectedFile?.name || "Arquivo do Figma"}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile?.key || manualFileKey}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Nome do projeto</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Nome do projeto"
              />
            </div>

            <div className="space-y-3">
              <Label>Empresa</Label>
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
                    placeholder="Ex: Onix Capital, umClique, UserFlow, Fotus, Litoral, CPAPS"
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">O que será importado:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Variáveis de cor
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Variáveis de espaçamento
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Variáveis de tipografia
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
          {step === 'configure' && (
            <Button variant="outline" onClick={() => setStep('select')}>
              Voltar
            </Button>
          )}
          {step !== 'token' && (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}
          {step === 'configure' && (
            <Button
              onClick={handleImport}
              disabled={importMutation.isPending || (!selectedFile && !manualFileKey)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
