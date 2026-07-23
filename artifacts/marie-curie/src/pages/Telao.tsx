import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useListFotosAprovadas, useGetConfig } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical } from "lucide-react";

export default function Telao() {
  const [_, setLocation] = useLocation();
  const { data: config } = useGetConfig();
  const { data: fotos, refetch } = useListFotosAprovadas({
    query: { refetchInterval: 30000 } // Refetch every 30s
  });

  const [currentIndex, setCurrentIdx] = useState(0);

  const intervalSecs = config?.intervaloCarrossel || 5;

  useEffect(() => {
    if (!fotos || fotos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % fotos.length);
    }, intervalSecs * 1000);
    return () => clearInterval(timer);
  }, [fotos, intervalSecs]);

  const currentFoto = fotos?.[currentIndex];

  if (!fotos || fotos.length === 0) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
        <FlaskConical className="w-24 h-24 text-primary opacity-20 mb-8 animate-pulse-neon" />
        <h1 className="text-5xl md:text-7xl font-serif text-neon uppercase tracking-widest mb-6">
          Galeria de Cientistas
        </h1>
        <p className="text-xl md:text-2xl font-mono text-muted-foreground">
          Aguardando as primeiras descobertas...
        </p>
        <button onClick={() => setLocation("/")} className="absolute bottom-8 right-8 opacity-10 hover:opacity-100 transition-opacity font-mono text-xs text-primary">Sair do Telão</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden relative flex items-center justify-center group">
      {/* Background ambient light */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
         <div className="w-[80vw] h-[80vh] bg-primary/20 rounded-full blur-[150px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentFoto.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 md:p-16"
        >
          <div className="relative max-w-6xl w-full h-full flex flex-col justify-center items-center">
            
            <div className="relative w-full h-[70vh] flex items-center justify-center">
              <img 
                src={currentFoto.urlImagem} 
                alt="Visitante" 
                className="max-w-full max-h-full object-contain drop-shadow-[0_0_30px_rgba(57,255,20,0.3)] border border-primary/20 rounded-lg p-2 bg-background/50 backdrop-blur-sm"
              />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-8 text-center space-y-2 bg-background/80 px-8 py-4 rounded-full border border-primary/30 backdrop-blur-md"
            >
              <h2 className="text-3xl md:text-5xl font-serif text-neon">
                {currentFoto.nomeVisitante || "Cientista Anônimo"}
              </h2>
              <p className="font-mono text-lg text-muted-foreground uppercase tracking-widest">
                Expedição: {currentFoto.miniGame}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button onClick={() => setLocation("/")} className="absolute bottom-8 right-8 z-50 opacity-0 group-hover:opacity-30 hover:!opacity-100 transition-opacity font-mono text-xs text-primary px-4 py-2 border border-primary rounded-md">
        Sair do Telão
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full z-20">
        <motion.div 
          key={currentFoto.id}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: intervalSecs, ease: "linear" }}
          className="h-full bg-primary shadow-[0_0_10px_rgba(57,255,20,0.8)]"
        />
      </div>
    </div>
  );
}
