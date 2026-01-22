import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, Copy } from 'lucide-react';
<<<<<<< HEAD:src/pages/DesignSystemDetails.tsx
=======
import { toast } from '@/hooks/use-toast';
>>>>>>> main:frontend/src/pages/DesignSystemDetails.tsx

export default function DesignSystemDetails() {
    const { id } = useParams();
    const [designSystem, setDesignSystem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Fetch DS details
        const fetchDS = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/design-systems/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setDesignSystem(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDS();
    }, [id]);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!designSystem) return <div className="p-10">Design System não encontrado.</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{designSystem.name}</h1>
                    <p className="text-muted-foreground">{designSystem.description || 'Sem descrição'}</p>
                </div>
                <div className="flex gap-2">
                    {designSystem.figmaUrl && (
                        <Button variant="outline" asChild>
                            <a href={designSystem.figmaUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> Abrir no Figma
                            </a>
                        </Button>
                    )}
                    <Button>Sincronizar Agora</Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                    <TabsTrigger value="components">Componentes</TabsTrigger>
                    <TabsTrigger value="code">Código</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Status da Sincronização</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
<<<<<<< HEAD:src/pages/DesignSystemDetails.tsx
                                <div className="p-4 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-500">Última Importação</div>
                                    <div className="font-medium">{designSystem.lastImportedAt ? new Date(designSystem.lastImportedAt).toLocaleString() : 'Nunca'}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-500">Status</div>
=======
                                <div className="p-4 bg-muted/30 rounded">
                                    <div className="text-sm text-muted-foreground">Última Importação</div>
                                    <div className="font-medium">{designSystem.lastImportedAt ? new Date(designSystem.lastImportedAt).toLocaleString() : 'Nunca'}</div>
                                </div>
                                <div className="p-4 bg-muted/30 rounded">
                                    <div className="text-sm text-muted-foreground">Status</div>
>>>>>>> main:frontend/src/pages/DesignSystemDetails.tsx
                                    <div className="font-medium">
                                        <Badge variant={designSystem.importStatus === 'SUCCESS' ? 'default' : 'destructive'}>
                                            {designSystem.importStatus || 'Idle'}
                                        </Badge>
                                    </div>
                                </div>
<<<<<<< HEAD:src/pages/DesignSystemDetails.tsx
                                <div className="p-4 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-500">Versão</div>
=======
                                <div className="p-4 bg-muted/30 rounded">
                                    <div className="text-sm text-muted-foreground">Versão</div>
>>>>>>> main:frontend/src/pages/DesignSystemDetails.tsx
                                    <div className="font-medium">v1.0.0</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tokens" className="mt-6">
                    <TokensTab designSystemId={id!} />
                </TabsContent>

                <TabsContent value="components" className="mt-6">
                    <ComponentsTab designSystemId={id!} />
                </TabsContent>

                <TabsContent value="code" className="mt-6">
                    <CodeTab designSystemId={id!} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TokensTab({ designSystemId }: { designSystemId: string }) {
    // Fetch tokens
    const [tokens, setTokens] = useState<any[]>([]);
    useEffect(() => {
        fetch(`/api/design-systems/${designSystemId}/tokens`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()).then(setTokens).catch(console.error);
    }, [designSystemId]);

    return (
        <Card>
            <CardHeader><CardTitle>Tokens ({tokens.length})</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokens.slice(0, 50).map((token: any) => (
                        <div key={token.id} className="flex items-center gap-3 p-2 border rounded">
                            <div
                                className="w-8 h-8 rounded border shadow-sm"
                                style={{ backgroundColor: token.type === 'COLOR' ? token.value : '#eee' }}
                            />
                            <div className="overflow-hidden">
                                <div className="font-medium text-sm truncate" title={token.name}>{token.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{token.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function ComponentsTab({ designSystemId }: { designSystemId: string }) {
    const [components, setComponents] = useState<any[]>([]);
    useEffect(() => {
        fetch(`/api/design-systems/${designSystemId}/components`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()).then(setComponents).catch(console.error);
    }, [designSystemId]);

    return (
        <Card>
            <CardHeader><CardTitle>Componentes ({components.length})</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {components.map((comp: any) => (
                        <div key={comp.id} className="border rounded-lg overflow-hidden group hover:shadow-md transition">
<<<<<<< HEAD:src/pages/DesignSystemDetails.tsx
                            <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                                {comp.previewUrl ? (
                                    <img src={comp.previewUrl} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-gray-400 text-xs">Sem preview</span>
=======
                            <div className="h-32 bg-muted/30 flex items-center justify-center relative">
                                {comp.previewUrl ? (
                                    <img src={comp.previewUrl} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-muted-foreground text-xs">Sem preview</span>
>>>>>>> main:frontend/src/pages/DesignSystemDetails.tsx
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs cursor-pointer">
                                    Ver Detalhes
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="font-medium text-sm truncate" title={comp.name}>{comp.name}</div>
                                <div className="text-xs text-muted-foreground">{comp.category}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function CodeTab({ designSystemId }: { designSystemId: string }) {
    const [framework, setFramework] = useState('react-tailwind');
    const [snippet, setSnippet] = useState('');

<<<<<<< HEAD:src/pages/DesignSystemDetails.tsx
=======
    const copyToClipboard = () => {
        navigator.clipboard.writeText(snippet);
        toast({ title: "Código copiado!" });
    };

>>>>>>> main:frontend/src/pages/DesignSystemDetails.tsx
    useEffect(() => {
        if (framework === 'react-tailwind') {
            setSnippet(`// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      }
    }
  }
}`);
        } else if (framework === 'css') {
            setSnippet(`:root {
  --color-primary: #000;
  --color-secondary: #fff;
  /* ... imported tokens */
}`);
        } else {
            setSnippet(`{
  "colors": {
    "primary": "#000"
  }
}`);
        }
    }, [framework]);

    return (
        <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 space-y-2">
                <Button variant={framework === 'react-tailwind' ? 'default' : 'ghost'} onClick={() => setFramework('react-tailwind')} className="w-full justify-start">React + Tailwind</Button>
                <Button variant={framework === 'react-styled' ? 'default' : 'ghost'} onClick={() => setFramework('react-styled')} className="w-full justify-start">React + Styled Components</Button>
                <Button variant={framework === 'css' ? 'default' : 'ghost'} onClick={() => setFramework('css')} className="w-full justify-start">CSS Variables</Button>
                <Button variant={framework === 'json' ? 'default' : 'ghost'} onClick={() => setFramework('json')} className="w-full justify-start">JSON Raw</Button>
            </div>
            <div className="col-span-3">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Snippet Gerado</CardTitle>
<<<<<<< HEAD:src/pages/DesignSystemDetails.tsx
                        <Button variant="ghost" size="sm"><Copy className="w-4 h-4 mr-2" /> Copiar</Button>
=======
                        <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="w-4 h-4 mr-2" /> Copiar</Button>
>>>>>>> main:frontend/src/pages/DesignSystemDetails.tsx
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                            {snippet}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
