import Anthropic from "@anthropic-ai/sdk";
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

  if (err instanceof Anthropic.APIError) {
    if (err.status === 401) {
      return {
        code: "UPSTREAM_AUTH",
        userMessage: "server misconfigured. try again later.",
        logMessage: `anthropic 401: ${err.message}`,
        status: 500,
      };
    }
    if (err.status === 429) {
      return {
        code: "UPSTREAM_RATE_LIMIT",
        userMessage: "too many verdicts right now. give it a minute.",
        logMessage: `anthropic 429: ${err.message}`,
        status: 429,
      };
    }
    if (err.status && err.status >= 500) {
      return {
        code: "UPSTREAM_OTHER",
        userMessage: "claude is having a moment. try again in a sec.",
        logMessage: `anthropic ${err.status}: ${err.message}`,
        status: 502,
      };
    }
    return {
      code: "UPSTREAM_OTHER",
      userMessage: "something broke talking to the model. try again.",
      logMessage: `anthropic ${err.status}: ${err.message}`,
      status: err.status ?? 502,
    };
  }

  if (
    err instanceof Anthropic.APIConnectionTimeoutError ||
    (err instanceof Error && /timeout/i.test(err.message))
  ) {
    return {
      code: "UPSTREAM_TIMEOUT",
      userMessage: "that took too long. try again.",
      logMessage: err instanceof Error ? err.message : String(err),
      status: 504,
    };
  }

  return {
    code: "UNKNOWN",
    userMessage: "something broke. try again.",
    logMessage: err instanceof Error ? err.message : String(err),
    status: 500,
  };
}
