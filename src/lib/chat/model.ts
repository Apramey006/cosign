import { getGemini, PERSONA_MODEL } from "@/lib/gemini";
import { ARMAAN_CHAT_SYSTEM, buildUserContextPrompt, buildPastVerdictsPrompt } from "@/lib/prompts";
import { formatPrice } from "@/lib/utils";
import type { ChatMessage, ChatRequest } from "./schema";

function buildOpeningContext(req: Omit<ChatRequest, "messages">): string {
  const verdictLabel = req.verdict.verdict.replace(/_/g, " ").toLowerCase();
  const price = formatPrice(req.product.priceCents);
  const source = req.product.source ? ` (${req.product.source})` : "";

  const reasonsText = req.verdict.reasons.map((r) => `  - ${r}`).join("\n");

  return `<original_verdict>
product: ${req.product.name} · ${price}${source}
your verdict: ${verdictLabel}
your headline: ${req.verdict.headline}
your reasons:
${reasonsText}${req.verdict.roast ? `\nyour roast: ${req.verdict.roast}` : ""}
</original_verdict>

${buildUserContextPrompt(req.userContext ?? null)}
${buildPastVerdictsPrompt(req.pastVerdicts ?? [])}

the user is now continuing the conversation with you about this verdict.`;
}

export async function callChatModel(req: ChatRequest): Promise<string> {
  const { messages, ...rest } = req;
  const opening = buildOpeningContext(rest);

  const contents = [
    { role: "user", parts: [{ text: opening }] },
    ...messages.map((m: ChatMessage) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  const gemini = getGemini();
  const response = await gemini.models.generateContent({
    model: PERSONA_MODEL,
    contents,
    config: {
      systemInstruction: ARMAAN_CHAT_SYSTEM,
      maxOutputTokens: 512,
      temperature: 0.9,
    },
  });

  const text = response.text;
  if (!text || text.trim().length === 0) {
    throw new Error("empty reply from model");
  }
  return text.trim();
}
