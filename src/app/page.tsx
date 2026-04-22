import Link from "next/link";
import { VerdictStamp } from "@/components/verdict-stamp";

const SAMPLE_REASONS = [
  "u returned the same hoodie 3 weeks ago",
  "u said you were saving for the concert in july",
  "u have 4 productivity journals already",
];

export default function Home() {
  return (
    <div className="flex-1 paper paper-grain">
      <header className="border-b border-rule">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-display italic text-2xl leading-none">
            cosign<span className="text-stamp-red not-italic">.</span>
          </span>
          <nav className="flex items-center gap-6 text-sm font-receipt text-ink-muted">
            <Link
              href="/cosign"
              className="hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
            >
              try it
            </Link>
            <Link
              href="https://github.com/Apramey006/cosign"
              className="hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
              target="_blank"
            >
              github
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-14 md:py-20">
        {/* Hero + visual proof in one viewport */}
        <section className="grid lg:grid-cols-[1.1fr,1fr] gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 font-receipt text-xs uppercase tracking-widest border border-rule-strong px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-stamp-red animate-pulse" />
              meet armaan — your stingy friend
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
              you need a <em className="text-stamp-red">cosigner</em>
              <br />
              for that purchase.
            </h1>
            <p className="text-lg md:text-xl text-ink-muted max-w-xl leading-snug">
              upload a screenshot of anything you&apos;re about to buy. armaan
              gives you the honest verdict your group chat is too polite to
              give.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/cosign"
                className="inline-flex items-center justify-center font-receipt uppercase tracking-wider font-bold bg-ink text-paper px-8 py-4 hover:bg-stamp-red focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors"
              >
                ask armaan →
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center justify-center font-receipt uppercase tracking-wider text-ink px-8 py-4 border border-rule-strong hover:border-ink focus:outline-none focus-visible:border-ink transition-colors"
              >
                how it works
              </Link>
            </div>
          </div>

          {/* Sample verdict as the hero visual — taped-on receipt */}
          <div className="relative tilt-right mt-4 lg:mt-0">
            <div className="bg-paper-tint border border-ink/20 px-5 md:px-8 py-7 md:py-9 shadow-[3px_6px_0_rgba(28,25,23,0.15)] relative">
              <div className="absolute -top-7 -right-3 md:-top-8 md:-right-6">
                <VerdictStamp verdict="NOT_COSIGNED" size="lg" />
              </div>

              <div className="flex items-start justify-between mb-3 font-receipt text-[10px] text-ink-muted uppercase tracking-widest">
                <span>armaan · cosign</span>
                <span>no. 0042</span>
              </div>

              <div className="rule-dashed h-px mb-4" />

              <p className="font-receipt text-xs text-ink-muted">
                amazon · $84
              </p>
              <h3 className="font-display text-2xl md:text-3xl leading-none mt-1">
                ergonomic mesh office chair
              </h3>
              <p className="mt-3 text-xl md:text-2xl font-display italic leading-tight">
                bro. no.
              </p>
              <ul className="mt-4 space-y-2 font-receipt text-sm text-ink">
                {SAMPLE_REASONS.map((r, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-stamp-red">›</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <div className="rule-dashed h-px mt-6" />

              <div className="flex items-center justify-between mt-3 font-receipt text-[10px] text-ink-fade uppercase tracking-widest">
                <span>signed, armaan</span>
                <span>don&apos;t make me say i told u so</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mt-24 md:mt-36">
          <h2 className="font-receipt text-sm text-ink-muted uppercase tracking-widest mb-10">
            how it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "screenshot",
                body: "anything. amazon, tiktok shop, depop, an ig post. we read it with gemini vision.",
              },
              {
                n: "02",
                title: "context",
                body: "armaan knows your budget, your goals, your recent regrets. no generic advice.",
              },
              {
                n: "03",
                title: "verdict",
                body: "COSIGNED, NOT COSIGNED, or SLEEP ON IT. with reasons. in armaan's voice.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="border-l-2 border-ink/30 pl-6 hover:border-stamp-red transition-colors"
              >
                <p className="font-receipt text-xs text-stamp-red mb-2">
                  {step.n}
                </p>
                <h3 className="font-display text-2xl mb-2 leading-none">
                  {step.title}
                </h3>
                <p className="text-ink-muted leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why it's different */}
        <section className="mt-24 md:mt-32">
          <h2 className="font-receipt text-sm text-ink-muted uppercase tracking-widest mb-10">
            why it isn&apos;t just chatgpt for shopping
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              [
                "persistent memory",
                "armaan remembers every purchase you've run through. he notices patterns you don't.",
              ],
              [
                "longitudinal regret scoring",
                "30 days after you buy, he pings: still glad? builds your actual regret profile over time.",
              ],
              [
                "argue with him",
                "don't like the verdict? push back in chat. he flips if you give him a real reason. he doesn't if you just whine.",
              ],
              [
                "receipt-ready",
                "every verdict becomes a shareable signed receipt. send it to the group chat. prove armaan was right (or wrong).",
              ],
            ].map(([title, body]) => (
              <div
                key={title}
                className="border border-ink/20 bg-paper-tint p-6 hover:border-ink transition-colors lift-on-hover"
              >
                <h3 className="font-receipt text-sm uppercase tracking-wider text-stamp-red mb-3">
                  {title}
                </h3>
                <p className="text-ink leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 pb-10 text-center">
          <Link
            href="/cosign"
            className="inline-flex items-center justify-center font-receipt uppercase tracking-wider font-bold bg-ink text-paper px-10 py-5 text-lg hover:bg-stamp-red focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors"
          >
            get your first verdict →
          </Link>
          <p className="mt-6 text-xs text-ink-fade font-receipt">
            free while in beta · no signup for the first verdict
          </p>
        </section>
      </main>

      <footer className="border-t border-rule mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs font-receipt text-ink-muted">
          <span>cosign · built by a broke college kid, for broke college kids</span>
          <span>v1.1 · paper edition</span>
        </div>
      </footer>
    </div>
  );
}
