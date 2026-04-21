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
      <div className="border border-dashed border-zinc-800 p-8 text-center">
        <p className="font-mono text-sm text-zinc-400">
          no verdicts yet. upload a screenshot to start your tab.
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
            className="border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <VerdictStamp verdict={entry.verdict.verdict} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{entry.product.name}</p>
                <p className="text-xs text-zinc-400 font-mono mt-1">
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
              <div className="mt-3 pt-3 border-t border-zinc-900 flex flex-wrap items-center gap-2">
                {!entry.purchased ? (
                  <>
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest mr-1">
                      did u buy it?
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdate?.(entry.id, { purchased: true })}
                      className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 border border-zinc-700 hover:border-lime-300 hover:text-lime-300 focus:outline-none focus-visible:border-lime-300 focus-visible:text-lime-300 transition-colors"
                    >
                      yeah, i bought it
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate?.(entry.id, { purchased: false })}
                      className="font-mono text-xs uppercase tracking-wider text-zinc-500 px-3 py-1.5 hover:text-zinc-300 focus:outline-none focus-visible:text-zinc-300 transition-colors"
                    >
                      nah
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest mr-1">
                      still glad?
                    </span>
                    <button
                      type="button"
                      aria-pressed={entry.stillGlad === true}
                      onClick={() => onUpdate?.(entry.id, { stillGlad: true })}
                      className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors focus:outline-none focus-visible:border-lime-300 ${
                        entry.stillGlad === true
                          ? "border-lime-300 text-lime-300 bg-lime-300/10"
                          : "border-zinc-700 hover:border-lime-300 hover:text-lime-300"
                      }`}
                    >
                      still glad
                    </button>
                    <button
                      type="button"
                      aria-pressed={entry.stillGlad === false}
                      onClick={() => onUpdate?.(entry.id, { stillGlad: false })}
                      className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors focus:outline-none focus-visible:border-red-400 ${
                        entry.stillGlad === false
                          ? "border-red-400 text-red-400 bg-red-400/10"
                          : "border-zinc-700 hover:border-red-400 hover:text-red-400"
                      }`}
                    >
                      regret it
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate?.(entry.id, { purchased: false, stillGlad: null })
                      }
                      className="font-mono text-xs uppercase tracking-wider text-zinc-500 px-3 py-1.5 ml-auto hover:text-zinc-300 focus:outline-none focus-visible:text-zinc-300 transition-colors"
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
