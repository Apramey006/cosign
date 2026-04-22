"use client";

import { useState } from "react";
import type { UserContext } from "@/lib/types";

interface OnboardingFormProps {
  initial?: UserContext | null;
  onSave: (ctx: UserContext) => void;
  onSkip?: () => void;
  compact?: boolean;
}

export function OnboardingForm({
  initial,
  onSave,
  onSkip,
  compact = false,
}: OnboardingFormProps) {
  const [budget, setBudget] = useState(
    initial?.weeklyBudgetCents ? String(initial.weeklyBudgetCents / 100) : "",
  );
  const [goal, setGoal] = useState(initial?.savingGoals?.[0] ?? "");
  const [regret, setRegret] = useState(initial?.recentRegrets?.[0] ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ctx: UserContext = {};
    const budgetNum = Number(budget);
    if (!isNaN(budgetNum) && budgetNum > 0) {
      ctx.weeklyBudgetCents = Math.round(budgetNum * 100);
    }
    if (goal.trim()) ctx.savingGoals = [goal.trim()];
    if (regret.trim()) ctx.recentRegrets = [regret.trim()];
    onSave(ctx);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper-tint border border-ink/20 px-6 md:px-10 py-6 md:py-8 space-y-5 shadow-[2px_4px_0_rgba(28,25,23,0.12)]"
    >
      <div>
        <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest mb-2">
          give armaan the receipts
        </p>
        <h2 className="font-display text-2xl md:text-3xl leading-none">
          he can&apos;t call u out if he doesn&apos;t know u
        </h2>
        {!compact && (
          <p className="text-ink-muted text-sm mt-3 font-receipt">
            all optional. saved in your browser only.
          </p>
        )}
      </div>

      <div className="rule-dashed h-px" />

      <div className="space-y-4">
        <div>
          <label
            className="block font-receipt text-xs text-ink uppercase tracking-widest mb-2"
            htmlFor="budget"
          >
            how much can u blow a week?
          </label>
          <input
            id="budget"
            type="number"
            inputMode="decimal"
            min={0}
            step={5}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 80"
            className="w-full bg-paper border-2 border-ink/20 focus:border-ink focus:outline-none px-4 py-3 text-ink font-receipt"
          />
        </div>

        <div>
          <label
            className="block font-receipt text-xs text-ink uppercase tracking-widest mb-2"
            htmlFor="goal"
          >
            what are u actually saving for?
          </label>
          <input
            id="goal"
            type="text"
            maxLength={120}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. coachella in april"
            className="w-full bg-paper border-2 border-ink/20 focus:border-ink focus:outline-none px-4 py-3 text-ink"
          />
        </div>

        <div>
          <label
            className="block font-receipt text-xs text-ink uppercase tracking-widest mb-2"
            htmlFor="regret"
          >
            last thing u regret buying?
          </label>
          <input
            id="regret"
            type="text"
            maxLength={120}
            value={regret}
            onChange={(e) => setRegret(e.target.value)}
            placeholder="e.g. another productivity journal"
            className="w-full bg-paper border-2 border-ink/20 focus:border-ink focus:outline-none px-4 py-3 text-ink"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="flex-1 font-receipt uppercase tracking-wider font-bold bg-ink text-paper px-6 py-3 hover:bg-stamp-red focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors"
        >
          cool, roast me →
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="font-receipt uppercase tracking-wider text-ink-muted px-6 py-3 border border-ink/30 hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink transition-colors"
          >
            skip
          </button>
        )}
      </div>
    </form>
  );
}
