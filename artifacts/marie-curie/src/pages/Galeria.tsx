import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useUploadArquivo, useUploadFoto } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Camera, Upload, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Galeria() {
  const [_, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const game = searchParams.get("game") || "visita";

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [nome, setNome] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadArquivo = useUploadArquivo();
  const uploadFoto = useUploadFoto();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.type.startsWith('image/')) {
        toast({ title: "Formato inválido", description: "Por favor, envie uma imagem." });
        return;
      }
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async () => {
    if (!preview || !file) return;

    try {
      const base64 = preview.split(",")[1];

      const result = await uploadArquivo.mutateAsync({
        data: {
          dados: base64,
          mimeType: file.type,
        },
      });

      // 2. Register foto
      await uploadFoto.mutateAsync({
        data: {
          urlImagem: result.url,
          miniGame: game,
          nomeVisitante: nome || undefined
        }
      });

      toast({ 
        title: "Foto enviada!", 
        description: "Sua foto foi enviada para o laboratório e logo aparecerá no telão." 
      });
      setLocation("/");

    } catch (error) {
      toast({ 
        title: "Erro no envio", 
        description: "Não foi possível enviar a foto. Tente novamente." 
      });
    }
  };

  const isUploading = uploadArquivo.isPending || uploadFoto.isPending;

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full space-y-8 pt-8 pb-12">
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-serif text-neon uppercase tracking-widest">
            Registro Fotográfico
          </h1>
          <p className="font-mono text-muted-foreground text-sm md:text-base">
            Capture este momento. Segure um tubo de ensaio imaginário (ou real) e junte-se ao mural de cientistas.
          </p>
        </div>

        <div className="w-full bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
          
          <div className="space-y-6">
            {!preview ? (
              <div 
                className="border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <span className="font-mono text-primary text-sm uppercase tracking-wider mb-2">Capturar ou Enviar</span>
                <span className="text-xs text-muted-foreground font-mono">Tire uma foto ou escolha da galeria</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  <button 
                    onClick={() => { setPreview(null); setFile(null); }}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur border border-border text-foreground px-3 py-1 rounded-md text-xs font-mono uppercase hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    Trocar
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Cientista (Opcional)</Label>
                  <Input 
                    id="nome" 
                    placeholder="Ex: Dr. Silva" 
                    value={nome} 
                    onChange={e => setNome(e.target.value)} 
                    maxLength={30}
                  />
                </div>

                <Button 
                  className="w-full" 
                  variant="neon" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Processando...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar para o Telão
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground">
          Pular esta etapa
        </Button>
      </div>
    </PublicLayout>
  );
}
