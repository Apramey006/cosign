import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set. See README.");
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

export const PERSONA_MODEL = "gemini-2.5-flash";
