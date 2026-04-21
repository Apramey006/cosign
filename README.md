# cosign

> **you need a cosigner for that purchase.**

The AI broke-friend who roasts (or blesses) your purchases before the money leaves the account. Upload a screenshot of anything — Amazon, TikTok Shop, Depop, an Instagram ad — and get an honest verdict in the voice of the friend who always keeps it real.

![cosign hero](https://github.com/Apramey006/cosign/assets/placeholder/hero.png)

## Why this isn't just ChatGPT for shopping

Four mechanics make cosign structurally different from a 10-second ChatGPT prompt:

| Mechanic | What it does | Why it's defensible |
|---|---|---|
| **Persistent persona with memory** | Knows your budget, past verdicts, recent regrets. Cites them by name. | ChatGPT can do this with priming — cosign does it by default, and the model sees tagged past verdicts in a structured way the prompt couldn't easily match |
| **Longitudinal regret scoring** | 30/90/180-day check-ins. `purchased → stillGlad?` closes the loop and becomes the model's strongest signal next time | Behavioral dataset that compounds. Each user's 20th verdict is measurably sharper than verdict #1 |
| **Shareable verdicts** | Every verdict is a screenshottable stamp with an auto-generated OG card, copyable URL, and native share sheet | Turns every NOT_COSIGNED into a distribution event — iMessage / TikTok / Discord all render the card natively |
| **Anti-influencer mode** (roadmap) | Paste any TikTok Shop / Instagram product link — we surface what the hype cycle left out | Counter-narrative positioning TikTok won't build themselves |

## Live demo

Deploy your own in ~5 minutes — see [`DEPLOY.md`](./DEPLOY.md). Needs a free Anthropic API key and a Vercel account.

## The iteration trail

This repo is also a portfolio project — five PRs, each reviewed by a different lens (PM / VC / SWE-recruiter / UX), with feedback integrated into the next PR.

| PR | What shipped |
|---|---|
| [#1](https://github.com/Apramey006/cosign/pull/1) | Scaffold + branded landing page |
| [#2](https://github.com/Apramey006/cosign/pull/2) | Working v1 — screenshot → Claude Vision → verdict |
| [#3](https://github.com/Apramey006/cosign/pull/3) | Round 1 feedback: memory loop, hero reveal, bug fixes, a11y |
| [#4](https://github.com/Apramey006/cosign/pull/4) | Round 2 feedback: share URLs, OG cards, rate limiting, prompt injection defense |
| [#5](https://github.com/Apramey006/cosign/pull/5) | Final polish: tests, CI, docs |

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **TypeScript** + **Tailwind v4** + Space Grotesk / Geist fonts
- **Anthropic Claude Sonnet 4.5** — single call does vision extraction + persona verdict
- **Zod** — validates both user input AND the model's JSON response
- **Vitest** — 26 tests covering share encoding, rate-limit isolation, error mapping, prompt sanitization
- **GitHub Actions** — lint + typecheck + test + build on every PR
- **Vercel** — hosting, OG image generation, serverless functions

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # landing page
│   ├── cosign/page.tsx             # main app: upload → verdict → tab
│   ├── v/[encoded]/
│   │   ├── page.tsx                # public shared verdict (server component)
│   │   └── opengraph-image.tsx     # 1200x630 PNG rendered via next/og
│   └── api/verdict/route.ts        # thin handler: parse, rate-limit, dispatch
├── lib/
│   ├── verdict/
│   │   ├── schema.ts               # zod schemas + allowed image types
│   │   ├── model.ts                # Anthropic call + JSON validation
│   │   └── errors.ts               # typed VerdictError union + APIError branching
│   ├── prompts.ts                  # broke-friend system prompt + XML-wrapped user data
│   ├── rate-limit.ts               # in-memory LRU, 10 req/min/IP
│   ├── share.ts                    # base64url verdict encoding
│   └── store.ts                    # localStorage helpers for tab + context
└── components/
    ├── verdict-card.tsx            # the hero reveal
    ├── verdict-stamp.tsx           # COSIGNED / NOT_COSIGNED / SLEEP_ON_IT
    ├── loading-thoughts.tsx        # "ok lemme look..." cycling thoughts
    ├── tab-list.tsx                # history + purchased/stillGlad controls
    ├── share-button.tsx            # navigator.share() → clipboard fallback
    ├── upload-dropzone.tsx         # drag/drop + keyboard accessible
    └── onboarding-form.tsx         # budget / goal / recent regret
```

## Run locally

```bash
pnpm install
cp .env.example .env.local          # fill in ANTHROPIC_API_KEY
pnpm dev                            # http://localhost:3000
```

### Scripts

- `pnpm dev` — Turbopack dev server
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest (26 tests, ~150ms)
- `pnpm test:watch` — watch mode

## Security notes

- **Rate limiting:** in-memory LRU on `/api/verdict`, 10 req/min per IP. In a multi-instance Vercel deploy, upgrade to Upstash Redis for shared state (documented in `lib/rate-limit.ts`).
- **Prompt injection:** user-controlled strings (past verdicts, saving goals, regrets) are sanitized (no newlines / backticks / angle brackets), length-capped, and wrapped in `<past_verdicts>` / `<user_context>` XML tags. System prompt explicitly treats tag contents as data.
- **Image upload validation:** strict MIME allowlist (png/jpg/webp/gif), 8MB cap, multipart only.
- **Error sanitization:** upstream Anthropic error messages never reach the client. `toVerdictError` produces user-safe messages while logging the real error server-side.

## What's next

Roadmap items we deliberately deferred during the 5-PR iteration:

- **Supabase persistence + magic-link auth** — currently localStorage only. Share URLs work because payload is encoded in the URL.
- **Receipt-shaped portrait share card** — UX R2 hero ask. Current OG is landscape 1200×630; a 1080×1350 portrait with perforated edges would be more TikTok-native.
- **30/90/180-day regret ping email** — needs email capture + Resend + scheduled job.
- **Friend jury (SMS)** — 3 friends vote on a big purchase. Twilio + a quick UI.
- **Anti-influencer mode** — paste a TikTok Shop / IG Reel link, cross-reference with review data.
- **Onboarding redesign** — one-question-per-screen conversational flow.
- **Browser extension** — intercept at checkout on Amazon / Shopify.

## License

MIT
