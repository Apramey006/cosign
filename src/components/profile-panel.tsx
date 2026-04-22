"use client";

import { formatPrice } from "@/lib/utils";
import type { UserContext } from "@/lib/types";

interface ProfilePanelProps {
  context: UserContext | null;
  onEdit: () => void;
}

export function ProfilePanel({ context, onEdit }: ProfilePanelProps) {
  if (!context) return null;

  const hasAny =
    context.weeklyBudgetCents ||
    (context.savingGoals && context.savingGoals.length > 0) ||
    (context.spendingTraps && context.spendingTraps.length > 0) ||
    (context.recentRegrets && context.recentRegrets.length > 0) ||
    (context.lifeStage && context.lifeStage.length > 0);

  if (!hasAny) return null;

  return (
    <section className="bg-paper-tint border border-ink/20 px-5 md:px-8 py-5 md:py-6 shadow-[2px_4px_0_rgba(28,25,23,0.12)]">
      <div className="flex items-center justify-between mb-4 font-receipt text-xs text-ink-muted uppercase tracking-widest">
        <span>armaan&apos;s file on u</span>
        <button
          type="button"
          onClick={onEdit}
          className="hover:text-ink focus:outline-none focus-visible:text-ink transition-colors underline underline-offset-4 decoration-ink/30 hover:decoration-ink"
        >
          edit →
        </button>
      </div>

      <div className="rule-dashed h-px mb-4" />

      <dl className="space-y-3 font-receipt text-sm text-ink">
        {context.lifeStage && (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-ink-muted">
              ur deal
            </dt>
            <dd className="mt-0.5 font-display italic text-base">
              {context.lifeStage}
            </dd>
          </div>
        )}

        {context.weeklyBudgetCents ? (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-ink-muted">
              weekly fun money
            </dt>
            <dd className="mt-0.5">
              {formatPrice(context.weeklyBudgetCents)} / wk
            </dd>
          </div>
        ) : null}

        {context.savingGoals && context.savingGoals.length > 0 && (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-ink-muted">
              saving for
            </dt>
            <dd className="mt-0.5">
              <ul className="space-y-1">
                {context.savingGoals.map((g, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-stamp-red">›</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {context.spendingTraps && context.spendingTraps.length > 0 && (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-ink-muted">
              ur traps
            </dt>
            <dd className="mt-0.5">
              <ul className="space-y-1">
                {context.spendingTraps.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-stamp-red">›</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {context.recentRegrets && context.recentRegrets.length > 0 && (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-ink-muted">
              last regret
            </dt>
            <dd className="mt-0.5 italic text-stamp-red">
              {context.recentRegrets[0]}
            </dd>
          </div>
        )}
      </dl>

      <div className="rule-dashed h-px mt-5" />
      <div className="flex items-center justify-between mt-3 font-receipt text-[10px] text-ink-fade uppercase tracking-widest">
        <span>confidential</span>
        <span>·· armaan ··</span>
      </div>
    </section>
  );
}
