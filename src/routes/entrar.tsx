import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  modo: z.enum(["entrar", "cadastro", "recuperar"]).optional().default("entrar"),
});

export const Route = createFileRoute("/entrar")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — PromptCerto" },
      {
        name: "description",
        content: "Acesse sua conta PromptCerto ou crie uma conta gratuita com 5 gerações por mês.",
      },
      { property: "og:title", content: "Entrar no PromptCerto" },
      { property: "og:description", content: "Acesse seu painel de prompts e conteúdos." },
    ],
  }),
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").max(255),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres.").max(72),
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  type Mode = "entrar" | "cadastro" | "recuperar";
  const [mode, setMode] = useState<Mode>((modo as Mode) ?? "entrar");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<null | "confirmacao" | "recuperacao">(null);

  useEffect(() => setMode((modo as Mode) ?? "entrar"), [modo]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "recuperar") {
        const parsed = z.string().email("Informe um e-mail válido.").safeParse(email.trim());
        if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
        const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        setSent("recuperacao");
        return;
      }

      const parsed = credentialsSchema.safeParse({ email, password });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);

      if (mode === "cadastro") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent("confirmacao");
          return;
        }
        toast.success("Conta criada!");
        navigate({ to: "/painel", replace: true });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) throw error;
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/painel", replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível continuar.";
      toast.error(
        message === "Invalid login credentials" ? "E-mail ou senha incorretos." : message,
      );
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    entrar: { title: "Entrar na sua conta", description: "Use seu e-mail e senha para acessar o painel." },
    cadastro: {
      title: "Criar conta gratuita",
      description: "5 gerações por mês, sem cartão de crédito.",
    },
    recuperar: {
      title: "Recuperar senha",
      description: "Enviaremos um link para você criar uma nova senha.",
    },
  }[mode];

  return (
    <div className="bg-primary-deep flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 font-display text-lg font-bold text-primary-foreground"
        >
          <span className="bg-accent flex size-8 items-center justify-center rounded-lg text-accent-foreground">
            <Sparkles className="size-4" />
          </span>
          PromptCerto
        </Link>
        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>{titles.title}</CardTitle>
            <CardDescription>{titles.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4 text-sm">
                <p>
                  {sent === "confirmacao"
                    ? "Enviamos um e-mail de confirmação. Clique no link para ativar sua conta e depois faça login."
                    : "Enviamos um e-mail com o link para redefinir sua senha. Confira sua caixa de entrada."}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSent(null);
                    setMode("entrar");
                  }}
                >
                  Voltar para o login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "cadastro" ? (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Seu nome</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      maxLength={120}
                      placeholder="Ana Souza"
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={255}
                    required
                    placeholder="voce@empresa.com.br"
                  />
                </div>
                {mode !== "recuperar" ? (
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={mode === "cadastro" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      maxLength={72}
                      required
                    />
                  </div>
                ) : null}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                  {mode === "cadastro" ? "Criar conta" : mode === "recuperar" ? "Enviar link" : "Entrar"}
                </Button>
              </form>
            )}

            {!sent ? (
              <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
                {mode !== "recuperar" ? (
                  <button className="hover:text-foreground" onClick={() => setMode("recuperar")}>
                    Esqueci minha senha
                  </button>
                ) : null}
                <p>
                  {mode === "cadastro" ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
                  <button
                    className="font-semibold text-accent hover:underline"
                    onClick={() => setMode(mode === "cadastro" ? "entrar" : "cadastro")}
                  >
                    {mode === "cadastro" ? "Entrar" : "Criar conta grátis"}
                  </button>
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}