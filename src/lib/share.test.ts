import { describe, expect, it, beforeEach } from "vitest";
import { encodeShare, decodeShare } from "./share";

beforeEach(() => {
  // Force a deterministic secret for tests
  process.env.COSIGN_SHARE_SECRET = "test-secret";
});

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

  it("produces a dotted format: payload.sig", () => {
    const encoded = encodeShare({
      p: { name: "x", priceCents: 0 },
      v: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
    });
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(encoded.split(".").length).toBe(2);
  });

  it("is URL-safe (no +, /, =)", () => {
    const encoded = encodeShare({
      p: { name: "x", priceCents: 0 },
      v: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
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
    expect(decodeShare("noDotHere")).toBeNull();
  });

  it("rejects tampered payloads (signature mismatch)", () => {
    const encoded = encodeShare({
      p: { name: "sneakers", priceCents: 5000 },
      v: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
    });
    const [payloadB64, sig] = encoded.split(".");
    // Tamper with payload but keep original sig → mismatch
    const tamperedBody = payloadB64.slice(0, -1) + (payloadB64.endsWith("A") ? "B" : "A");
    expect(decodeShare(`${tamperedBody}.${sig}`)).toBeNull();
  });

  it("rejects unsigned legacy payloads (no dot)", () => {
    // Pre-signing, shares were just bare base64url. Those must be rejected now.
    const bare = Buffer.from(
      JSON.stringify({
        p: { name: "x", priceCents: 0 },
        v: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
      }),
    ).toString("base64url");
    expect(decodeShare(bare)).toBeNull();
  });

  it("rejects a forged signature from a different secret", () => {
    process.env.COSIGN_SHARE_SECRET = "attacker-secret";
    const forged = encodeShare({
      p: { name: "lmao", priceCents: 999 },
      v: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
    });
    process.env.COSIGN_SHARE_SECRET = "real-secret";
    expect(decodeShare(forged)).toBeNull();
  });

  it("clamps negative priceCents to 0", () => {
    const encoded = encodeShare({
      p: { name: "x", priceCents: -99999 },
      v: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
    });
    const decoded = decodeShare(encoded);
    expect(decoded?.p.priceCents).toBe(0);
  });

  it("clamps absurdly large priceCents", () => {
    const encoded = encodeShare({
      p: { name: "x", priceCents: 999_999_999_999 },
      v: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
    });
    const decoded = decodeShare(encoded);
    expect(decoded?.p.priceCents).toBeLessThanOrEqual(10_000_000);
  });

  it("strips control characters + RTL overrides on encode", () => {
    const payload = {
      p: {
        name: "sneaker‮namefake",
        priceCents: 1000,
      },
      v: {
        verdict: "COSIGNED" as const,
        headline: "heyhi",
        reasons: ["a", "b"],
      },
    };
    const encoded = encodeShare(payload);
    const decoded = decodeShare(encoded);
    expect(decoded?.p.name).not.toContain("‮");
    expect(decoded?.v.headline).not.toContain("");
  });

  it("truncates oversize product names", () => {
    const encoded = encodeShare({
      p: { name: "x".repeat(5000), priceCents: 500 },
      v: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
    });
    const decoded = decodeShare(encoded);
    expect(decoded?.p.name.length).toBeLessThanOrEqual(200);
  });
});
