import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCompanyProfile, saveCompanyProfile } from "@/lib/prompts.functions";

export const Route = createFileRoute("/_authenticated/empresa")({
  head: () => ({
    meta: [
      { title: "Perfil da empresa — PromptCerto" },
      {
        name: "description",
        content: "Cadastre segmento, público-alvo, produtos e tom de voz para personalizar as gerações.",
      },
      { property: "og:title", content: "Perfil da empresa — PromptCerto" },
      { property: "og:description", content: "Personalize os conteúdos com os dados do seu negócio." },
    ],
  }),
  component: Empresa,
});

const EMPTY = {
  name: "",
  segment: "",
  audience: "",
  products: "",
  differentials: "",
  tone: "",
  city: "",
  whatsapp: "",
};

function Empresa() {
  const fetchCompany = useServerFn(getCompanyProfile);
  const save = useServerFn(saveCompanyProfile);
  const { data, isLoading } = useQuery({ queryKey: ["company"], queryFn: () => fetchCompany() });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name ?? "",
        segment: data.segment ?? "",
        audience: data.audience ?? "",
        products: data.products ?? "",
        differentials: data.differentials ?? "",
        tone: data.tone ?? "",
        city: data.city ?? "",
        whatsapp: data.whatsapp ?? "",
      });
    }
  }, [data]);

  function update(key: keyof typeof EMPTY, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await save({ data: form });
      toast.success("Perfil da empresa salvo!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Perfil da empresa</h1>
          <p className="mt-1 text-muted-foreground">
            Esses dados são aplicados automaticamente em todos os prompts e conteúdos gerados.
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Dados do negócio</CardTitle>
            <CardDescription>Quanto mais completo, melhores os resultados.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da empresa</Label>
                  <Input
                    id="name"
                    value={form.name}
                    maxLength={120}
                    onChange={(event) => update("name", event.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento</Label>
                  <Input
                    id="segment"
                    value={form.segment}
                    maxLength={120}
                    onChange={(event) => update("segment", event.target.value)}
                    disabled={isLoading}
                    placeholder="Ex.: barbearia, loja de roupas"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Público-alvo</Label>
                <Textarea
                  id="audience"
                  rows={2}
                  maxLength={400}
                  value={form.audience}
                  onChange={(event) => update("audience", event.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="products">Produtos e serviços</Label>
                <Textarea
                  id="products"
                  rows={3}
                  maxLength={600}
                  value={form.products}
                  onChange={(event) => update("products", event.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="differentials">Diferenciais</Label>
                <Textarea
                  id="differentials"
                  rows={3}
                  maxLength={600}
                  value={form.differentials}
                  onChange={(event) => update("differentials", event.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tom de comunicação</Label>
                  <Input
                    id="tone"
                    value={form.tone}
                    maxLength={120}
                    onChange={(event) => update("tone", event.target.value)}
                    disabled={isLoading}
                    placeholder="Ex.: próximo e direto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={form.city}
                    maxLength={120}
                    onChange={(event) => update("city", event.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={form.whatsapp}
                    maxLength={40}
                    onChange={(event) => update("whatsapp", event.target.value)}
                    disabled={isLoading}
                    placeholder="(11) 90000-0000"
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving || isLoading}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Salvar perfil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}