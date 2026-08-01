import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { useGetCacaPalavras } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 12;

function generateGrid(words: string[]) {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  const uppercaseWords = words.map(w => w.toUpperCase().replace(/[^A-Z]/g, ''));
  
  // Basic placement logic
  const dirs = [[0, 1], [1, 0], [1, 1]]; // right, down, diagonal
  const placedWords: { word: string, cells: number[][] }[] = [];

  for (const word of uppercaseWords) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);
      
      const cells: number[][] = [];
      let canPlace = true;
      
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dir[0] * i;
        const c = startCol + dir[1] * i;
        
        if (r >= GRID_SIZE || c >= GRID_SIZE || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
          canPlace = false;
          break;
        }
        cells.push([r, c]);
      }
      
      if (canPlace) {
        cells.forEach(([r, c], i) => {
          grid[r][c] = word[i];
        });
        placedWords.push({ word, cells });
        placed = true;
      }
      attempts++;
    }
  }

  // Fill empty cells
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, placedWords };
}

export default function CacaPalavras() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [_, setLocation] = useLocation();
  const { data: config, isLoading, isError } = useGetCacaPalavras({
    query: { refetchOnWindowFocus: false }
  });

  const words = useMemo(() => config?.palavras || [], [config]);
  
  const [gridData, setGridData] = useState<{grid: string[][], placedWords: any[]}>({ grid: [], placedWords: [] });
  const [selectedCells, setSelectedCells] = useState<number[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (words.length > 0) {
      setGridData(generateGrid(words));
    }
  }, [words]);

  const handlePointerDown = (r: number, c: number) => {
    setIsDragging(true);
    setSelectedCells([[r, c]]);
};

  const updateSelection = (r: number, c: number) => {
  if (!isDragging || selectedCells.length === 0) return;

  const start = selectedCells[0];
  const end = [r, c];

  const dr = end[0] - start[0];
  const dc = end[1] - start[1];

  const dist = Math.max(Math.abs(dr), Math.abs(dc));

  if (dist === 0) return;

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return;

  const cells = [];

  for (let i = 0; i <= dist; i++) {
    cells.push([
      start[0] + stepR * i,
      start[1] + stepC * i,
    ]);
  }

  setSelectedCells(cells);
};

const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
  if (!isDragging) return;

  const element = document.elementFromPoint(
    e.clientX,
    e.clientY
  ) as HTMLElement | null;

  if (!element) return;

  const row = element.dataset.row;
  const col = element.dataset.col;

  if (row === undefined || col === undefined) return;

  updateSelection(Number(row), Number(col));
};
  const handlePointerUp = () => {
    setIsDragging(false);
    
    // Check if selection matches any word
    const selectedWord1 = selectedCells.map(([r, c]) => gridData.grid[r][c]).join('');
    const selectedWord2 = [...selectedCells].reverse().map(([r, c]) => gridData.grid[r][c]).join('');
    
    const matched = gridData.placedWords.find(pw => 
      (pw.word === selectedWord1 || pw.word === selectedWord2) && 
      !foundWords.includes(pw.word)
    );
    
    if (matched) {
      const newFound = [...foundWords, matched.word];
      setFoundWords(newFound);
      
      if (newFound.length === gridData.placedWords.length) {
        setTimeout(() => setLocation("/conclusao?game=cacapalavras"), 1500);
      }
    }
    
    setSelectedCells([]);
  };

  if (isLoading) {
    return <PublicLayout><div className="flex-1 flex justify-center items-center"><div className="animate-pulse-neon w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div></PublicLayout>;
  }

  if (isError || words.length === 0) {
    return <PublicLayout><div className="flex-1 flex flex-col items-center justify-center space-y-4 text-destructive">Erro ao carregar palavras. <Button onClick={() => setLocation("/")}>Voltar</Button></div></PublicLayout>;
  }

  const isCellSelected = (r: number, c: number) => {
    return selectedCells.some(([sr, sc]) => sr === r && sc === c);
  };

  const isCellFound = (r: number, c: number) => {
    for (const pw of gridData.placedWords) {
      if (foundWords.includes(pw.word)) {
        if (pw.cells.some(([cr, cc]: number[]) => cr === r && cc === c)) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <PublicLayout>
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 pt-8" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        
        <div className="flex-1 bg-card border border-border p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div
    ref={gridRef}
    onPointerMove={handlePointerMove}
    className="grid gap-1 touch-none"
            style={{
    touchAction: "none",
    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0,1fr))`
}}
          >
            {gridData.grid.map((row, r) => 
              row.map((letter, c) => {
                const selected = isCellSelected(r, c);
                const found = isCellFound(r, c);
                
                let bgClass = "bg-background border-border hover:bg-secondary";
                if (found) bgClass = "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(57,255,20,0.3)]";
                else if (selected) bgClass = "bg-primary text-primary-foreground";
                
                return (
                  <div
                    key={`${r}-${c}`}
                    onPointerDown={() => handlePointerDown(r, c)}
                    data-row={r}
                    data-col={c}
                    className={`aspect-square flex items-center justify-center font-mono font-bold text-lg md:text-xl cursor-pointer border rounded-sm transition-colors duration-150 select-none ${bgClass}`}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="w-full md:w-64 flex flex-col space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-serif text-xl text-primary uppercase tracking-widest mb-4">Termos</h3>
            <ul className="space-y-2 font-mono text-sm">
              {gridData.placedWords.map(pw => {
                const isFound = foundWords.includes(pw.word);
                return (
                  <li key={pw.word} className={`flex items-center gap-2 ${isFound ? "text-primary line-through opacity-70" : "text-foreground"}`}>
                    <div className={`w-2 h-2 rounded-full ${isFound ? "bg-primary" : "bg-muted"}`} />
                    {pw.word}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
