import { Type } from "@google/genai";
import { getGemini, PERSONA_MODEL } from "@/lib/gemini";
import { ARMAAN_SYSTEM, buildUserContextPrompt, buildPastVerdictsPrompt } from "@/lib/prompts";
import type { UserContext } from "@/lib/types";
import {
  VerdictResponseSchema,
  type VerdictResponse,
  type PastVerdict,
  type AllowedImageType,
} from "./schema";

const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    product: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        priceCents: { type: Type.INTEGER },
        source: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["name", "priceCents"],
      propertyOrdering: ["name", "priceCents", "source", "description"],
    },
    verdict: {
      type: Type.STRING,
      enum: ["COSIGNED", "NOT_COSIGNED", "SLEEP_ON_IT"],
    },
    headline: { type: Type.STRING },
    reasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: "2",
      maxItems: "5",
    },
    roast: { type: Type.STRING },
  },
  required: ["product", "verdict", "headline", "reasons"],
  propertyOrdering: ["product", "verdict", "headline", "reasons", "roast"],
};

export class ModelError extends Error {
  code: "NO_TEXT" | "BAD_JSON" | "SCHEMA_FAIL";
  details?: unknown;
  constructor(code: "NO_TEXT" | "BAD_JSON" | "SCHEMA_FAIL", message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

interface CallVerdictModelArgs {
  base64Image: string;
  mediaType: AllowedImageType;
  userContext: UserContext | null;
  pastVerdicts: PastVerdict[];
}

function stripJsonFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
}

export async function callVerdictModel({
  base64Image,
  mediaType,
  userContext,
  pastVerdicts,
}: CallVerdictModelArgs): Promise<VerdictResponse> {
  const userPrompt = [
    buildUserContextPrompt(userContext),
    buildPastVerdictsPrompt(pastVerdicts),
    `the product they want to buy is in the attached screenshot. read it and give your verdict. output a single JSON object matching the schema in the system prompt.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const gemini = getGemini();
  const response = await gemini.models.generateContent({
    model: PERSONA_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: mediaType, data: base64Image } },
          { text: userPrompt },
        ],
      },
    ],
    config: {
      systemInstruction: ARMAAN_SYSTEM,
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
      maxOutputTokens: 1024,
      temperature: 0.95,
    },
  });

  const text = response.text;
  if (!text || text.trim().length === 0) {
    throw new ModelError("NO_TEXT", "model returned no text");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(text));
  } catch {
    throw new ModelError("BAD_JSON", "model returned invalid JSON", { raw: text });
  }

  const validated = VerdictResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new ModelError("SCHEMA_FAIL", "model response failed schema validation", {
      issues: validated.error.issues,
    });
  }

  return validated.data;
}
