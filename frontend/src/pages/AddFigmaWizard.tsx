<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
import React, { useState, useEffect } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';

// Types
interface PreviewData {
    fileKey: string;
    fileName: string;
    lastModified: string;
    coverImageUrl?: string;
    pages: { id: string; name: string }[];
    componentsPreview: { name: string; nodeId: string; thumbnailUrl?: string }[];
}

// Steps
enum Step {
    INPUT = 'input',
    PREVIEW = 'preview',
    LOADING = 'loading',
    SUCCESS = 'success',
}

export default function AddFigmaWizard() {
    const navigate = useNavigate();
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
    // const { toast } = useToast();
    const [step, setStep] = useState<Step>(Step.INPUT);
    const [formData, setFormData] = useState({
        name: '',
        companyId: '', // Optional or hidden
=======
    const [step, setStep] = useState<Step>(Step.INPUT);
    const [formData, setFormData] = useState({
        name: '',
        companyId: '',
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
        figmaUrl: '',
    });
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importStats, setImportStats] = useState({ tokens: 0, components: 0 });
    const [createdDesignSystemId, setCreatedDesignSystemId] = useState<string | null>(null);

    const handlePreview = async () => {
        setLoading(true);
        setError(null);
        try {
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
            const response = await fetch('/api/figma/preview', { // Proxy configured in vite.config.ts
=======
            const response = await fetch('/api/figma/preview', {
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ figmaUrl: formData.figmaUrl })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Falha ao carregar prévia');
            }

            const data = await response.json();
            setPreviewData(data);
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
            // Auto-fill name if empty
=======
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
            if (!formData.name) setFormData(prev => ({ ...prev, name: data.fileName }));
            setStep(Step.PREVIEW);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setStep(Step.LOADING);
        try {
            // 1. Create Design System
            const createRes = await fetch('/api/design-systems', {
                method: 'POST',
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // Assuming auth
=======
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                body: JSON.stringify(formData)
            });
            if (!createRes.ok) throw new Error('Falha ao criar Design System');
            const ds = await createRes.json();
            setCreatedDesignSystemId(ds.id);

            // 2. Trigger Import
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
            const importRes = await fetch(`/api/design-systems/${ds.id}/import`, {
=======
            await fetch(`/api/design-systems/${ds.id}/import`, {
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            // Polling for status
            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                if (attempts > 60) { // 1 min timeout
                    clearInterval(interval);
                    setError('Tempo limite excedido.');
                    setStep(Step.SUCCESS); // Or error state
=======
                if (attempts > 60) {
                    clearInterval(interval);
                    setError('Tempo limite excedido.');
                    setStep(Step.SUCCESS);
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                    return;
                }

                try {
                    const statusRes = await fetch(`/api/design-systems/${ds.id}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    const statusData = await statusRes.json();

                    if (statusData.importStatus === 'SUCCESS') {
                        clearInterval(interval);
                        setImportStats({
                            tokens: statusData.tokensCount || 0,
                            components: statusData.componentsCount || 0
                        });
                        setStep(Step.SUCCESS);
                    } else if (statusData.importStatus === 'ERROR') {
                        clearInterval(interval);
                        setError(statusData.importErrorMessage || 'Erro na importação');
                        setStep(Step.INPUT);
                    }
                } catch (e) {
                    // Ignore transient errors during polling
                }
            }, 1000);

        } catch (err: any) {
            setError(err.message);
            setStep(Step.INPUT);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Adicionar Design System do Figma</CardTitle>
                    <CardDescription>Conecte seus tokens e componentes diretamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === Step.INPUT && (
                        <div className="space-y-4">
                            <div>
                                <Label>URL do Arquivo Figma *</Label>
                                <Input
                                    placeholder="https://www.figma.com/file/..."
                                    value={formData.figmaUrl}
                                    onChange={e => setFormData({ ...formData, figmaUrl: e.target.value })}
                                />
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                                <p className="text-sm text-gray-500 mt-1">Cole o link completo do arquivo (modo de visualização ou dev).</p>
=======
                                <p className="text-sm text-muted-foreground mt-1">Cole o link completo do arquivo (modo de visualização ou dev).</p>
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                            </div>
                            <div>
                                <Label>Nome do Design System</Label>
                                <Input
                                    placeholder="Ex: Onix DS"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                            {error && <div className="text-red-500 text-sm">{error}</div>}
=======
                            {error && <div className="text-destructive text-sm">{error}</div>}
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                        </div>
                    )}

                    {step === Step.PREVIEW && previewData && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                {previewData.coverImageUrl && (
                                    <img src={previewData.coverImageUrl} alt="Cover" className="w-24 h-24 object-cover rounded shadow" />
                                )}
                                <div>
                                    <h3 className="text-lg font-bold">{previewData.fileName}</h3>
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                                    <p className="text-sm text-gray-500">Última alteração: {new Date(previewData.lastModified).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">{previewData.pages.length} páginas encontradas</p>
=======
                                    <p className="text-sm text-muted-foreground">Última alteração: {new Date(previewData.lastModified).toLocaleDateString()}</p>
                                    <p className="text-sm text-muted-foreground">{previewData.pages.length} páginas encontradas</p>
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Prévia de Componentes ({previewData.componentsPreview.length})</h4>
                                <div className="grid grid-cols-4 gap-4">
                                    {previewData.componentsPreview.slice(0, 8).map((comp) => (
                                        <div key={comp.nodeId} className="border rounded p-2 text-center text-xs">
                                            {comp.thumbnailUrl ? (
                                                <img src={comp.thumbnailUrl} className="w-full h-16 object-contain mb-2" />
                                            ) : (
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                                                <div className="w-full h-16 bg-gray-100 mb-2 flex items-center justify-center">No thumb</div>
=======
                                                <div className="w-full h-16 bg-muted/30 mb-2 flex items-center justify-center">No thumb</div>
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                                            )}
                                            <div className="truncate" title={comp.name}>{comp.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === Step.LOADING && (
                        <div className="py-20 text-center">
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                            <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" />
                            <h3 className="text-xl font-semibold">Importando seu Design System...</h3>
                            <p className="text-gray-500 mt-2">Isso pode levar alguns instantes. Estamos processando tokens e componentes.</p>

                            <div className="mt-8 max-w-xs mx-auto space-y-2 text-left text-sm text-gray-400">
                                <div className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-2" /> Conectado ao Figma</div>
                                <div className="flex items-center text-blue-600"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importando Tokens e Componentes</div>
=======
                            <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="text-xl font-semibold">Importando seu Design System...</h3>
                            <p className="text-muted-foreground mt-2">Isso pode levar alguns instantes. Estamos processando tokens e componentes.</p>

                            <div className="mt-8 max-w-xs mx-auto space-y-2 text-left text-sm text-muted-foreground">
                                <div className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-2" /> Conectado ao Figma</div>
                                <div className="flex items-center text-primary"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importando Tokens e Componentes</div>
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                            </div>
                        </div>
                    )}

                    {step === Step.SUCCESS && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Importação Concluída!</h2>
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                            <p className="mb-6 text-gray-600">
                                Seu Design System <strong>{formData.name}</strong> foi importado com sucesso.
                            </p>
                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left bg-gray-50 p-4 rounded">
=======
                            <p className="mb-6 text-muted-foreground">
                                Seu Design System <strong>{formData.name}</strong> foi importado com sucesso.
                            </p>
                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left bg-muted/30 p-4 rounded">
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                                <div><strong>Tokens:</strong> {importStats.tokens}</div>
                                <div><strong>Componentes:</strong> {importStats.components}</div>
                            </div>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="flex justify-between">
                    {step === Step.INPUT && (
                        <Button onClick={handlePreview} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null} Carregar Prévia
                        </Button>
                    )}
                    {step === Step.PREVIEW && (
                        <>
                            <Button variant="outline" onClick={() => setStep(Step.INPUT)}>Cancelar</Button>
                            <Button onClick={handleConfirm}>Confirmar Importação</Button>
                        </>
                    )}
                    {step === Step.SUCCESS && (
                        <div className="flex gap-4 w-full">
                            <Button variant="outline" className="flex-1" onClick={() => navigate('/code-generator')}>Gerar Código</Button>
<<<<<<< HEAD:src/pages/AddFigmaWizard.tsx
                            <Button className="flex-1" onClick={() => navigate(`/projects/${createdDesignSystemId}`)}>Ver Design System</Button>
=======
                            <Button className="flex-1" onClick={() => navigate(`/design-systems/${createdDesignSystemId}`)}>Ver Design System</Button>
>>>>>>> main:frontend/src/pages/AddFigmaWizard.tsx
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
