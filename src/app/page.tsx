import Link from "next/link";
import { VerdictStamp } from "@/components/verdict-stamp";

const SAMPLE_REASONS = [
  "u returned the same hoodie 3 weeks ago",
  "u said you were saving for the concert in july",
  "u have 4 productivity journals already",
];

export default function Home() {
  return (
    <div className="flex-1 grain">
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-tight">
              cosign<span className="text-lime-300">.</span>
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-zinc-400 font-mono">
            <Link href="/cosign" className="hover:text-lime-300 transition-colors">
              try it
            </Link>
            <Link
              href="https://github.com/Apramey006/cosign"
              className="hover:text-lime-300 transition-colors"
              target="_blank"
            >
              github
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 md:py-32">
        <section className="space-y-10">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest border border-zinc-800 px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300 animate-pulse" />
              broke-friend energy, on demand
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              you need a <span className="text-lime-300">cosigner</span>
              <br />
              for that purchase.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed">
              upload a screenshot of anything you&apos;re about to buy. get the
              honest verdict your group chat is too polite to give.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/cosign"
              className="inline-flex items-center justify-center font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-8 py-4 hover:bg-lime-200 transition-colors"
            >
              get a verdict →
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center justify-center font-mono uppercase tracking-wider text-zinc-400 px-8 py-4 border border-zinc-800 hover:border-lime-300 hover:text-lime-300 transition-colors"
            >
              how it works
            </Link>
          </div>
        </section>

        <section className="mt-28 md:mt-40">
          <div className="border-2 border-zinc-800 bg-zinc-950 p-6 md:p-10 max-w-3xl relative">
            <div className="absolute -top-5 -right-4">
              <VerdictStamp verdict="NOT_COSIGNED" size="lg" />
            </div>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">
              example verdict
            </p>
            <div className="flex items-start gap-4 md:gap-6">
              <div className="h-20 w-20 md:h-28 md:w-28 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs shrink-0">
                IMG
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-zinc-500">
                  amazon.com · $84
                </p>
                <h3 className="text-xl md:text-2xl font-semibold mt-1">
                  ergonomic mesh office chair (viral tiktok listing)
                </h3>
                <p className="mt-4 text-zinc-300 text-lg leading-snug">
                  bro. no.
                </p>
                <ul className="mt-4 space-y-2 text-zinc-400 font-mono text-sm">
                  {SAMPLE_REASONS.map((r, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-lime-300">›</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mt-28 md:mt-40">
          <h2 className="font-mono text-sm text-zinc-500 uppercase tracking-widest mb-10">
            how it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "screenshot",
                body: "anything. amazon, tiktok shop, depop, an ig post. we read it with claude vision.",
              },
              {
                n: "02",
                title: "context",
                body: "your broke-friend AI knows your budget, your goals, your recent regrets. no generic advice.",
              },
              {
                n: "03",
                title: "verdict",
                body: "COSIGNED, NOT COSIGNED, or SLEEP ON IT. with reasons. in your broke friend's voice.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="border-l-2 border-zinc-800 pl-6 hover:border-lime-300 transition-colors"
              >
                <p className="font-mono text-xs text-lime-300 mb-2">
                  {step.n}
                </p>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-28 md:mt-40">
          <h2 className="font-mono text-sm text-zinc-500 uppercase tracking-widest mb-10">
            why it isn&apos;t just chatgpt for shopping
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              [
                "persistent memory",
                "it remembers every purchase you've run through. it notices patterns you don't.",
              ],
              [
                "longitudinal regret scoring",
                "30/90/180 days after you buy, it pings: still glad? builds your actual regret profile over time.",
              ],
              [
                "friend jury (coming soon)",
                "text 3 real friends for a cosign. they vote. you see the ballot.",
              ],
              [
                "anti-influencer mode (coming soon)",
                "paste a tiktok shop link. we surface what the hype cycle left out.",
              ],
            ].map(([title, body]) => (
              <div
                key={title}
                className="border border-zinc-800 p-6 hover:border-lime-300 transition-colors"
              >
                <h3 className="font-mono text-sm uppercase tracking-wider text-lime-300 mb-3">
                  {title}
                </h3>
                <p className="text-zinc-300 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-32 pb-10 text-center">
          <Link
            href="/cosign"
            className="inline-flex items-center justify-center font-mono uppercase tracking-wider font-bold bg-lime-300 text-black px-10 py-5 text-lg hover:bg-lime-200 transition-colors"
          >
            get your first verdict →
          </Link>
          <p className="mt-6 text-xs text-zinc-600 font-mono">
            free while in beta · no signup for the first verdict
          </p>
        </section>
      </main>

      <footer className="border-t border-zinc-900 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs font-mono text-zinc-600">
          <span>cosign · built by a broke college kid, for broke college kids</span>
          <span>v0.1 · scaffold</span>
        </div>
      </footer>
    </div>
  );
}
