"use client";

import { useEffect, useState } from "react";

const THOUGHTS = [
  "ok lemme look...",
  "checking ur tab...",
  "running the math...",
  "hm.",
  "aight i got a take.",
];

export function LoadingThoughts() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, THOUGHTS.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-paper-tint border border-ink/20 px-6 md:px-12 py-12 md:py-16 shadow-[2px_4px_0_rgba(28,25,23,0.12)]">
      <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest mb-6">
        armaan is thinking
      </p>
      <ul className="space-y-3" aria-live="polite">
        {THOUGHTS.slice(0, index + 1).map((t, i) => (
          <li
            key={i}
            className="font-receipt text-lg md:text-2xl text-ink animate-in fade-in slide-in-from-left-2 duration-300"
          >
            <span className="text-stamp-red">›</span> {t}
            {i === index && (
              <span
                className="inline-block w-2 h-5 md:h-6 ml-1 bg-ink align-middle animate-pulse"
                aria-hidden
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
