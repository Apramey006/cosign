"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadDropzone } from "@/components/upload-dropzone";
import { VerdictCard } from "@/components/verdict-card";
import { OnboardingForm } from "@/components/onboarding-form";
import { TabList } from "@/components/tab-list";
import { LoadingThoughts } from "@/components/loading-thoughts";
import {
  addToTab,
  loadContext,
  loadTab,
  saveContext,
} from "@/lib/store";
import type { Product, TabEntry, UserContext, VerdictResult } from "@/lib/types";
import type { PastVerdict } from "@/lib/verdict/schema";

type Phase =
  | { kind: "idle" }
  | { kind: "preview"; file: File; preview: string }
  | { kind: "loading"; preview: string }
  | {
      kind: "verdict";
      preview: string;
      product: Product;
      verdict: VerdictResult;
      isFirst: boolean;
    }
  | { kind: "error"; message: string; preview?: string };

function tabEntriesToPast(entries: TabEntry[], limit = 8): PastVerdict[] {
  const now = Date.now();
  return entries.slice(0, limit).map((e) => {
    const daysAgo = Math.max(
      0,
      Math.floor((now - new Date(e.createdAt).getTime()) / 86400000),
    );
    return {
      productName: e.product.name,
      priceCents: e.product.priceCents,
      verdict: e.verdict.verdict,
      headline: e.verdict.headline,
      daysAgo,
      purchased: e.purchased,
      stillGlad: e.stillGlad ?? null,
    };
  });
}

export default function CosignPage() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [tab, setTab] = useState<TabEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const trackPreview = useCallback((url: string) => {
    previewUrlsRef.current.add(url);
  }, []);

  const revokeAllPreviews = useCallback(() => {
    for (const url of previewUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    previewUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate localStorage after client mount
    setContext(loadContext());
    setTab(loadTab());
    setHydrated(true);
  }, []);

  useEffect(() => {
    return () => revokeAllPreviews();
  }, [revokeAllPreviews]);

  const handleFile = useCallback(
    (file: File) => {
      revokeAllPreviews();
      const preview = URL.createObjectURL(file);
      trackPreview(preview);
      setPhase({ kind: "preview", file, preview });
    },
    [revokeAllPreviews, trackPreview],
  );

  const handleSaveContext = useCallback((ctx: UserContext) => {
    saveContext(ctx);
    setContext(ctx);
    setShowOnboarding(false);
  }, []);

  const handleGetVerdict = useCallback(async () => {
    if (phase.kind !== "preview") return;

    const { file, preview } = phase;
    setPhase({ kind: "loading", preview });

    try {
      const form = new FormData();
      form.append("image", file);
      if (context) form.append("context", JSON.stringify(context));
      const past = tabEntriesToPast(tab);
      if (past.length > 0) form.append("pastVerdicts", JSON.stringify(past));

      const res = await fetch("/api/verdict", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setPhase({
          kind: "error",
          message: data.error || "something broke. try again.",
          preview,
        });
        return;
      }

      const entry: TabEntry = {
        id: crypto.randomUUID(),
        product: data.product,
        verdict: data.verdict,
        purchased: false,
        createdAt: new Date().toISOString(),
      };
      const updated = addToTab(entry);
      setTab(updated);

      const isFirst = tab.length === 0;
      setPhase({
        kind: "verdict",
        preview,
        product: data.product,
        verdict: data.verdict,
        isFirst,
      });
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "network error",
        preview,
      });
    }
  }, [phase, context, tab]);

  const handleReset = useCallback(() => {
    revokeAllPreviews();
    setPhase({ kind: "idle" });
  }, [revokeAllPreviews]);

  return (
    <div className="flex-1 grain">
      <header className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-lg font-bold tracking-tight focus:outline-none focus-visible:text-lime-300"
          >
            cosign<span className="text-lime-300">.</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="font-mono text-xs text-zinc-400 uppercase tracking-widest hover:text-lime-300 focus:outline-none focus-visible:text-lime-300 transition-colors"
          >
            {context ? "edit context" : "set context"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16 space-y-10">
        {showOnboarding && hydrated && (
          <OnboardingForm
            initial={context}
            onSave={handleSaveContext}
            onSkip={() => setShowOnboarding(false)}
          />
        )}

        {!showOnboarding && (
          <>
            {phase.kind === "idle" && <UploadDropzone onFile={handleFile} />}

            {phase.kind === "preview" && (
              <section className="space-y-6">
                <div className="border-2 border-zinc-800 bg-zinc-950 p-6">
                  <p className="font-mono text-xs text-lime-300 uppercase tracking-widest mb-4">
                    step 2 · confirm
                  </p>
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- client-side blob URL */}
                    <img
                      src={phase.preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover border border-zinc-800 bg-zinc-900"
                    />
                    <div className="flex-1">
                      <p className="text-zinc-200">ready to submit.</p>
                      <p className="text-zinc-400 text-sm mt-1 font-mono">
                        {phase.file.name} ·{" "}
                        {(phase.file.size / 1024).toFixed(0)} kb
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleGetVerdict}
                    className="flex-1 font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-6 py-4 hover:bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
                  >
                    get verdict →
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="font-mono uppercase tracking-wider text-zinc-300 px-6 py-4 border border-zinc-800 hover:border-zinc-600 focus:outline-none focus-visible:border-lime-300 transition-colors"
                  >
                    change
                  </button>
                </div>
              </section>
            )}

            {phase.kind === "loading" && <LoadingThoughts />}

            {phase.kind === "verdict" && (
              <section className="space-y-6">
                <VerdictCard
                  product={phase.product}
                  verdict={phase.verdict}
                  imagePreview={phase.preview}
                />
                {phase.isFirst && !context && (
                  <div className="border border-lime-300/30 bg-lime-300/5 p-5">
                    <p className="font-mono text-xs text-lime-300 uppercase tracking-widest mb-2">
                      want sharper roasts?
                    </p>
                    <p className="text-zinc-200 mb-4">
                      tell your broke friend a bit about you — budget, what
                      you&apos;re saving for, recent regrets. next verdict will
                      reference it.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowOnboarding(true)}
                      className="font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-5 py-3 hover:bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors text-sm"
                    >
                      set context →
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-6 py-4 hover:bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
                >
                  get another verdict →
                </button>
              </section>
            )}

            {phase.kind === "error" && (
              <div
                role="alert"
                className="border-2 border-red-900 bg-red-950/20 p-6"
              >
                <p className="font-mono text-xs text-red-400 uppercase tracking-widest mb-2">
                  error
                </p>
                <p className="text-zinc-100 mb-4">{phase.message}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="font-mono uppercase tracking-wider text-zinc-100 px-4 py-2 border border-zinc-700 hover:border-zinc-500 focus:outline-none focus-visible:border-lime-300 transition-colors text-sm"
                >
                  try again
                </button>
              </div>
            )}
          </>
        )}

        {hydrated && tab.length > 0 && phase.kind !== "verdict" && (
          <section className="pt-8 border-t border-zinc-900">
            <h2 className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-4">
              your tab · {tab.length}
            </h2>
            <TabList entries={tab} />
          </section>
        )}
      </main>
    </div>
  );
}
