import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { REFINE_LABELS, type RefineAction } from "@/lib/generators";

export type GenerationRow = {
  id: string;
  kind: string;
  user_input: string;
  final_prompt: string;
  ai_response: string;
  score: number;
  missing_info: unknown;
  questions: unknown;
  created_at: string;
};

function toList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success(`${label} copiado!`);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("Não foi possível copiar.");
        }
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      Copiar
    </Button>
  );
}

export function ResultPanel({
  generation,
  outputLabel = "Conteúdo gerado",
  onRefine,
  refining,
}: {
  generation: GenerationRow;
  outputLabel?: string;
  onRefine?: (action: RefineAction) => void;
  refining?: RefineAction | null;
}) {
  const missing = toList(generation.missing_info);
  const questions = toList(generation.questions);
  const scoreTone =
    generation.score >= 80 ? "text-success" : generation.score >= 50 ? "text-accent" : "text-destructive";

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pontuação do seu pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-2">
            <span className={`font-display text-5xl font-bold ${scoreTone}`}>{generation.score}</span>
            <span className="pb-2 text-sm text-muted-foreground">de 100</span>
          </div>
          <Progress value={generation.score} />
          <p className="text-sm text-muted-foreground">
            {generation.score >= 80
              ? "Pedido muito bem detalhado."
              : generation.score >= 50
                ? "Bom começo, mas ainda falta contexto importante."
                : "Pedido genérico: complete as informações abaixo para um resultado muito melhor."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Informações ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            {missing.length ? (
              <ul className="space-y-2 text-sm">
                {missing.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-accent">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nada crítico faltando. Ótimo trabalho!</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Perguntas complementares</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length ? (
              <ol className="space-y-2 text-sm">
                {questions.map((item, index) => (
                  <li key={item} className="flex gap-2">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Sem perguntas pendentes.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base">Prompt profissional</CardTitle>
          <CopyButton value={generation.final_prompt} label="Prompt" />
        </CardHeader>
        <CardContent>
          <pre className="max-h-72 overflow-auto rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
            {generation.final_prompt}
          </pre>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base">{outputLabel}</CardTitle>
          <CopyButton value={generation.ai_response} label="Conteúdo" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm whitespace-pre-wrap">{generation.ai_response}</div>
          {onRefine ? (
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              {(Object.keys(REFINE_LABELS) as RefineAction[]).map((action) => (
                <Button
                  key={action}
                  variant={action === "nova-versao" ? "default" : "secondary"}
                  size="sm"
                  disabled={Boolean(refining)}
                  onClick={() => onRefine(action)}
                >
                  {refining === action ? <Loader2 className="size-4 animate-spin" /> : null}
                  {REFINE_LABELS[action]}
                </Button>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}