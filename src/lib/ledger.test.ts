import { describe, expect, it } from "vitest";
import { computeLedger, armaanReactionForUpdate, FOLLOW_UP_MS } from "./ledger";
import type { TabEntry } from "./types";

function entry(partial: Partial<TabEntry>): TabEntry {
  return {
    id: partial.id ?? Math.random().toString(),
    product: {
      name: "generic item",
      priceCents: 5000,
      source: "amazon",
      ...partial.product,
    },
    verdict: {
      verdict: "COSIGNED",
      headline: "yeah",
      reasons: ["r1", "r2"],
      ...partial.verdict,
    },
    purchased: partial.purchased ?? false,
    stillGlad: partial.stillGlad ?? null,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    followUpAt: partial.followUpAt,
  };
}

describe("computeLedger", () => {
  it("counts verdict sides", () => {
    const l = computeLedger([
      entry({ verdict: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] } }),
      entry({ verdict: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] } }),
      entry({ verdict: { verdict: "NOT_COSIGNED", headline: "n", reasons: ["a", "b"] } }),
      entry({ verdict: { verdict: "SLEEP_ON_IT", headline: "hm", reasons: ["a", "b"] } }),
    ]);
    expect(l.cosigned).toBe(2);
    expect(l.notCosigned).toBe(1);
    expect(l.sleepOnIt).toBe(1);
    expect(l.total).toBe(4);
  });

  it("sums NOT_COSIGNED prices into rejectsDollarTotal (only unpurchased)", () => {
    const l = computeLedger([
      entry({
        verdict: { verdict: "NOT_COSIGNED", headline: "n", reasons: ["a", "b"] },
        product: { name: "hoodie", priceCents: 8000 },
      }),
      entry({
        verdict: { verdict: "NOT_COSIGNED", headline: "n", reasons: ["a", "b"] },
        product: { name: "ipad", priceCents: 75000 },
        purchased: true, // should NOT count
      }),
    ]);
    expect(l.rejectsDollarTotal).toBe(8000);
  });

  it("computes armaan accuracy only on resolved purchased entries", () => {
    const l = computeLedger([
      entry({
        verdict: { verdict: "NOT_COSIGNED", headline: "n", reasons: ["a", "b"] },
        purchased: true,
        stillGlad: false, // armaan was right
      }),
      entry({
        verdict: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
        purchased: true,
        stillGlad: true, // armaan was right
      }),
      entry({
        verdict: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
        purchased: true,
        stillGlad: false, // armaan was wrong
      }),
      entry({ purchased: false }), // not resolved — ignored
    ]);
    expect(l.armaanAccuracy).toEqual({ total: 3, correct: 2, percent: 67 });
  });

  it("returns null armaanAccuracy when no resolved purchases exist", () => {
    const l = computeLedger([entry({ purchased: false })]);
    expect(l.armaanAccuracy).toBeNull();
  });

  it("surfaces pending follow-ups once followUpAt is in the past and stillGlad is null", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const future = new Date(Date.now() + FOLLOW_UP_MS).toISOString();
    const l = computeLedger([
      entry({ id: "due", purchased: true, stillGlad: null, followUpAt: past }),
      entry({ id: "not-due", purchased: true, stillGlad: null, followUpAt: future }),
      entry({ id: "already-resolved", purchased: true, stillGlad: true, followUpAt: past }),
    ]);
    expect(l.pendingFollowUpIds).toEqual(["due"]);
  });
});

describe("armaanReactionForUpdate", () => {
  it("snarks when user buys something armaan rejected", () => {
    const e = entry({
      verdict: { verdict: "NOT_COSIGNED", headline: "n", reasons: ["a", "b"] },
    });
    const out = armaanReactionForUpdate(e, { purchased: true }, []);
    expect(out?.toLowerCase()).toMatch(/anyway|we'?ll see/);
  });

  it("blesses when user buys something armaan cosigned", () => {
    const e = entry({
      verdict: { verdict: "COSIGNED", headline: "y", reasons: ["a", "b"] },
    });
    const out = armaanReactionForUpdate(e, { purchased: true }, []);
    expect(out?.toLowerCase()).toMatch(/bless|approves/);
  });

  it("calls it when user regrets something armaan rejected", () => {
    const e = entry({
      verdict: { verdict: "NOT_COSIGNED", headline: "n", reasons: ["a", "b"] },
    });
    const out = armaanReactionForUpdate(e, { stillGlad: false }, []);
    expect(out?.toLowerCase()).toMatch(/called it/);
  });

  it("counts category regrets when stacking regrets in same product-name bucket", () => {
    const hoodie1 = entry({
      id: "1",
      verdict: { verdict: "NOT_COSIGNED", headline: "n", reasons: ["a", "b"] },
      product: { name: "champion hoodie", priceCents: 5000 },
      stillGlad: false,
    });
    const hoodie2 = entry({
      id: "2",
      verdict: { verdict: "NOT_COSIGNED", headline: "n", reasons: ["a", "b"] },
      product: { name: "champion hoodie", priceCents: 5000 },
    });
    const out = armaanReactionForUpdate(hoodie2, { stillGlad: false }, [hoodie1]);
    expect(out).toMatch(/2 regrets|2 in/i);
  });
});
