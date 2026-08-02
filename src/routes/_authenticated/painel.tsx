import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GENERATOR_LIST, GENERATORS } from "@/lib/generators";
import { getDashboard } from "@/lib/prompts.functions";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel — PromptCerto" },
      { name: "description", content: "Suas gerações disponíveis, últimos prompts e atalhos." },
      { property: "og:title", content: "Painel — PromptCerto" },
      { property: "og:description", content: "Acompanhe gerações e crie conteúdo." },
    ],
  }),
  component: Painel,
});

function Painel() {
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
  });

  const remaining = data ? Math.max(0, data.limit - data.used) : 0;

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Olá{data?.fullName ? `, ${data.fullName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">O que vamos criar hoje?</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="shadow-card md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Gerações disponíveis</CardTitle>
              <CardDescription>Renova todo mês</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading || !data ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <p className="font-display text-4xl font-bold">
                    {remaining}
                    <span className="text-base font-medium text-muted-foreground"> de {data.limit}</span>
                  </p>
                  <Progress value={(data.used / data.limit) * 100} />
                  <Badge variant={data.plan === "profissional" ? "default" : "secondary"}>
                    Plano {data.plan === "profissional" ? "Profissional" : "Gratuito"}
                  </Badge>
                  {data.plan === "gratuito" ? (
                    <Button asChild variant="link" className="h-auto p-0">
                      <Link to="/planos">Quero mais gerações</Link>
                    </Button>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-brand text-primary-foreground shadow-glow md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" /> Diagnóstico de prompt
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Escreva um pedido simples e receba pontuação, o que falta e um prompt profissional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link to="/gerar/$kind" params={{ kind: "diagnostico" }}>
                  Começar diagnóstico <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <section>
          <h2 className="text-xl font-semibold">Criar conteúdo</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GENERATOR_LIST.filter((item) => item.kind !== "diagnostico").map((item) => (
              <Link key={item.kind} to="/gerar/$kind" params={{ kind: item.kind }}>
                <Card className="h-full shadow-card transition-shadow hover:shadow-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Últimos prompts</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/historico">Ver histórico</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : data?.recent.length ? (
              data.recent.map((item) => (
                <Card key={item.id} className="shadow-card">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.user_input}</p>
                      <p className="text-xs text-muted-foreground">
                        {GENERATORS[item.kind as keyof typeof GENERATORS]?.short ?? item.kind} ·{" "}
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.score}/100</Badge>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Você ainda não gerou nada. Comece pelo diagnóstico de prompt.
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}