"use client";

import { useMemo } from "react";
import { computeLedger } from "@/lib/ledger";
import { formatPrice } from "@/lib/utils";
import type { TabEntry } from "@/lib/types";

interface ArmaanLedgerProps {
  entries: TabEntry[];
  onReviewClick?: (id: string) => void;
}

function weekLabel(): string {
  const now = new Date();
  const month = now.toLocaleDateString(undefined, { month: "short" });
  const day = now.getDate();
  return `week of ${month.toLowerCase()} ${day}`;
}

export function ArmaanLedger({ entries, onReviewClick }: ArmaanLedgerProps) {
  const stats = useMemo(() => computeLedger(entries), [entries]);

  // Don't bother rendering the ledger until there's real signal
  if (stats.total < 3) return null;

  const pending = stats.pendingFollowUpIds
    .map((id) => entries.find((e) => e.id === id))
    .filter((e): e is TabEntry => !!e);

  return (
    <section className="bg-paper-tint border border-ink/20 px-6 md:px-10 py-7 md:py-9 shadow-[2px_4px_0_rgba(28,25,23,0.12)]">
      <div className="rule-dashed h-px mb-5" />
      <div className="flex items-center justify-between mb-5 font-receipt text-xs text-ink-muted uppercase tracking-widest">
        <span>armaan&apos;s ledger</span>
        <span>{weekLabel()}</span>
      </div>

      <ul className="space-y-2.5 font-receipt text-sm md:text-base text-ink">
        <li className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="text-stamp-red">›</span>
            <span>
              u cosigned <span className="font-bold">{stats.cosigned}</span>, rejected{" "}
              <span className="font-bold">{stats.notCosigned}</span>
              {stats.sleepOnIt > 0 ? (
                <>
                  , slept on <span className="font-bold">{stats.sleepOnIt}</span>
                </>
              ) : null}
            </span>
          </span>
        </li>

        {stats.rejectsDollarTotal > 0 && (
          <li className="flex items-center gap-2">
            <span className="text-stamp-red">›</span>
            <span>
              armaan saved u{" "}
              <span className="font-bold">
                {formatPrice(stats.rejectsDollarTotal)}
              </span>{" "}
              in impulse buys
            </span>
          </li>
        )}

        {stats.armaanAccuracy && stats.armaanAccuracy.total >= 2 && (
          <li className="flex items-center gap-2">
            <span className="text-stamp-red">›</span>
            <span>
              armaan was right{" "}
              <span className="font-bold">
                {stats.armaanAccuracy.correct}/{stats.armaanAccuracy.total}
              </span>{" "}
              times (<span className="font-bold">{stats.armaanAccuracy.percent}%</span>)
            </span>
          </li>
        )}

        {stats.mostRecentStillGlad && (
          <li className="flex items-center gap-2">
            <span className="text-stamp-red">›</span>
            <span>
              still glad about:{" "}
              <span className="font-bold">{stats.mostRecentStillGlad.product.name}</span>
            </span>
          </li>
        )}
      </ul>

      {pending.length > 0 && (
        <>
          <div className="rule-dashed h-px my-5" />
          <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest mb-3">
            armaan wants to know
          </p>
          <ul className="space-y-2">
            {pending.slice(0, 3).map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onReviewClick?.(e.id)}
                  className="w-full text-left font-receipt text-sm md:text-base text-ink hover:text-stamp-red focus:outline-none focus-visible:text-stamp-red transition-colors flex justify-between items-center gap-4 py-1"
                >
                  <span className="flex-1 truncate">
                    still glad about{" "}
                    <span className="font-bold">{e.product.name}</span>?
                  </span>
                  <span className="font-receipt text-xs text-ink-fade shrink-0">
                    review →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="rule-dashed h-px mt-5" />
      <div className="flex items-center justify-between mt-3 font-receipt text-[10px] text-ink-fade uppercase tracking-widest">
        <span>running tab · {stats.total} verdicts</span>
        <span>·· armaan ··</span>
      </div>
    </section>
  );
}
