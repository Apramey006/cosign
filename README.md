# cosign

> you need a cosigner for that purchase.

**Cosign** is an AI "broke-friend" who vets your purchases. Upload a screenshot of anything you're about to buy — Amazon, TikTok Shop, Depop, an IG ad — and get an honest verdict in the voice of the friend who always keeps it real.

Not just ChatGPT for shopping. Four unique mechanics:

1. **Persistent persona with memory.** Knows your budget, past purchases, saving goals, recent regrets. Roasts accordingly.
2. **Longitudinal regret scoring.** 30/90/180-day pings. Builds your actual regret profile, not your narrative.
3. **Friend jury** (coming). Text 3 real friends; they vote on your purchase.
4. **Anti-influencer mode** (coming). Paste a TikTok Shop link; we surface what the hype cycle hid.

Built as an iterative portfolio project — each PR is a review round by a separate lens (PM / VC / SWE / UX).

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript + Tailwind v4
- Supabase (auth + Postgres + Storage)
- Anthropic Claude Sonnet 4.5 (vision + persona)
- Vercel hosting

## Run locally

```bash
pnpm install
cp .env.example .env.local  # fill in keys
pnpm dev
```

Env vars (all free tier):

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from https://supabase.com
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com

## Iteration trail

- [x] **PR #1** — scaffold + landing page
- [ ] **PR #2** — working v1 (vision → verdict → tab)
- [ ] **PR #3** — review-round-1 feedback
- [ ] **PR #4** — moat features (regret pings + friend jury)
- [ ] **PR #5** — final polish + deploy config
