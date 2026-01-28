import { useState, useEffect, useMemo } from "react";
import type { MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
  Type,
  Palette,
  Box,
  Layers,
  Grid3X3,
  Code,
  Eye,
  Settings2,
  ChevronUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ComponentPreview } from "@/components/components/ComponentPreview";
import {
  componentsService,
  ComponentDetail,
  ChildElement,
} from "@/services/components.service";

interface Component {
  id: string;
  name: string;
  nodeId: string;
  previewUrl?: string;
  description?: string;
  status?: "ok" | "modified" | "broken" | "unauthorized";
  variantsCount?: number;
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
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [componentDetail, setComponentDetail] = useState<ComponentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [framework, setFramework] = useState<Framework>("react");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(true);

  useEffect(() => {
    if (id) fetchDesignSystem();
  }, [id]);

  useEffect(() => {
    if (selectedComponent && id) {
      fetchComponentDetail();
    }
  }, [selectedComponent, id]);

  useEffect(() => {
    setSelectedElementId(null);
    setHoveredElementId(null);
    setSelectedVariantId(null);
  }, [selectedComponent?.id]);

  useEffect(() => {
    if (selectedComponent && componentDetail) {
      generateCode();
    }
  }, [selectedComponent, framework, selectedElementId, componentDetail, selectedVariantId]);

  const flattenChildElements = (elements?: ChildElement[]): ChildElement[] => {
    if (!elements) return [];
    const result: ChildElement[] = [];
    const stack = [...elements];
    while (stack.length) {
      const current = stack.shift()!;
      result.push(current);
      if (current.children && current.children.length > 0) {
        stack.push(...current.children);
      }
    }
    return result;
  };

  const getSelectedElement = () => {
    const activeProperties = getActiveProperties();
    if (!selectedElementId || !activeProperties?.childElements) return null;
    return (
      flattenChildElements(activeProperties.childElements).find(
        (child) => child.nodeId === selectedElementId
      ) || null
    );
  };

  const getActiveVariant = () => {
    if (!componentDetail || !componentDetail.variants) return null;
    return componentDetail.variants.find((variant) => variant.id === selectedVariantId) || null;
  };

  const getActiveProperties = () => {
    const activeVariant = getActiveVariant();
    return activeVariant?.properties || componentDetail?.properties || null;
  };

