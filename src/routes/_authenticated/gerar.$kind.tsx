import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ResultPanel, type GenerationRow } from "@/components/result-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GENERATORS, type GeneratorKind, type RefineAction } from "@/lib/generators";
import { refineGeneration, runGeneration } from "@/lib/prompts.functions";

export const Route = createFileRoute("/_authenticated/gerar/$kind")({
  beforeLoad: ({ params }) => {
    if (!(params.kind in GENERATORS)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Criar conteúdo — PromptCerto" },
      {
        name: "description",
        content: "Gere prompts profissionais e conteúdos prontos a partir de um pedido simples.",
      },
      { property: "og:title", content: "Criar conteúdo — PromptCerto" },
      { property: "og:description", content: "Diagnóstico e geração de conteúdo com IA." },
    ],
  }),
  component: Gerar,
});

function Gerar() {
  const { kind } = Route.useParams();
  const meta = GENERATORS[kind as GeneratorKind];
  const queryClient = useQueryClient();
  const generate = useServerFn(runGeneration);
  const refine = useServerFn(refineGeneration);

  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState("");
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState<RefineAction | null>(null);
  const [generation, setGeneration] = useState<GenerationRow | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generate({
        data: { kind: kind as GeneratorKind, input: input.trim(), answers: answers.trim() },
      });
      setGeneration(result.generation as GenerationRow);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success(`Pronto! Restam ${result.limit - result.used} gerações neste mês.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar agora.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefine(action: RefineAction) {
    if (!generation) return;
    setRefining(action);
    try {
      const result = await refine({ data: { id: generation.id, action } });
      setGeneration(result.generation as GenerationRow);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Conteúdo atualizado!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível refinar agora.");
    } finally {
      setRefining(null);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{meta.label}</h1>
            <p className="mt-1 text-muted-foreground">{meta.description}</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/painel">← Voltar</Link>
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Seu pedido</CardTitle>
            <CardDescription>Escreva do jeito que você falaria com um funcionário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pedido">Pedido</Label>
              <Textarea
                id="pedido"
                rows={4}
                maxLength={2000}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={meta.placeholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complemento">Informações complementares (opcional)</Label>
              <Textarea
                id="complemento"
                rows={3}
                maxLength={2000}
                value={answers}
                onChange={(event) => setAnswers(event.target.value)}
                placeholder="Responda aqui as perguntas complementares e gere novamente para melhorar a pontuação."
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading || input.trim().length < 5}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              {loading ? "Gerando..." : "Analisar e gerar"}
            </Button>
          </CardContent>
        </Card>

        {generation ? (
          <ResultPanel
            generation={generation}
            outputLabel={meta.outputLabel}
            onRefine={handleRefine}
            refining={refining}
          />
        ) : null}
      </div>
    </AppShell>
  );
}