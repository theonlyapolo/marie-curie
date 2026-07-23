import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListQuizPerguntasTodas, useCreateQuizPergunta, useUpdateQuizPergunta, useDeleteQuizPergunta, getListQuizPerguntasTodasQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function QuizAdmin() {
  const queryClient = useQueryClient();
  const { data: perguntas, isLoading } = useListQuizPerguntasTodas();
  
  const createQ = useCreateQuizPergunta();
  const updateQ = useUpdateQuizPergunta();
  const deleteQ = useDeleteQuizPergunta();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [pergunta, setPergunta] = useState("");
  const [alt0, setAlt0] = useState("");
  const [alt1, setAlt1] = useState("");
  const [alt2, setAlt2] = useState("");
  const [alt3, setAlt3] = useState("");
  const [correta, setCorreta] = useState<number>(0);

  const handleOpenNew = () => {
    setEditingId(null);
    setPergunta("");
    setAlt0(""); setAlt1(""); setAlt2(""); setAlt3("");
    setCorreta(0);
    setIsOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingId(p.id);
    setPergunta(p.pergunta);
    setAlt0(p.alternativas[0] || "");
    setAlt1(p.alternativas[1] || "");
    setAlt2(p.alternativas[2] || "");
    setAlt3(p.alternativas[3] || "");
    setCorreta(p.respostaCorreta);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!pergunta || !alt0 || !alt1 || !alt2 || !alt3) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    
    const payload = {
      pergunta,
      alternativas: [alt0, alt1, alt2, alt3],
      respostaCorreta: correta
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListQuizPerguntasTodasQueryKey() });
      setIsOpen(false);
      toast({ title: "Salvo com sucesso" });
    };

    if (editingId) {
      updateQ.mutate({ id: editingId, data: payload }, { onSuccess });
    } else {
      createQ.mutate({ data: payload }, { onSuccess });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
      deleteQ.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListQuizPerguntasTodasQueryKey() });
          toast({ title: "Excluído com sucesso" });
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-serif text-primary uppercase tracking-widest">Banco do Quiz</h2>
            <p className="text-muted-foreground font-mono mt-1">Gerencie as perguntas do mini-game</p>
          </div>
          <Button variant="neon" onClick={handleOpenNew}>
            <Plus className="w-4 h-4 mr-2" /> Nova Pergunta
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {isLoading && <div className="p-8 text-center text-muted-foreground font-mono">Carregando...</div>}
            
            {perguntas?.map(p => (
              <div key={p.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-secondary/20 transition-colors">
                <div className="space-y-2 flex-1">
                  <h3 className="font-serif text-lg">{p.pergunta}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono text-muted-foreground">
                    {p.alternativas.map((alt: string, i: number) => (
                      <div key={i} className={`px-2 py-1 rounded border ${p.respostaCorreta === i ? 'bg-primary/10 border-primary/50 text-primary' : 'border-border'}`}>
                        {String.fromCharCode(65 + i)}) {alt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {perguntas?.length === 0 && !isLoading && (
              <div className="p-8 text-center text-muted-foreground font-mono">Nenhuma pergunta cadastrada.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Pergunta" : "Nova Pergunta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Enunciado</Label>
              <Input value={pergunta} onChange={e => setPergunta(e.target.value)} />
            </div>
            
            <div className="space-y-4">
              <Label>Alternativas (Selecione a correta)</Label>
              {[
                { val: alt0, set: setAlt0 },
                { val: alt1, set: setAlt1 },
                { val: alt2, set: setAlt2 },
                { val: alt3, set: setAlt3 }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="correta" 
                    checked={correta === i}
                    onChange={() => setCorreta(i)}
                    className="w-4 h-4 text-primary bg-background border-border accent-primary"
                  />
                  <span className="font-mono text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                  <Input value={item.val} onChange={e => item.set(e.target.value)} className={correta === i ? "border-primary/50 bg-primary/5" : ""} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button variant="neon" onClick={handleSave} disabled={createQ.isPending || updateQ.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
