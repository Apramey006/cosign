"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadDropzone } from "@/components/upload-dropzone";
import { VerdictCard } from "@/components/verdict-card";
import { OnboardingForm } from "@/components/onboarding-form";
import { TabList } from "@/components/tab-list";
import { LoadingThoughts } from "@/components/loading-thoughts";
import { ShareButton } from "@/components/share-button";
import { ChatThread } from "@/components/chat-thread";
import { ArmaanLedger } from "@/components/armaan-ledger";
import { RevisitModal } from "@/components/revisit-modal";
import {
  addToTab,
  loadContext,
  loadTab,
  saveContext,
  updateTabEntry,
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
  const [onboardingDismissedThisSession, setOnboardingDismissedThisSession] =
    useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [tab, setTab] = useState<TabEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [revisitId, setRevisitId] = useState<string | null>(null);
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
    const ctx = loadContext();
    const entries = loadTab();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate localStorage after client mount
    setContext(ctx);
    setTab(entries);
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
    setOnboardingDismissedThisSession(true);
  }, []);

  const handleSkipOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setOnboardingDismissedThisSession(true);
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
          message: data.error || "gemini choked. not ur fault. try again.",
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
        message:
          err instanceof Error ? err.message : "network error. try again.",
        preview,
      });
    }
  }, [phase, context, tab]);

  const handleReset = useCallback(() => {
    revokeAllPreviews();
    setPhase({ kind: "idle" });
  }, [revokeAllPreviews]);

  const handleTabUpdate = useCallback((id: string, patch: Partial<TabEntry>) => {
    const updated = updateTabEntry(id, patch);
    setTab(updated);
  }, []);

  // First-run auto-show: if hydrated, no saved context, haven't dismissed this session,
  // and we're idle (pre-upload), show onboarding inline.
  const autoShowOnboarding =
    hydrated &&
    !context &&
    !onboardingDismissedThisSession &&
    phase.kind === "idle";

  const onboardingVisible = showOnboarding || autoShowOnboarding;

  return (
    <div className="flex-1 paper">
      <header className="border-b border-rule">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-display italic text-2xl leading-none focus:outline-none focus-visible:text-stamp-red"
          >
            cosign<span className="text-stamp-red not-italic">.</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="font-receipt text-xs text-ink-muted uppercase tracking-widest hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
          >
            {context ? "edit context" : "set context"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 md:py-14 space-y-8">
        {onboardingVisible && hydrated && (
          <OnboardingForm
            initial={context}
            onSave={handleSaveContext}
            onSkip={handleSkipOnboarding}
            compact={autoShowOnboarding}
          />
        )}

        {!onboardingVisible && (
          <>
            {phase.kind === "idle" && <UploadDropzone onFile={handleFile} />}

            {phase.kind === "preview" && (
              <section className="space-y-6">
                <div className="bg-paper-tint border border-ink/20 p-6 shadow-[2px_4px_0_rgba(28,25,23,0.12)]">
                  <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest mb-4">
                    ready?
                  </p>
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- client-side blob URL */}
                    <img
                      src={phase.preview}
                      alt="Preview"
                      className="h-32 w-32 object-cover border-2 border-ink/20 bg-paper"
                    />
                    <div className="flex-1">
                      <p className="text-ink font-display text-xl">lock in?</p>
                      <p className="text-ink-muted text-sm mt-1 font-receipt">
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
                    className="flex-1 font-receipt uppercase tracking-wider font-bold bg-ink text-paper px-6 py-4 hover:bg-stamp-red focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors"
                  >
                    ask armaan →
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="font-receipt uppercase tracking-wider text-ink px-6 py-4 border border-ink/30 hover:border-ink focus:outline-none focus-visible:border-ink transition-colors"
                  >
                    change
                  </button>
                </div>
              </section>
            )}

            {phase.kind === "loading" && (
              <LoadingThoughts userContext={context} />
            )}

            {phase.kind === "verdict" && (
              <section className="space-y-6">
                <VerdictCard
                  product={phase.product}
                  verdict={phase.verdict}
                  imagePreview={phase.preview}
                />

                {/* Primary post-verdict action = SHARE (the viral loop) */}
                <ShareButton
                  product={phase.product}
                  verdict={phase.verdict}
                  variant="primary"
                />

                {/* Chat = deepening the current verdict */}
                <ChatThread
                  product={phase.product}
                  verdict={phase.verdict}
                  userContext={context}
                  pastVerdicts={tabEntriesToPast(tab.slice(1))}
                />

                {/* "ask again" is a quiet ghost link, not the loud primary */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="font-receipt uppercase tracking-wider text-sm text-ink-muted hover:text-ink focus:outline-none focus-visible:text-ink transition-colors underline underline-offset-4 decoration-ink/30 hover:decoration-ink"
                  >
                    ask armaan again →
                  </button>
                </div>
              </section>
            )}

            {phase.kind === "error" && (
              <div
                role="alert"
                className="border-2 border-stamp-red bg-stamp-red/5 p-6"
              >
                <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest mb-2">
                  armaan&apos;s glitching
                </p>
                <p className="text-ink mb-4 font-display italic text-lg">
                  {phase.message}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="font-receipt uppercase tracking-wider text-ink px-4 py-2 border border-ink/30 hover:border-ink focus:outline-none focus-visible:border-ink transition-colors text-sm"
                >
                  try again
                </button>
              </div>
            )}
          </>
        )}

        {hydrated && tab.length >= 3 && phase.kind === "idle" && !onboardingVisible && (
          <ArmaanLedger
            entries={tab}
            onReviewClick={(id) => setRevisitId(id)}
          />
        )}

        {hydrated && tab.length > 0 && phase.kind !== "verdict" && (
          <section className="pt-8 border-t border-rule">
            <h2 className="font-receipt text-xs text-ink-muted uppercase tracking-widest mb-4">
              your tab · {tab.length}
            </h2>
            <TabList
              entries={tab}
              onUpdate={handleTabUpdate}
              onOpen={(id) => setRevisitId(id)}
            />
          </section>
        )}
      </main>

      {revisitId && hydrated && (() => {
        const revisiting = tab.find((e) => e.id === revisitId);
        if (!revisiting) return null;
        const others = tabEntriesToPast(tab.filter((e) => e.id !== revisitId));
        return (
          <RevisitModal
            entry={revisiting}
            userContext={context}
            otherPastVerdicts={others}
            onClose={() => setRevisitId(null)}
            onUpdate={handleTabUpdate}
          />
        );
      })()}
    </div>
  );
}
