import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VerdictStamp } from "@/components/verdict-stamp";
import { decodeShare } from "@/lib/share";
import { formatPrice } from "@/lib/utils";

type Params = Promise<{ encoded: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { encoded } = await params;
  const payload = decodeShare(encoded);
  if (!payload) {
    return { title: "cosign · verdict not found" };
  }
  const title = `${payload.v.verdict.replace(/_/g, " ")}: ${payload.p.name}`;
  const description = payload.v.headline;
  return {
    title: `cosign · ${title}`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharedVerdictPage({ params }: { params: Params }) {
  const { encoded } = await params;
  const payload = decodeShare(encoded);

  if (!payload) notFound();
  const { p: product, v: verdict } = payload;

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
          <Link
            href="/cosign"
            className="font-receipt text-xs uppercase tracking-widest text-ink-muted hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
          >
            get your own verdict →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <p className="font-receipt text-xs text-ink-muted uppercase tracking-widest">
          a verdict from armaan
        </p>
        <div className="bg-paper-tint border border-ink/20 px-6 md:px-12 py-10 md:py-14 relative shadow-[2px_4px_0_rgba(28,25,23,0.12)]">
          <div className="absolute top-4 right-4 md:-top-10 md:-right-8">
            <VerdictStamp
              verdict={verdict.verdict}
              size="xl"
              className="md:scale-100 scale-[0.65]"
            />
          </div>

          <div className="flex items-start justify-between mb-5 font-receipt text-xs text-ink-muted uppercase tracking-widest">
            <span>armaan · cosign</span>
            <span>shared verdict</span>
          </div>

          <div className="rule-dashed h-px mb-8" />

          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            <div className="h-28 w-28 md:h-40 md:w-40 bg-paper border-2 border-ink/20 flex items-center justify-center text-ink-fade font-receipt text-xs shrink-0">
              IMG
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-receipt text-sm text-ink-muted">
                {product.source ? `${product.source} · ` : ""}
                {formatPrice(product.priceCents)}
              </p>
              <h1 className="font-display text-3xl md:text-4xl mt-1 leading-none break-words">
                {product.name}
              </h1>
              <p className="mt-5 text-2xl md:text-3xl font-display italic leading-tight">
                {verdict.headline}
              </p>
              <ul className="mt-6 space-y-2.5 font-receipt text-sm md:text-base text-ink">
                {verdict.reasons.map((r, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-stamp-red shrink-0">›</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {verdict.roast && (
                <p className="mt-6 font-display italic text-xl border-l-2 border-stamp-red pl-4">
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

        <div className="border border-ink/20 bg-paper-tint p-6 text-center">
          <p className="text-ink mb-4 font-display italic text-xl leading-tight">
            ur friend ran this past armaan before buying.
            <br />
            wanna run ur next thing past him too?
          </p>
          <Link
            href="/cosign"
            className="inline-flex items-center justify-center font-receipt uppercase tracking-wider font-bold bg-ink text-paper px-6 py-3 hover:bg-stamp-red focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors text-sm"
          >
            ask armaan →
          </Link>
        </div>

        <div className="h-24" aria-hidden />
      </main>

      {/* Sticky mobile bottom CTA — the primary acquisition surface when a friend shares a verdict */}
      <div className="fixed bottom-0 inset-x-0 bg-paper-tint border-t-2 border-ink shadow-[0_-4px_12px_rgba(28,25,23,0.1)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <p className="font-display italic text-sm md:text-base text-ink flex-1 leading-tight">
            your friend just got roasted.
            <br className="md:hidden" />
            <span className="text-ink-muted"> you&apos;re next.</span>
          </p>
          <Link
            href="/cosign"
            className="shrink-0 font-receipt uppercase tracking-wider font-bold bg-ink text-paper px-5 py-3 text-sm hover:bg-stamp-red focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors"
          >
            ask armaan →
          </Link>
        </div>
      </div>

      <footer className="border-t border-rule mt-20 pb-24">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs font-receipt text-ink-muted text-center">
          cosign · built by a broke college kid, for broke college kids
        </div>
      </footer>
    </div>
  );
}
