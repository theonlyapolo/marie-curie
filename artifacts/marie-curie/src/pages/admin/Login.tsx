import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useLogin, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { data: user, isLoading: isLoadingMe } = useGetMe({
    query: {
      retry: false,
    }
  });

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({ title: "Erro de autenticação", description: "Usuário ou senha inválidos.", variant: "destructive" });
      }
    }
  });

  const redirected = useRef(false);
  useEffect(() => {
    if (!isLoadingMe && user && !redirected.current) {
      redirected.current = true;
      setLocation("/admin/dashboard");
    }
  }, [isLoadingMe, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { usuario, senha } });
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none rounded-full w-1/2 h-1/2 top-1/4 left-1/4" />
      
      <div className="mb-8 flex flex-col items-center text-center z-10">
        <FlaskConical className="w-16 h-16 text-primary mb-4 animate-pulse-neon" />
        <h1 className="text-3xl font-serif text-neon uppercase tracking-widest">Acesso Restrito</h1>
        <p className="text-muted-foreground font-mono mt-2 text-sm">Painel de Controle da Exposição</p>
      </div>

      <Card className="w-full max-w-md z-10 border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="usuario">Identificação do Pesquisador</Label>
              <Input 
                id="usuario" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)} 
                required 
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Código de Acesso</Label>
              <Input 
                id="senha" 
                type="password" 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                required 
                className="bg-background"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="neon" 
              disabled={loginMutation.isPending}
              data-testid="btn-login"
            >
              {loginMutation.isPending ? "Verificando..." : "Acessar Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Button variant="ghost" className="mt-8 z-10 text-muted-foreground" onClick={() => setLocation("/")}>
        Voltar à Exposição
      </Button>
    </div>
  );
}
