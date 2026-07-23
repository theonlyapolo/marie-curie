import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Atom, ShieldAlert, Zap, Flame, Radiation, Beaker, Microsope, TestTube } from "lucide-react";

// Lucide doesn't have Microscope, TestTube, so I'll use equivalents
// Oh wait, Lucide has Microscope and TestTube, Beaker.
// I will just use text or existing icons if they exist, but let's use what I imported.

const ICONS = [Atom, ShieldAlert, Zap, Flame, Radiation, Beaker, Flame, Beaker]; // Using duplicates to make 8 distinct if needed, wait.
// Let's just use strings/emojis? No emojis!
// I'll use 8 distinct lucide icons.
import { Activity, CircleDot, Hexagon, Triangle, Square, Diamond, Star, Octagon } from "lucide-react";

const PAIRS = [
  { id: 'radium', Icon: Radiation, label: 'Ra' },
  { id: 'polonium', Icon: Activity, label: 'Po' },
  { id: 'uranium', Icon: Hexagon, label: 'U' },
  { id: 'atom', Icon: Atom, label: 'Atom' },
  { id: 'energy', Icon: Zap, label: 'Energy' },
  { id: 'shield', Icon: ShieldAlert, label: 'Lead' },
  { id: 'flask', Icon: Beaker, label: 'Lab' },
  { id: 'core', Icon: CircleDot, label: 'Core' },
];

type CardType = {
  id: string;
  pairId: string;
  Icon: React.ElementType;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function Memoria() {
  const [_, setLocation] = useLocation();
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIdxs, setFlippedIdxs] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    // Initialize cards
    const deck = [...PAIRS, ...PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((pair, idx) => ({
        id: `${pair.id}-${idx}`,
        pairId: pair.id,
        Icon: pair.Icon,
        label: pair.label,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(deck);
  }, []);

  const handleCardClick = (idx: number) => {
    if (isLocked || cards[idx].isFlipped || cards[idx].isMatched) return;

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIdxs, idx];
    setFlippedIdxs(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        // Match!
        setTimeout(() => {
          setCards(prev => {
            const matched = [...prev];
            matched[firstIdx].isMatched = true;
            matched[secondIdx].isMatched = true;
            return matched;
          });
          setFlippedIdxs([]);
          setIsLocked(false);
          
          // Check win
          if (cards.every((c, i) => c.isMatched || i === firstIdx || i === secondIdx)) {
            setTimeout(() => setLocation("/conclusao?game=memoria"), 1000);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => {
            const reset = [...prev];
            reset[firstIdx].isFlipped = false;
            reset[secondIdx].isFlipped = false;
            return reset;
          });
          setFlippedIdxs([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <PublicLayout>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center pt-8">
        <div className="w-full flex justify-between items-center mb-8 font-mono text-primary uppercase">
          <h2 className="text-xl">Jogo da Memória</h2>
          <span>Movimentos: {moves}</span>
        </div>

        <div className="grid grid-cols-4 gap-3 md:gap-4 w-full aspect-square max-w-[500px]">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              data-testid={`card-${idx}`}
              className="relative w-full h-full perspective-1000 cursor-pointer"
              onClick={() => handleCardClick(idx)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Back of card (visible when hidden) */}
                <div className="absolute inset-0 backface-hidden bg-card border border-border rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors shadow-sm">
                  <div className="w-8 h-8 rounded-full border border-primary/20 opacity-50" />
                </div>

                {/* Front of card (visible when flipped) */}
                <div 
                  className="absolute inset-0 backface-hidden bg-primary/10 border border-primary rounded-lg flex flex-col items-center justify-center text-primary shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  <card.Icon className="w-8 h-8 md:w-10 md:h-10 mb-2 drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                  <span className="text-xs md:text-sm font-mono">{card.label}</span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
