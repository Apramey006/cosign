/**
 * Minimal structured-log helpers so Vercel logs can be grepped for error rate,
 * rate-limit hits, and upstream latency without wiring up external observability.
 *
 *   grep '"ev":"verdict_ok"' → successful verdicts
 *   grep '"ev":"verdict_err"' → failed verdicts
 *   grep '"ev":"rate_limit_hit"' → abuse detection
 *   grep '"ev":"model_call"' → per-call gemini latency
 */

export function logOk(
  ev: "verdict_ok" | "chat_ok",
  extras: Record<string, unknown>,
): void {
  console.log(JSON.stringify({ lvl: "info", ev, ...extras }));
}

export function logErr(
  ev: "verdict_err" | "chat_err" | "config_err",
  code: string,
  extras: Record<string, unknown>,
): void {
  console.error(JSON.stringify({ lvl: "error", ev, code, ...extras }));
}

export function logRateLimit(path: string, keyPrefix: string): void {
  console.warn(
    JSON.stringify({
      lvl: "warn",
      ev: "rate_limit_hit",
      path,
      key: keyPrefix.slice(0, 10),
    }),
  );
}

export function logModelCall(
  model: string,
  ms: number,
  ok: boolean,
): void {
  console.log(
    JSON.stringify({
      lvl: "info",
      ev: "model_call",
      model,
      ms,
      ok,
    }),
  );
}

/**
 * Verifies GEMINI_API_KEY is set. Returns a distinct error code we can
 * log/surface independently of generic "UNKNOWN / something broke" errors.
 */
export function assertGeminiKey(): string | null {
  if (!process.env.GEMINI_API_KEY) {
    return "CONFIG_MISSING_KEY";
  }
  return null;
}
