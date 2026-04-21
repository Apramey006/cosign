import { describe, expect, it } from "vitest";
import { ChatRequestSchema, ChatMessageSchema } from "./schema";

const baseReq = {
  product: { name: "hoodie", priceCents: 4000, source: "amazon" },
  verdict: {
    verdict: "NOT_COSIGNED" as const,
    headline: "bro no",
    reasons: ["r1", "r2"],
    roast: "lol",
  },
  userContext: { weeklyBudgetCents: 5000 },
  pastVerdicts: [],
};

describe("ChatRequestSchema", () => {
  it("accepts a minimal well-formed request", () => {
    const out = ChatRequestSchema.safeParse({
      ...baseReq,
      messages: [{ role: "user", content: "but i need it" }],
    });
    expect(out.success).toBe(true);
  });

  it("rejects empty messages array", () => {
    const out = ChatRequestSchema.safeParse({ ...baseReq, messages: [] });
    expect(out.success).toBe(false);
  });

  it("rejects a thread longer than 30 messages (runaway conversation cap)", () => {
    const messages = Array.from({ length: 31 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `msg ${i}`,
    }));
    const out = ChatRequestSchema.safeParse({ ...baseReq, messages });
    expect(out.success).toBe(false);
  });

  it("rejects message content longer than 2000 chars", () => {
    const out = ChatRequestSchema.safeParse({
      ...baseReq,
      messages: [{ role: "user", content: "x".repeat(2001) }],
    });
    expect(out.success).toBe(false);
  });

  it("rejects invalid verdict enum on the original verdict", () => {
    const out = ChatRequestSchema.safeParse({
      ...baseReq,
      verdict: { ...baseReq.verdict, verdict: "MAYBE" },
      messages: [{ role: "user", content: "x" }],
    });
    expect(out.success).toBe(false);
  });
});

describe("ChatMessageSchema", () => {
  it("only accepts user/assistant roles (no system)", () => {
    expect(ChatMessageSchema.safeParse({ role: "system", content: "hi" }).success).toBe(false);
  });
  it("rejects empty content", () => {
    expect(ChatMessageSchema.safeParse({ role: "user", content: "" }).success).toBe(false);
  });
});
