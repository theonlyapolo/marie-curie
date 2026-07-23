import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetCacaPalavras, useUpdateCacaPalavras, getGetCacaPalavrasQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function CacaPalavrasAdmin() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useGetCacaPalavras();
  const updateMut = useUpdateCacaPalavras();

  const [palavrasStr, setPalavrasStr] = useState("");

  useEffect(() => {
    if (config?.palavras) {
      setPalavrasStr(config.palavras.join(", "));
    }
  }, [config]);

  const handleSave = () => {
    const list = palavrasStr.split(",").map(p => p.trim().toUpperCase()).filter(p => p.length > 0);
    
    if (list.length === 0) {
      toast({ title: "Adicione pelo menos uma palavra", variant: "destructive" });
      return;
    }
    
    if (list.length > 7) {
      toast({ title: "Máximo de 7 palavras permitidas", variant: "destructive" });
      return;
    }

    if (list.some(p => p.length > 12)) {
      toast({ title: "As palavras podem ter no máximo 12 letras", variant: "destructive" });
      return;
    }

    updateMut.mutate({ data: { palavras: list } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCacaPalavrasQueryKey() });
        toast({ title: "Palavras salvas com sucesso" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-serif text-primary uppercase tracking-widest">Caça-Palavras</h2>
            <p className="text-muted-foreground font-mono mt-1">Configuração das palavras do jogo</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Palavras Ocultas</CardTitle>
            <CardDescription className="font-mono text-xs">Insira até 7 palavras separadas por vírgula. Apenas letras (sem acentos ou espaços).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-secondary rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Lista de Palavras</Label>
                  <Input 
                    value={palavrasStr} 
                    onChange={e => setPalavrasStr(e.target.value.replace(/[^a-zA-Z, ]/g, ''))}
                    placeholder="RADIO, POLONIO, URANIO, CURIE..."
                    className="font-mono text-base"
                  />
                </div>
                
                <div className="p-4 bg-secondary/30 border border-border rounded-lg">
                  <h4 className="font-mono text-sm text-primary mb-2 uppercase">Palavras detectadas ({palavrasStr.split(",").filter(p => p.trim().length > 0).length}/7):</h4>
                  <div className="flex flex-wrap gap-2">
                    {palavrasStr.split(",").map(p => p.trim()).filter(p => p.length > 0).map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/20 text-primary border border-primary/50 rounded font-mono text-sm uppercase">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <Button variant="neon" onClick={handleSave} disabled={updateMut.isPending}>
                  {updateMut.isPending ? "Salvando..." : "Salvar Configuração"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
