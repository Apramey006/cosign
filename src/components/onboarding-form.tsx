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
      className="border-2 border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6"
    >
      <div>
        <p className="font-mono text-xs text-lime-300 uppercase tracking-widest mb-2">
          quick context
        </p>
        <h2 className="text-xl font-semibold">
          so your broke friend knows who they&apos;re talking to
        </h2>
        <p className="text-zinc-500 text-sm mt-2">
          all optional. skip any of these. saved only in your browser.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="block font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2"
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
            className="w-full bg-black border border-zinc-800 focus:border-lime-300 px-4 py-3 text-zinc-100 outline-none font-mono"
          />
        </div>

        <div>
          <label
            className="block font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2"
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
            className="w-full bg-black border border-zinc-800 focus:border-lime-300 px-4 py-3 text-zinc-100 outline-none"
          />
        </div>

        <div>
          <label
            className="block font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2"
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
            className="w-full bg-black border border-zinc-800 focus:border-lime-300 px-4 py-3 text-zinc-100 outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-6 py-3 hover:bg-lime-200 transition-colors"
        >
          save & continue
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="font-mono uppercase tracking-wider text-zinc-500 px-6 py-3 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            skip
          </button>
        )}
      </div>
    </form>
  );
}
