import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListCuriosidades, useCreateCuriosidade, useUpdateCuriosidade, useDeleteCuriosidade, getListCuriosidadesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function CuriosidadesAdmin() {
  const queryClient = useQueryClient();
  const { data: curiosidades, isLoading } = useListCuriosidades();
  
  const createMut = useCreateCuriosidade();
  const updateMut = useUpdateCuriosidade();
  const deleteMut = useDeleteCuriosidade();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [texto, setTexto] = useState("");

  const handleOpenNew = () => {
    setEditingId(null);
    setTexto("");
    setIsOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setTexto(c.texto);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!texto) {
      toast({ title: "O texto não pode ser vazio", variant: "destructive" });
      return;
    }
    
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListCuriosidadesQueryKey() });
      setIsOpen(false);
      toast({ title: "Curiosidade salva" });
    };

    if (editingId) {
      updateMut.mutate({ id: editingId, data: { texto } }, { onSuccess });
    } else {
      createMut.mutate({ data: { texto } }, { onSuccess });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Excluir esta curiosidade?")) {
      deleteMut.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCuriosidadesQueryKey() });
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
            <h2 className="text-3xl font-serif text-primary uppercase tracking-widest">Curiosidades</h2>
            <p className="text-muted-foreground font-mono mt-1">Exibidas na tela de conclusão</p>
          </div>
          <Button variant="neon" onClick={handleOpenNew}>
            <Plus className="w-4 h-4 mr-2" /> Nova
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {isLoading && <div className="p-8 text-center text-muted-foreground font-mono">Carregando...</div>}
            
            {curiosidades?.map(c => (
              <div key={c.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-secondary/20 transition-colors">
                <div className="flex gap-4 items-start flex-1">
                  <Sparkles className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <p className="font-serif text-lg leading-relaxed text-foreground">{c.texto}</p>
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
            
            {curiosidades?.length === 0 && !isLoading && (
              <div className="p-8 text-center text-muted-foreground font-mono">Nenhuma curiosidade cadastrada.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Curiosidade" : "Nova Curiosidade"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Texto da Curiosidade</Label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-serif text-base"
                value={texto} 
                onChange={e => setTexto(e.target.value)} 
                placeholder="Sabia que..."
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
