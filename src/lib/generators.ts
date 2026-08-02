export type GeneratorKind =
  | "diagnostico"
  | "instagram"
  | "produto"
  | "whatsapp"
  | "roteiro"
  | "email";

export type GeneratorMeta = {
  kind: GeneratorKind;
  label: string;
  short: string;
  description: string;
  placeholder: string;
  outputLabel: string;
};

export const GENERATORS: Record<GeneratorKind, GeneratorMeta> = {
  diagnostico: {
    kind: "diagnostico",
    label: "Diagnóstico de prompt",
    short: "Diagnóstico",
    description:
      "Avalie seu pedido, descubra o que está faltando e receba um prompt profissional pronto para usar.",
    placeholder: "Ex.: quero um texto para vender meu curso de confeitaria",
    outputLabel: "Conteúdo sugerido",
  },
  instagram: {
    kind: "instagram",
    label: "Anúncio para Instagram",
    short: "Instagram",
    description: "Legenda com gancho, benefícios, prova e chamada para ação.",
    placeholder: "Ex.: anúncio de promoção de corte + barba na terça-feira",
    outputLabel: "Anúncio pronto",
  },
  produto: {
    kind: "produto",
    label: "Descrição de produto",
    short: "Produto",
    description: "Descrição comercial completa, com benefícios e especificações.",
    placeholder: "Ex.: descrição para caneca personalizada de porcelana 350ml",
    outputLabel: "Descrição pronta",
  },
  whatsapp: {
    kind: "whatsapp",
    label: "Resposta para WhatsApp",
    short: "WhatsApp",
    description: "Mensagem curta, humana e persuasiva para responder clientes.",
    placeholder: "Ex.: cliente perguntou o preço e disse que está caro",
    outputLabel: "Mensagem pronta",
  },
  roteiro: {
    kind: "roteiro",
    label: "Roteiro de vídeo",
    short: "Roteiro",
    description: "Roteiro em blocos com gancho, desenvolvimento e fechamento.",
    placeholder: "Ex.: reels de 30 segundos mostrando meu ateliê",
    outputLabel: "Roteiro pronto",
  },
  email: {
    kind: "email",
    label: "E-mail profissional",
    short: "E-mail",
    description: "E-mail claro e educado, com assunto e assinatura.",
    placeholder: "Ex.: e-mail cobrando um orçamento aprovado há 15 dias",
    outputLabel: "E-mail pronto",
  },
};

export const GENERATOR_LIST = Object.values(GENERATORS);

export const PLAN_LIMITS = { gratuito: 5, profissional: 200 } as const;

export type RefineAction = "melhorar" | "encurtar" | "persuasivo" | "nova-versao";

export const REFINE_LABELS: Record<RefineAction, string> = {
  melhorar: "Melhorar",
  encurtar: "Encurtar",
  persuasivo: "Mais persuasivo",
  "nova-versao": "Gerar nova versão",
};