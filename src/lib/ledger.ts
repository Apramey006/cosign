import type { TabEntry } from "./types";

export const FOLLOW_UP_DAYS = 30;
export const FOLLOW_UP_MS = FOLLOW_UP_DAYS * 86400_000;

export interface LedgerStats {
  total: number;
  cosigned: number;
  notCosigned: number;
  sleepOnIt: number;
  purchasedCount: number;
  stillGladCount: number;
  regretCount: number;
  pendingFollowUpIds: string[];
  rejectsDollarTotal: number;
  armaanAccuracy: {
    total: number;
    correct: number;
    percent: number;
  } | null;
  mostRecentStillGlad: TabEntry | null;
}

export function computeLedger(entries: TabEntry[]): LedgerStats {
  const now = Date.now();
  let cosigned = 0;
  let notCosigned = 0;
  let sleepOnIt = 0;
  let purchasedCount = 0;
  let stillGladCount = 0;
  let regretCount = 0;
  let rejectsDollarTotal = 0;
  const pendingFollowUpIds: string[] = [];
  let accurate = 0;
  let judgedOpportunities = 0;
  let mostRecentStillGlad: TabEntry | null = null;

  for (const e of entries) {
    if (e.verdict.verdict === "COSIGNED") cosigned++;
    else if (e.verdict.verdict === "NOT_COSIGNED") notCosigned++;
    else if (e.verdict.verdict === "SLEEP_ON_IT") sleepOnIt++;

    if (e.purchased) {
      purchasedCount++;
      if (e.stillGlad === true) {
        stillGladCount++;
        if (!mostRecentStillGlad || e.createdAt > mostRecentStillGlad.createdAt) {
          mostRecentStillGlad = e;
        }
      }
      if (e.stillGlad === false) regretCount++;
      if (e.followUpAt && e.stillGlad === null) {
        const followAt = new Date(e.followUpAt).getTime();
        if (!isNaN(followAt) && now >= followAt) pendingFollowUpIds.push(e.id);
      }
    } else {
      if (e.verdict.verdict === "NOT_COSIGNED") {
        rejectsDollarTotal += e.product.priceCents;
      }
    }

    if (e.purchased && e.stillGlad !== null && e.stillGlad !== undefined) {
      judgedOpportunities++;
      // Armaan was "right" if:
      //   NOT_COSIGNED + they bought it and regret it (he called it)
      //   COSIGNED + they bought it and still like it (he was right)
      const armaanRight =
        (e.verdict.verdict === "NOT_COSIGNED" && e.stillGlad === false) ||
        (e.verdict.verdict === "COSIGNED" && e.stillGlad === true);
      if (armaanRight) accurate++;
    }
  }

  const armaanAccuracy =
    judgedOpportunities === 0
      ? null
      : {
          total: judgedOpportunities,
          correct: accurate,
          percent: Math.round((accurate / judgedOpportunities) * 100),
        };

  return {
    total: entries.length,
    cosigned,
    notCosigned,
    sleepOnIt,
    purchasedCount,
    stillGladCount,
    regretCount,
    pendingFollowUpIds,
    rejectsDollarTotal,
    armaanAccuracy,
    mostRecentStillGlad,
  };
}

/**
 * Generates a short client-side "armaan reaction" to a just-updated tab entry.
 * No API call — pure template keyed on the update.
 */
export function armaanReactionForUpdate(
  entry: TabEntry,
  patch: { purchased?: boolean; stillGlad?: boolean | null },
  allEntries: TabEntry[],
): string | null {
  if (patch.purchased === true) {
    return entry.verdict.verdict === "NOT_COSIGNED"
      ? "bro u bought it anyway. we'll see."
      : entry.verdict.verdict === "SLEEP_ON_IT"
        ? "aight, noted. hope u thought about it."
        : "bless. armaan approves.";
  }

  if (patch.stillGlad === true) {
    return entry.verdict.verdict === "COSIGNED"
      ? "told u. 2/2 on this vibe."
      : "ok maybe i was wrong. rare W for u.";
  }

  if (patch.stillGlad === false) {
    const regretInCategory = allEntries.filter(
      (e) =>
        e.id !== entry.id &&
        e.stillGlad === false &&
        e.product.name.toLowerCase().split(" ")[0] ===
          entry.product.name.toLowerCase().split(" ")[0],
    ).length;
    if (entry.verdict.verdict === "NOT_COSIGNED") {
      if (regretInCategory > 0) {
        return `called it. that's ${regretInCategory + 1} regrets in the same lane.`;
      }
      return "called it.";
    }
    return "dang. noted — ur profile just updated.";
  }

  return null;
}
