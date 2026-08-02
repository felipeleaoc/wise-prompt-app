import { z } from "zod";

export const GenerateInput = z.object({
  kind: z.enum(["diagnostico", "instagram", "produto", "whatsapp", "roteiro", "email"]),
  input: z.string().trim().min(5, "Descreva seu pedido com pelo menos 5 caracteres.").max(2000),
  answers: z.string().trim().max(2000).optional().default(""),
});

export const RefineInput = z.object({
  id: z.string().uuid(),
  action: z.enum(["melhorar", "encurtar", "persuasivo", "nova-versao"]),
});

export const CompanyInput = z.object({
  name: z.string().trim().max(120),
  segment: z.string().trim().max(120),
  audience: z.string().trim().max(400),
  products: z.string().trim().max(600),
  differentials: z.string().trim().max(600),
  tone: z.string().trim().max(120),
  city: z.string().trim().max(120),
  whatsapp: z.string().trim().max(40),
});

export const IdInput = z.object({ id: z.string().uuid() });

export const PlanInput = z.object({ plan: z.enum(["gratuito", "profissional"]) });