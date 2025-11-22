import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Palette, Ruler, Type, Radius, Layers, Wand2, RefreshCw, Eye, Shield, CheckCircle, Trash2, Plus } from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  changes: number;
  impact: number;
  status: "draft" | "simulated" | "applied";
  createdAt: string;
}

export default function ScenariosAutomation() {
  const [isCreateScenarioOpen, setIsCreateScenarioOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const scenarios: Scenario[] = [
    {
      id: "1",
      name: "Nova cor primária",
      changes: 3,
      impact: 48,
      status: "simulated",
      createdAt: "23 Jan 2025",
    },
    {
      id: "2",
      name: "Ajuste do spacing base",
      changes: 5,
      impact: 32,
      status: "draft",
      createdAt: "22 Jan 2025",
    },
    {
      id: "3",
      name: "Mudança de tipografia",
      changes: 8,
      impact: 67,
      status: "applied",
      createdAt: "20 Jan 2025",
    },
  ];

  const automations = [
    {
      category: "Sincronização",
      items: [
        { name: "Sincronizar tokens com Figma", description: "Atualiza automaticamente quando detectar mudanças", enabled: true },
        { name: "Atualizar componentes ao alterar tokens", description: "Propaga alterações para componentes derivados", enabled: true },
      ],
    },
    {
      category: "Acessibilidade",
      items: [
        { name: "Verificação de contraste", description: "Valida WCAG AA/AAA em todas as cores", enabled: true },
        { name: "Alertas de tamanhos mínimos", description: "Detecta elementos menores que 44x44px", enabled: false },
        { name: "Análise de leitura", description: "Identifica problemas de legibilidade em textos", enabled: true },
      ],
    },
    {
      category: "Consistência",
      items: [
        { name: "Detectar tokens duplicados", description: "Encontra valores idênticos com nomes diferentes", enabled: true },
        { name: "Tokens sem uso", description: "Identifica tokens não utilizados em componentes", enabled: false },
        { name: "Componentes órfãos", description: "Alerta sobre componentes sem tokens vinculados", enabled: true },
      ],
    },
    {
      category: "Limpeza",
      items: [
        { name: "Remover tokens mortos", description: "Exclui automaticamente tokens não referenciados", enabled: false },
        { name: "Agrupar tokens equivalentes", description: "Consolida tokens com valores idênticos", enabled: false },
        { name: "Refatorar nomenclaturas", description: "Padroniza nomes seguindo convenção do sistema", enabled: false },
      ],
    },
  ];

  const statusConfig = {
    draft: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
    simulated: { label: "Simulado", color: "bg-accent/30 text-accent-foreground" },
    applied: { label: "Aplicado", color: "bg-primary/10 text-primary" },
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="mb-2 text-3xl">Cenários & Automação</h1>
          <p className="text-muted-foreground">
            Simule mudanças e automatize tarefas do Design System
          </p>
        </div>

        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="scenarios">Cenários</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
          </TabsList>

          {/* CENÁRIOS TAB */}
          <TabsContent value="scenarios" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">Cenários</h2>
                <p className="text-sm text-muted-foreground">
                  Simule alterações no Design System antes de aplicá-las
                </p>
              </div>
              <Button onClick={() => setIsCreateScenarioOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Cenário
              </Button>
            </div>

            {/* Scenarios List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((scenario, index) => (
                <Card 
                  key={scenario.id}
                  className="shadow-soft transition-smooth hover:shadow-elevated cursor-pointer group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                      <Badge className={statusConfig[scenario.status].color}>
                        {statusConfig[scenario.status].label}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Criado em {scenario.createdAt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Alterações</span>
                      <span className="font-medium">{scenario.changes} tokens</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Impacto previsto</span>
                      <span className="font-medium">{scenario.impact} componentes</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Abrir Cenário
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AUTOMAÇÃO TAB */}
          <TabsContent value="automation" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Automação</h2>
              <p className="text-sm text-muted-foreground">
                Automatize tarefas para manter seu Design System consistente
              </p>
            </div>

            <div className="space-y-6">
              {automations.map((group, groupIndex) => (
                <Card 
                  key={group.category}
                  className="shadow-soft animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${groupIndex * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {group.category === "Sincronização" && <RefreshCw className="h-5 w-5 text-primary" />}
                      {group.category === "Acessibilidade" && <Shield className="h-5 w-5 text-primary" />}
                      {group.category === "Consistência" && <CheckCircle className="h-5 w-5 text-primary" />}
                      {group.category === "Limpeza" && <Trash2 className="h-5 w-5 text-primary" />}
                      <CardTitle className="text-lg">Automação de {group.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {group.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex}
                        className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4 transition-smooth hover:bg-muted/50"
                      >
                        <div className="flex-1 space-y-1">
                          <Label htmlFor={`${group.category}-${itemIndex}`} className="font-medium cursor-pointer">
                            {item.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Switch 
                          id={`${group.category}-${itemIndex}`}
                          checked={item.enabled}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Scenario Dialog */}
      <Dialog open={isCreateScenarioOpen} onOpenChange={setIsCreateScenarioOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Criar Novo Cenário</DialogTitle>
            <DialogDescription>
              Simule alterações antes de aplicá-las ao Design System
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Scenario Name */}
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Nome do Cenário</Label>
              <Input id="scenario-name" placeholder="Ex: Ajuste de cor primária" />
            </div>

            {/* Modification Type */}
            <div className="space-y-3">
              <Label>Tipo de Modificação</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Palette, label: "Modificar tokens", desc: "Alterar valores de tokens existentes" },
                  { icon: Radius, label: "Alterar radius global", desc: "Ajustar bordas arredondadas" },
                  { icon: Ruler, label: "Ajustar spacing", desc: "Modificar espaçamentos base" },
                  { icon: Type, label: "Mudar tipografia", desc: "Alterar fontes e tamanhos" },
                  { icon: Palette, label: "Paleta semântica", desc: "Modificar cores semânticas" },
                  { icon: Layers, label: "Ajustar shadows", desc: "Configurar sombras e elevações" },
                ].map((type) => (
                  <button
                    key={type.label}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-smooth hover:border-primary hover:shadow-soft"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <type.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-0.5">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Analysis Preview */}
            <Card className="shadow-subtle border-accent/20 bg-accent/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/30">
                    <Sparkles className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Análise IA</p>
                    <p className="text-xs text-muted-foreground">
                      A IA analisará o impacto das suas alterações e fornecerá:
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        Lista de componentes afetados
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        Tokens derivados que serão atualizados
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        Impacto de acessibilidade (contraste, legibilidade)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        Sugestões de melhorias e otimizações
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateScenarioOpen(false)}>
              Cancelar
            </Button>
            <Button className="gap-2">
              <Wand2 className="h-4 w-4" />
              Criar e Analisar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scenario Detail Dialog */}
      <Dialog open={!!selectedScenario} onOpenChange={() => setSelectedScenario(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={selectedScenario ? statusConfig[selectedScenario.status].color : ""}>
                {selectedScenario && statusConfig[selectedScenario.status].label}
              </Badge>
            </div>
            <DialogTitle className="text-2xl">{selectedScenario?.name}</DialogTitle>
            <DialogDescription>
              Criado em {selectedScenario?.createdAt}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Impact Summary */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="shadow-subtle">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Tokens Alterados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{selectedScenario?.changes}</p>
                </CardContent>
              </Card>
              <Card className="shadow-subtle">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Componentes Afetados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{selectedScenario?.impact}</p>
                </CardContent>
              </Card>
            </div>

            {/* Before/After Comparison */}
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="text-base">Comparação Antes/Depois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Antes</p>
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <div className="h-10 rounded-md bg-[#3B82F6] flex items-center justify-center text-white text-sm font-medium">
                        Button Primary
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">color/primary-500</p>
                        <p className="font-mono text-xs">#3B82F6</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Depois</p>
                    <div className="rounded-lg border border-primary/20 p-4 space-y-3 bg-primary/5">
                      <div className="h-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        Button Primary
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">color/primary-500</p>
                        <p className="font-mono text-xs">#6BA5E7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="shadow-subtle border-accent/20 bg-accent/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                  <CardTitle className="text-base">Insights da IA</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm">Contraste WCAG AA mantido em todos os componentes</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm">48 componentes serão atualizados automaticamente</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/30">
                    <Eye className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>
                  <p className="text-sm">Sugestão: Considere ajustar também color/primary-400 para manter harmonia</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedScenario(null)}>
              Fechar
            </Button>
            <Button variant="outline" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Exportar Relatório
            </Button>
            <Button className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Aplicar Cenário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
