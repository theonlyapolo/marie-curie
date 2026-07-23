import { useState } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Brain, Puzzle, Dna, FileSearch, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [_, setLocation] = useLocation();

  const games = [
    { id: "quiz", name: "Quiz Científico", icon: Brain, desc: "Teste seus conhecimentos", path: "/game/quiz" },
    { id: "memoria", name: "Jogo da Memória", icon: Dna, desc: "Elementos e símbolos", path: "/game/memoria" },
    { id: "quebracabeca", name: "Quebra-Cabeça", icon: Puzzle, desc: "Reconstrua a história", path: "/game/quebracabeca" },
    { id: "cacapalavras", name: "Caça-Palavras", icon: FileSearch, desc: "Encontre os termos", path: "/game/cacapalavras" },
    { id: "laboratorio", name: "Laboratório", icon: FlaskConical, desc: "Misture elementos", path: "/game/laboratorio" },
  ];

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[50px] rounded-full" />
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground text-neon relative z-10 uppercase tracking-widest">
            Exposição
            <br />
            <span className="text-primary text-6xl md:text-8xl">Marie Curie</span>
          </h1>
          <p className="text-lg md:text-xl font-mono text-muted-foreground max-w-2xl mx-auto uppercase tracking-widest">
            Descubra a luz invisível que mudou a ciência
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <button
                onClick={() => setLocation(game.path)}
                data-testid={`btn-game-${game.id}`}
                className="w-full group bg-card hover:bg-secondary border border-border hover:border-primary/50 rounded-lg p-6 flex flex-col items-center text-center space-y-4 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <game.icon className="w-12 h-12 text-primary group-hover:animate-pulse-neon" />
                <div>
                  <h2 className="text-xl font-serif font-bold text-foreground">{game.name}</h2>
                  <p className="text-sm font-mono text-muted-foreground mt-1">{game.desc}</p>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PublicLayout>
  );
}
