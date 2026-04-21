import { describe, expect, it } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
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

  it("maps Anthropic 401 → UPSTREAM_AUTH / 500", () => {
    const err = new Anthropic.APIError(401, { type: "error" }, "bad key", new Headers());
    const ve = toVerdictError(err);
    expect(ve.code).toBe("UPSTREAM_AUTH");
    expect(ve.status).toBe(500);
  });

  it("maps Anthropic 429 → UPSTREAM_RATE_LIMIT / 429", () => {
    const err = new Anthropic.APIError(429, { type: "error" }, "slow down", new Headers());
    const ve = toVerdictError(err);
    expect(ve.code).toBe("UPSTREAM_RATE_LIMIT");
    expect(ve.status).toBe(429);
  });

  it("maps Anthropic 503 → UPSTREAM_OTHER / 502", () => {
    const err = new Anthropic.APIError(503, { type: "error" }, "down", new Headers());
    const ve = toVerdictError(err);
    expect(ve.code).toBe("UPSTREAM_OTHER");
    expect(ve.status).toBe(502);
  });

  it("maps unknown errors to UNKNOWN / 500", () => {
    const ve = toVerdictError(new Error("random"));
    expect(ve.code).toBe("UNKNOWN");
    expect(ve.status).toBe(500);
  });

  it("surfaces user-safe messages only", () => {
    const err = new Anthropic.APIError(
      401,
      { type: "error" },
      "sk-ant-key-leaked-here-invalid",
      new Headers(),
    );
    const ve = toVerdictError(err);
    expect(ve.userMessage).not.toContain("sk-ant");
  });
});
