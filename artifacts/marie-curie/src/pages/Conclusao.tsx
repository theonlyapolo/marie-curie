import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetCuriosidadeAleatoria, useRegistrarStat } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";

export default function Conclusao() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const game = searchParams.get("game") || "desconhecido";

  const { data: curiosidade, isLoading } = useGetCuriosidadeAleatoria({
    query: {
      refetchOnWindowFocus: false,
    }
  });

  const registrar = useRegistrarStat();

  useEffect(() => {
    if (game !== "desconhecido") {
      registrar.mutate({ data: { miniGame: game } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-10 max-w-2xl mx-auto w-full text-center">
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
          <h1 className="text-5xl font-serif text-neon uppercase tracking-widest relative z-10">
            Concluído
          </h1>
          <p className="text-muted-foreground font-mono mt-4">
            Dados coletados com sucesso.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <Card className="bg-card/50 backdrop-blur border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <CardContent className="p-8 flex flex-col items-center">
              <Sparkles className="w-10 h-10 text-primary mb-6 animate-pulse-neon" />
              <h2 className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-4">Registro Científico</h2>
              
              {isLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <p className="text-lg md:text-xl font-serif text-foreground leading-relaxed">
                  "{curiosidade?.texto || "Marie Curie foi a primeira pessoa e a única mulher a ganhar o Prêmio Nobel duas vezes."}"
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => setLocation("/")}
            className="w-full sm:w-auto"
            data-testid="btn-voltar-jogar"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Voltar ao Menu
          </Button>
          <Button 
            variant="neon" 
            size="lg" 
            onClick={() => setLocation(`/galeria?game=${game}`)}
            className="w-full sm:w-auto"
            data-testid="btn-galeria"
          >
            Continuar para Galeria
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

      </div>
    </PublicLayout>
  );
}
