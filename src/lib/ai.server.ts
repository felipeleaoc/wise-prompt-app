import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.5-flash";

export type AiResult = {
  score: number;
  missing_info: string[];
  questions: string[];
  final_prompt: string;
  content: string;
};

type GeminiMessage = {
  role: string;
  content: string;
};

function getClient(): GoogleGenAI {
  const apiKey = process.env["GEMINI_API_KEY"];

  if (!apiKey) {
    throw new Error(
      "Serviço de IA indisponível: a variável GEMINI_API_KEY não foi configurada.",
    );
  }

  return new GoogleGenAI({ apiKey });
}

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
        // O conteúdo não contém um JSON válido.
      }
    }

    return {};
  }
}

function buildPrompt(messages: GeminiMessage[]): {
  systemInstruction: string;
  contents: string;
} {
  const systemInstruction = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");

  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => {
      const role =
        message.role === "assistant" ? "Assistente" : "Usuário";

      return `${role}:\n${message.content}`;
    })
    .join("\n\n");

  return {
    systemInstruction,
    contents,
  };
}

async function callGemini(
  messages: GeminiMessage[],
  json: boolean,
): Promise<string> {
  const client = getClient();
  const { systemInstruction, contents } = buildPrompt(messages);

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: json ? 0.4 : 0.7,
        ...(json
          ? {
              responseMimeType: "application/json",
            }
          : {}),
      },
    });

    return response.text?.trim() ?? "";
  } catch (error) {
    console.error("[AI] Gemini error:", error);

    const message =
      error instanceof Error ? error.message.toLowerCase() : "";

    if (
      message.includes("429") ||
      message.includes("resource_exhausted") ||
      message.includes("quota")
    ) {
      throw new Error(
        "Muitas solicitações ou limite da IA atingido. Tente novamente em alguns instantes.",
      );
    }

    if (
      message.includes("401") ||
      message.includes("403") ||
      message.includes("api key") ||
      message.includes("permission_denied")
    ) {
      throw new Error(
        "A chave da IA é inválida ou não possui permissão para usar este modelo.",
      );
    }

    throw new Error(
      "Não foi possível falar com a IA agora. Tente novamente em alguns instantes.",
    );
  }
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
    "Analise o pedido do usuário e responda exclusivamente com um objeto JSON válido.",
    "O objeto deve possuir exatamente as seguintes chaves:",
    '"score": número inteiro entre 0 e 100;',
    '"missing_info": lista de informações relevantes que estão faltando;',
    '"questions": lista de no máximo 5 perguntas complementares objetivas;',
    '"final_prompt": prompt profissional e detalhado;',
    '"content": conteúdo final pronto para uso.',
    "Avalie objetivo, público-alvo, contexto, formato, tom, chamada para ação, restrições e informações específicas.",
    "Não invente dados pessoais, preços, resultados, depoimentos ou características não informadas.",
    "Não use blocos Markdown e não escreva explicações fora do JSON.",
  ].join(" ");

  const user = [
    `Tipo de geração: ${args.kindLabel}`,
    `Pedido do usuário: ${args.userInput}`,
    args.answers
      ? `Respostas complementares: ${args.answers}`
      : "",
    args.companyContext
      ? `Perfil da empresa: ${args.companyContext}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await callGemini(
    [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: user,
      },
    ],
    true,
  );

  const parsed = safeParse(raw);

  const score = Number(parsed["score"]);

  const toList = (value: unknown): string[] =>
    Array.isArray(value)
      ? value
          .map((item) => String(item).trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];

  const finalPrompt = String(parsed["final_prompt"] ?? "").trim();
  const content = String(parsed["content"] ?? "").trim();

  if (!finalPrompt || !content) {
    console.error("[AI] Resposta inválida recebida:", raw);

    throw new Error(
      "A IA devolveu uma resposta incompleta. Tente gerar novamente.",
    );
  }

  return {
    score: Number.isFinite(score)
      ? Math.max(0, Math.min(100, Math.round(score)))
      : 60,
    missing_info: toList(parsed["missing_info"]),
    questions: toList(parsed["questions"]),
    final_prompt: finalPrompt,
    content,
  };
}

const ACTION_INSTRUCTIONS: Record<string, string> = {
  melhorar:
    "Reescreva o conteúdo com mais qualidade, clareza e detalhes concretos, mantendo o objetivo.",
  encurtar:
    "Reescreva o conteúdo de forma mais curta e direta, mantendo o essencial e a chamada para ação.",
  profissional:
    "Reescreva o conteúdo com linguagem mais profissional, clara e confiável.",
  persuasivo:
    "Reescreva o conteúdo de forma mais persuasiva, com gancho forte, benefícios concretos e chamada para ação clara.",
  instagram:
    "Adapte o conteúdo para uma publicação do Instagram, com leitura fluida, parágrafos curtos e chamada para ação.",
  whatsapp:
    "Adapte o conteúdo para WhatsApp, usando uma mensagem curta, humana, direta e fácil de responder.",
  "nova-versao":
    "Crie uma versão alternativa e criativa do conteúdo, com abordagem diferente da atual.",
};

export async function refineContent(args: {
  action: string;
  finalPrompt: string;
  content: string;
}): Promise<string> {
  const instruction =
    ACTION_INSTRUCTIONS[args.action] ??
    ACTION_INSTRUCTIONS["melhorar"];

  const raw = await callGemini(
    [
      {
        role: "system",
        content: [
          "Você é o PromptCerto.",
          "Responda somente com o novo conteúdo final em português do Brasil.",
          "Não inclua comentários, explicações ou observações sobre a tarefa.",
        ].join(" "),
      },
      {
        role: "user",
        content: [
          "Prompt profissional original:",
          args.finalPrompt,
          "",
          "Conteúdo atual:",
          args.content,
          "",
          `Tarefa: ${instruction}`,
        ].join("\n"),
      },
    ],
    false,
  );

  if (!raw.trim()) {
    throw new Error(
      "A IA não conseguiu gerar a nova versão do conteúdo.",
    );
  }

  return raw.trim();
}