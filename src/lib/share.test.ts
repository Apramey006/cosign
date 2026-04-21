import { describe, expect, it } from "vitest";
import { encodeShare, decodeShare } from "./share";

describe("share encode/decode", () => {
  it("round-trips a full verdict payload", () => {
    const payload = {
      p: {
        name: "Nike Dunk Low Panda",
        priceCents: 11000,
        source: "amazon.com",
        description: "classic sneaker",
      },
      v: {
        verdict: "NOT_COSIGNED" as const,
        headline: "bro you already have three pairs",
        reasons: ["reason one", "reason two"],
        roast: "break the cycle king",
      },
    };
    const encoded = encodeShare(payload);
    const decoded = decodeShare(encoded);
    expect(decoded).toEqual(payload);
  });

  it("is URL-safe (no +, /, =)", () => {
    const encoded = encodeShare({
      p: { name: "x", priceCents: 0 },
      v: {
        verdict: "COSIGNED",
        headline: "y",
        reasons: ["a", "b"],
      },
    });
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("handles unicode and emoji", () => {
    const payload = {
      p: { name: "café ☕", priceCents: 500 },
      v: {
        verdict: "COSIGNED" as const,
        headline: "vibes check ✓",
        reasons: ["yes", "good"],
      },
    };
    const encoded = encodeShare(payload);
    const decoded = decodeShare(encoded);
    expect(decoded).toEqual(payload);
  });

  it("returns null on malformed input", () => {
    expect(decodeShare("not-valid-base64-!!")).toBeNull();
    expect(decodeShare("")).toBeNull();
  });

  it("returns null on valid base64 but wrong shape", () => {
    const bogus = Buffer.from(JSON.stringify({ foo: "bar" })).toString("base64url");
    expect(decodeShare(bogus)).toBeNull();
  });

  it("returns null on invalid verdict enum", () => {
    const bogus = Buffer.from(
      JSON.stringify({
        p: { name: "x", priceCents: 0 },
        v: { verdict: "MAYBE", headline: "y", reasons: ["a", "b"] },
      }),
    ).toString("base64url");
    expect(decodeShare(bogus)).toBeNull();
  });
});
