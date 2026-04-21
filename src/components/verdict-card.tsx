"use client";

import { VerdictStamp } from "./verdict-stamp";
import { formatPrice } from "@/lib/utils";
import type { Product, VerdictResult } from "@/lib/types";

interface VerdictCardProps {
  product: Product;
  verdict: VerdictResult;
  imagePreview?: string;
}

export function VerdictCard({ product, verdict, imagePreview }: VerdictCardProps) {
  return (
    <div className="border-2 border-zinc-800 bg-zinc-950 p-6 md:p-10 relative animate-in fade-in duration-500">
      <div className="absolute -top-5 -right-4 animate-stamp">
        <VerdictStamp verdict={verdict.verdict} size="lg" />
      </div>

      <div className="flex items-start gap-4 md:gap-6">
        {imagePreview ? (
          <div className="h-24 w-24 md:h-32 md:w-32 bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
            <img
              src={imagePreview}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-24 w-24 md:h-32 md:w-32 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs shrink-0">
            IMG
          </div>
        )}
        <div className="flex-1 min-w-0">
          {product.source && (
            <p className="font-mono text-sm text-zinc-500">
              {product.source} · {formatPrice(product.priceCents)}
            </p>
          )}
          {!product.source && (
            <p className="font-mono text-sm text-zinc-500">
              {formatPrice(product.priceCents)}
            </p>
          )}
          <h3 className="text-xl md:text-2xl font-semibold mt-1 break-words">
            {product.name}
          </h3>
          <p className="mt-4 text-zinc-100 text-lg leading-snug">
            {verdict.headline}
          </p>
          <ul className="mt-4 space-y-2 text-zinc-400 font-mono text-sm">
            {verdict.reasons.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-lime-300 shrink-0">›</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          {verdict.roast && (
            <p className="mt-6 text-zinc-300 italic border-l-2 border-lime-300 pl-4">
              {verdict.roast}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
