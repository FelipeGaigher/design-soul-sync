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
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  FileImage, 
  Check, 
  AlertCircle,
  RefreshCw,
  Link2,
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { figmaService, FigmaFile } from "@/services/figma.service";
import { projectsService } from "@/services/projects.service";

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
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);
  const [projectName, setProjectName] = useState("");
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [manualFileKey, setManualFileKey] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isLoadingFileInfo, setIsLoadingFileInfo] = useState(false);

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

  // Create project and import from Figma
  const importMutation = useMutation({
    mutationFn: async ({ name, fileKey }: { name: string; fileKey: string }) => {
      // 1. Create project
      const project = await projectsService.create({
        name,
        description: `Importado do Figma`,
        figmaFileId: fileKey,
      });

      // 2. Import variables from Figma
      try {
        await figmaService.importVariables(project.id, fileKey);
      } catch (error) {
        console.warn('Could not import variables:', error);
      }

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Projeto importado com sucesso!",
        description: `O projeto "${project.name}" foi criado e vinculado ao Figma.`,
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

  useEffect(() => {
    if (!open) {
      setStep('select');
      setSelectedFile(null);
      setProjectName("");
      setManualFileKey("");
      setUrlInput("");
      setIsLoadingFileInfo(false);
    }
  }, [open]);

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
            {step === 'select' 
              ? "Selecione um arquivo do Figma para criar um projeto" 
              : "Configure o projeto antes de importar"}
          </DialogDescription>
        </DialogHeader>

        {checkingConnection ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !connectionStatus ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Figma não conectado</p>
              <p className="text-sm text-muted-foreground">
                Você precisa conectar sua conta do Figma primeiro
              </p>
            </div>
            <Button onClick={() => window.location.href = `${API_URL}/auth/figma`}>
              <FigmaIcon className="h-4 w-4 mr-2" />
              Conectar com Figma
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
              <FigmaIcon className="h-8 w-8" />
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
                  Outras variáveis do arquivo
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
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
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
