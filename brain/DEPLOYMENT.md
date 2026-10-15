# Deployment & DevOps Guide — SafeCity AI

> **Single Deployer Rule:** Only **Zeeshan Maqsood** merges pull requests into `main` and triggers production deployments on Vercel to eliminate race conditions and conflicting build states.

---

## 1. Hosting Architecture
- **Primary Hosting:** Vercel (Edge Network + Serverless Functions).
- **Production Domain:** `https://safecity-ai.vercel.app` (or custom hackathon domain if provisioned).
- **Database (Optional):** Supabase Managed Postgres (`aws-eu-central-1` or closest low-latency region).

---

## 2. Step-by-Step Production Deployment

### Step 1: Initial Empty App Deployment (Minute 0:10)
Before building full features, verify Vercel pipeline:
```bash
# In local terminal
git checkout -b init/empty-app
npm install
npx vercel link
npx vercel --prod
```
Confirm the production URL returns HTTP 200.

### Step 2: Configure Environment Variables in Vercel
In Vercel Dashboard -> Project Settings -> Environment Variables, add:
- `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK`: `true`
- `NEXT_PUBLIC_CITY_NAME`: `Abbottabad`
- `NEXT_PUBLIC_DEFAULT_HOSPITAL`: `City Hospital`
- `NEXT_PUBLIC_EMERGENCY_SERVICE`: `Rescue 1122`
- `NEXT_PUBLIC_SUPABASE_URL`: *(Supabase project URL if connected)*
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: *(Supabase anon key)*

### Step 3: Database Migration & Seeding (If Supabase Active)
Run migrations via Supabase SQL Editor or CLI:
```bash
npx supabase db push
npm run db:seed
```

### Step 4: Preview vs Production Deployments
- Every GitHub Pull Request automatically generates a Vercel **Preview URL**.
- Reviewers validate features on the Preview URL using [brain/TESTING.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/TESTING.md).
- Merges into `main` trigger immediate production promotion.

---

## 3. Rollback Procedure
If a production deployment breaks during the hackathon:
1. Open the [Vercel Deployments Dashboard](https://vercel.com/dashboard).
2. Locate the previous successful green deployment.
3. Click the three dots `...` -> **Promote to Production**.
4. Rollback takes effect globally in under 10 seconds.

---

## 4. Post-Deploy Smoke Test Checklist

Execute immediately after any production promotion:
```bash
# 1. Verify Health Endpoint
curl -I https://safecity-ai.vercel.app/api/health
# Expected: HTTP/2 200 OK

# 2. Verify Signals Preemption Mock
curl -s https://safecity-ai.vercel.app/api/signals | grep "Int-01"
# Expected: JSON containing intersection metadata

# 3. Visual Smoke Test
# - Open production URL on smartphone (360px) and laptop (1440px)
# - Confirm ambulance marker translates along the corridor
# - Confirm no 500 error banners in the console
```
