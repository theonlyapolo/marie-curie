import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion, AnimatePresence } from "framer-motion";
import portraitImg from "@assets/generated_images/marie_curie_portrait.png";

const GRID_SIZE = 4;
const NUM_PIECES = GRID_SIZE * GRID_SIZE;

export default function QuebraCabeca() {
  const [_, setLocation] = useLocation();
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    // Generate shuffled pieces
    const initialPieces = Array.from({ length: NUM_PIECES }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = initialPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialPieces[i], initialPieces[j]] = [initialPieces[j], initialPieces[i]];
    }
    setPieces(initialPieces);
  }, []);

  const handlePieceClick = (index: number) => {
    if (isWinner) return;

    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else {
      if (selectedPiece === index) {
        setSelectedPiece(null);
        return;
      }

      // Swap pieces
      const newPieces = [...pieces];
      [newPieces[selectedPiece], newPieces[index]] = [newPieces[index], newPieces[selectedPiece]];
      setPieces(newPieces);
      setSelectedPiece(null);
      setMoves(m => m + 1);

      // Check win
      if (newPieces.every((p, i) => p === i)) {
        setIsWinner(true);
        setTimeout(() => setLocation("/conclusao?game=quebracabeca"), 3000);
      }
    }
  };

  return (
    <PublicLayout>
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center pt-8">
        <div className="w-full flex justify-between items-center mb-8 font-mono text-primary uppercase">
          <h2 className="text-xl">Reconstrua a Imagem</h2>
          <span>Movimentos: {moves}</span>
        </div>

        <div className="relative w-full aspect-square max-w-[500px] bg-card border-2 border-primary/20 rounded-lg p-2 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
          <AnimatePresence>
            {isWinner && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg border border-primary p-6 text-center"
              >
                <h3 className="text-4xl font-serif text-neon mb-4 uppercase">Brilhante!</h3>
                <p className="font-mono text-muted-foreground">Você revelou o retrato histórico.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            className="w-full h-full grid gap-1 relative"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
            }}
          >
            {pieces.map((pieceVal, idx) => {
              const bgX = (pieceVal % GRID_SIZE) * (100 / (GRID_SIZE - 1));
              const bgY = Math.floor(pieceVal / GRID_SIZE) * (100 / (GRID_SIZE - 1));
              const isSelected = selectedPiece === idx;

              return (
                <motion.div
                  key={pieceVal}
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={() => handlePieceClick(idx)}
                  className={`relative cursor-pointer overflow-hidden rounded-sm transition-shadow ${
                    isSelected ? "ring-2 ring-primary shadow-[0_0_15px_rgba(57,255,20,0.8)] z-10" : "hover:ring-1 hover:ring-primary/50"
                  }`}
                  style={{
                    backgroundImage: `url(${portraitImg})`,
                    backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                    backgroundPosition: `${bgX}% ${bgY}%`
                  }}
                >
                  {/* Subtle overlay to make it look like a puzzle piece */}
                  <div className={`absolute inset-0 border transition-colors ${
                    isWinner ? "border-transparent" : "border-background/20"
                  }`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
