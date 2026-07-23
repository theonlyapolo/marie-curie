import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { FlaskConical, LayoutDashboard, ListOrdered, Sparkles, Type, FileImage, Settings, LogOut } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      retry: false,
    }
  });
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      setLocation("/admin");
    }
  }, [isLoading, isError, user, setLocation]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/admin")
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse-neon w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!user) return null;

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/quiz", icon: ListOrdered, label: "Quiz" },
    { href: "/admin/curiosidades", icon: Sparkles, label: "Curiosidades" },
    { href: "/admin/cacapalavras", icon: Type, label: "Caça-palavras" },
    { href: "/admin/laboratorio", icon: FlaskConical, label: "Laboratório" },
    { href: "/admin/config", icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border p-4 flex flex-col h-auto md:h-[100dvh] sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-8 px-2">
          <FlaskConical className="text-primary w-6 h-6 animate-pulse-neon" />
          <h1 className="font-serif font-bold text-xl text-primary">Admin Lab</h1>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md font-mono text-sm transition-colors ${location === item.href ? 'bg-primary/20 text-primary border border-primary/50' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-border">
          <div className="px-3 py-2 mb-2 text-xs font-mono text-muted-foreground">
            Operador: {user.usuario}
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair do Sistema
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
