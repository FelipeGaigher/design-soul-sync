import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  FolderOpen,
  Palette,
  Type,
  Layers,
  ArrowRight,
  AlertCircle
} from "lucide-react";

interface ImportedFolder {
  name: string;
  components: { name: string; nodeId: string }[];
}

interface ImportSummary {
  projectName: string;
  folders: ImportedFolder[];
  styles: {
    colors: number;
    typography: number;
    effects: number;
  };
}

type ImportStatus = "connecting" | "analyzing" | "extracting" | "processing" | "completed" | "error";

const statusSteps = [
  { key: "connecting", label: "Conectando ao Figma" },
  { key: "analyzing", label: "Analisando estrutura de pastas" },
  { key: "extracting", label: "Extraindo componentes" },
  { key: "processing", label: "Processando estilos" },
];

export default function ImportFlow() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ImportStatus>("connecting");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      startImport();
    }
  }, [projectId]);

  const startImport = async () => {
    try {
      const token = localStorage.getItem("token");

      // Trigger import
      const importRes = await fetch(`/api/projects/${projectId}/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!importRes.ok) {
        throw new Error("Falha ao iniciar importação");
      }

      // Poll for status
      pollStatus();
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  const pollStatus = async () => {
    const token = localStorage.getItem("token");
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes

    const interval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(interval);
        setError("Tempo limite excedido. Tente novamente.");
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Update status based on progress
        if (data.importProgress) {
          if (data.importProgress < 25) setStatus("connecting");
          else if (data.importProgress < 50) setStatus("analyzing");
          else if (data.importProgress < 75) setStatus("extracting");
          else if (data.importProgress < 100) setStatus("processing");
        }

        if (data.importStatus === "SUCCESS") {
          clearInterval(interval);
          setStatus("completed");

          // Build summary from response
          setSummary({
            projectName: data.name,
            folders: data.folders || [],
            styles: {
              colors: data.colorsCount || 0,
              typography: data.typographyCount || 0,
              effects: data.effectsCount || 0,
            },
          });
        } else if (data.importStatus === "ERROR") {
          clearInterval(interval);
          setError(data.importErrorMessage || "Erro durante a importação");
          setStatus("error");
        }
      } catch (e) {
        // Ignore transient errors
      }
    }, 1000);
  };

  const getCurrentStep = () => {
    return statusSteps.findIndex((s) => s.key === status);
  };

  if (status === "error") {
    return (
      <div className="container mx-auto max-w-2xl py-20">
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Erro na Importação</h2>
            <p className="mb-6 text-center text-muted-foreground">{error}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Voltar ao Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "completed" && summary) {
    return (
      <div className="container mx-auto max-w-3xl py-10">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 rounded-full bg-green-100 p-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Importação Concluída!</CardTitle>
            <p className="text-muted-foreground mt-2">
              Projeto "{summary.projectName}" importado com sucesso.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Folders Summary */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Componentes Importados
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {summary.folders.length > 0 ? (
                  summary.folders.map((folder) => (
                    <div
                      key={folder.name}
                      className="rounded-lg border bg-muted/30 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium">{folder.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({folder.components.length} componentes)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pl-6">
                        {folder.components.slice(0, 6).map((comp) => (
                          <span
                            key={comp.nodeId}
                            className="text-sm text-muted-foreground truncate"
                          >
                            • {comp.name}
                          </span>
                        ))}
                        {folder.components.length > 6 && (
                          <span className="text-sm text-muted-foreground">
                            ... e mais {folder.components.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum componente encontrado. Verifique se o arquivo Figma contém componentes publicados.
                  </p>
                )}
              </div>
            </div>

            {/* Styles Summary */}
            <div>
              <h3 className="font-semibold mb-4">Estilos Extraídos</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <Palette className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{summary.styles.colors}</div>
                  <div className="text-sm text-muted-foreground">Cores</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <Type className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{summary.styles.typography}</div>
                  <div className="text-sm text-muted-foreground">Tipografia</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <Layers className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{summary.styles.effects}</div>
                  <div className="text-sm text-muted-foreground">Efeitos</div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => navigate(`/design-system/${projectId}`)}
              >
                Visualizar Design System
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  return (
    <div className="container mx-auto max-w-2xl py-20">
      <Card>
        <CardContent className="py-16">
          <div className="text-center mb-10">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-bold mb-2">Importando seu projeto...</h2>
            <p className="text-muted-foreground">
              Isso pode levar alguns instantes. Estamos processando seus componentes.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-sm mx-auto space-y-4">
            {statusSteps.map((step, index) => {
              const currentStep = getCurrentStep();
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 ${
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                  <span className={isCurrent ? "font-medium" : ""}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
