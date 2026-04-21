"use client";

import { VerdictStamp } from "./verdict-stamp";
import { formatPrice } from "@/lib/utils";
import type { TabEntry } from "@/lib/types";

interface TabListProps {
  entries: TabEntry[];
}

export function TabList({ entries }: TabListProps) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-zinc-800 p-8 text-center">
        <p className="font-mono text-sm text-zinc-500">
          no verdicts yet. upload a screenshot to start your tab.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="border border-zinc-800 bg-zinc-950 p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors"
        >
          <VerdictStamp verdict={entry.verdict.verdict} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{entry.product.name}</p>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              {entry.product.source ? `${entry.product.source} · ` : ""}
              {formatPrice(entry.product.priceCents)} ·{" "}
              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
