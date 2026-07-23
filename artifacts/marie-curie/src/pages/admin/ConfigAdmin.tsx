import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetConfig, useUpdateConfig, getGetConfigQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ConfigAdmin() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useGetConfig();
  const updateMut = useUpdateConfig();

  const [intervalo, setIntervalo] = useState<number>(5);
  const [aprovacaoAutomatica, setAprovacaoAutomatica] = useState<boolean>(false);

  useEffect(() => {
    if (config) {
      setIntervalo(config.intervaloCarrossel);
      setAprovacaoAutomatica(config.aprovacaoAutomatica);
    }
  }, [config]);

  const handleSave = () => {
    updateMut.mutate({ data: { intervaloCarrossel: Number(intervalo), aprovacaoAutomatica } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConfigQueryKey() });
        toast({ title: "Configurações atualizadas com sucesso" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-serif text-primary uppercase tracking-widest">Configurações</h2>
            <p className="text-muted-foreground font-mono mt-1">Ajustes gerais do sistema</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exibição e Moderação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-secondary rounded w-1/4"></div>
                <div className="h-10 bg-secondary rounded w-full"></div>
              </div>
            ) : (
              <div className="space-y-8">
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="intervalo">Intervalo do Telão (segundos)</Label>
                    <CardDescription>Tempo que cada foto é exibida no carrossel da galeria pública.</CardDescription>
                  </div>
                  <Input 
                    id="intervalo"
                    type="number"
                    min={1}
                    max={60}
                    value={intervalo} 
                    onChange={e => setIntervalo(Number(e.target.value))}
                    className="max-w-[200px] font-mono text-base"
                  />
                </div>
                
                <div className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-secondary/20">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Aprovação Automática</Label>
                    <CardDescription>
                      Se ativado, fotos enviadas vão direto para o telão sem moderação.
                    </CardDescription>
                  </div>
                  <Switch
                    checked={aprovacaoAutomatica}
                    onCheckedChange={setAprovacaoAutomatica}
                  />
                </div>

                <Button variant="neon" onClick={handleSave} disabled={updateMut.isPending}>
                  {updateMut.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
