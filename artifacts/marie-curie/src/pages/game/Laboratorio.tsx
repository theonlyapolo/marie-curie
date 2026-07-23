import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useListLabCombinacoes } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, MoveDown, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Laboratorio() {
  const [location, setLocation] = useLocation();
  const { data: combinacoes, isLoading } = useListLabCombinacoes({
    query: { refetchOnWindowFocus: false }
  });

  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  const elements = useMemo(() => {
    if (!combinacoes) return [];
    const els = new Set<string>();
    combinacoes.forEach(c => {
      els.add(c.elemento1);
      els.add(c.elemento2);
    });
    return Array.from(els);
  }, [combinacoes]);

  const handleElementClick = (el: string) => {
    if (result) return; // Wait until result is dismissed
    
    if (selectedElements.includes(el)) {
      setSelectedElements(prev => prev.filter(e => e !== el));
    } else if (selectedElements.length < 2) {
      const newSelection = [...selectedElements, el];
      setSelectedElements(newSelection);
      
      if (newSelection.length === 2) {
        checkCombination(newSelection[0], newSelection[1]);
      }
    }
  };

  const checkCombination = (e1: string, e2: string) => {
    if (!combinacoes) return;
    
    const combo = combinacoes.find(c => 
      (c.elemento1 === e1 && c.elemento2 === e2) ||
      (c.elemento1 === e2 && c.elemento2 === e1)
    );

    setTimeout(() => {
      if (combo) {
        setResult(combo);
        if (combo.tipo === "correta" || combo.tipo === "explosao") {
          setSuccessCount(s => s + 1);
        }
      } else {
        setResult({
          tipo: "nenhuma",
          resultado: "Mistura Inerte",
          explicacao: "Estes elementos não reagem entre si nestas condições."
        });
      }
    }, 800);
  };

  const resetMix = () => {
    setSelectedElements([]);
    setResult(null);
    if (successCount >= 3) {
      setLocation("/conclusao?game=laboratorio");
    }
  };

  if (isLoading) {
    return <PublicLayout><div className="flex-1 flex justify-center items-center"><div className="animate-pulse-neon w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div></PublicLayout>;
  }

  return (
    <PublicLayout>
      <div className="w-full max-w-4xl mx-auto flex flex-col pt-8 space-y-12">
        
        <div className="flex justify-between items-center text-primary font-mono uppercase text-sm">
          <span>Experimentos: {successCount}/3</span>
          {successCount >= 3 && (
            <Button variant="neon" size="sm" onClick={() => setLocation("/conclusao?game=laboratorio")}>
              Concluir <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Reaction Area */}
        <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-transparent pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="mixing"
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-8 z-10"
              >
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 border-dashed ${selectedElements[0] ? 'border-primary bg-primary/10' : 'border-muted text-muted-foreground'}`}>
                  {selectedElements[0] ? (
                    <span className="font-mono text-xl text-primary text-center px-2">{selectedElements[0]}</span>
                  ) : <FlaskConical className="w-8 h-8 opacity-50" />}
                </div>
                
                <span className="text-4xl text-muted-foreground font-serif">+</span>
                
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 border-dashed ${selectedElements[1] ? 'border-primary bg-primary/10' : 'border-muted text-muted-foreground'}`}>
                  {selectedElements[1] ? (
                    <span className="font-mono text-xl text-primary text-center px-2">{selectedElements[1]}</span>
                  ) : <FlaskConical className="w-8 h-8 opacity-50" />}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center z-10 text-center space-y-6 max-w-lg"
              >
                {result.tipo === "explosao" && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 0] }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-destructive/30 rounded-full blur-[50px] -z-10"
                  />
                )}
                
                <div className={`p-6 rounded-full border-4 ${result.tipo === 'correta' ? 'border-primary text-primary' : result.tipo === 'explosao' ? 'border-destructive text-destructive' : 'border-muted text-muted-foreground'}`}>
                  {result.tipo === 'correta' && <FlaskConical className="w-12 h-12 animate-pulse-neon" />}
                  {result.tipo === 'explosao' && <Search className="w-12 h-12 animate-bounce" />}
                  {result.tipo === 'nenhuma' && <MoveDown className="w-12 h-12" />}
                </div>

                <div>
                  <h3 className={`text-2xl md:text-3xl font-serif uppercase tracking-wider mb-2 ${result.tipo === 'explosao' ? 'text-destructive text-shadow-sm' : 'text-foreground'}`}>
                    {result.resultado}
                  </h3>
                  <p className="font-mono text-muted-foreground">
                    {result.explicacao}
                  </p>
                </div>

                <Button variant={result.tipo === 'nenhuma' ? "outline" : "neon"} onClick={resetMix} className="mt-4">
                  Nova Mistura
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Elements Shelf */}
        <div className="flex flex-col space-y-4">
          <h3 className="font-mono text-sm text-primary uppercase tracking-widest text-center">Bancada de Elementos</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {elements.map((el) => (
              <button
                key={el}
                disabled={!!result}
                onClick={() => handleElementClick(el)}
                className={`px-4 py-3 rounded-lg border font-mono text-sm md:text-base transition-all duration-300 ${
                  selectedElements.includes(el) 
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(57,255,20,0.5)]" 
                    : "border-border bg-card hover:border-primary/50 text-foreground"
                } ${result ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
