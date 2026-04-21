"use client";

import { useState } from "react";
import { encodeShare } from "@/lib/share";
import type { Product, VerdictResult } from "@/lib/types";

interface ShareButtonProps {
  product: Product;
  verdict: VerdictResult;
}

export function ShareButton({ product, verdict }: ShareButtonProps) {
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

  return (
    <button
      type="button"
      onClick={handleShare}
      className="font-mono uppercase tracking-wider text-zinc-200 px-5 py-3 border border-zinc-700 hover:border-lime-300 hover:text-lime-300 focus:outline-none focus-visible:border-lime-300 focus-visible:text-lime-300 transition-colors text-sm"
    >
      {copied ? "copied ✓" : error ? error : "share verdict →"}
    </button>
  );
}
