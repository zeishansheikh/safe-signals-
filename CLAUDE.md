# SafeCity AI — Ambulance Green Corridor

> **Project Summary:** SafeCity AI is an intelligent emergency transit system for Abbottabad, Pakistan. CCTV-based AI detects approaching ambulances, calculates the optimal route to City Hospital, and dynamically switches traffic signals along the corridor to green in real time, cutting emergency transit delays.
>
> **Demo-Critical Feature:** When an ambulance appears in the CCTV feed, the system detects it, computes the route to the hospital, and turns the signals along that route green in real time on the dashboard.
>
> **Wow Factor / Differentiator:** Simulated live green corridor with moving ambulance marker, countdown timers on upcoming signals, automated Rescue 1122 dispatch alert, and real-time "ETA with vs. without corridor" time saved metric.
>
> **Current Phase:** Phase 0 — Scaffolding & Prototype Documentation Complete. Frontend implementation against mock contracts starting.

---

## Mandatory Reading Order for Agents
Before modifying or creating any code or documentation, read files in this exact sequence:
1. [brain/00-START-HERE.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/00-START-HERE.md) — Master index and execution roadmap
2. [brain/changes/current-state.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/changes/current-state.md) — Verified reality of what currently works
3. The last 3 session files in [brain/changes/sessions/](file:///c:/Users/ATECH/Desktop/Hachathon/brain/changes/sessions/)
4. Task-relevant document:
   - Frontend UI: [brain/DESIGN.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DESIGN.md) & [prototype/safecity-frontend.html](file:///c:/Users/ATECH/Desktop/Hachathon/prototype/safecity-frontend.html)
   - Product requirements & scope: [brain/PRD.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/PRD.md)
   - Architecture & contracts: [brain/ARCHITECTURE.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/ARCHITECTURE.md) & [brain/API_SPEC.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/API_SPEC.md)
   - Workflow & logging rules: [brain/WORKFLOW.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/WORKFLOW.md)

---

## Non-Negotiable Hard Rules
1. **Design System Adherence:** Solid colors only. **NO gradients, NO AI-glow purple/blue palettes, NO glassmorphism**. Use exact tokens defined in [brain/DESIGN.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DESIGN.md).
2. **Frontend Priority & Mock-First:** Frontend builds against mock JSON contracts defined in [brain/API_SPEC.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/API_SPEC.md). Never block frontend on real ML or backend services.
3. **Simulation Disclaimer:** The system SIMULATES signal control. Real municipal traffic signals are NEVER manipulated. Always display the "Simulation Only" banner in the UI and README.
4. **No Raw Video Storage:** CCTV video streams must never be stored on disks or databases. Only ephemeral frames and detection bounding box metadata are processed (see [brain/ETHICS_PRIVACY.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/ETHICS_PRIVACY.md)).
5. **No Committed Secrets:** Never commit `.env` or API keys. Use `.env.example` as reference.
6. **Token Budget:** Every file in `/brain/` must stay strictly under 300 lines. Use concise tables, bullets, and Mermaid diagrams.
7. **Task Granularity:** Keep individual tasks under 30 minutes. Always test and verify before closing.
8. **Logging Mandate:** After every feature, fix, or decision, log a session file in `brain/changes/sessions/`, append to `brain/changes/changelog.md`, and update `brain/changes/current-state.md`.
9. **Dependency Freeze at 3:00:** After minute 180 of the hackathon, zero new packages may be installed without explicit human confirmation.
10. **Validate Boundaries:** All inputs and contract payloads must be validated with Zod schemas.
11. **Strict No-Emoji Mandate:** **NEVER USE EMOJIS ANYWHERE** in the UI, code, markers, badges, headers, or logo. Use Lucide SVG vector icons exclusively (`stroke-width="2"`).

---

## Standard Commands
```bash
# Package Installation
npm install

# Local Development Server (Next.js)
npm run dev

# Production Build Validation
npm run build

# Unit & Contract Tests
npm test

# Linting & Formatting Check
npm run lint

# Database Seed (when backend connected)
npm run db:seed

# Vercel Production Deployment
npx vercel --prod
```

---

## Definition of Done (DoD) for Any Task
A task is marked complete only when:
- [ ] Code strictly follows [brain/DESIGN.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DESIGN.md) tokens (zero ad-hoc hex codes, zero gradients).
- [ ] Responsive behavior is verified at 360px, 768px, 1100px, and 1440px.
- [ ] Empty, loading, and error states are implemented.
- [ ] All inputs are strictly typed and runtime-validated with Zod.
- [ ] Session log is written to `brain/changes/sessions/YYYY-MM-DD-NN-*.md`.
- [ ] Entry added to `brain/changes/changelog.md` and `brain/changes/current-state.md` updated.
- [ ] Conventional commit created referencing the session file.
