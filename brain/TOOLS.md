# Tools, Services & Third-Party Integrations — SafeCity AI

> **Selection Principle:** Radical minimalism. Every added external service introduces deployment latency and failure modes. We prioritize client-side execution and mock-first fallback contracts.

---

## 1. Selected Services Matrix

| Category | Chosen Tool | Purpose | Free-Tier Limits (Verify on official page) | Setup Time | Fallback Plan |
|---|---|---|---|---|---|
| **Hosting & CI** | **Vercel** | Next.js Edge frontend & API hosting | 100 GB bandwidth, serverless execution limits (Hobby) | 5 mins | Local Next.js server via tunnel / Netlify |
| **Code Hosting** | **GitHub** | Repository, PR reviews, Actions CI | Unlimited public repos, 2,000 CI mins/mo | 3 mins | Local git bundles |
| **Database & Realtime** | **Supabase** | Postgres data & WebSocket channels | 500 MB storage, 50,000 active monthly users, 200 concurrent real-time | 7 mins | In-memory JavaScript Map & SWR polling |
| **Mapping Engine** | **Leaflet + OSM** | Geospatial corridor & marker rendering | 100% Free, open-source OpenStreetMap raster tiles | 4 mins | SVG schematic map (implemented in prototype) |
| **Iconography** | **Lucide React** | Consistent emergency dashboard icons | Free & open-source MIT license | 1 min | Inline SVGs |
| **Validation** | **Zod** | TypeScript runtime API contract validation | Free & open-source npm library | 1 min | Manual defensive `if` guards |
| **Optional ML** | **HF Spaces (Gradio/FastAPI)** | YOLO ambulance object detection (COULD) | Free CPU basic (sleeps after 48h idle) | 15 mins | **Scripted mock `/api/detect` fixture (Default path)** |

---

## 2. Critical Free-Tier Gotchas & Mitigations

1. **Supabase Inactivity Pause:**
   - *Risk:* Inactive free Supabase projects pause after 7 days, returning HTTP 503 during presentations.
   - *Mitigation:* Zeeshan opens the Supabase project dashboard at Minute 0:10 to ensure the project is warmed up and active. If paused, `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=true` runs the demo seamlessly without database connection.
2. **Hugging Face Spaces Cold Sleep:**
   - *Risk:* Free HF Spaces spin down. First detection call can take 45–90 seconds to wake up.
   - *Mitigation:* Do NOT rely on real HF ML for the primary live demo path. Keep the scripted mock active. Real ML is an optional bonus.
3. **Render Free Server Sleep:**
   - *Risk:* Render web services sleep after 15 mins of inactivity.
   - *Decision:* We avoid Render completely and host Next.js server actions on Vercel.
4. **Vercel Hobby Serverless Timeout:**
   - *Risk:* Functions hard-cap at 10s execution on the free plan.
   - *Mitigation:* All `/api/*` endpoints respond within <50ms using mock or lightweight SQL queries.

---

## 3. Accounts Checklist (First 15 Minutes)

- [ ] **GitHub:** Create organization/repo `safecity-ai/safecity-green-corridor` (Owner: Abdul Wahid / Zeeshan)
- [ ] **Vercel:** Connect GitHub repo, deploy initial empty commit to verify DNS and edge routing (Owner: Zeeshan)
- [ ] **Supabase:** Initialize free project `safecity-prod` (Abbottabad demo DB) (Owner: Zeeshan)
- [ ] *(Optional)* **Hugging Face:** Free CPU Space initialized only if Phase 2 completes ahead of schedule (Owner: Zeeshan / Faseeh)

---

## 4. Scaling & Production Cost Note
Beyond the hackathon free tier:
- Supabase Pro ($25/mo) unlocks automated point-in-time recovery, dedicated compute, and 8 GB database storage.
- Vercel Pro ($20/seat/mo) eliminates serverless function timeouts and provides SLA guarantees for municipal control centers.
- AWS / Dedicated GPU edge node ($80–$150/mo) for 24/7 RTSP video inference.
