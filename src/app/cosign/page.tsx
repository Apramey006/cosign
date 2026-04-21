"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UploadDropzone } from "@/components/upload-dropzone";
import { VerdictCard } from "@/components/verdict-card";
import { OnboardingForm } from "@/components/onboarding-form";
import { TabList } from "@/components/tab-list";
import {
  addToTab,
  loadContext,
  loadTab,
  saveContext,
} from "@/lib/store";
import type { Product, TabEntry, UserContext, VerdictResult } from "@/lib/types";

type Phase =
  | { kind: "idle" }
  | { kind: "preview"; file: File; preview: string }
  | { kind: "loading"; preview: string }
  | {
      kind: "verdict";
      preview: string;
      product: Product;
      verdict: VerdictResult;
    }
  | { kind: "error"; message: string; preview?: string };

export default function CosignPage() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [tab, setTab] = useState<TabEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage requires client-side read after mount
    setContext(loadContext());
    setTab(loadTab());
    setHydrated(true);
  }, []);

  const handleFile = useCallback((file: File) => {
    const preview = URL.createObjectURL(file);
    setPhase({ kind: "preview", file, preview });
  }, []);

  const handleSaveContext = useCallback((ctx: UserContext) => {
    saveContext(ctx);
    setContext(ctx);
    setShowOnboarding(false);
  }, []);

  const handleGetVerdict = useCallback(async () => {
    if (phase.kind !== "preview") return;

    if (!context && !showOnboarding) {
      setShowOnboarding(true);
      return;
    }

    const { file, preview } = phase;
    setPhase({ kind: "loading", preview });

    try {
      const form = new FormData();
      form.append("image", file);
      if (context) form.append("context", JSON.stringify(context));

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

      setPhase({
        kind: "verdict",
        preview,
        product: data.product,
        verdict: data.verdict,
      });
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "network error",
        preview,
      });
    }
  }, [phase, context, showOnboarding]);

  const handleReset = useCallback(() => {
    if (phase.kind !== "idle" && "preview" in phase && phase.preview) {
      URL.revokeObjectURL(phase.preview);
    }
    setPhase({ kind: "idle" });
  }, [phase]);

  return (
    <div className="flex-1 grain">
      <header className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-mono text-lg font-bold tracking-tight">
            cosign<span className="text-lime-300">.</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="font-mono text-xs text-zinc-400 uppercase tracking-widest hover:text-lime-300 transition-colors"
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
            onSkip={context ? () => setShowOnboarding(false) : undefined}
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
                    <img
                      src={phase.preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover border border-zinc-800 bg-zinc-900"
                    />
                    <div className="flex-1">
                      <p className="text-zinc-300">ready to submit.</p>
                      <p className="text-zinc-500 text-sm mt-1">
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
                    className="flex-1 font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-6 py-4 hover:bg-lime-200 transition-colors"
                  >
                    get verdict →
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="font-mono uppercase tracking-wider text-zinc-400 px-6 py-4 border border-zinc-800 hover:border-zinc-600 transition-colors"
                  >
                    change
                  </button>
                </div>
              </section>
            )}

            {phase.kind === "loading" && (
              <div className="border-2 border-zinc-800 bg-zinc-950 p-12 text-center">
                <div className="inline-flex items-center gap-3 font-mono text-sm text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-lime-300 animate-pulse" />
                  reading your screenshot · thinking it through...
                </div>
              </div>
            )}

            {phase.kind === "verdict" && (
              <section className="space-y-6">
                <VerdictCard
                  product={phase.product}
                  verdict={phase.verdict}
                  imagePreview={phase.preview}
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-6 py-4 hover:bg-lime-200 transition-colors"
                >
                  get another verdict →
                </button>
              </section>
            )}

            {phase.kind === "error" && (
              <div className="border-2 border-red-900 bg-red-950/20 p-6">
                <p className="font-mono text-xs text-red-400 uppercase tracking-widest mb-2">
                  error
                </p>
                <p className="text-zinc-200 mb-4">{phase.message}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="font-mono uppercase tracking-wider text-zinc-300 px-4 py-2 border border-zinc-700 hover:border-zinc-500 transition-colors text-sm"
                >
                  try again
                </button>
              </div>
            )}
          </>
        )}

        {hydrated && tab.length > 0 && phase.kind !== "verdict" && (
          <section className="pt-8 border-t border-zinc-900">
            <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">
              your tab · {tab.length}
            </h2>
            <TabList entries={tab} />
          </section>
        )}
      </main>
    </div>
  );
}
