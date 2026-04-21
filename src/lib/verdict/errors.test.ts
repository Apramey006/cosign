import { describe, expect, it } from "vitest";
import { ApiError } from "@google/genai";
import { toVerdictError } from "./errors";
import { ModelError } from "./model";

describe("toVerdictError", () => {
  it("maps ModelError NO_TEXT → MODEL_NO_TEXT / 502", () => {
    const ve = toVerdictError(new ModelError("NO_TEXT", "empty"));
    expect(ve.code).toBe("MODEL_NO_TEXT");
    expect(ve.status).toBe(502);
  });

  it("maps ModelError BAD_JSON with details", () => {
    const ve = toVerdictError(
      new ModelError("BAD_JSON", "bad", { raw: "not json" }),
    );
    expect(ve.code).toBe("MODEL_BAD_JSON");
    expect(ve.details).toEqual({ raw: "not json" });
  });

  it("maps Gemini 401 → UPSTREAM_AUTH / 500", () => {
    const err = new ApiError({ status: 401, message: "bad key" });
    const ve = toVerdictError(err);
    expect(ve.code).toBe("UPSTREAM_AUTH");
    expect(ve.status).toBe(500);
  });

  it("maps Gemini 403 → UPSTREAM_AUTH / 500", () => {
    const err = new ApiError({ status: 403, message: "forbidden" });
    const ve = toVerdictError(err);
    expect(ve.code).toBe("UPSTREAM_AUTH");
    expect(ve.status).toBe(500);
  });

  it("maps Gemini 429 → UPSTREAM_RATE_LIMIT / 429", () => {
    const err = new ApiError({ status: 429, message: "slow down" });
    const ve = toVerdictError(err);
    expect(ve.code).toBe("UPSTREAM_RATE_LIMIT");
    expect(ve.status).toBe(429);
  });

  it("maps Gemini 503 → UPSTREAM_OTHER / 502", () => {
    const err = new ApiError({ status: 503, message: "down" });
    const ve = toVerdictError(err);
    expect(ve.code).toBe("UPSTREAM_OTHER");
    expect(ve.status).toBe(502);
  });

  it("recognizes duck-typed status on plain errors too", () => {
    const err = Object.assign(new Error("oops"), { status: 429 });
    const ve = toVerdictError(err);
    expect(ve.code).toBe("UPSTREAM_RATE_LIMIT");
  });

  it("maps unknown errors to UNKNOWN / 500", () => {
    const ve = toVerdictError(new Error("random"));
    expect(ve.code).toBe("UNKNOWN");
    expect(ve.status).toBe(500);
  });

  it("surfaces user-safe messages only", () => {
    const err = new ApiError({
      status: 401,
      message: "AIzaSy-leaked-key-here-invalid",
    });
    const ve = toVerdictError(err);
    expect(ve.userMessage).not.toContain("AIzaSy");
  });

  it("maps timeout-like errors to UPSTREAM_TIMEOUT / 504", () => {
    const ve = toVerdictError(new Error("request ETIMEDOUT"));
    expect(ve.code).toBe("UPSTREAM_TIMEOUT");
    expect(ve.status).toBe(504);
  });
});
