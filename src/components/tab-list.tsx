"use client";

import { useState } from "react";
import { VerdictStamp } from "./verdict-stamp";
import { formatPrice } from "@/lib/utils";
import { armaanReactionForUpdate } from "@/lib/ledger";
import type { TabEntry } from "@/lib/types";

interface TabListProps {
  entries: TabEntry[];
  onUpdate?: (id: string, patch: Partial<TabEntry>) => void;
  onOpen?: (id: string) => void;
}

export function TabList({ entries, onUpdate, onOpen }: TabListProps) {
  const [flashReactions, setFlashReactions] = useState<Record<string, string>>({});

  function handleUpdate(entry: TabEntry, patch: Partial<TabEntry>) {
    const reaction = armaanReactionForUpdate(entry, patch, entries);
    if (reaction) {
      setFlashReactions((prev) => ({ ...prev, [entry.id]: reaction }));
      setTimeout(() => {
        setFlashReactions((prev) => {
          const rest = { ...prev };
          delete rest[entry.id];
          return rest;
        });
      }, 3600);
    }
    onUpdate?.(entry.id, patch);
  }

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
        const reaction = flashReactions[entry.id];
        const rowOpenable = Boolean(onOpen);

        // 3-state prompt logic:
        //   never answered buy question  → show "did u buy it?"
        //   answered "nah"               → quiet (buyAnswered=true, purchased=false)
        //   answered "yeah" / purchased  → show still-glad prompt until resolved
        const showBuyPrompt = !entry.purchased && !entry.buyAnswered;
        const showStillGladPrompt =
          entry.purchased && (entry.stillGlad === null || entry.stillGlad === undefined);
        const promptVisible = onUpdate && (showBuyPrompt || showStillGladPrompt);

        return (
          <li
            key={entry.id}
            className="border border-ink/20 bg-paper-tint hover:border-ink lift-on-hover"
          >
            {rowOpenable ? (
              <button
                type="button"
                onClick={() => onOpen?.(entry.id)}
                className="w-full text-left flex items-center gap-4 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
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
                <span
                  className="font-receipt text-xs text-ink-fade shrink-0"
                  aria-hidden
                >
                  open →
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-4 p-4">
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
            )}

            {promptVisible && (
              <div className="px-4 pb-4 -mt-1 border-t border-ink/10 pt-3 flex flex-wrap items-center gap-2">
                {showBuyPrompt ? (
                  <>
                    <span className="font-receipt text-xs text-ink-muted uppercase tracking-widest mr-1">
                      did u buy it?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(entry, { purchased: true, buyAnswered: true })
                      }
                      className="font-receipt text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/30 hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink transition-colors"
                    >
                      yeah, i bought it
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(entry, { purchased: false, buyAnswered: true })
                      }
                      className="font-receipt text-xs uppercase tracking-wider text-ink-muted px-3 py-1.5 hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
                    >
                      nah, i didn&apos;t
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
                      onClick={() => handleUpdate(entry, { stillGlad: true })}
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
                      onClick={() => handleUpdate(entry, { stillGlad: false })}
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
                        handleUpdate(entry, {
                          purchased: false,
                          stillGlad: null,
                          buyAnswered: false,
                        })
                      }
                      className="font-receipt text-xs uppercase tracking-wider text-ink-muted px-3 py-1.5 ml-auto hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
                    >
                      undo
                    </button>
                  </>
                )}
              </div>
            )}

            {reaction && (
              <div className="px-4 pb-3 font-display italic text-base text-stamp-red animate-in fade-in duration-300">
                › {reaction}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
