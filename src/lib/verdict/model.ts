import { getAnthropic, PERSONA_MODEL } from "@/lib/anthropic";
import { BROKE_FRIEND_SYSTEM, buildUserContextPrompt, buildPastVerdictsPrompt } from "@/lib/prompts";
import type { UserContext } from "@/lib/types";
import {
  VerdictResponseSchema,
  type VerdictResponse,
  type PastVerdict,
  type AllowedImageType,
} from "./schema";

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
    `user context:\n${buildUserContextPrompt(userContext)}`,
    buildPastVerdictsPrompt(pastVerdicts),
    `the product they want to buy is in the attached screenshot. read it and give your verdict. output JSON only.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: PERSONA_MODEL,
    max_tokens: 1024,
    system: BROKE_FRIEND_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          { type: "text", text: userPrompt },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new ModelError("NO_TEXT", "model returned no text block");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(textBlock.text));
  } catch {
    throw new ModelError("BAD_JSON", "model returned invalid JSON", { raw: textBlock.text });
  }

  const validated = VerdictResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new ModelError("SCHEMA_FAIL", "model response failed schema validation", {
      issues: validated.error.issues,
    });
  }

  return validated.data;
}
