import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Copy, 
  Download, 
  FileJson, 
  FileCode, 
  Palette,
  Type,
  Settings,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CodeGenerator() {
  const [activeTab, setActiveTab] = useState("json");
  const [selectedTokens, setSelectedTokens] = useState(true);
  const [selectedComponents, setSelectedComponents] = useState(true);
  const { toast } = useToast();

  const codeExamples = {
    json: `{
  "colors": {
    "primary": {
      "500": "#6BA5E7",
      "400": "#85B6EC",
      "600": "#5A94D6"
    },
    "accent": {
      "400": "#F0E4C8"
    }
  },
  "spacing": {
    "md": "16px",
    "lg": "24px"
  },
  "typography": {
    "heading": {
      "fontFamily": "Inter",
      "fontWeight": "600"
    }
  }
}`,
    css: `:root {
  /* Colors */
  --color-primary-500: #6BA5E7;
  --color-primary-400: #85B6EC;
  --color-primary-600: #5A94D6;
  --color-accent-400: #F0E4C8;
  
  /* Spacing */
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Typography */
  --font-heading: Inter, sans-serif;
  --font-weight-heading: 600;
  
  /* Shadows */
  --shadow-soft: 0 4px 12px rgba(0,0,0,0.06);
}`,
    tailwind: `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6BA5E7',
          400: '#85B6EC',
          600: '#5A94D6',
        },
        accent: {
          400: '#F0E4C8',
        },
      },
      spacing: {
        md: '16px',
        lg: '24px',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
      },
    },
  },
}`,
    react: `import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  children,
  className,
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-smooth';
  
  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border bg-transparent hover:bg-muted',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button 
      className={\`\${baseStyles} \${variantStyles[variant]} \${sizeStyles[size]} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
}`,
    typescript: `export interface DesignTokens {
  colors: {
    primary: {
      500: string;
      400: string;
      600: string;
    };
    accent: {
      400: string;
    };
  };
  spacing: {
    md: string;
    lg: string;
  };
  typography: {
    heading: {
      fontFamily: string;
      fontWeight: string;
    };
  };
}

export type ColorToken = keyof DesignTokens['colors'];
export type SpacingToken = keyof DesignTokens['spacing'];

export interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}`
  };

  const tabs = [
    { id: "json", label: "JSON", icon: FileJson },
    { id: "css", label: "CSS Variables", icon: Palette },
    { id: "tailwind", label: "Tailwind Config", icon: Settings },
    { id: "react", label: "React Components", icon: FileCode },
    { id: "typescript", label: "TypeScript Types", icon: Type },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab as keyof typeof codeExamples]);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download iniciado",
      description: "Seu arquivo ZIP está sendo preparado.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl">Gerador de Código</h1>
          <p className="text-muted-foreground">
            Exporte seu Design System em múltiplos formatos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            Copiar Tudo
          </Button>
          <Button className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Baixar ZIP
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileJson className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">247</div>
                <p className="text-sm text-muted-foreground">Tokens Exportáveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCode className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">38</div>
                <p className="text-sm text-muted-foreground">Componentes Prontos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">5</div>
                <p className="text-sm text-muted-foreground">Formatos Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar - Configuration */}
        <Card className="shadow-soft h-fit">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg">Configurações</CardTitle>
            <CardDescription>Personalize a exportação</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">O que exportar</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tokens" 
                    checked={selectedTokens}
                    onCheckedChange={(checked) => setSelectedTokens(checked as boolean)}
                  />
                  <Label htmlFor="tokens" className="text-sm cursor-pointer">
                    Design Tokens
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="components" 
                    checked={selectedComponents}
                    onCheckedChange={(checked) => setSelectedComponents(checked as boolean)}
                  />
                  <Label htmlFor="components" className="text-sm cursor-pointer">
                    Componentes
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Framework Alvo</h3>
              <div className="space-y-2">
                {["React", "Vue", "Angular", "Vanilla"].map((framework) => (
                  <Button 
                    key={framework}
                    variant={framework === "React" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    {framework}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Estilo de Nomenclatura</h3>
              <div className="space-y-2">
                {["camelCase", "kebab-case", "snake_case"].map((style) => (
                  <Button 
                    key={style}
                    variant={style === "camelCase" ? "secondary" : "ghost"}
                    className="w-full justify-start font-mono text-xs"
                    size="sm"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main - Code Preview */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Preview do Código</CardTitle>
                <CardDescription>Visualize antes de exportar</CardDescription>
              </div>
              <Badge variant="secondary">
                {tabs.find(t => t.id === activeTab)?.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-border px-6 pt-4">
                <TabsList className="w-full justify-start h-auto bg-transparent p-0 gap-1">
                  {tabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id}
                      className="gap-2 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="m-0">
                  <div className="relative">
                    <pre className="p-6 overflow-x-auto">
                      <code className="text-sm font-mono text-foreground">
                        {codeExamples[tab.id as keyof typeof codeExamples]}
                      </code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
