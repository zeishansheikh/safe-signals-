# 4-Hour Timeboxed Build Plan — SafeCity AI

> **Golden Rule:** Deploy early, deploy often. The deployed application on Vercel must remain 100% working and green at all times. If any phase runs >20% overtime, apply the explicit Cut List immediately.

---

## 1. Timeboxed Execution Schedule

### Phase 0: Setup, Contracts & Empty Deploy (0:00 – 0:20)
- [x] **0:00–0:10** Initialize repo, branch protection rules, `.env.example`, and brain scaffolding. *(Owner: Malik Faseeh Awan — DONE)*
- [ ] **0:10–0:15** Deploy clean empty Next.js app to Vercel to lock down production URL. *(Owner: Zeeshan Maqsood)*
  - *Done when:* Empty landing page returns HTTP 200 on `*.vercel.app`.
- [ ] **0:15–0:20** Lock JSON contracts for `/api/detect`, `/api/signals`, and `/api/events`. *(Owners: Zeeshan & Abdul Wahid)*
  - *Done when:* [API_SPEC.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/API_SPEC.md) validated and agreed.

### Phase 1: Prototype Port & Mock Shell (0:20 – 1:00)
- [ ] **0:20–0:50** Port prototype layout, sidebar drawer, and design tokens to Next.js + Tailwind. *(Owner: Abdul Wahid)*
  - *Done when:* Dashboard renders cleanly with mock data at 360px and 1440px.
- [ ] **0:20–0:50** Create Supabase schema migrations and mock API route handlers. *(Owner: Zeeshan Maqsood)*
  - *Done when:* `curl /api/signals` returns 4 mock green intersections.
- [ ] **0:50–1:00** Draft 3-minute demo script and source CCTV test video clip. *(Owner: Malik Faseeh Awan)*
  - *Done when:* Demo script finalized in [DEMO_PITCH.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DEMO_PITCH.md).

### Phase 2: Demo-Critical Feature & Wow Factor (1:00 – 2:30)
- [ ] **1:00–1:45** Implement CCTV Monitor with bounding box overlays and offline simulation toggle. *(Owner: Abdul Wahid)*
  - *Done when:* Ambulance bounding box (0.94 confidence) renders over CCTV canvas.
- [ ] **1:45–2:15** Implement interactive corridor map with moving ambulance marker. *(Owner: Abdul Wahid)*
  - *Done when:* Ambulance marker translates smoothly across 4 intersections to City Hospital.
- [ ] **2:15–2:30** Wire real-time signal preemption trigger and Rescue 1122 dispatch action. *(Owners: Abdul Wahid & Zeeshan)*
  - *Done when:* Clicking "Alert Rescue 1122" appends dispatch event and sets all 4 lights green.

### Phase 3: Secondary Features & Hard Freeze (2:30 – 3:00)
- [ ] **2:30–2:50** Build Signal Control countdown cards and Event Log with Clear action. *(Owner: Abdul Wahid)*
  - *Done when:* Timers count down second-by-second with accurate status badges.
- [ ] **2:50–3:00** Code cleanup, accessibility verification, and dark/light mode polish. *(All)*
- [ ] **3:00 DEPENDENCY FREEZE:** Zero new npm packages or external services allowed.

### Phase 4: Production Hardening & Seed Verification (3:00 – 3:30)
- [ ] **3:00–3:15** Hard Deadline: Seed data loaded and verified on demo account. *(Owner: Zeeshan Maqsood)*
- [ ] **3:15–3:30** Production-readiness MUST checks: 404 page, loading skeletons, responsive test. *(Owner: Abdul Wahid)*
- [ ] **3:30** Pre-record 60–90 second fallback video demo. *(Owner: Malik Faseeh Awan)*
  - *Done when:* MP4 fallback video saved in `/demo/safecity-fallback-demo.mp4`.

### Phase 5: Final Deploy & Rehearsal (3:40 – 4:00)
- [ ] **3:40–3:50** Final production merge to `main` and Vercel smoke test. *(Owner: Zeeshan Maqsood)*
- [ ] **3:50–4:00** Full live 3-minute presentation rehearsal (2 min demo + 1 min Q&A) with all three team members. *(Lead: Malik Faseeh Awan)*

---

## 2. Explicit Cut List (Drop in exact order if >20% behind)

1. **Cut #1:** Real YOLO ML detection on Hugging Face Spaces (revert 100% to scripted mock).
2. **Cut #2:** Analytics & Speed Graph tab (retain stat cards only).
3. **Cut #3:** Event history search/filtering (retain simple append-only log).
4. **Cut #4:** Signal Control manual timing overrides (retain automated preemption view).
5. **Cut #5:** Light theme toggle (lock application to high-contrast dark mode).

---

## 3. Phase Status Reporting Format
At the conclusion of each phase, the responsible agent outputs:
```markdown
### Phase [N] Report
- **Status:** [ON TRACK | BEHIND | CUT LIST APPLIED]
- **Time Elapsed:** [MM mins]
- **Completed Checkboxes:** [List]
- **Cut List Items Dropped:** [None or Item #]
- **Next Action:** [Immediate 15-minute priority]
```
