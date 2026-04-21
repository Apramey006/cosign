import { ApiError } from "@google/genai";
import { ModelError } from "./model";

export type VerdictErrorCode =
  | "MODEL_NO_TEXT"
  | "MODEL_BAD_JSON"
  | "MODEL_SCHEMA_FAIL"
  | "UPSTREAM_AUTH"
  | "UPSTREAM_RATE_LIMIT"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_OTHER"
  | "UNKNOWN";

export interface VerdictError {
  code: VerdictErrorCode;
  userMessage: string;
  logMessage: string;
  status: number;
  details?: unknown;
}

function getStatus(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;
  if (typeof err === "object" && err !== null && "status" in err) {
    const s = (err as { status?: unknown }).status;
    if (typeof s === "number") return s;
  }
  return undefined;
}

export function toVerdictError(err: unknown): VerdictError {
  if (err instanceof ModelError) {
    const code: VerdictErrorCode =
      err.code === "NO_TEXT"
        ? "MODEL_NO_TEXT"
        : err.code === "BAD_JSON"
          ? "MODEL_BAD_JSON"
          : "MODEL_SCHEMA_FAIL";
    return {
      code,
      userMessage: "the model returned something weird. try again.",
      logMessage: err.message,
      status: 502,
      details: err.details,
    };
  }

  const status = getStatus(err);
  const rawMessage = err instanceof Error ? err.message : String(err);

  if (status === 401 || status === 403) {
    return {
      code: "UPSTREAM_AUTH",
      userMessage: "server misconfigured. try again later.",
      logMessage: `gemini ${status}: ${rawMessage}`,
      status: 500,
    };
  }

  if (status === 429) {
    return {
      code: "UPSTREAM_RATE_LIMIT",
      userMessage: "too many verdicts right now. give it a minute.",
      logMessage: `gemini 429: ${rawMessage}`,
      status: 429,
    };
  }

  if (status && status >= 500) {
    return {
      code: "UPSTREAM_OTHER",
      userMessage: "gemini is having a moment. try again in a sec.",
      logMessage: `gemini ${status}: ${rawMessage}`,
      status: 502,
    };
  }

  if (status && status >= 400) {
    return {
      code: "UPSTREAM_OTHER",
      userMessage: "something broke talking to the model. try again.",
      logMessage: `gemini ${status}: ${rawMessage}`,
      status,
    };
  }

  if (err instanceof Error && /timeout|ETIMEDOUT|ECONNRESET/i.test(err.message)) {
    return {
      code: "UPSTREAM_TIMEOUT",
      userMessage: "that took too long. try again.",
      logMessage: err.message,
      status: 504,
    };
  }

  return {
    code: "UNKNOWN",
    userMessage: "something broke. try again.",
    logMessage: rawMessage,
    status: 500,
  };
}
