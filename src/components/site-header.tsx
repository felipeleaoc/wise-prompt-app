import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { session, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="bg-brand flex size-8 items-center justify-center rounded-lg text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          PromptCerto
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="/#beneficios" className="hover:text-foreground">
            Benefícios
          </a>
          <a href="/#exemplos" className="hover:text-foreground">
            Exemplos
          </a>
          <Link to="/planos" className="hover:text-foreground">
            Preços
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {loading ? null : session ? (
            <Button asChild size="sm">
              <Link to="/painel">Ir para o painel</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/entrar">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/entrar" search={{ modo: "cadastro" }}>
                  Criar conta grátis
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}