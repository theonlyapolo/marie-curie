import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListLabCombinacoes, useCreateLabCombinacao, useUpdateLabCombinacao, useDeleteLabCombinacao, getListLabCombinacoesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Search, MoveDown, FlaskConical } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function LaboratorioAdmin() {
  const queryClient = useQueryClient();
  const { data: combinacoes, isLoading } = useListLabCombinacoes();
  
  const createMut = useCreateLabCombinacao();
  const updateMut = useUpdateLabCombinacao();
  const deleteMut = useDeleteLabCombinacao();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [elemento1, setElemento1] = useState("");
  const [elemento2, setElemento2] = useState("");
  const [resultado, setResult] = useState("");
  const [tipo, setTipo] = useState<"correta" | "nenhuma" | "explosao">("correta");
  const [explicacao, setExplicacao] = useState("");

  const handleOpenNew = () => {
    setEditingId(null);
    setElemento1(""); setElemento2(""); setResult(""); setTipo("correta"); setExplicacao("");
    setIsOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setElemento1(c.elemento1);
    setElemento2(c.elemento2);
    setResult(c.resultado);
    setTipo(c.tipo);
    setExplicacao(c.explicacao);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!elemento1 || !elemento2 || !resultado || !explicacao) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    
    const payload = { elemento1, elemento2, resultado, tipo, explicacao };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListLabCombinacoesQueryKey() });
      setIsOpen(false);
      toast({ title: "Combinação salva" });
    };

    if (editingId) {
      updateMut.mutate({ id: editingId, data: payload }, { onSuccess });
    } else {
      createMut.mutate({ data: payload }, { onSuccess });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Excluir esta combinação?")) {
      deleteMut.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLabCombinacoesQueryKey() });
          toast({ title: "Excluída com sucesso" });
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-serif text-primary uppercase tracking-widest">Laboratório</h2>
            <p className="text-muted-foreground font-mono mt-1">Fórmulas e reações do mini-game</p>
          </div>
          <Button variant="neon" onClick={handleOpenNew}>
            <Plus className="w-4 h-4 mr-2" /> Nova Reação
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {isLoading && <div className="p-8 text-center text-muted-foreground font-mono">Carregando...</div>}
            
            {combinacoes?.map(c => (
              <div key={c.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-secondary/20 transition-colors">
                
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 font-mono text-lg">
                    <span className="px-3 py-1 bg-secondary border border-border rounded">{c.elemento1}</span>
                    <span className="text-muted-foreground">+</span>
                    <span className="px-3 py-1 bg-secondary border border-border rounded">{c.elemento2}</span>
                    <span className="text-primary mx-2">=</span>
                    <span className={`px-3 py-1 rounded border ${c.tipo === 'explosao' ? 'bg-destructive/20 border-destructive/50 text-destructive' : c.tipo === 'correta' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-muted/20 border-muted text-muted-foreground'}`}>
                      {c.resultado}
                    </span>
                  </div>
                </div>

                <div className="flex-1 font-mono text-sm text-muted-foreground border-l border-border pl-4">
                  {c.explicacao}
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(c)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {combinacoes?.length === 0 && !isLoading && (
              <div className="p-8 text-center text-muted-foreground font-mono">Nenhuma combinação cadastrada.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Reação" : "Nova Reação"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Elemento 1</Label>
                <Input value={elemento1} onChange={e => setElemento1(e.target.value)} placeholder="Ex: Urânio" />
              </div>
              <div className="space-y-2">
                <Label>Elemento 2</Label>
                <Input value={elemento2} onChange={e => setElemento2(e.target.value)} placeholder="Ex: Pechblenda" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Resultado</Label>
                <Input value={resultado} onChange={e => setResult(e.target.value)} placeholder="Ex: Rádio (Ra)" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Reação</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                  value={tipo}
                  onChange={(e: any) => setTipo(e.target.value)}
                >
                  <option value="correta">Sucesso (Correta)</option>
                  <option value="explosao">Explosão (Perigosa)</option>
                  <option value="nenhuma">Inerte (Nenhuma)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Explicação Científica</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                value={explicacao} 
                onChange={e => setExplicacao(e.target.value)} 
                placeholder="Por que esta reação ocorre..."
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button variant="neon" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
