import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLAN_LIMITS } from "@/lib/generators";

const GenerateInput = z.object({
  kind: z.enum(["diagnostico", "instagram", "produto", "whatsapp", "roteiro", "email"]),
  input: z.string().trim().min(5, "Descreva seu pedido com pelo menos 5 caracteres.").max(2000),
  answers: z.string().trim().max(2000).optional().default(""),
});

const RefineInput = z.object({
  id: z.string().uuid(),
  action: z.enum(["melhorar", "encurtar", "persuasivo", "nova-versao"]),
});

const CompanyInput = z.object({
  name: z.string().trim().max(120),
  segment: z.string().trim().max(120),
  audience: z.string().trim().max(400),
  products: z.string().trim().max(600),
  differentials: z.string().trim().max(600),
  tone: z.string().trim().max(120),
  city: z.string().trim().max(120),
  whatsapp: z.string().trim().max(40),
});

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, generationsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("generations")
        .select("id, kind, user_input, score, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const profile = profileRes.data;
    const plan = (profile?.plan ?? "gratuito") as keyof typeof PLAN_LIMITS;
    const monthStart = new Date();
    const currentPeriod = `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, "0")}-01`;
    const used = profile?.period_start === currentPeriod ? (profile?.generations_used ?? 0) : 0;

    return {
      plan,
      used,
      limit: PLAN_LIMITS[plan],
      fullName: profile?.full_name ?? "",
      recent: generationsRes.data ?? [],
    };
  });

export const getHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getGeneration = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("generations")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getCompanyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const saveCompanyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CompanyInput.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("company_profiles")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ plan: z.enum(["gratuito", "profissional"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ plan: data.plan })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true, plan: data.plan };
  });

export const runGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => GenerateInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { GENERATORS } = await import("@/lib/generators");
    const { generateWithDiagnosis } = await import("@/lib/ai.server");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, generations_used, period_start")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    const now = new Date();
    const currentPeriod = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
    const plan = (profile?.plan ?? "gratuito") as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan];
    const used = profile?.period_start === currentPeriod ? (profile?.generations_used ?? 0) : 0;

    if (used >= limit) {
      throw new Error(
        plan === "gratuito"
          ? "Você usou as 5 gerações gratuitas deste mês. Assine o plano Profissional para continuar."
          : "Você atingiu o limite de gerações deste mês.",
      );
    }

    const { data: company } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const companyContext = company
      ? [
          company.name && `Nome: ${company.name}`,
          company.segment && `Segmento: ${company.segment}`,
          company.audience && `Público-alvo: ${company.audience}`,
          company.products && `Produtos: ${company.products}`,
          company.differentials && `Diferenciais: ${company.differentials}`,
          company.tone && `Tom de comunicação: ${company.tone}`,
          company.city && `Cidade: ${company.city}`,
          company.whatsapp && `WhatsApp: ${company.whatsapp}`,
        ]
          .filter(Boolean)
          .join(" | ")
      : "";

    const result = await generateWithDiagnosis({
      kindLabel: GENERATORS[data.kind].label,
      userInput: data.input,
      answers: data.answers ?? "",
      companyContext,
    });

    const { data: inserted, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        kind: data.kind,
        user_input: data.input,
        final_prompt: result.final_prompt,
        ai_response: result.content,
        score: result.score,
        missing_info: result.missing_info,
        questions: result.questions,
      })
      .select("*")
      .single();
    if (insertError) throw new Error(insertError.message);

    await supabase
      .from("profiles")
      .update({ generations_used: used + 1, period_start: currentPeriod })
      .eq("id", userId);

    return { generation: inserted, used: used + 1, limit };
  });

export const refineGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => RefineInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { refineContent } = await import("@/lib/ai.server");

    const { data: row, error } = await supabase
      .from("generations")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Geração não encontrada.");

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, generations_used, period_start")
      .eq("id", userId)
      .maybeSingle();

    const now = new Date();
    const currentPeriod = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
    const plan = (profile?.plan ?? "gratuito") as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan];
    const used = profile?.period_start === currentPeriod ? (profile?.generations_used ?? 0) : 0;
    if (used >= limit) {
      throw new Error("Você atingiu o limite de gerações deste mês.");
    }

    const content = await refineContent({
      action: data.action,
      finalPrompt: row.final_prompt,
      content: row.ai_response,
    });

    const { data: updated, error: updateError } = await supabase
      .from("generations")
      .update({ ai_response: content })
      .eq("id", data.id)
      .select("*")
      .single();
    if (updateError) throw new Error(updateError.message);

    await supabase
      .from("profiles")
      .update({ generations_used: used + 1, period_start: currentPeriod })
      .eq("id", userId);

    return { generation: updated, used: used + 1, limit };
  });