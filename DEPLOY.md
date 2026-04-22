# Deploy cosign

Cosign runs on Vercel Hobby (free) + Google AI Studio (free) — no credit card required. This doc covers first deploy, post-deploy checks, and upgrade paths as usage grows.

## 1. Get a Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with any Google account
3. Click **Create API key**
4. Copy the key (starts with `AIza...`)

**Free-tier limits on `gemini-2.5-flash-lite`:** 30 req/min, 1,500 req/day. Plenty for a personal demo and a small beta cohort.

## 2. Generate a share-signing secret

Share URLs are HMAC-signed so nobody can forge a fake verdict under your domain. Generate a 32-byte secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save the output — you'll paste it into Vercel in the next step.

## 3. Deploy to Vercel

### Option A — one-click

1. Click the deploy button below (after pushing this repo to your GitHub):

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FApramey006%2Fcosign)

2. Vercel will prompt for environment variables. Add:
   - `GEMINI_API_KEY` — from step 1
   - `COSIGN_SHARE_SECRET` — the hex string from step 2

3. Click **Deploy.** Takes ~60 seconds.

### Option B — CLI

```bash
pnpm install -g vercel
cd cosign
vercel                   # link to your project
vercel env add GEMINI_API_KEY production
vercel env add COSIGN_SHARE_SECRET production
vercel --prod
```

## 4. (Optional) custom domain

1. Buy a domain (Porkbun / Namecheap / Cloudflare — try `cosign.me`, `getcosign.com`, `cosign.cool`)
2. In Vercel project → **Settings → Domains** → add it
3. Copy Vercel's DNS records to your registrar

## 5. Post-deploy checklist

- [ ] `/` landing page renders
- [ ] `/cosign` — upload a screenshot → get a verdict
- [ ] **Chat:** push back ("but it's a gift") → Armaan should flip
- [ ] **Share:** click "send this to the group chat" → paste the URL in iMessage → OG preview renders
- [ ] Open the share URL in incognito — renders, has sticky "get your own verdict" CTA
- [ ] Tab (after 3+ verdicts): Armaan's Ledger appears at top with stats
- [ ] Click a tab row → revisit modal opens with the old verdict + a fresh chat

## Monitoring

Everything logs structured JSON to Vercel's logs panel. Grep for:

| Pattern | Meaning |
|---|---|
| `"ev":"verdict_ok"` | successful verdict (has `ms`, `verdict`, `hasCtx`) |
| `"ev":"verdict_err"` | failed verdict (has `code`, `log`) |
| `"ev":"chat_ok"` / `"ev":"chat_err"` | chat equivalents |
| `"ev":"rate_limit_hit"` | abuse detection — multiple hits in a short window = investigate |
| `"ev":"model_call"` | per-call Gemini latency (`ms`, `ok`) |
| `"ev":"config_err"` | misconfiguration (missing env var) |

## Troubleshooting

**"server misconfigured" on verdict**
\`GEMINI_API_KEY\` isn't set in Vercel env vars or was typo'd. Check **Settings → Environment Variables**.

**Share URLs return 404 for verdicts you know are valid**
`COSIGN_SHARE_SECRET` isn't set or got rotated. Either re-set it to the original value, or accept that pre-rotation URLs are now invalid (share URLs only live as long as the secret that signed them).

**"too many verdicts right now" when you've barely used it**
Gemini free-tier rate limit (30 rpm). Wait 60s. If persistent, consider enabling billing on the Google AI account for a higher cap — still dirt cheap.

**OG image not showing on iMessage / Twitter**
iMessage caches aggressively. Use a fresh URL. Twitter can take a minute to index new OG cards.

## Upgrade paths

All of these are **optional** — the app works great without them until traffic grows.

### 1. Multi-instance rate limit (Upstash Redis)

The current rate limit is in-memory per serverless instance. On Vercel Hobby this is effectively 1-2 instances, so the real cap per IP is 10-20 rpm. For higher-traffic deployments you'll want Upstash Redis:

1. Create a free Upstash Redis database at https://upstash.com
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. (Future work — currently the code uses in-memory only; stub for the swap is documented in `src/lib/rate-limit.ts`)

### 2. Global daily Gemini budget cap

Protects against a single adversary exhausting your daily free-tier quota via IP rotation. Same Upstash integration — tracks a key like `cosign:daily:YYYY-MM-DD`; at ~80% of free-tier cap the API starts returning 503.

### 3. Persistent tabs across devices (Supabase)

Current tabs are localStorage only. For users who want to sync across phone + laptop, drop in Supabase auth + a single `verdicts` table. The data model is already in `src/lib/types.ts` (`TabEntry`).

### 4. Email follow-ups (Resend + Vercel Cron)

The 30-day follow-up ping is currently in-app only. For users who rarely return, a Resend email saying "armaan wants to know about your [product]" would close the loop. Free tier: 3k emails/month.
