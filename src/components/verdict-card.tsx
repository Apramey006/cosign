"use client";

import { useEffect, useState } from "react";
import { VerdictStamp } from "./verdict-stamp";
import { formatPrice } from "@/lib/utils";
import type { Product, VerdictResult } from "@/lib/types";

interface VerdictCardProps {
  product: Product;
  verdict: VerdictResult;
  imagePreview?: string;
}

export function VerdictCard({ product, verdict, imagePreview }: VerdictCardProps) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= verdict.reasons.length) return;
    const id = setTimeout(() => setRevealed((n) => n + 1), 180);
    return () => clearTimeout(id);
  }, [revealed, verdict.reasons.length]);

  return (
    <div className="border-2 border-zinc-800 bg-zinc-950 p-8 md:p-14 relative animate-in fade-in duration-500">
      <div className="absolute -top-8 -right-4 md:-top-10 md:-right-8 animate-stamp">
        <VerdictStamp verdict={verdict.verdict} size="xl" />
      </div>

      <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
        {imagePreview ? (
          <div className="h-28 w-28 md:h-40 md:w-40 bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- client-side blob URL, not optimizable */}
            <img
              src={imagePreview}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-28 w-28 md:h-40 md:w-40 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs shrink-0">
            IMG
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm text-zinc-400">
            {product.source ? `${product.source} · ` : ""}
            {formatPrice(product.priceCents)}
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold mt-1 break-words font-display tracking-tight">
            {product.name}
          </h3>
          <p className="mt-5 text-zinc-100 text-xl md:text-2xl leading-snug">
            {verdict.headline}
          </p>
          <ul className="mt-5 space-y-2.5 text-zinc-300 font-mono text-sm md:text-base">
            {verdict.reasons.slice(0, revealed).map((r, i) => (
              <li
                key={i}
                className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <span className="text-lime-300 shrink-0">›</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          {verdict.roast && revealed >= verdict.reasons.length && (
            <p className="mt-6 text-zinc-100 italic border-l-2 border-lime-300 pl-4 animate-in fade-in duration-500">
              {verdict.roast}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
