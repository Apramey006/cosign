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
    <div className="flex-1 grain">
      <header className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-lg font-bold tracking-tight focus:outline-none focus-visible:text-lime-300"
          >
            cosign<span className="text-lime-300">.</span>
          </Link>
          <Link
            href="/cosign"
            className="font-mono text-xs uppercase tracking-widest text-zinc-300 hover:text-lime-300 focus:outline-none focus-visible:text-lime-300 transition-colors"
          >
            get your own verdict →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
          a verdict from their broke friend
        </p>
        <div className="border-2 border-zinc-800 bg-zinc-950 p-8 md:p-14 relative">
          <div className="absolute -top-8 -right-4 md:-top-10 md:-right-8">
            <VerdictStamp verdict={verdict.verdict} size="xl" />
          </div>
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            <div className="h-28 w-28 md:h-40 md:w-40 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs shrink-0">
              IMG
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-zinc-400">
                {product.source ? `${product.source} · ` : ""}
                {formatPrice(product.priceCents)}
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold mt-1 break-words font-display tracking-tight">
                {product.name}
              </h1>
              <p className="mt-5 text-zinc-100 text-xl md:text-2xl leading-snug">
                {verdict.headline}
              </p>
              <ul className="mt-5 space-y-2.5 text-zinc-300 font-mono text-sm md:text-base">
                {verdict.reasons.map((r, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-lime-300 shrink-0">›</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {verdict.roast && (
                <p className="mt-6 text-zinc-100 italic border-l-2 border-lime-300 pl-4">
                  {verdict.roast}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-6 text-center">
          <p className="text-zinc-200 mb-4">
            your friend is using cosign to roast (or bless) their purchases
            before the money leaves the account.
          </p>
          <Link
            href="/cosign"
            className="inline-flex items-center justify-center font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-6 py-3 hover:bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors text-sm"
          >
            get your own verdict →
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-900 mt-20">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs font-mono text-zinc-500 text-center">
          cosign · built by a broke college kid, for broke college kids
        </div>
      </footer>
    </div>
  );
}
