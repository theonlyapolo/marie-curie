import { Routes, Route, Switch, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import Quiz from "@/pages/game/Quiz";
import Memoria from "@/pages/game/Memoria";
import QuebraCabeca from "@/pages/game/QuebraCabeca";
import CacaPalavras from "@/pages/game/CacaPalavras";
import Laboratorio from "@/pages/game/Laboratorio";
import Conclusao from "@/pages/Conclusao";
import Galeria from "@/pages/Galeria";
import Telao from "@/pages/Telao";

import LoginAdmin from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import QuizAdmin from "@/pages/admin/QuizAdmin";
import CuriosidadesAdmin from "@/pages/admin/CuriosidadesAdmin";
import CacaPalavrasAdmin from "@/pages/admin/CacaPalavrasAdmin";
import LaboratorioAdmin from "@/pages/admin/LaboratorioAdmin";
import ConfigAdmin from "@/pages/admin/ConfigAdmin";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-mono">
      <h1 className="text-4xl text-neon mb-4">404</h1>
      <p>Elemento não encontrado no laboratório.</p>
      <a href="/" className="mt-8 text-primary underline hover:text-primary/80">Voltar à Exposição</a>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game/quiz" component={Quiz} />
      <Route path="/game/memoria" component={Memoria} />
      <Route path="/game/quebracabeca" component={QuebraCabeca} />
      <Route path="/game/cacapalavras" component={CacaPalavras} />
      <Route path="/game/laboratorio" component={Laboratorio} />
      <Route path="/conclusao" component={Conclusao} />
      <Route path="/galeria" component={Galeria} />
      <Route path="/telao" component={Telao} />
      
      {/* Admin */}
      <Route path="/admin" component={LoginAdmin} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/quiz" component={QuizAdmin} />
      <Route path="/admin/curiosidades" component={CuriosidadesAdmin} />
      <Route path="/admin/cacapalavras" component={CacaPalavrasAdmin} />
      <Route path="/admin/laboratorio" component={LaboratorioAdmin} />
      <Route path="/admin/config" component={ConfigAdmin} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}