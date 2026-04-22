import type { TabEntry } from "./types";

/**
 * Derived signals we pull from the tab so Armaan can reason about patterns
 * without the user having to describe them. Complements whatever they filled
 * into UserContext manually.
 */
export interface TabSummary {
  last30Days: {
    total: number;
    cosigned: number;
    notCosigned: number;
    sleepOnIt: number;
  };
  purchased30d: number;
  purchasedRegret30d: number;
  purchasedStillGlad30d: number;
  /** Top 3 "category" lanes by verdict count — a crude category derived from the first word of the product name. */
  topCategories: Array<{
    category: string;
    count: number;
    regrets: number;
    total: number;
  }>;
}

function coarseCategory(productName: string): string {
  // Normalize — lowercase, strip punctuation, take the last meaningful word
  // ("nike dunk low panda" → "panda"? that's bad). Better: take the shortest
  // word longer than 3 chars from the LAST 3 tokens, else the first word.
  const tokens = productName
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return "misc";
  // Words that are often the noun/category in a product name
  const categoryHints = [
    "hoodie",
    "sweater",
    "jacket",
    "pants",
    "jeans",
    "shirt",
    "tshirt",
    "shoes",
    "sneaker",
    "sneakers",
    "dunks",
    "jordans",
    "boots",
    "headphones",
    "airpods",
    "earbuds",
    "laptop",
    "macbook",
    "phone",
    "iphone",
    "ipad",
    "tablet",
    "chair",
    "desk",
    "lamp",
    "candle",
    "journal",
    "planner",
    "notebook",
    "book",
    "textbook",
    "ticket",
    "ticket",
    "serum",
    "skincare",
    "fragrance",
    "perfume",
    "cream",
    "mascara",
    "lipstick",
    "bag",
    "backpack",
    "wallet",
    "hat",
    "cap",
    "sunglasses",
    "watch",
    "ring",
    "necklace",
    "figure",
    "lego",
    "vinyl",
    "poster",
    "frame",
    "print",
  ];
  for (const hint of categoryHints) {
    if (tokens.includes(hint)) return hint;
  }
  // fall back to the last token that's 4+ chars (often the noun in English
  // product names like "levi's 501 jeans" → "jeans")
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].length >= 4) return tokens[i];
  }
  return tokens[0] ?? "misc";
}

export function summarizeTab(entries: TabEntry[]): TabSummary {
  const now = Date.now();
  const THIRTY_D = 30 * 86400_000;

  let total = 0;
  let cosigned = 0;
  let notCosigned = 0;
  let sleepOnIt = 0;
  let purchased30d = 0;
  let purchasedRegret30d = 0;
  let purchasedStillGlad30d = 0;

  const categoryMap = new Map<
    string,
    { count: number; regrets: number; total: number }
  >();

  for (const e of entries) {
    const age = now - new Date(e.createdAt).getTime();
    const recent = age <= THIRTY_D;

    if (recent) {
      total++;
      if (e.verdict.verdict === "COSIGNED") cosigned++;
      else if (e.verdict.verdict === "NOT_COSIGNED") notCosigned++;
      else if (e.verdict.verdict === "SLEEP_ON_IT") sleepOnIt++;
      if (e.purchased) {
        purchased30d++;
        if (e.stillGlad === false) purchasedRegret30d++;
        if (e.stillGlad === true) purchasedStillGlad30d++;
      }
    }

    const cat = coarseCategory(e.product.name);
    const existing = categoryMap.get(cat) ?? { count: 0, regrets: 0, total: 0 };
    existing.count += 1;
    existing.total += 1;
    if (e.stillGlad === false) existing.regrets += 1;
    categoryMap.set(cat, existing);
  }

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    last30Days: { total, cosigned, notCosigned, sleepOnIt },
    purchased30d,
    purchasedRegret30d,
    purchasedStillGlad30d,
    topCategories,
  };
}

/**
 * Formats the tab summary as an XML block for the system prompt.
 * Empty summaries return an empty string so we don't confuse the model.
 */
export function formatTabSummaryForPrompt(summary: TabSummary): string {
  if (summary.last30Days.total === 0 && summary.topCategories.length === 0) {
    return "";
  }

  const lines: string[] = [];
  if (summary.last30Days.total > 0) {
    lines.push(
      `last 30 days: ${summary.last30Days.total} verdicts (${summary.last30Days.cosigned} cosigned, ${summary.last30Days.notCosigned} rejected, ${summary.last30Days.sleepOnIt} slept on)`,
    );
  }
  if (summary.purchased30d > 0) {
    lines.push(
      `purchased in last 30d: ${summary.purchased30d}; of those, ${summary.purchasedRegret30d} regrets and ${summary.purchasedStillGlad30d} still glad`,
    );
  }
  if (summary.topCategories.length > 0) {
    const cats = summary.topCategories
      .map((c) => {
        const regretNote =
          c.regrets > 0 ? ` (${c.regrets} regrets)` : c.regrets === 0 && c.total > 1 ? " (no regrets)" : "";
        return `${c.category}×${c.count}${regretNote}`;
      })
      .join(", ");
    lines.push(`top lanes: ${cats}`);
  }
  return `<tab_summary>\n${lines.join("\n")}\n</tab_summary>`;
}
