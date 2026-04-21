import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set. See README.");
  }
  client = new Anthropic({ apiKey });
  return client;
}

export const PERSONA_MODEL = "claude-sonnet-4-5";
