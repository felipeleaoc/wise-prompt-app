import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Gauge,
  Instagram,
  Mail,
  MessageCircle,
  Package,
  Video,
  Zap,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptCerto — transforme pedidos simples em prompts profissionais" },
      {
        name: "description",
        content:
          "O PromptCerto avalia seu pedido, mostra o que falta e entrega prompts profissionais e conteúdos prontos para pequenos negócios.",
      },
      { property: "og:title", content: "PromptCerto — prompts profissionais em segundos" },
      {
        property: "og:description",
        content: "Diagnóstico de prompt, anúncios, descrições, WhatsApp, roteiros e e-mails prontos.",
      },
    ],
  }),
  component: Index,
});

const BENEFITS = [
  {
    icon: Gauge,
    title: "Diagnóstico com nota de 0 a 100",
    text: "Descubra na hora o quanto seu pedido está claro e o que ainda falta informar.",
  },
  {
    icon: Zap,
    title: "Prompt profissional automático",
    text: "Seu pedido simples se transforma em um prompt completo com contexto, público e tom.",
  },
  {
    icon: Check,
    title: "Conteúdo pronto para publicar",
    text: "Além do prompt, você recebe o texto final pronto para copiar e usar.",
  },
];

const GENERATORS = [
  { icon: Instagram, title: "Anúncio para Instagram" },
  { icon: Package, title: "Descrição de produto" },
  { icon: MessageCircle, title: "Resposta para WhatsApp" },
  { icon: Video, title: "Roteiro de vídeo" },
  { icon: Mail, title: "E-mail profissional" },
];

const EXAMPLES = [
  {
    before: "quero um post pra vender bolo",
    score: 32,
    after:
      "Crie uma legenda de Instagram para uma confeitaria artesanal em Campinas que vende bolos de pote por R$ 18, público de mulheres 25-45 anos, tom acolhedor, com gancho, 3 benefícios, prova social e CTA para o WhatsApp.",
  },
  {
    before: "responder cliente que achou caro",
    score: 41,
    after:
      "Escreva uma resposta curta de WhatsApp para um cliente que achou o orçamento caro, reforçando garantia de 1 ano, material premium e parcelamento em 3x, tom consultivo e sem desconto imediato.",
  },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="bg-primary-deep relative overflow-hidden text-primary-foreground">
        <img
          src={heroImage}
          alt="Painel do PromptCerto com pontuação de prompt"
          width={1600}
          height={1200}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center">
          <Badge className="bg-accent text-accent-foreground border-0">
            Feito para pequenos negócios brasileiros
          </Badge>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-tight font-extrabold sm:text-6xl">
            Pare de pedir errado para a inteligência artificial
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-foreground/80">
            O PromptCerto avalia seu pedido, mostra o que está faltando e entrega o prompt profissional
            junto com o conteúdo pronto para usar no seu negócio.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:opacity-90">
              <Link to="/entrar" search={{ modo: "cadastro" }}>
                Criar conta grátis <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/planos">Ver preços</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70">
            5 gerações gratuitas por mês. Sem cartão de crédito.
          </p>
        </div>
      </section>

      <section id="beneficios" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Por que o PromptCerto funciona</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {BENEFITS.map((item) => (
            <Card key={item.title} className="shadow-card">
              <CardContent className="space-y-3 pt-6">
                <span className="bg-brand flex size-10 items-center justify-center rounded-xl text-primary-foreground">
                  <item.icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-soft mt-14 rounded-3xl p-8">
          <h3 className="text-center text-xl font-semibold">Geradores prontos</h3>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {GENERATORS.map((item) => (
              <span
                key={item.title}
                className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium shadow-card"
              >
                <item.icon className="size-4 text-accent" />
                {item.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="exemplos" className="bg-card border-y border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Antes e depois</h2>
          <p className="mt-3 text-center text-muted-foreground">
            Veja como um pedido simples vira um prompt profissional.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {EXAMPLES.map((example) => (
              <Card key={example.before} className="shadow-card">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Pedido do usuário
                    </p>
                    <p className="mt-1 text-sm italic">“{example.before}”</p>
                    <Badge variant="destructive" className="mt-2">
                      Pontuação {example.score}/100
                    </Badge>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Prompt profissional do PromptCerto
                    </p>
                    <p className="mt-1 text-sm">{example.after}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="bg-brand rounded-3xl px-8 py-14 text-center text-primary-foreground shadow-glow">
          <h2 className="text-3xl font-bold">Comece grátis hoje</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Crie sua conta, preencha o perfil da empresa e gere seu primeiro conteúdo em menos de dois
            minutos.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8">
            <Link to="/entrar" search={{ modo: "cadastro" }}>
              Criar minha conta <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PromptCerto. Feito para quem vende todos os dias.
      </footer>
    </div>
  );
}
