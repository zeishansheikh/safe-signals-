# Architecture Decision Records (ADRs) — SafeCity AI

---

## ADR-001: Scaled-Down Stack C with Mock-First Stack A Fallback
- **Date:** 2026-10-15
- **Status:** Accepted
- **Context:** SafeCity AI requires real-time detection, mapping, and signal coordination under a tight 4-hour hackathon limit.
- **Options Considered:**
  1. *Stack A (Fastest):* Next.js + Supabase + Vercel (All logic inside Next.js server actions).
  2. *Stack B (Separate API):* React/Vite + Express/FastAPI on Render + Neon.
  3. *Stack C (ML/AI):* Next.js on Vercel + FastAPI on Hugging Face Spaces + Supabase.
- **Decision:** Adopt Stack C scaled down: Next.js + TypeScript + Tailwind on Vercel with mock-first endpoints. The ML detection route (`/api/detect`) serves scripted detection fixtures from the demo CCTV clip. A real YOLO model on Hugging Face Spaces is a non-blocking COULD item, started only if backend work finishes before the 3:00 freeze. If the model slips, Stack A is our instant fallback.
- **Consequences:** Eliminates external server cold-start delays, prevents demo failure, and guarantees an interactive dashboard from minute 30.

---

## ADR-002: Mapping Engine — Leaflet + OpenStreetMap
- **Date:** 2026-10-15
- **Status:** Accepted
- **Options Considered:**
  1. *Mapbox GL JS:* High fidelity, but requires billing credit card, API access token, and complex token security.
  2. *Google Maps JS API:* Expensive, requires Google Cloud Project and billing credentials.
  3. *Leaflet + OpenStreetMap:* Open source, zero API tokens, 100% free, lightweight, easy custom SVG overlay rendering.
- **Decision:** Use Leaflet + OSM tiles with SVG route overlays.
- **Consequences:** Zero API failure risk during hackathon evaluation, 0ms token authorization delay.

---

## ADR-003: Design System — Solid Colors, Zero Gradients, Zero Glow
- **Date:** 2026-10-15
- **Status:** Accepted
- **Options Considered:**
  1. *Trendy "AI-Style" Glow:* Gradients, glassmorphism blur, purple/neon cyan accents.
  2. *Standard Bootstrap / Clean Neutral:* Plain gray and basic blue.
  3. *Industrial Emergency Command System:* Solid dark surface (`#111827`), high-contrast text, single blue accent, semantic red/green/amber reserved strictly for emergency statuses, depth from 4 distinct shadow levels.
- **Decision:** Option 3. Industrial Emergency Command System.
- **Consequences:** Maximizes visual credibility with judges, meets strict WCAG AA contrast criteria, and eliminates visual clutter.

---

## ADR-004: Typography — Geist Sans & Neue Haas Grotesk Hybrid
- **Date:** 2026-10-15
- **Status:** Accepted
- **Options Considered:**
  1. *Commercial Only (Neue Haas Grotesk / Söhne):* Unmatched aesthetic, but requires external `.woff2` font files which risk licensing issues or font loading dropouts on judge devices.
  2. *Standard Browser Default (`Arial / sans-serif`):* Utilitarian, but lacks premium command-center polish.
  3. *Geist Sans + Neue Haas Grotesk Hybrid Stack:* Embed `geist/font/sans` via Next.js with local fallback to `Neue Haas Grotesk Text Pro`, `Neue Haas Unica Pro`, and `Helvetica Neue`.
- **Decision:** Option 3. Geist Sans + Neue Haas Grotesk Hybrid Stack with `font-variant-numeric: tabular-nums`.
- **Consequences:** Eliminates timer jitter during countdown animations, guarantees 0ms compile-time self-hosting (zero layout shifts / CLS=0 for 95+ Lighthouse), and delivers a world-class Swiss Grotesk command-center feel.

---

## ADR-005: Single Production Deploy Owner
- **Date:** 2026-10-15
- **Status:** Accepted
- **Decision:** Zeeshan Maqsood is designated the sole production deploy owner. All pull requests require peer review, and only Zeeshan merges to `main` and pushes to production.
- **Consequences:** Avoids concurrent deployment collisions and ensures environment variables on Vercel are consistently managed.
