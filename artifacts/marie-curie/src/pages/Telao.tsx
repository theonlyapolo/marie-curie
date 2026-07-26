import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useListFotosAprovadas, useGetConfig } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical } from "lucide-react";

export default function Telao() {
  const [_, setLocation] = useLocation();
  const { data: config } = useGetConfig();
  const { data: fotos } = useListFotosAprovadas({
    query: { refetchInterval: 30000 },
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
        <button onClick={() => setLocation("/")} className="absolute bottom-8 right-8 opacity-10 hover:opacity-100 transition-opacity font-mono text-xs text-primary">
          Sair do Telão
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden relative flex flex-col items-center justify-between py-10 px-8 group">

      {/* Ambient glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[70vw] h-[70vh] bg-primary/10 rounded-full blur-[160px]" />
      </div>

      {/* Topo: título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-center"
      >
        <p className="font-mono text-primary/60 uppercase tracking-[0.3em] text-sm mb-1">
          Curie Lab: Onde a Ciência Ganha Vida
        </p>
        <h1 className="font-serif text-neon text-4xl md:text-5xl lg:text-6xl uppercase tracking-widest">
          Mulheres na Ciência
        </h1>
      </motion.div>

      {/* Centro: foto + nome + expedição */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFoto.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="z-10 flex flex-col items-center gap-6 flex-1 justify-center w-full"
        >
          {/* Foto */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-xl" />
            <img
              src={currentFoto.urlImagem}
              alt={currentFoto.nomeVisitante || "Visitante"}
              className="relative max-h-[52vh] max-w-[80vw] object-contain rounded-2xl border border-primary/30 shadow-[0_0_40px_rgba(57,255,20,0.15)]"
            />
          </div>

          {/* Nome e expedição */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-serif text-neon text-3xl md:text-4xl lg:text-5xl">
              {currentFoto.nomeVisitante || "Cientista Anônimo"}
            </h2>
            <p className="font-mono text-primary/60 uppercase tracking-[0.25em] text-sm mt-2">
              Expedição: {currentFoto.miniGame}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Rodapé: citação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="z-10 text-center"
      >
        <p className="font-serif text-foreground/50 italic text-xl md:text-2xl tracking-wide">
          "A ciência pertence a todos."
        </p>
      </motion.div>

      {/* Barra de progresso */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-primary/10 w-full z-20">
        <motion.div
          key={currentFoto.id}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: intervalSecs, ease: "linear" }}
          className="h-full bg-primary shadow-[0_0_8px_rgba(57,255,20,0.8)]"
        />
      </div>

      {/* Botão oculto de saída */}
      <button
        onClick={() => setLocation("/")}
        className="absolute bottom-8 right-8 z-50 opacity-0 group-hover:opacity-30 hover:!opacity-100 transition-opacity font-mono text-xs text-primary px-4 py-2 border border-primary/40 rounded-md"
      >
        Sair do Telão
      </button>
    </div>
  );
}
