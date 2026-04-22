"use client";

import { useState } from "react";
import type { UserContext } from "@/lib/types";

interface OnboardingFormProps {
  initial?: UserContext | null;
  onSave: (ctx: UserContext) => void;
  onSkip?: () => void;
  compact?: boolean;
}

const MAX_LINES = 4;

function linesToArray(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, MAX_LINES);
}

function arrayToLines(arr?: string[]): string {
  return (arr ?? []).join("\n");
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
  const [goals, setGoals] = useState(arrayToLines(initial?.savingGoals));
  const [traps, setTraps] = useState(arrayToLines(initial?.spendingTraps));
  const [lifeStage, setLifeStage] = useState(initial?.lifeStage ?? "");
  const [lastRegret, setLastRegret] = useState(
    initial?.recentRegrets?.[0] ?? "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ctx: UserContext = {};

    const budgetNum = Number(budget);
    if (!isNaN(budgetNum) && budgetNum > 0) {
      ctx.weeklyBudgetCents = Math.round(budgetNum * 100);
    }

    const goalArr = linesToArray(goals);
    if (goalArr.length > 0) ctx.savingGoals = goalArr;

    const trapArr = linesToArray(traps);
    if (trapArr.length > 0) ctx.spendingTraps = trapArr;

    if (lifeStage.trim()) ctx.lifeStage = lifeStage.trim().slice(0, 200);

    const regretTrim = lastRegret.trim();
    if (regretTrim) ctx.recentRegrets = [regretTrim];

    onSave(ctx);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper-tint border border-ink/20 px-6 md:px-10 py-6 md:py-8 space-y-5 shadow-[2px_4px_0_rgba(28,25,23,0.12)]"
    >
      <div>
        <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest mb-2">
          armaan&apos;s file on u
        </p>
        <h2 className="font-display text-2xl md:text-3xl leading-none">
          the more he knows u, the sharper the roasts
        </h2>
        {!compact && (
          <p className="text-ink-muted text-sm mt-3 font-receipt">
            everything is optional. saved only in your browser.
          </p>
        )}
      </div>

      <div className="rule-dashed h-px" />

      <div className="space-y-5">
        <div>
          <label
            className="block font-receipt text-xs text-ink uppercase tracking-widest mb-2"
            htmlFor="lifeStage"
          >
            whats ur deal rn?
          </label>
          <input
            id="lifeStage"
            type="text"
            maxLength={200}
            value={lifeStage}
            onChange={(e) => setLifeStage(e.target.value)}
            placeholder="e.g. cs senior at columbia, broke, grad in may"
            className="w-full bg-paper border-2 border-ink/20 focus:border-ink focus:outline-none px-4 py-3 text-ink"
          />
        </div>

        <div>
          <label
            className="block font-receipt text-xs text-ink uppercase tracking-widest mb-2"
            htmlFor="budget"
          >
            weekly fun money (after rent/bills)
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
            htmlFor="goals"
          >
            what u saving for? (one per line, up to 4)
          </label>
          <textarea
            id="goals"
            rows={3}
            maxLength={640}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder={`coachella in april (~$500)\nnew laptop by summer\nmoving-out deposit`}
            className="w-full bg-paper border-2 border-ink/20 focus:border-ink focus:outline-none px-4 py-3 text-ink resize-none"
          />
        </div>

        <div>
          <label
            className="block font-receipt text-xs text-ink uppercase tracking-widest mb-2"
            htmlFor="traps"
          >
            ur money traps (lanes where u overspend, one per line)
          </label>
          <textarea
            id="traps"
            rows={3}
            maxLength={640}
            value={traps}
            onChange={(e) => setTraps(e.target.value)}
            placeholder={`doordash when stressed\nclothes at 1am\nrandom amazon stuff`}
            className="w-full bg-paper border-2 border-ink/20 focus:border-ink focus:outline-none px-4 py-3 text-ink resize-none"
          />
        </div>

        <div>
          <label
            className="block font-receipt text-xs text-ink uppercase tracking-widest mb-2"
            htmlFor="regret"
          >
            last thing u regret buying
          </label>
          <input
            id="regret"
            type="text"
            maxLength={160}
            value={lastRegret}
            onChange={(e) => setLastRegret(e.target.value)}
            placeholder="e.g. another pair of jordans"
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
