import type { Product, VerdictResult } from "./types";

export interface SharePayload {
  p: Product;
  v: VerdictResult;
}

function toBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const s = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return toBase64Url(bytes);
}

export function decodeShare(encoded: string): SharePayload | null {
  try {
    const bytes = fromBase64Url(encoded);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.p &&
      typeof parsed.p.name === "string" &&
      typeof parsed.p.priceCents === "number" &&
      parsed.v &&
      typeof parsed.v.headline === "string" &&
      Array.isArray(parsed.v.reasons) &&
      ["COSIGNED", "NOT_COSIGNED", "SLEEP_ON_IT"].includes(parsed.v.verdict)
    ) {
      return parsed as SharePayload;
    }
    return null;
  } catch {
    return null;
  }
}
