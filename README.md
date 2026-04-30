# cosign

> You need a cosigner for that purchase.

Upload a screenshot of anything you're about to buy — Amazon, TikTok Shop, Depop, an Instagram ad — and **Armaan**, an AI stingy-friend, gives you an honest verdict: **COSIGNED**, **NOT_COSIGNED**, or **SLEEP_ON_IT**. Push back in chat and he'll update his take if you give him a real reason.

**Live demo:** [cosign-apramey006s-projects.vercel.app](https://cosign-apramey006s-projects.vercel.app)

## Features

- **Verdict from a screenshot** — vision + reasoning in a single model call, grounded in your budget, saving goals, and past regrets.
- **Chat** — argue with Armaan; he flips on new info, holds the line on excuses.
- **Shareable verdicts** — every verdict gets a signed public URL with a custom OG image.
- **History (Tab)** — past verdicts are clickable; reopen, continue the chat, mark as purchased or regret.
- **30-day follow-ups** — Armaan checks in on your purchases later.
- **Ledger** — receipt-style stats once you have 3+ verdicts.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Google Gemini 2.5 Flash Lite (vision + structured output via `responseSchema`)
- Zod for input + LLM-output validation
- Vitest + GitHub Actions CI
- Vercel (hosting, OG images via `next/og`)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # add GEMINI_API_KEY
pnpm dev
```

Open <http://localhost:3000>. Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

### Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest |
| `pnpm exec tsx evals/run.ts` | Run the eval suite (needs `GEMINI_API_KEY`) |

## License

MIT
