# Production Readiness Checklist — SafeCity AI

> **Classification Scheme:**
> - **MUST:** Mandatory for hackathon demo submission (Non-negotiable).
> - **SHOULD:** High value if time permits in Phase 3.
> - **SKIP-FOR-HACKATHON:** Documented for future production, but excluded from 4h scope.

---

## 1. Authentication & Accounts

| Item | Priority | Status | Rationale |
|---|---|---|---|
| Single Click Demo Access | **MUST** | Ready | Judges must inspect dashboard without registration walls |
| Demo Admin Credentials | **MUST** | Ready | Pre-seeded operator profile (`admin@safecity.local`) |
| Real Email Verification | SKIP-FOR-HACKATHON | Skipped | Adds friction and requires verified DNS domain |
| Password Reset / Forgot Flow | SKIP-FOR-HACKATHON | Skipped | Unnecessary for short evaluation window |
| Account Deletion (GDPR) | SKIP-FOR-HACKATHON | Skipped | No personal citizen accounts stored |

---

## 2. User Experience & Component States

| Item | Priority | Status | Rationale |
|---|---|---|---|
| CCTV Feed Offline Error State | **MUST** | Ready | Demonstrates resilience when camera drops |
| Empty Event Log State | **MUST** | Ready | Clean illustration when log is cleared |
| Real-Time Countdown Timers | **MUST** | Ready | Core visual evidence of green corridor preemption |
| Form / Action Feedback (Toasts) | **MUST** | Ready | Confirms Rescue 1122 dispatch action |
| Custom 404 Page | **SHOULD** | Planned | Polished fallback for broken URLs |
| Confirmation Modal for Overrides | **SHOULD** | Planned | Prevents accidental signal disruption |

---

## 3. UI, Responsiveness & Navigation

| Item | Priority | Status | Rationale |
|---|---|---|---|
| Mobile Responsive Layout (<640px) | **MUST** | Ready | Judges often review submissions on smartphones |
| Collapsible Sidebar Drawer (<1100px) | **MUST** | Ready | Preserves screen space for camera and map |
| Persistent Simulation Notice | **MUST** | Ready | Ethical clarity that no real hardware is controlled |
| Dark Mode (Default) | **MUST** | Ready | Optimal for operations center and high contrast |
| Light Mode Toggle | **SHOULD** | Ready | Implemented in prototype reference |
| Skip-to-Content Link | **MUST** | Ready | WCAG accessibility standard |
| Site Search / Complex Filters | SKIP-FOR-HACKATHON | Skipped | Cut List Item #3 |

---

## 4. Backend, Data & Security

| Item | Priority | Status | Rationale |
|---|---|---|---|
| Mock-First Fallback Switch | **MUST** | Ready | System runs 100% functional without live DB/ML |
| Zod Boundary Validation | **MUST** | Ready | Blocks malformed API payloads |
| API Keys Stored in Env Vars | **MUST** | Ready | No secrets committed to source |
| Row-Level Security on Postgres | **SHOULD** | Ready | Schema prepared in DATA_MODEL.md |
| Automated Database Backups | SKIP-FOR-HACKATHON | Skipped | Managed automatically by Supabase free tier |

---

## 5. Observability & Infrastructure

| Item | Priority | Status | Rationale |
|---|---|---|---|
| Health Check Endpoint (`/api/health`) | **MUST** | Ready | Uptime monitoring verification |
| Fallback Pre-recorded Demo Video | **MUST** | Scheduled 3:30 | Guaranteed insurance against live demo failure |
| Sentry Error Tracking | SKIP-FOR-HACKATHON | Skipped | Avoids runtime overhead during 4h build |
| Analytics Tracking (PostHog/GA) | SKIP-FOR-HACKATHON | Skipped | Not needed for judging evaluation |

---

## 6. Legal, Ethics & Compliance

| Item | Priority | Status | Rationale |
|---|---|---|---|
| "Simulation Only" Disclaimer | **MUST** | Ready | Prominently displayed in UI header & README |
| No Raw Video Storage Policy | **MUST** | Ready | Verified zero disk storage of video |
| Open Source MIT License | **MUST** | Ready | License file included in repository root |
| Terms of Service / Cookie Banner | SKIP-FOR-HACKATHON | Skipped | No tracking cookies used on dashboard |
