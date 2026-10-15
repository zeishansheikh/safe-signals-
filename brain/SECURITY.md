# Security, Access Control & Privacy — SafeCity AI

---

## 1. Threat Model & Hackathon Posture

| Threat Vector | Severity | Mitigation & Architecture Rule |
|---|---|---|
| **Secret Leaks in Git** | Critical | Strict `.gitignore`, pre-commit hooks, `.env.example` templates, automated secrets scans. |
| **Unauthorized Signal Overrides** | High | In production, priority signal overrides require JWT Bearer authentication. For judge demo, UI features demo controls with simulated action guards. |
| **Denial of Service (DoS)** | Medium | Vercel Edge rate limiting (100 req/min per IP) and deterministic in-memory caching. |
| **CCTV Privacy Invasion** | Critical | **Zero raw video storage.** Frames processed in volatile memory only. Facial and license plate blurring applied at detection boundary. |
| **Tampering with Public Displays** | Medium | Row-Level Security (RLS) restricts database mutations exclusively to authenticated service roles. |

---

## 2. Row-Level Security (RLS) Policies (Supabase Postgres)

```sql
-- Enable RLS on core tables
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE intersections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public Read Policy: Allow anonymous users (Judges) to inspect status
CREATE POLICY "Public read corridor status" 
ON intersections FOR SELECT 
USING (true);

CREATE POLICY "Public read event logs" 
ON events FOR SELECT 
USING (true);

-- Authenticated Mutate Policy: Restrict priority changes to authenticated staff
CREATE POLICY "Operators manage preemption" 
ON intersections FOR UPDATE 
TO authenticated 
USING (true);
```

---

## 3. Input Validation at Boundaries (Zod)
All API endpoints enforce strict schema validation to block injection or malformed data:
```ts
import { z } from 'zod';

export const SignalPreemptionInput = z.object({
  corridorId: z.string().min(3).max(50),
  durationSeconds: z.number().int().min(30).max(300),
});
```

---

## 4. HTTP Security Headers (Next.js Config)
Configured in `next.config.js`:
```js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];
```

---

## 5. Simulation Disclaimer Banner
To prevent any misunderstanding regarding physical municipal infrastructure, the application mounts a persistent disclaimer banner across the top header:
> *"Demonstration Mode: Signal preemption logic is simulated. Real municipal signals are never controlled."*
