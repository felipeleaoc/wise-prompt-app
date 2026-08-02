import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { setPlan } from "@/lib/prompts.functions";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos e preços — PromptCerto" },
      {
        name: "description",
        content:
          "Plano gratuito com 5 gerações mensais e plano Profissional com histórico completo, perfil da empresa e modelos avançados.",
      },
      { property: "og:title", content: "Planos e preços — PromptCerto" },
      { property: "og:description", content: "Comece grátis e evolua para o plano Profissional." },
    ],
  }),
  component: Planos,
});

const PLANS = [
  {
    id: "gratuito" as const,
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    features: [
      "5 gerações por mês",
      "Diagnóstico de prompt com pontuação",
      "Todos os geradores de conteúdo",
      "Histórico das últimas gerações",
    ],
  },
  {
    id: "profissional" as const,
    name: "Profissional",
    price: "R$ 49",
    period: "por mês",
    highlight: true,
    features: [
      "200 gerações por mês",
      "Histórico completo salvo",
      "Perfil da empresa aplicado em tudo",
      "Modelos avançados e refinamentos ilimitados",
      "Suporte prioritário",
    ],
  },
];

function Planos() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const changePlan = useServerFn(setPlan);
  const [saving, setSaving] = useState<string | null>(null);

  async function choose(plan: "gratuito" | "profissional") {
    if (!session) {
      navigate({ to: "/entrar", search: { modo: "cadastro" } });
      return;
    }
    setSaving(plan);
    try {
      await changePlan({ data: { plan } });
      toast.success(
        plan === "profissional" ? "Plano Profissional ativado!" : "Plano gratuito ativado.",
      );
      navigate({ to: "/painel" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível trocar o plano.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="min-h-screen">
      {session ? null : <SiteHeader />}
      <div className="mx-auto max-w-5xl px-4 py-16">
        {session ? (
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link to="/painel">← Voltar ao painel</Link>
          </Button>
        ) : null}
        <h1 className="text-center text-4xl font-bold">Planos simples e diretos</h1>
        <p className="mt-3 text-center text-muted-foreground">
          Comece grátis. Assine quando o conteúdo começar a trazer clientes.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={plan.highlight ? "border-accent shadow-glow" : "shadow-card"}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.highlight ? (
                    <Badge className="bg-accent text-accent-foreground border-0">Mais popular</Badge>
                  ) : null}
                </div>
                <CardDescription>
                  <span className="font-display text-3xl font-bold text-foreground">{plan.price}</span>{" "}
                  {plan.period}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="size-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "secondary"}
                  disabled={loading || saving !== null}
                  onClick={() => choose(plan.id)}
                >
                  {saving === plan.id ? <Loader2 className="size-4 animate-spin" /> : null}
                  {session ? `Ativar plano ${plan.name}` : "Começar agora"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}