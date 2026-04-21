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
    <div className="border-2 border-zinc-800 bg-zinc-950 p-12 md:p-16">
      <p className="font-mono text-xs text-lime-300 uppercase tracking-widest mb-6">
        your broke friend is thinking
      </p>
      <ul className="space-y-3" aria-live="polite">
        {THOUGHTS.slice(0, index + 1).map((t, i) => (
          <li
            key={i}
            className="font-mono text-lg md:text-2xl text-zinc-200 animate-in fade-in slide-in-from-left-2 duration-300"
          >
            <span className="text-lime-300">›</span> {t}
            {i === index && (
              <span
                className="inline-block w-2 h-5 md:h-6 ml-1 bg-lime-300 align-middle animate-pulse"
                aria-hidden
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
