import { describe, expect, it, beforeEach, vi } from "vitest";
import { checkRateLimit, clientKeyFromRequest } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("allows the first 10 requests in a window", () => {
    const key = `test-allow-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit(key);
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(9 - i);
    }
  });

  it("blocks the 11th request and returns Retry-After", () => {
    const key = `test-block-${Math.random()}`;
    for (let i = 0; i < 10; i++) checkRateLimit(key);
    const r = checkRateLimit(key);
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.retryAfterSec).toBeGreaterThan(0);
    expect(r.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it("isolates buckets by key (different IPs)", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    for (let i = 0; i < 10; i++) checkRateLimit(keyA);
    expect(checkRateLimit(keyA).ok).toBe(false);
    expect(checkRateLimit(keyB).ok).toBe(true);
  });
});

describe("clientKeyFromRequest", () => {
  it("prefers x-forwarded-for (first hop)", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(clientKeyFromRequest(req)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-real-ip": "203.0.113.9" },
    });
    expect(clientKeyFromRequest(req)).toBe("203.0.113.9");
  });

  it("returns 'unknown' when no headers present", () => {
    const req = new Request("http://localhost/");
    expect(clientKeyFromRequest(req)).toBe("unknown");
  });
});
