import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { ResultPanel, type GenerationRow } from "@/components/result-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GENERATORS } from "@/lib/generators";
import { getHistory } from "@/lib/prompts.functions";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — PromptCerto" },
      { name: "description", content: "Todas as suas gerações salvas com prompt, resposta e pontuação." },
      { property: "og:title", content: "Histórico — PromptCerto" },
      { property: "og:description", content: "Consulte suas gerações anteriores." },
    ],
  }),
  component: Historico,
});

function Historico() {
  const fetchHistory = useServerFn(getHistory);
  const { data, isLoading } = useQuery({ queryKey: ["history"], queryFn: () => fetchHistory() });
  const [selected, setSelected] = useState<GenerationRow | null>(null);

  if (selected) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Detalhes da geração</h1>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              ← Voltar ao histórico
            </Button>
          </div>
          <ResultPanel generation={selected} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="mt-1 text-muted-foreground">
            Tudo o que você gerou fica salvo aqui, com prompt final e pontuação.
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : data?.length ? (
          <div className="space-y-3">
            {data.map((item) => (
              <Card key={item.id} className="shadow-card">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {GENERATORS[item.kind as keyof typeof GENERATORS]?.short ?? item.kind}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">{item.user_input}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-bold">{item.score}</span>
                    <Button size="sm" variant="outline" onClick={() => setSelected(item as GenerationRow)}>
                      Abrir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-card">
            <CardContent className="space-y-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma geração salva ainda.</p>
              <Button asChild>
                <Link to="/gerar/$kind" params={{ kind: "diagnostico" }}>
                  Fazer meu primeiro diagnóstico
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}