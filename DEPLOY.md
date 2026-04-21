# Deploy cosign

You'll have this live at a real URL (`cosign.vercel.app` or similar) in ~5 minutes. **Free tier, no credit card needed anywhere.**

## 1. Get a Gemini API key (free, no card)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with any Google account
3. Click **Create API key**
4. Copy the key (starts with `AIza...`)

> **Free tier limits on `gemini-2.5-flash`:** 15 requests/minute, 1,500 requests/day, 1M tokens/minute. Plenty for a personal demo and small beta.

## 2. Deploy to Vercel

### Option A — one-click (easiest)

1. Click the deploy button:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FApramey006%2Fcosign)

2. Vercel will prompt you for environment variables. Add:
   - `GEMINI_API_KEY` — the key you copied above

3. Click **Deploy**. Takes ~60 seconds.

### Option B — CLI

```bash
pnpm install -g vercel
cd ~/projects/cosign
vercel                   # follow prompts, link to your account
vercel env add GEMINI_API_KEY production
vercel --prod            # deploy
```

## 3. (Optional) Custom domain

1. Buy a domain (Porkbun / Namecheap / Cloudflare — `cosign.app` is taken; try `cosign.me`, `getcosign.com`, `cosign.cool`)
2. In Vercel project → **Settings → Domains** → add your domain
3. Copy Vercel's DNS records to your registrar

## 4. Post-deploy checklist

- [ ] Visit `/` — landing page renders
- [ ] Visit `/cosign` — upload a screenshot, get a verdict
- [ ] Click **share verdict** — copy the URL
- [ ] Paste the URL in iMessage → you should see the OG card preview
- [ ] Paste the same URL in Twitter / Discord → same card renders
- [ ] In a new browser window, open the share URL — verdict renders with no auth

## Troubleshooting

**"server misconfigured" error on verdict**
Your `GEMINI_API_KEY` isn't set in Vercel env vars. Check **Settings → Environment Variables** in the Vercel project.

**"too many verdicts right now" when you've barely used it**
You may have hit Gemini's free tier per-minute rate limit (15 rpm). Wait 60s and try again. If it keeps happening, upgrade to paid in Google AI Studio (still dirt cheap) or swap to `gemini-2.5-flash-lite` in `src/lib/gemini.ts`.

**OG image not showing on iMessage / Twitter**
iMessage caches OG cards aggressively. Try a fresh URL (re-share). Twitter sometimes takes a minute to index new OG cards.

## Upgrade path when you outgrow this

- **Multi-instance rate limit** — swap `lib/rate-limit.ts` for `@upstash/ratelimit` + Upstash Redis (free tier, 10k req/day)
- **Real persistence** — add Supabase (auth + Postgres) when you want cross-device tabs. The data model is already in `lib/types.ts` (`TabEntry`)
- **Email regret pings** — add Resend (3k emails/mo free) + a scheduled Vercel Cron to fire at 30/90/180 days after `purchased=true`
- **Swap model for free-er tier** — `gemini-2.5-flash-lite` is 10x cheaper if you blow past the free tier
