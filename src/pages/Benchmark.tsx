import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Upload,
  Eye,
  Trash2,
  Network,
  Image as ImageIcon
} from "lucide-react";
import { UploadDialog } from "@/components/benchmark/UploadDialog";

interface BenchmarkImage {
  id: string;
  name: string;
  type: "competitor" | "reference";
  competitor?: string;
  preview: string;
  analysis?: {
    components: string[];
    patterns: string[];
    colors: string[];
  };
  addedAt: string;
}

export default function Benchmark() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [images, setImages] = useState<BenchmarkImage[]>([
    {
      id: "1",
      name: "Login Screen - Competitor A",
      type: "competitor",
      competitor: "Competitor A",
      preview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      analysis: {
        components: ["Input", "Button", "Logo", "Social Login"],
        patterns: ["Center Layout", "Card Container"],
        colors: ["#3B82F6", "#FFFFFF", "#F3F4F6"]
      },
      addedAt: "2 horas atrás"
    },
    {
      id: "2",
      name: "Dashboard - Competitor A",
      type: "competitor",
      competitor: "Competitor A",
      preview: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      analysis: {
        components: ["Sidebar", "Cards", "Charts", "Table"],
        patterns: ["Grid Layout", "Side Navigation"],
        colors: ["#10B981", "#1F2937", "#FFFFFF"]
      },
      addedAt: "3 horas atrás"
    },
    {
      id: "3",
      name: "Product Page - Competitor B",
      type: "competitor",
      competitor: "Competitor B",
      preview: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400",
      analysis: {
        components: ["Image Gallery", "Price Tag", "Add to Cart", "Rating"],
        patterns: ["Two Column", "Sticky Header"],
        colors: ["#EF4444", "#111827", "#F9FAFB"]
      },
      addedAt: "1 dia atrás"
    }
  ]);

  const handleUpload = (file: File, type: "competitor" | "reference") => {
    // In a real app, this would process the image with AI
    const newImage: BenchmarkImage = {
      id: Date.now().toString(),
      name: file.name,
      type,
      competitor: type === "competitor" ? "New Competitor" : undefined,
      preview: URL.createObjectURL(file),
      analysis: type === "competitor" ? {
        components: ["Button", "Input", "Card"],
        patterns: ["Grid Layout"],
        colors: ["#6BA5E7", "#F0E4C8"]
      } : undefined,
      addedAt: "Agora"
    };
    setImages([newImage, ...images]);
  };

  const competitorGroups = images.reduce((acc, img) => {
    if (img.type === "competitor" && img.competitor) {
      if (!acc[img.competitor]) acc[img.competitor] = [];
      acc[img.competitor].push(img);
    }
    return acc;
  }, {} as Record<string, BenchmarkImage[]>);

  const references = images.filter(img => img.type === "reference");

  return (
    <>
      <UploadDialog 
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUpload={handleUpload}
      />

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl">Benchmark de Concorrentes</h1>
            <p className="text-muted-foreground">
              Analise e compare interfaces da concorrência
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Network className="h-4 w-4" />
              Gerar Fluxograma
            </Button>
            <Button className="gap-2" onClick={() => setIsUploadOpen(true)}>
              <Plus className="h-4 w-4" />
              Adicionar Imagem
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold mb-1">{images.length}</div>
              <p className="text-sm text-muted-foreground">Imagens Totais</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold mb-1">{Object.keys(competitorGroups).length}</div>
              <p className="text-sm text-muted-foreground">Concorrentes</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold mb-1">{images.filter(i => i.type === "competitor").length}</div>
              <p className="text-sm text-muted-foreground">Telas Analisadas</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold mb-1">{references.length}</div>
              <p className="text-sm text-muted-foreground">Referências</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-border">
            <CardTitle>Análises</CardTitle>
            <CardDescription>Imagens organizadas por categoria</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="competitors">Por Concorrente</TabsTrigger>
                <TabsTrigger value="references">Referências</TabsTrigger>
              </TabsList>

              {/* All Images */}
              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {images.map((img) => (
                    <Card key={img.id} className="group overflow-hidden">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img 
                          src={img.preview} 
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Análise
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm">{img.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {img.type === "competitor" ? "Concorrente" : "Referência"}
                          </Badge>
                        </div>
                        {img.competitor && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {img.competitor}
                          </p>
                        )}
                        {img.analysis && (
                          <div className="text-xs text-muted-foreground">
                            {img.analysis.components.length} componentes identificados
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {img.addedAt}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Grouped by Competitor */}
              <TabsContent value="competitors" className="space-y-6">
                {Object.entries(competitorGroups).map(([competitor, imgs]) => (
                  <div key={competitor}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{competitor}</h3>
                      <Badge variant="secondary">{imgs.length} telas</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {imgs.map((img) => (
                        <Card key={img.id} className="group overflow-hidden">
                          <div className="aspect-video relative overflow-hidden bg-muted">
                            <img 
                              src={img.preview} 
                              alt={img.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="pt-4">
                            <h4 className="font-medium text-sm mb-2">{img.name}</h4>
                            {img.analysis && (
                              <div className="flex flex-wrap gap-1">
                                {img.analysis.components.slice(0, 3).map((comp) => (
                                  <Badge key={comp} variant="secondary" className="text-xs">
                                    {comp}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* References */}
              <TabsContent value="references">
                {references.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {references.map((img) => (
                      <Card key={img.id} className="group overflow-hidden">
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <img 
                            src={img.preview} 
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="pt-4">
                          <h4 className="font-medium text-sm">{img.name}</h4>
                          <p className="text-xs text-muted-foreground mt-2">
                            {img.addedAt}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Nenhuma referência adicionada ainda
                    </p>
                    <Button onClick={() => setIsUploadOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Referência
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
