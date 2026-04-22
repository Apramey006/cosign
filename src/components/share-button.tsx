"use client";

import { useState } from "react";
import { encodeShare } from "@/lib/share";
import { cn } from "@/lib/utils";
import type { Product, VerdictResult } from "@/lib/types";

interface ShareButtonProps {
  product: Product;
  verdict: VerdictResult;
  variant?: "primary" | "ghost";
  className?: string;
}

export function ShareButton({
  product,
  verdict,
  variant = "primary",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    try {
      const encoded = encodeShare({ p: product, v: verdict });
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const shareUrl = `${origin}/v/${encoded}`;

      const nav: Navigator | undefined =
        typeof navigator !== "undefined" ? navigator : undefined;

      if (nav && typeof nav.share === "function") {
        try {
          await nav.share({
            title: `cosign · ${verdict.verdict.replace(/_/g, " ")}`,
            text: verdict.headline,
            url: shareUrl,
          });
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }

      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      setError("couldn't copy — copy from the address bar");
    } catch {
      setError("couldn't share. try again.");
    }
  }

  const base =
    "font-receipt uppercase tracking-wider transition-colors focus:outline-none";

  const styles =
    variant === "primary"
      ? "w-full font-bold bg-ink text-paper px-6 py-4 hover:bg-stamp-red focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      : "text-ink px-5 py-3 border border-ink/30 hover:border-ink hover:text-stamp-red focus-visible:border-ink focus-visible:text-stamp-red text-sm";

  return (
    <button type="button" onClick={handleShare} className={cn(base, styles, className)}>
      {copied ? "copied ✓" : error ? error : "send this to the group chat →"}
    </button>
  );
}
