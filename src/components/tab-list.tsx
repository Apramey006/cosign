"use client";

import { VerdictStamp } from "./verdict-stamp";
import { formatPrice } from "@/lib/utils";
import type { TabEntry } from "@/lib/types";

interface TabListProps {
  entries: TabEntry[];
  onUpdate?: (id: string, patch: Partial<TabEntry>) => void;
}

export function TabList({ entries, onUpdate }: TabListProps) {
  if (entries.length === 0) {
    return (
      <div className="border-2 border-dashed border-ink/20 p-8 text-center bg-paper-tint">
        <p className="font-display italic text-xl text-ink leading-none">
          tab&apos;s empty. armaan&apos;s waiting.
        </p>
        <p className="font-receipt text-xs text-ink-muted mt-3">
          every verdict ends up here. he remembers all of them.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => {
        const controlsEnabled = Boolean(onUpdate);
        return (
          <li
            key={entry.id}
            className="border border-ink/20 bg-paper-tint p-4 hover:border-ink transition-colors"
          >
            <div className="flex items-center gap-4">
              <VerdictStamp verdict={entry.verdict.verdict} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{entry.product.name}</p>
                <p className="text-xs text-ink-muted font-receipt mt-1">
                  {entry.product.source ? `${entry.product.source} · ` : ""}
                  {formatPrice(entry.product.priceCents)} ·{" "}
                  {new Date(entry.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {controlsEnabled && (
              <div className="mt-3 pt-3 border-t border-ink/10 flex flex-wrap items-center gap-2">
                {!entry.purchased ? (
                  <>
                    <span className="font-receipt text-xs text-ink-muted uppercase tracking-widest mr-1">
                      did u buy it?
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdate?.(entry.id, { purchased: true })}
                      className="font-receipt text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/30 hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink transition-colors"
                    >
                      yeah, i bought it
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate?.(entry.id, { purchased: false })}
                      className="font-receipt text-xs uppercase tracking-wider text-ink-muted px-3 py-1.5 hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
                    >
                      nah
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-receipt text-xs text-ink-muted uppercase tracking-widest mr-1">
                      still glad?
                    </span>
                    <button
                      type="button"
                      aria-pressed={entry.stillGlad === true}
                      onClick={() => onUpdate?.(entry.id, { stillGlad: true })}
                      className={`font-receipt text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors focus:outline-none focus-visible:border-ink ${
                        entry.stillGlad === true
                          ? "border-stamp-green text-stamp-green bg-stamp-green/5"
                          : "border-ink/30 hover:border-stamp-green hover:text-stamp-green"
                      }`}
                    >
                      still glad
                    </button>
                    <button
                      type="button"
                      aria-pressed={entry.stillGlad === false}
                      onClick={() => onUpdate?.(entry.id, { stillGlad: false })}
                      className={`font-receipt text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors focus:outline-none focus-visible:border-ink ${
                        entry.stillGlad === false
                          ? "border-stamp-red text-stamp-red bg-stamp-red/5"
                          : "border-ink/30 hover:border-stamp-red hover:text-stamp-red"
                      }`}
                    >
                      regret it
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate?.(entry.id, { purchased: false, stillGlad: null })
                      }
                      className="font-receipt text-xs uppercase tracking-wider text-ink-muted px-3 py-1.5 ml-auto hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
                    >
                      undo
                    </button>
                  </>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
