import Link from "next/link";

export default function CosignPage() {
  return (
    <div className="flex-1 grain">
      <header className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-mono text-lg font-bold tracking-tight">
            cosign<span className="text-lime-300">.</span>
          </Link>
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            scaffold · coming online next PR
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="border-2 border-dashed border-zinc-800 p-16 text-center">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">
            upload dropzone
          </p>
          <p className="text-zinc-300 text-lg mb-6">
            drop a screenshot here — or click to pick one
          </p>
          <p className="text-zinc-600 text-sm max-w-md mx-auto">
            this is the scaffold. the vision → verdict pipeline lands in PR #2.
            for now, here is the UI shape.
          </p>
        </div>

        <div className="mt-10">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">
            what is next
          </p>
          <ul className="space-y-3 font-mono text-sm text-zinc-400">
            <li className="flex gap-3">
              <span className="text-lime-300">›</span>
              <span>wire claude vision for screenshot → product extraction</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lime-300">›</span>
              <span>broke-friend persona endpoint (verdict + reasons)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lime-300">›</span>
              <span>supabase auth (magic link)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lime-300">›</span>
              <span>&ldquo;the tab&rdquo; — running history of your verdicts</span>
            </li>
          </ul>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center font-mono uppercase tracking-wider text-zinc-400 px-6 py-3 border border-zinc-800 hover:border-lime-300 hover:text-lime-300 transition-colors"
          >
            ← back
          </Link>
        </div>
      </main>
    </div>
  );
}
