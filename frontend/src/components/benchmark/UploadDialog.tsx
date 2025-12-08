import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, type: "competitor" | "reference") => void;
}

export function UploadDialog({ open, onOpenChange, onUpload }: UploadDialogProps) {
  const [selectedType, setSelectedType] = useState<"competitor" | "reference">("competitor");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      setIsProcessing(true);
      // Simulate processing delay
      setTimeout(() => {
        onUpload(selectedFile, selectedType);
        setIsProcessing(false);
        setSelectedFile(null);
        setPreview(null);
        onOpenChange(false);
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Adicionar Imagem ao Benchmark</DialogTitle>
          <DialogDescription>
            Faça upload de uma tela para análise competitiva
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* File Upload */}
          <div className="space-y-3">
            <Label>Imagem da Tela</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {preview ? (
                  <div className="space-y-3">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg shadow-soft"
                    />
                    <p className="text-sm text-muted-foreground">
                      Clique para trocar a imagem
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                      <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Clique para fazer upload</p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG ou WebP até 10MB
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-3">
            <Label>Tipo de Imagem</Label>
            <RadioGroup value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
              <div className="grid gap-3 md:grid-cols-2">
                <div 
                  className={`rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    selectedType === "competitor" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedType("competitor")}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="competitor" id="competitor" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="competitor" className="cursor-pointer font-medium">
                        Tela de Concorrente
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        A IA irá analisar a estrutura, componentes e padrões usados
                      </p>
                    </div>
                  </div>
                </div>
                <div 
                  className={`rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    selectedType === "reference" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedType("reference")}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="reference" id="reference" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="reference" className="cursor-pointer font-medium">
                        Referência Visual
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Imagem de inspiração sem análise estrutural detalhada
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedFile || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Adicionar ao Benchmark
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
