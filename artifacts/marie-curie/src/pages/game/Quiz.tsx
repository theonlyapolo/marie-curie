import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useGetQuizPerguntas } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function Quiz() {
  const [location, setLocation] = useLocation();
  const { data: perguntas, isLoading, isError } = useGetQuizPerguntas({
    query: {
      refetchOnWindowFocus: false,
    }
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAlt, setSelectedAlt] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Shuffle alternatives for current question
  const currentQ = perguntas?.[currentIdx];
  
  const shuffledAlts = useMemo(() => {
    if (!currentQ) return [];
    const alts = currentQ.alternativas.map((alt, index) => ({
      text: alt,
      isCorrect: index === currentQ.respostaCorreta,
    }));
    return alts.sort(() => Math.random() - 0.5);
  }, [currentQ]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-neon w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !perguntas || perguntas.length === 0) {
    return (
      <PublicLayout>
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <h2 className="text-xl font-serif text-destructive">Erro ao carregar o quiz.</h2>
          <Button variant="outline" onClick={() => setLocation("/")}>Voltar</Button>
        </div>
      </PublicLayout>
    );
  }

  const handleSelect = (alt: typeof shuffledAlts[0]) => {
    if (showResult) return;
    setSelectedAlt(alt.text);
    setShowResult(true);
    
    if (alt.isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (currentIdx < perguntas.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelectedAlt(null);
        setShowResult(false);
      } else {
        setLocation(`/conclusao?game=quiz&score=${score + (alt.isCorrect ? 1 : 0)}`);
      }
    }, 2000);
  };

  const progress = ((currentIdx) / perguntas.length) * 100;

  return (
    <PublicLayout>
      <div className="w-full max-w-2xl mx-auto flex flex-col pt-10">
        <div className="mb-8 space-y-4">
          <div className="flex justify-between font-mono text-primary text-sm uppercase">
            <span>Questão {currentIdx + 1}/{perguntas.length}</span>
            <span>Acertos: {score}</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col space-y-8"
          >
            <h2 className="text-2xl md:text-4xl font-serif text-foreground text-center">
              {currentQ.pergunta}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {shuffledAlts.map((alt, i) => {
                let btnClass = "border-border hover:border-primary/50 text-foreground bg-card";
                if (showResult) {
                  if (alt.isCorrect) {
                    btnClass = "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(57,255,20,0.5)]";
                  } else if (selectedAlt === alt.text) {
                    btnClass = "border-destructive bg-destructive/20 text-destructive";
                  } else {
                    btnClass = "border-border opacity-50";
                  }
                } else if (selectedAlt === alt.text) {
                  btnClass = "border-primary bg-primary/10 text-primary";
                }

                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => handleSelect(alt)}
                    data-testid={`alt-${i}`}
                    className={`p-4 md:p-6 rounded-lg border text-left font-mono text-sm md:text-base transition-all duration-300 ${btnClass}`}
                  >
                    {alt.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PublicLayout>
  );
}
