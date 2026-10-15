# Demo Script, Pitch Deck & Submission Summary — SafeCity AI

---

## 1. 3-Minute Presentation Script (2 Min Demo + 1 Min Q&A)
*Event: DeepBuild Hackathon 2026, COMSATS University Islamabad (Attock Campus)*

| Time | Slide / Screen | Presenter Dialogue & Live Interaction (Lead: Malik Faseeh Awan) |
|---|---|---|
| **0:00–0:30** | Problem & Relevance (25 pts) | "In congested cities like Abbottabad, patients lose their lives in ambulances trapped at chokepoints along Main Boulevard. Drivers cannot clear red lights, and dispatchers have no automated corridor control. SafeCity AI solves this." |
| **0:30–1:00** | AI & Innovation (25+25 pts) | "We combine computer vision CCTV detection with dynamic transit preemption. When an ambulance approaches, our vision model detects it, computes the route to City Hospital, and clears downstream signals with a synchronized green wave." |
| **1:00–2:00** | Live Working Demo (15+10 pts) | **[Interactive Dashboard on Vercel]**<br>1. *CCTV-01 Detection:* Ambulance #AB-901 flagged with 94.2% confidence.<br>2. *Route Map:* Corridors 1–4 engage green simultaneously with countdowns.<br>3. *Time Saved Display:* ETA cut from 8.0m to 3.8m (+4.2 minutes saved).<br>4. *Rescue 1122 Alert:* Automated dispatch notification logged in real-time.<br>5. *Fault Tolerance:* Toggle camera offline to show immediate resilient fallback. |
| **2:00–3:00** | Judges' Q&A (10 pts) | Dedicated 1 minute for questions on scalability, municipal deployment, and edge architecture. |

---

## 2. DeepBuild 2026 Scoring Criteria Alignment (100 Points Total)

| Scoring Criterion | Max Pts | What Judges Look For | SafeCity AI Direct Demonstration |
|---|---|---|---|
| **Idea / Problem** | **25** | Real, clearly defined problem relevant to real users | Resolves emergency ambulance delays in Abbottabad; saves lives in the Golden Hour. |
| **Scalability / Innovation** | **25** | Original approach, scalable beyond prototype | Software-first CCTV preemption: zero expensive GPS hardware needed in private ambulances; scalable across municipal networks. |
| **AI Integration** | **25** | AI used meaningfully, adding real value to product | Computer vision vehicle detection (`/api/detect`) directly drives automated signal preemption and ETA calculation. |
| **UI / User Experience** | **15** | Visual design, ease of use, responsiveness, polish | Industrial Operations design system (zero gradients, solid tokens, WCAG AA contrast, responsive at 360px & 1440px). |
| **Clear Presentation** | **10** | Clear structure, live demo that works, confident Q&A | Crisp 2-min demo + 1-min Q&A, pre-recorded fallback video ready, sub-50ms responsive interactions. |
| **TOTAL** | **100** | Direct Scoring | Tie-breaker priority: Idea > Scalability > AI. |

---

## 4. Devpost / Hackathon Submission Summary
- **Elevator Pitch:** SafeCity AI turns urban CCTV networks into intelligent green corridors that clear traffic signals for inbound ambulances in real time.
- **Inspiration:** First responders in congested cities lose patients in preventable gridlock.
- **What it does:** Scans CCTV feeds, detects ambulances, calculates routes to Abbottabad City Hospital, and coordinates dynamic green signal waves.
- **Built With:** Next.js 14, TypeScript, Tailwind CSS, Leaflet, OpenStreetMap, Lucide Icons, Zod, Supabase.
- **Accomplishments:** Zero-gradient industrial operations design, full mobile responsiveness, sub-50ms simulation response, and strict privacy-first architecture.