  const buildElementStyles = (element: ChildElement): Record<string, string> => {
    const styles: Record<string, string> = {};

    if (element.width) styles.width = `${Math.round(element.width)}px`;
    if (element.height) styles.height = `${Math.round(element.height)}px`;
    if (element.opacity !== undefined) styles.opacity = `${element.opacity}`;
    if (element.cornerRadius !== undefined) {
      styles.borderRadius = Array.isArray(element.cornerRadius)
        ? element.cornerRadius.map(v => `${v}px`).join(" ")
        : `${element.cornerRadius}px`;
    }
    if (element.fills && element.fills[0]?.color) {
      styles.backgroundColor = element.fills[0].color;
    }
    if (element.strokes && element.strokes[0]?.color) {
      const stroke = element.strokes[0];
      styles.border = `${stroke.weight || 1}px solid ${stroke.color}`;
    }
    if (element.effects && element.effects.length > 0) {
      const shadows = element.effects
        .filter(effect => effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW")
        .map(effect => {
          const x = effect.offset?.x || 0;
          const y = effect.offset?.y || 0;
          const radius = effect.radius || 0;
          const color = effect.color || "rgba(0,0,0,0.2)";
          const inset = effect.type === "INNER_SHADOW" ? "inset " : "";
          return `${inset}${x}px ${y}px ${radius}px ${color}`;
        });
      if (shadows.length > 0) styles.boxShadow = shadows.join(", ");
    }
    if (element.typography?.fontFamily) styles.fontFamily = element.typography.fontFamily;
    if (element.typography?.fontSize) styles.fontSize = `${element.typography.fontSize}px`;
    if (element.typography?.fontWeight) styles.fontWeight = `${element.typography.fontWeight}`;
    if (element.typography?.letterSpacing) styles.letterSpacing = `${element.typography.letterSpacing}px`;
    if (element.typography?.lineHeight && element.typography.lineHeight !== "AUTO") {
      styles.lineHeight = `${element.typography.lineHeight}`;
    }
    if (element.layoutMode) {
      styles.display = "flex";
      styles.flexDirection = element.layoutMode === "HORIZONTAL" ? "row" : "column";
    }

    return styles;
  };

  const styleObjectToJsx = (styles: Record<string, string>) => {
    const entries = Object.entries(styles)
      .map(([key, value]) => `    ${key}: '${value}'`)
      .join(",\n");
    return `{\n${entries}\n  }`;
  };

  const toKebab = (value: string) => value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

  const styleObjectToCss = (styles: Record<string, string>) =>
    Object.entries(styles)
      .map(([key, value]) => `${toKebab(key)}: ${value};`)
      .join("\n  ");

  // Generate code based on actual component properties
  const generateComponentCode = useMemo(() => {
    if (!componentDetail) return "";

    const props = getActiveProperties() || componentDetail.properties;
    const name = componentDetail.name.replace(/[^a-zA-Z0-9]/g, "");
    const category = componentDetail.category;

    // Build styles from component properties
    const styles: Record<string, string> = {};

    if (props.width) styles.width = `${Math.round(props.width)}px`;
    if (props.height) styles.height = `${Math.round(props.height)}px`;
    if (props.cornerRadius) styles.borderRadius = `${props.cornerRadius}px`;
    if (props.fills?.[0]?.color) styles.backgroundColor = props.fills[0].color;
    if (props.strokes?.[0]?.color) {
      styles.border = `${props.strokes[0].weight || 1}px solid ${props.strokes[0].color}`;
    }
    if (props.effects?.length) {
      const shadows = props.effects
        .filter(e => e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW")
        .map(e => {
          const x = e.offset?.x || 0;
          const y = e.offset?.y || 0;
          const blur = e.radius || 0;
          const color = e.color || "rgba(0,0,0,0.25)";
          const inset = e.type === "INNER_SHADOW" ? "inset " : "";
          return `${inset}${x}px ${y}px ${blur}px ${color}`;
        });
      if (shadows.length) styles.boxShadow = shadows.join(", ");
    }
    if (props.layoutMode && props.layoutMode !== "NONE") {
      styles.display = "flex";
      styles.flexDirection = props.layoutMode === "HORIZONTAL" ? "row" : "column";
      if (props.itemSpacing) styles.gap = `${props.itemSpacing}px`;
    }
    if (props.paddingTop || props.paddingRight || props.paddingBottom || props.paddingLeft) {
      styles.padding = `${props.paddingTop || 0}px ${props.paddingRight || 0}px ${props.paddingBottom || 0}px ${props.paddingLeft || 0}px`;
    }

    // Generate child elements code
    const generateChildCode = (children: ChildElement[], indent: string = "      "): string => {
      return children.map(child => {
        const childStyles = buildElementStyles(child);
        const tag = child.type === "TEXT" ? "span" : "div";
        const content = child.text || "";

        if (child.children && child.children.length > 0) {
          const nestedContent = generateChildCode(child.children, indent + "  ");
          if (framework === "react") {
            return `${indent}<${tag} style={${styleObjectToJsx(childStyles)}}>\n${nestedContent}\n${indent}</${tag}>`;
          }
          return `${indent}<${tag} style="${styleObjectToCss(childStyles)}">\n${nestedContent}\n${indent}</${tag}>`;
        }

        if (framework === "react") {
          return `${indent}<${tag} style={${styleObjectToJsx(childStyles)}}>${content}</${tag}>`;
        }
        return `${indent}<${tag} style="${styleObjectToCss(childStyles)}">${content}</${tag}>`;
      }).join("\n");
    };

    // Generate variants type
    const variants = componentDetail.variants || [];
    const variantType = variants.length > 0
      ? variants.map(v => `'${v.name.replace(/[^a-zA-Z0-9]/g, "")}'`).join(" | ")
      : "'default'";

    if (framework === "react") {
      const childrenCode = props.childElements?.length
        ? generateChildCode(props.childElements)
        : props.textContents?.map(t => `      <span style={{ fontFamily: '${t.style.fontFamily}', fontSize: '${t.style.fontSize}px' }}>${t.characters}</span>`).join("\n") || "      {children}";

      return `import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
  variant?: ${variantType};
  className?: string;
  onClick?: () => void;
}

const ${name}Styles: React.CSSProperties = ${styleObjectToJsx(styles)};

export const ${name}: React.FC<${name}Props> = ({
  children,
  variant = '${variants[0]?.name.replace(/[^a-zA-Z0-9]/g, "") || "default"}',
  className = '',
  onClick,
}) => {
  return (
    <div
      style={${name}Styles}
      className={className}
      onClick={onClick}
    >
${childrenCode}
    </div>
  );
};

export default ${name};`;
    }

    if (framework === "vue") {
      const childrenCode = props.childElements?.length
        ? props.childElements.map(child => {
            const childStyles = buildElementStyles(child);
            return `    <div style="${styleObjectToCss(childStyles)}">${child.text || ""}</div>`;
          }).join("\n")
        : "    <slot />";

      return `<template>
  <div :style="rootStyles" :class="className" @click="$emit('click')">
${childrenCode}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: ${variantType};
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: '${variants[0]?.name.replace(/[^a-zA-Z0-9]/g, "") || "default"}',
  className: '',
});

defineEmits(['click']);

const rootStyles = computed(() => ({
  ${Object.entries(styles).map(([k, v]) => `${k}: '${v}'`).join(",\n  ")}
}));
</script>`;
    }

    // Angular
    return `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${name.toLowerCase()}',
  standalone: true,
  template: \`
    <div [ngStyle]="rootStyles" [class]="className" (click)="onClick.emit()">
      ${props.childElements?.map(child => `<div>${child.text || ""}</div>`).join("\n      ") || "<ng-content />"}
    </div>
  \`,
})
export class ${name}Component {
  @Input() variant: ${variantType} = '${variants[0]?.name.replace(/[^a-zA-Z0-9]/g, "") || "default"}';
  @Input() className: string = '';
  @Output() onClick = new EventEmitter<void>();

  rootStyles = {
    ${Object.entries(styles).map(([k, v]) => `'${toKebab(k)}': '${v}'`).join(",\n    ")}
  };
}`;
  }, [componentDetail, framework, selectedVariantId]);

  const generateElementCode = (element: ChildElement, frameworkType: Framework) => {
    const styles = buildElementStyles(element);
    const tag = element.type === "TEXT" ? "span" : "div";
    const content = element.text || element.name || "";

    if (frameworkType === "react") {
      return `// ${element.name} (${element.type})
<${tag} style={${styleObjectToJsx(styles)}}>
  ${content}
</${tag}>`;
    }

    if (frameworkType === "vue") {
      return `<template>
  <!-- ${element.name} (${element.type}) -->
  <${tag} style="${styleObjectToCss(styles)}">${content}</${tag}>
</template>`;
    }

    return `<!-- ${element.name} (${element.type}) -->
<${tag} style="${styleObjectToCss(styles)}">${content}</${tag}>`;
  };

  const fetchDesignSystem = async () => {
    try {
      const data = await componentsService.getProjectComponents(id!);
      setDesignSystem(data);

      if (data.folders?.length > 0) {
        setExpandedFolders(new Set([data.folders[0].name]));
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

  const fetchComponentDetail = async () => {
    if (!selectedComponent || !id) return;
    setLoadingDetail(true);
    try {
      const detail = await componentsService.getComponentDetail(id, selectedComponent.id);
      setComponentDetail(detail);
      if (detail.variants && detail.variants.length > 0) {
        setSelectedVariantId(detail.variants[0].id);
      }
    } catch (e) {
      console.error("Error fetching component detail:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const generateCode = async () => {
    if (!selectedComponent || !id || !componentDetail) return;

    setGeneratingCode(true);
    try {
      const selectedElement = getSelectedElement();
      if (selectedElement) {
        setGeneratedCode(generateElementCode(selectedElement, framework));
        return;
      }

      // Use locally generated code instead of API
      setGeneratedCode(generateComponentCode);
    } catch (e) {
      console.error("Error generating code:", e);
      setGeneratedCode("// Error generating code");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handlePreviewMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest("[data-node-id]") as HTMLElement | null;
    setHoveredElementId(target?.dataset.nodeId || null);
  };

  const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest("[data-node-id]") as HTMLElement | null;
    setSelectedElementId(target?.dataset.nodeId || null);
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
    toast({ title: "Codigo copiado!" });
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
      toast({ title: "Sincronizacao iniciada!" });
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

  // Render compact properties panel
  const renderPropertiesPanel = () => {
    if (!componentDetail) return null;

    const properties = getActiveProperties() || componentDetail.properties;
    const selectedElement = getSelectedElement();
    const displayProps = selectedElement || properties;

    return (
      <div className="border-t bg-muted/30">
        <button
          onClick={() => setPropertiesPanelOpen(!propertiesPanelOpen)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>Propriedades</span>
            {selectedElement && (
              <Badge variant="secondary" className="text-xs">
                {selectedElement.name}
              </Badge>
            )}
          </div>
          {propertiesPanelOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>

        {propertiesPanelOpen && (
          <div className="p-4 max-h-[300px] overflow-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
              {/* Dimensions */}
              {(displayProps.width || displayProps.height) && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Box className="h-3 w-3" /> Dimensoes
                  </div>
                  <div className="font-mono text-xs bg-background rounded px-2 py-1">
                    {displayProps.width && <div>W: {Math.round(displayProps.width)}px</div>}
                    {displayProps.height && <div>H: {Math.round(displayProps.height)}px</div>}
                  </div>
                </div>
              )}

              {/* Corner Radius */}
              {(displayProps.cornerRadius !== undefined || ('cornerRadii' in displayProps && displayProps.cornerRadii)) && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Border Radius</div>
                  <div className="font-mono text-xs bg-background rounded px-2 py-1">
                    {displayProps.cornerRadius !== undefined
                      ? `${displayProps.cornerRadius}px`
                      : 'cornerRadii' in displayProps && displayProps.cornerRadii
                        ? `${displayProps.cornerRadii.topLeft} ${displayProps.cornerRadii.topRight} ${displayProps.cornerRadii.bottomRight} ${displayProps.cornerRadii.bottomLeft}`
                        : "-"}
                  </div>
                </div>
              )}

              {/* Fills */}
              {displayProps.fills && displayProps.fills.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Palette className="h-3 w-3" /> Fills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {displayProps.fills.map((fill, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 bg-background rounded px-2 py-1"
                      >
                        {fill.color && (
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: fill.color }}
                          />
                        )}
                        <span className="font-mono text-xs">{fill.color || fill.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strokes */}
              {displayProps.strokes && displayProps.strokes.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Strokes
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {displayProps.strokes.map((stroke, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 bg-background rounded px-2 py-1"
                      >
                        {stroke.color && (
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: stroke.color }}
                          />
                        )}
                        <span className="font-mono text-xs">
                          {stroke.weight}px {stroke.color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Effects */}
              {displayProps.effects && displayProps.effects.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Effects</div>
                  <div className="flex flex-wrap gap-1">
                    {displayProps.effects.map((effect, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {effect.type.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout */}
              {'layoutMode' in displayProps && displayProps.layoutMode && displayProps.layoutMode !== "NONE" && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Grid3X3 className="h-3 w-3" /> Layout
                  </div>
                  <div className="font-mono text-xs bg-background rounded px-2 py-1">
                    <div>{displayProps.layoutMode}</div>
                    {'itemSpacing' in displayProps && displayProps.itemSpacing !== undefined && (
                      <div>Gap: {displayProps.itemSpacing}px</div>
                    )}
                  </div>
                </div>
              )}

              {/* Typography (for selected text element) */}
              {'typography' in displayProps && displayProps.typography && (
                <div className="space-y-1 col-span-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Type className="h-3 w-3" /> Tipografia
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {displayProps.typography.fontFamily && (
                      <Badge variant="outline" className="text-xs">
                        {displayProps.typography.fontFamily}
                      </Badge>
                    )}
                    {displayProps.typography.fontSize && (
                      <Badge variant="outline" className="text-xs">
                        {displayProps.typography.fontSize}px
                      </Badge>
                    )}
                    {displayProps.typography.fontWeight && (
                      <Badge variant="outline" className="text-xs">
                        {displayProps.typography.fontWeight}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Child Elements List */}
            {properties.childElements && properties.childElements.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-muted-foreground mb-2">
                  Elementos ({properties.childElements.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {flattenChildElements(properties.childElements).slice(0, 20).map((child) => (
                    <button
                      key={child.nodeId}
                      onClick={() => setSelectedElementId(child.nodeId)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        selectedElementId === child.nodeId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                  {flattenChildElements(properties.childElements).length > 20 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{flattenChildElements(properties.childElements).length - 20} mais
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
            <h2 className="mb-2 text-xl font-bold">Projeto nao encontrado</h2>
            <Button onClick={() => navigate("/projects")} className="mt-4">
              Voltar aos Projetos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alerts = designSystem.alerts || [];
  const selectedElement = getSelectedElement();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{designSystem.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {designSystem.companyName && (
                  <>
                    <Building2 className="h-3 w-3" />
                    <span>{designSystem.companyName}</span>
                    <span>-</span>
                  </>
                )}
                <span>
                  Ultima sync:{" "}
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
                <a href={designSystem.figmaUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Figma
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              Sincronizar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Folders */}
        <div className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
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
              <div className="p-3 space-y-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum alerta ativo</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-3 rounded-lg border bg-background">
                      <div className="flex items-start gap-2">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.componentName}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-2">
                {designSystem.folders?.length > 0 ? (
                  designSystem.folders.map((folder) => (
                    <div key={folder.name} className="mb-1">
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
                        <span className="text-sm font-medium flex-1 truncate">{folder.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {folder.components.length}
                        </span>
                      </button>

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
                              {comp.variantsCount !== undefined && comp.variantsCount > 0 && (
                                <Badge
                                  variant={
                                    selectedComponent?.id === comp.id ? "secondary" : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {comp.variantsCount}
                                </Badge>
                              )}
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

        {/* Main Area - Preview + Code side by side */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedComponent ? (
            <>
              {/* Component Header */}
              <div className="p-4 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{selectedComponent.name}</h2>
                  {selectedComponent.status && selectedComponent.status !== "ok" && (
                    <Badge
                      variant={selectedComponent.status === "broken" ? "destructive" : "secondary"}
                      className="capitalize"
                    >
                      {selectedComponent.status}
                    </Badge>
                  )}
                  {loadingDetail && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="flex items-center gap-4">
                  {componentDetail?.variants && componentDetail.variants.length > 0 && (
                    <Select
                      value={selectedVariantId || componentDetail.variants[0].id}
                      onValueChange={(v) => setSelectedVariantId(v)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Variante" />
                      </SelectTrigger>
                      <SelectContent>
                        {componentDetail.variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Select value={framework} onValueChange={(v) => setFramework(v as Framework)}>
                    <SelectTrigger className="w-32">
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

              {/* Preview + Code Side by Side */}
              <div className="flex-1 flex overflow-hidden">
                {/* Preview Panel */}
                <div className="flex-1 flex flex-col overflow-hidden border-r">
                  <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2 shrink-0">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Preview</span>
                    {selectedElement && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        {selectedElement.name}
                      </Badge>
                    )}
                  </div>
                  <div
                    className="flex-1 overflow-auto p-6 bg-[repeating-conic-gradient(#f0f0f0_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px]"
                    onMouseMove={handlePreviewMouseMove}
                    onMouseLeave={() => setHoveredElementId(null)}
                    onClick={handlePreviewClick}
                  >
                    <div className="flex items-center justify-center min-h-full">
                      {componentDetail ? (
                        <ComponentPreview
                          componentDetail={componentDetail}
                          selectedNodeId={selectedElementId}
                          hoveredNodeId={hoveredElementId}
                          onNodeSelect={setSelectedElementId}
                          onNodeHover={setHoveredElementId}
                          activeVariantName={getActiveVariant()?.name || null}
                          activeVariantProps={getActiveProperties()}
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Carregando preview...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Code Panel */}
                <div className="w-[45%] flex flex-col overflow-hidden">
                  <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Codigo</span>
                      <Badge variant="outline" className="text-xs">
                        {framework.toUpperCase()}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyCode} disabled={generatingCode}>
                      {copied ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {generatingCode ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <pre className="bg-slate-950 text-slate-50 p-4 text-sm font-mono h-full overflow-auto">
                        <code>{generatedCode}</code>
                      </pre>
                    )}
                  </div>
                </div>
              </div>

              {/* Properties Panel (collapsible at bottom) */}
              {renderPropertiesPanel()}
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
