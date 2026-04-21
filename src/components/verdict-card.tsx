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

  const dateStr = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-paper-tint border border-ink/20 px-6 md:px-12 py-10 md:py-14 relative shadow-[2px_4px_0_rgba(28,25,23,0.12)] animate-in fade-in duration-500">
      <div className="absolute top-4 right-4 md:-top-10 md:-right-8 animate-stamp origin-top-right">
        <VerdictStamp
          verdict={verdict.verdict}
          size="xl"
          className="md:scale-100 scale-[0.65]"
        />
      </div>

      <div className="flex items-start justify-between mb-5 font-receipt text-xs text-ink-muted uppercase tracking-widest">
        <span>armaan · cosign</span>
        <span>{dateStr}</span>
      </div>

      <div className="rule-dashed h-px mb-8" />

      <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
        {imagePreview ? (
          <div className="h-28 w-28 md:h-40 md:w-40 bg-paper border-2 border-ink/20 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- client-side blob URL, not optimizable */}
            <img
              src={imagePreview}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-28 w-28 md:h-40 md:w-40 bg-paper border-2 border-ink/20 flex items-center justify-center text-ink-fade font-receipt text-xs shrink-0">
            IMG
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-receipt text-sm text-ink-muted">
            {product.source ? `${product.source} · ` : ""}
            {formatPrice(product.priceCents)}
          </p>
          <h3 className="font-display text-3xl md:text-4xl mt-1 leading-none break-words">
            {product.name}
          </h3>
          <p className="mt-5 text-2xl md:text-3xl font-display italic leading-tight">
            {verdict.headline}
          </p>
          <ul className="mt-6 space-y-2.5 font-receipt text-sm md:text-base text-ink">
            {verdict.reasons.slice(0, revealed).map((r, i) => (
              <li
                key={i}
                className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <span className="text-stamp-red shrink-0">›</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          {verdict.roast && revealed >= verdict.reasons.length && (
            <p className="mt-6 font-display italic text-xl border-l-2 border-stamp-red pl-4 animate-in fade-in duration-500">
              {verdict.roast}
            </p>
          )}
        </div>
      </div>

      <div className="rule-dashed h-px mt-10" />

      <div className="flex items-center justify-between mt-4 font-receipt text-[10px] text-ink-fade uppercase tracking-widest">
        <span>thank u for shopping honestly</span>
        <span>·· armaan ··</span>
      </div>
    </div>
  );
}
