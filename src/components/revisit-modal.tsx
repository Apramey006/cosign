"use client";

import { useEffect } from "react";
import { VerdictCard } from "./verdict-card";
import { ChatThread } from "./chat-thread";
import { ShareButton } from "./share-button";
import type { TabEntry, UserContext } from "@/lib/types";
import type { PastVerdict } from "@/lib/verdict/schema";

interface RevisitModalProps {
  entry: TabEntry;
  userContext: UserContext | null;
  otherPastVerdicts: PastVerdict[];
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<TabEntry>) => void;
}

export function RevisitModal({
  entry,
  userContext,
  otherPastVerdicts,
  onClose,
  onUpdate,
}: RevisitModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const pendingReview =
    entry.purchased &&
    (entry.stillGlad === null || entry.stillGlad === undefined);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`verdict for ${entry.product.name}`}
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-start md:items-center justify-center p-4 md:p-8">
        <div
          className="max-w-3xl w-full bg-paper border-2 border-ink/20 shadow-[4px_8px_0_rgba(28,25,23,0.2)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-rule">
            <p className="font-receipt text-xs text-ink-muted uppercase tracking-widest">
              revisit · {new Date(entry.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="font-receipt text-xs text-ink-muted uppercase tracking-widest hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
              aria-label="Close revisit"
            >
              close ×
            </button>
          </div>

          <div className="px-5 md:px-8 py-6 md:py-8 space-y-6">
            <VerdictCard product={entry.product} verdict={entry.verdict} />

            {pendingReview && (
              <div className="border-2 border-stamp-red bg-stamp-red/5 p-5">
                <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest mb-2">
                  armaan wants to know
                </p>
                <p className="font-display italic text-xl md:text-2xl leading-tight text-ink mb-4">
                  still glad about the {entry.product.name.toLowerCase()}?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate(entry.id, { stillGlad: true })}
                    className="font-receipt text-xs uppercase tracking-wider px-4 py-2 border-2 border-stamp-green text-stamp-green bg-stamp-green/5 hover:bg-stamp-green/10 focus:outline-none focus-visible:border-ink transition-colors"
                  >
                    still glad
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate(entry.id, { stillGlad: false })}
                    className="font-receipt text-xs uppercase tracking-wider px-4 py-2 border-2 border-stamp-red text-stamp-red bg-stamp-red/5 hover:bg-stamp-red/10 focus:outline-none focus-visible:border-ink transition-colors"
                  >
                    regret it
                  </button>
                </div>
              </div>
            )}

            <ShareButton
              product={entry.product}
              verdict={entry.verdict}
              variant="primary"
            />

            <ChatThread
              product={entry.product}
              verdict={entry.verdict}
              userContext={userContext}
              pastVerdicts={otherPastVerdicts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
