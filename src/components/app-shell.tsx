import { Link, useNavigate } from "@tanstack/react-router";
import { History, LayoutDashboard, Building2, Sparkles, CreditCard, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/empresa", label: "Perfil da empresa", icon: Building2 },
  { to: "/planos", label: "Planos", icon: CreditCard },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/painel" className="flex items-center gap-2 font-display font-bold">
            <span className="bg-brand flex size-8 items-center justify-center rounded-lg text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            PromptCerto
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
        <div className="mx-auto max-w-6xl overflow-x-auto px-4">
          <nav className="flex gap-1 pb-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}