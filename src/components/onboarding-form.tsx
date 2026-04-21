"use client";

import { useState } from "react";
import type { UserContext } from "@/lib/types";

interface OnboardingFormProps {
  initial?: UserContext | null;
  onSave: (ctx: UserContext) => void;
  onSkip?: () => void;
}

export function OnboardingForm({ initial, onSave, onSkip }: OnboardingFormProps) {
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
      className="bg-paper-tint border border-ink/20 px-6 md:px-10 py-8 md:py-10 space-y-6 shadow-[2px_4px_0_rgba(28,25,23,0.12)]"
    >
      <div>
        <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest mb-2">
          tell armaan about you
        </p>
        <h2 className="font-display text-3xl md:text-4xl leading-none">
          so he&apos;s roasting the right person
        </h2>
        <p className="text-ink-muted text-sm mt-3 font-receipt">
          all optional. saved only in your browser.
        </p>
      </div>

      <div className="rule-dashed h-px" />

      <div className="space-y-5">
        <div>
          <label
            className="block font-receipt text-xs text-ink uppercase tracking-widest mb-2"
            htmlFor="budget"
          >
            weekly discretionary $
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
            top thing you&apos;re saving for
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
            most recent purchase you regret
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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 font-receipt uppercase tracking-wider font-bold bg-ink text-paper px-6 py-3 hover:bg-stamp-red focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors"
        >
          save & continue
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
