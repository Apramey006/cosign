import { describe, expect, it } from "vitest";
import { summarizeTab, formatTabSummaryForPrompt } from "./profile-stats";
import type { TabEntry } from "./types";

type EntryArgs = {
  name: string;
  verdict: "COSIGNED" | "NOT_COSIGNED" | "SLEEP_ON_IT";
  purchased?: boolean;
  stillGlad?: boolean | null;
  createdAt?: string;
  priceCents?: number;
};

function e(args: EntryArgs): TabEntry {
  return {
    id: Math.random().toString(),
    product: {
      name: args.name,
      priceCents: args.priceCents ?? 5000,
      source: "amazon",
    },
    verdict: {
      verdict: args.verdict,
      headline: "x",
      reasons: ["a", "b"],
    },
    purchased: args.purchased ?? false,
    stillGlad: args.stillGlad ?? null,
    createdAt: args.createdAt ?? new Date().toISOString(),
  };
}

describe("summarizeTab", () => {
  it("counts last-30-day verdict splits", () => {
    const s = summarizeTab([
      e({ name: "item a", verdict: "COSIGNED" }),
      e({ name: "item b", verdict: "COSIGNED" }),
      e({ name: "item c", verdict: "NOT_COSIGNED" }),
      e({ name: "item d", verdict: "SLEEP_ON_IT" }),
    ]);
    expect(s.last30Days.total).toBe(4);
    expect(s.last30Days.cosigned).toBe(2);
    expect(s.last30Days.notCosigned).toBe(1);
    expect(s.last30Days.sleepOnIt).toBe(1);
  });

  it("excludes verdicts older than 30 days from last30Days", () => {
    const old = new Date(Date.now() - 40 * 86400_000).toISOString();
    const s = summarizeTab([
      e({ name: "old item", verdict: "COSIGNED", createdAt: old }),
      e({ name: "new item", verdict: "COSIGNED" }),
    ]);
    expect(s.last30Days.total).toBe(1);
  });

  it("derives category lanes and counts regrets per lane", () => {
    const s = summarizeTab([
      e({ name: "champion hoodie grey", verdict: "COSIGNED", purchased: true, stillGlad: false }),
      e({ name: "nike hoodie black", verdict: "NOT_COSIGNED" }),
      e({ name: "essentials hoodie tan", verdict: "NOT_COSIGNED" }),
      e({ name: "nike dunk sneakers", verdict: "NOT_COSIGNED", purchased: true, stillGlad: false }),
    ]);
    const hoodieLane = s.topCategories.find((c) => c.category === "hoodie");
    expect(hoodieLane?.count).toBe(3);
    expect(hoodieLane?.regrets).toBe(1);
  });

  it("tracks purchase-regret split over 30d", () => {
    const s = summarizeTab([
      e({ name: "a hoodie", verdict: "COSIGNED", purchased: true, stillGlad: true }),
      e({ name: "b sneakers", verdict: "NOT_COSIGNED", purchased: true, stillGlad: false }),
      e({ name: "c ticket", verdict: "COSIGNED", purchased: true, stillGlad: null }),
      e({ name: "d chair", verdict: "NOT_COSIGNED", purchased: false }),
    ]);
    expect(s.purchased30d).toBe(3);
    expect(s.purchasedStillGlad30d).toBe(1);
    expect(s.purchasedRegret30d).toBe(1);
  });
});

describe("formatTabSummaryForPrompt", () => {
  it("returns empty for an empty tab (so we don't clutter the prompt)", () => {
    const empty = summarizeTab([]);
    expect(formatTabSummaryForPrompt(empty)).toBe("");
  });

  it("wraps the summary in <tab_summary> tags", () => {
    const summary = summarizeTab([
      e({ name: "a hoodie", verdict: "COSIGNED" }),
      e({ name: "b hoodie", verdict: "NOT_COSIGNED" }),
    ]);
    const out = formatTabSummaryForPrompt(summary);
    expect(out).toMatch(/<tab_summary>/);
    expect(out).toMatch(/hoodie/);
  });

  it("names specific regret counts in category lanes", () => {
    const summary = summarizeTab([
      e({ name: "hoodie a", verdict: "COSIGNED", purchased: true, stillGlad: false }),
      e({ name: "hoodie b", verdict: "NOT_COSIGNED", purchased: true, stillGlad: false }),
    ]);
    const out = formatTabSummaryForPrompt(summary);
    expect(out).toMatch(/hoodie/);
    expect(out).toMatch(/regret/);
  });
});
