const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

export type AiResult = {
  score: number;
  missing_info: string[];
  questions: string[];
  final_prompt: string;
  content: string;
};

function safeParse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        /* ignore */
      }
    }
    return {};
  }
}

async function callGateway(messages: Array<{ role: string; content: string }>, json: boolean) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Serviço de IA indisponível: chave não configurada.");

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (response.status === 429) {
    throw new Error("Muitas solicitações agora. Tente novamente em alguns instantes.");
  }
  if (response.status === 402) {
    throw new Error("Os créditos de IA do espaço de trabalho acabaram. Adicione créditos para continuar.");
  }
  if (!response.ok) {
    const detail = await response.text();
    console.error("[AI] gateway error", response.status, detail);
    throw new Error("Não foi possível falar com a IA agora. Tente novamente.");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function generateWithDiagnosis(args: {
  kindLabel: string;
  userInput: string;
  answers: string;
  companyContext: string;
}): Promise<AiResult> {
  const system = [
    "Você é o PromptCerto, especialista brasileiro em engenharia de prompts para pequenos negócios.",
    "Sempre responda em português do Brasil.",
    "Analise o pedido simples do usuário e devolve um JSON com as chaves:",
    '"score" (inteiro 0-100 avaliando a clareza e completude do pedido),',
    '"missing_info" (lista de textos curtos com informações que faltam),',
    '"questions" (lista de até 5 perguntas complementares objetivas),',
    '"final_prompt" (um prompt profissional, detalhado, com contexto, objetivo, público, tom, formato e restrições),',
    '"content" (o conteúdo final já pronto para o usuário usar, seguindo o final_prompt).',
    "Não use bounds artificiais: seja específico, prático e comercial. Nunca invente dados sensíveis.",
  ].join(" ");

  const user = [
    `Tipo de geração: ${args.kindLabel}`,
    `Pedido do usuário: ${args.userInput}`,
    args.answers ? `Respostas complementares: ${args.answers}` : "",
    args.companyContext ? `Perfil da empresa: ${args.companyContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await callGateway(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    true,
  );

  const parsed = safeParse(raw);
  const score = Number(parsed["score"]);
  const toList = (value: unknown) =>
    Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean).slice(0, 8) : [];

  return {
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 60,
    missing_info: toList(parsed["missing_info"]),
    questions: toList(parsed["questions"]),
    final_prompt: String(parsed["final_prompt"] ?? "").trim(),
    content: String(parsed["content"] ?? "").trim(),
  };
}

const ACTION_INSTRUCTIONS: Record<string, string> = {
  melhorar: "Reescreva o conteúdo com mais qualidade, clareza e detalhes concretos, mantendo o objetivo.",
  encurtar: "Reescreva o conteúdo bem mais curto e direto, mantendo o essencial e a chamada para ação.",
  persuasivo: "Reescreva o conteúdo muito mais persuasivo, com gancho forte, prova e chamada para ação clara.",
  "nova-versao": "Crie uma versão alternativa e criativa do conteúdo, com abordagem diferente da atual.",
};

export async function refineContent(args: {
  action: string;
  finalPrompt: string;
  content: string;
}): Promise<string> {
  const instruction = ACTION_INSTRUCTIONS[args.action] ?? ACTION_INSTRUCTIONS["melhorar"]!;
  const raw = await callGateway(
    [
      {
        role: "system",
        content:
          "Você é o PromptCerto. Responda somente com o novo conteúdo final em português do Brasil, sem comentários, sem título extra e sem explicações.",
      },
      {
        role: "user",
        content: `Prompt profissional original:\n${args.finalPrompt}\n\nConteúdo atual:\n${args.content}\n\nTarefa: ${instruction}`,
      },
    ],
    false,
  );
  return raw.trim();
}