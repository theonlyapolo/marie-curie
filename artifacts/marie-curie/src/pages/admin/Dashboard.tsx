import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListStats, useListFotos, useUpdateFoto, useDeleteFoto, getListFotosQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Check, X, Trash2, Camera, Gamepad2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: stats } = useListStats({ query: { refetchInterval: 30000 } });
  
  // Fetch pending photos
  const { data: pendentes } = useListFotos({ status: "pendente" }, { query: { refetchInterval: 15000 } });
  
  const updateFoto = useUpdateFoto({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status atualizado" });
        queryClient.invalidateQueries({ queryKey: getListFotosQueryKey({ status: "pendente" }) });
        queryClient.invalidateQueries({ queryKey: getListFotosQueryKey({ status: "aprovada" }) });
      }
    }
  });

  const deleteFoto = useDeleteFoto({
    mutation: {
      onSuccess: () => {
        toast({ title: "Foto excluída" });
        queryClient.invalidateQueries({ queryKey: getListFotosQueryKey({ status: "pendente" }) });
      }
    }
  });

  const handleUpdateStatus = (id: number, status: 'aprovada' | 'rejeitada') => {
    updateFoto.mutate({ id, data: { status } });
  };

  const chartData = stats?.porGame.map(s => ({
    name: s.miniGame,
    total: s.total
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        <div>
          <h2 className="text-3xl font-serif text-primary uppercase tracking-widest">Dashboard</h2>
          <p className="text-muted-foreground font-mono mt-1">Estatísticas e moderação em tempo real</p>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-primary" /> Jogadas Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-foreground">{stats?.totalJogadas || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" /> Fotos Recebidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-foreground">{stats?.fotosTotal || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/50 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-primary uppercase">Pendentes de Revisão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-neon">{stats?.fotosPendentes || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase">Aprovadas no Telão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-foreground">{stats?.fotosAprovadas || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Engajamento por Mini-Game</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#666" tick={{fontFamily: "Space Mono", fontSize: 12}} />
                      <YAxis stroke="#666" tick={{fontFamily: "Space Mono", fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                        cursor={{fill: 'hsl(var(--secondary))'}}
                      />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground font-mono">
                    Sem dados suficientes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Moderation Queue */}
          <Card className="col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle>Fila de Moderação</CardTitle>
              <CardDescription>Fotos aguardando aprovação</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[400px] space-y-4">
              {pendentes && pendentes.length > 0 ? (
                pendentes.map(foto => (
                  <div key={foto.id} className="bg-secondary/50 rounded-lg p-3 border border-border flex flex-col gap-3">
                    <div className="aspect-video w-full bg-black rounded-md overflow-hidden relative">
                      <img src={foto.urlImagem} alt="Pendente" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-muted-foreground truncate">{foto.nomeVisitante || 'Anônimo'}</span>
                      <span className="text-primary/70 uppercase">{foto.miniGame}</span>
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button size="sm" variant="neon" className="flex-1" onClick={() => handleUpdateStatus(foto.id, 'aprovada')} disabled={updateFoto.isPending}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleUpdateStatus(foto.id, 'rejeitada')} disabled={updateFoto.isPending}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => deleteFoto.mutate({ id: foto.id })} disabled={deleteFoto.isPending}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground font-mono text-center">
                  Nenhuma foto na fila de moderação.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </AdminLayout>
  );
}
