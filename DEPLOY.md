# Deploy cosign

You'll have this live at a real URL (`cosign.vercel.app` or similar) in ~5 minutes. Free tier, no credit card needed.

## 1. Get an Anthropic API key

1. Go to https://console.anthropic.com
2. Sign in (Google works)
3. Go to **Settings → API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Add $5 in credits under **Settings → Billing**. That's ~500 verdicts.

> **Note:** if you want to stay free-tier forever, swap `claude-sonnet-4-5` for `claude-haiku-4-5` in `src/lib/anthropic.ts`. Haiku is cheaper and nearly as good for this task.

## 2. Deploy to Vercel

### Option A — one-click (easiest)

1. Click the Vercel deploy button below (after you push this repo to your GitHub):

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FApramey006%2Fcosign)

2. Vercel will prompt you for environment variables. Add:
   - `ANTHROPIC_API_KEY` — the key you copied above

3. Click **Deploy**. Takes ~60 seconds.

### Option B — CLI

```bash
pnpm install -g vercel
cd ~/projects/cosign
vercel                   # follow prompts, link to your account
vercel env add ANTHROPIC_API_KEY production
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
Your `ANTHROPIC_API_KEY` isn't set in Vercel env vars, or has no credits. Check **Settings → Environment Variables** in the Vercel project.

**Rate limit hit immediately**
The in-memory rate limit resets on every serverless invocation — shouldn't trip under normal use. If it does, you may have hit Anthropic's upstream rate limit.

**OG image not showing on iMessage / Twitter**
iMessage caches OG cards aggressively. Try a fresh URL (re-share). Twitter sometimes takes a minute to index new OG cards.

## Upgrade path when you outgrow this

- **Multi-instance rate limit** — swap `lib/rate-limit.ts` for `@upstash/ratelimit` + Upstash Redis (free tier, 10k req/day)
- **Real persistence** — add Supabase (auth + Postgres) when you want cross-device tabs. The data model is already in `lib/types.ts` (`TabEntry`)
- **Email regret pings** — add Resend (3k emails/mo free) + a scheduled Vercel Cron to fire at 30/90/180 days after `purchased=true`
