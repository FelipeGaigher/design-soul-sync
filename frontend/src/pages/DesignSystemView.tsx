import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Building2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { componentsService } from "@/services/components.service";

interface Component {
  id: string;
  name: string;
  nodeId: string;
  previewUrl?: string;
  description?: string;
  status?: "ok" | "modified" | "broken" | "unauthorized";
}

interface Folder {
  name: string;
  components: Component[];
}

interface Alert {
  id: string;
  type: "broken" | "modified" | "unauthorized" | "outdated";
  componentName: string;
  message: string;
  createdAt: string;
}

interface DesignSystem {
  id: string;
  name: string;
  figmaUrl: string;
  folders: Folder[];
  lastImportedAt: string;
  companyName?: string;
  alerts?: Alert[];
  alertsCount?: number;
}

type Framework = "react" | "vue" | "angular";

export default function DesignSystemView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [framework, setFramework] = useState<Framework>("react");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    if (id) fetchDesignSystem();
  }, [id]);

  useEffect(() => {
    if (selectedComponent) {
      generateCode();
    }
  }, [selectedComponent, framework]);

  const fetchDesignSystem = async () => {
    try {
      // Use the new components service
      const data = await componentsService.getProjectComponents(id!);
      setDesignSystem(data);

      // Expand first folder by default
      if (data.folders?.length > 0) {
        setExpandedFolders(new Set([data.folders[0].name]));
        // Select first component
        if (data.folders[0].components?.length > 0) {
          setSelectedComponent(data.folders[0].components[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching design system:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!selectedComponent) return;

    setGeneratingCode(true);
    try {
      const data = await componentsService.getComponentCode(
        id!,
        selectedComponent.id,
        framework,
      );
      setGeneratedCode(data.code || getPlaceholderCode());
    } catch (e) {
      console.error("Error generating code:", e);
      setGeneratedCode(getPlaceholderCode());
    } finally {
      setGeneratingCode(false);
    }
  };

  const getPlaceholderCode = () => {
    const name = selectedComponent?.name.replace(/\s+/g, "") || "Component";

    if (framework === "react") {
      return `import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const ${name}: React.FC<${name}Props> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  return (
    <div className={\`\${className} \${variant === 'primary' ? 'bg-primary text-white' : 'bg-secondary'}\`}>
      {children}
    </div>
  );
};`;
    } else if (framework === "vue") {
      return `<template>
  <div :class="[variant === 'primary' ? 'bg-primary text-white' : 'bg-secondary', className]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary';
  className?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  className: '',
});
</script>`;
    } else {
      return `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-${name.toLowerCase()}',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div [ngClass]="variant === 'primary' ? 'bg-primary text-white' : 'bg-secondary'">
      <ng-content />
    </div>
  \`,
})
export class ${name}Component {
  @Input() variant: 'primary' | 'secondary' = 'primary';
}`;
    }
  };

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast({ title: "Código copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/projects/${id}/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Sincronização iniciada!" });
    } catch (e) {
      toast({ title: "Erro ao sincronizar", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "broken":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "modified":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "unauthorized":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getComponentStatusIcon = (status?: string) => {
    switch (status) {
      case "broken":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case "modified":
        return <AlertTriangle className="h-3 w-3 text-amber-500" />;
      case "unauthorized":
        return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!designSystem) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <h2 className="mb-2 text-xl font-bold">Projeto não encontrado</h2>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alerts = designSystem.alerts || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{designSystem.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {designSystem.companyName && (
                  <>
                    <Building2 className="h-3 w-3" />
                    <span>{designSystem.companyName}</span>
                    <span>•</span>
                  </>
                )}
                <span>
                  Última sync:{" "}
                  {designSystem.lastImportedAt
                    ? new Date(designSystem.lastImportedAt).toLocaleString()
                    : "Nunca"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {designSystem.figmaUrl && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={designSystem.figmaUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Figma
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              />
              Sincronizar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Folders & Alerts */}
        <div className="w-72 border-r bg-muted/30 flex flex-col">
          {/* Tabs: Components / Alerts */}
          <div className="flex border-b">
            <button
              onClick={() => setShowAlerts(false)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                !showAlerts
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Componentes
            </button>
            <button
              onClick={() => setShowAlerts(true)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                showAlerts
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Alertas
              {alerts.length > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5">
                  {alerts.length}
                </Badge>
              )}
            </button>
          </div>

          <ScrollArea className="flex-1">
            {showAlerts ? (
              /* Alerts List */
              <div className="p-3 space-y-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum alerta ativo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Todos os componentes estão conformes com o Figma
                    </p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border bg-background"
                    >
                      <div className="flex items-start gap-2">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {alert.componentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              Ver Diff
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              Restaurar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Components List */
              <div className="p-2">
                {designSystem.folders?.length > 0 ? (
                  designSystem.folders.map((folder) => (
                    <div key={folder.name} className="mb-1">
                      {/* Folder Header */}
                      <button
                        onClick={() => toggleFolder(folder.name)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-left"
                      >
                        {expandedFolders.has(folder.name) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium flex-1 truncate">
                          {folder.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {folder.components.length}
                        </span>
                      </button>

                      {/* Components */}
                      {expandedFolders.has(folder.name) && (
                        <div className="ml-6 mt-1 space-y-0.5">
                          {folder.components.map((comp) => (
                            <button
                              key={comp.id}
                              onClick={() => setSelectedComponent(comp)}
                              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${
                                selectedComponent?.id === comp.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted text-foreground"
                              }`}
                            >
                              {getComponentStatusIcon(comp.status)}
                              <span className="truncate flex-1">{comp.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum componente encontrado
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedComponent ? (
            <>
              {/* Component Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    {selectedComponent.name}
                  </h2>
                  {selectedComponent.status && selectedComponent.status !== "ok" && (
                    <Badge
                      variant={
                        selectedComponent.status === "broken"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {selectedComponent.status === "broken" && "Quebrado"}
                      {selectedComponent.status === "modified" && "Modificado"}
                      {selectedComponent.status === "unauthorized" && "Não autorizado"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={framework}
                    onValueChange={(v) => setFramework(v as Framework)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue 3</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview + Code */}
              <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
                {/* Preview */}
                <div className="border-r p-6 overflow-auto">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    Preview
                  </h3>
                  <div className="rounded-lg border bg-muted/30 p-8 flex items-center justify-center min-h-[200px]">
                    {selectedComponent.previewUrl ? (
                      <img
                        src={selectedComponent.previewUrl}
                        alt={selectedComponent.name}
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Preview não disponível</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Code */}
                <div className="flex flex-col overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Código
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyCode}
                      disabled={generatingCode}
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {generatingCode ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                        <code>{generatedCode}</code>
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um componente para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
