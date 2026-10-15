# Testing Strategy & Quality Assurance — SafeCity AI

---

## 1. Quality Strategy
In a 4-hour hackathon, comprehensive end-to-end suites create unnecessary friction. We implement a **high-yield dual strategy**:
1. A rigorous 6-step manual critical-path checklist run before every deployment.
2. Lightweight Vitest contract unit tests verifying the core `detect -> route -> priority` logic pipeline.

---

## 2. Critical-Path Manual Checklist (Run Before Every Deploy)

Every pull request must be validated against these 6 manual steps by the reviewer:

- [ ] **Step 1: Application Load & Shell**
  - Navigate to production URL or `http://localhost:3000`.
  - Verify live header clock is ticking and "Green Corridor Active" badge pulses green.
  - Check simulation banner is clearly visible across the top.
- [ ] **Step 2: CCTV Feed & Bounding Boxes**
  - Verify Camera CCTV-01 displays the feed with bounding boxes.
  - Confirm Ambulance bounding box is danger-red with `>= 0.90` confidence label.
  - Click "Simulate Camera Offline" — verify graceful fallback error banner appears.
- [ ] **Step 3: Route Computation & Metrics**
  - Verify Stat Cards show: Confidence `94.2%`, Estimated Arrival `3m 45s`, Speed `58 km/h`.
  - Confirm "Time Saved" displays `+4.2 mins`.
- [ ] **Step 4: Live Corridor Map Tracking**
  - Verify map loads Abbottabad corridor with 4 intersection circles.
  - Confirm ambulance marker animates smoothly along the green route towards City Hospital.
- [ ] **Step 5: Dynamic Signal Preemption**
  - Verify all 4 intersections (Int-01 to Int-04) display green lights with synchronized countdowns.
  - Verify countdown numbers decrement continuously.
- [ ] **Step 6: Rescue 1122 Dispatch & Log**
  - Click "Alert Rescue 1122".
  - Verify simulated confirmation toast/alert triggers.
  - Verify new entry prepends to Event Log with timestamp and `DISPATCHED` badge.
  - Click "Clear Log" and verify the empty state illustration displays.

---

## 3. Minimal Automated Tests (`/tests/corridor.test.ts`)
Run via `npm test`:
- **Test 1:** `POST /api/detect` returns valid bounding boxes and ambulance confidence `>= 0.85`.
- **Test 2:** `GET /api/route` returns non-empty polyline and 4 sequential intersection stops.
- **Test 3:** `POST /api/signals/priority` switches all 4 signals to `green` and returns valid integer timers.

---

## 4. Lighthouse Performance & Accessibility Targets

| Metric | Target Score | Mitigation if Slipping |
|---|---|---|
| **Performance** | **>= 90** | System Helvetica font stack (0ms font delay); static SVG map option |
| **Accessibility** | **>= 95** | WCAG AA contrast on all badges; visible keyboard focus rings |
| **Largest Contentful Paint (LCP)** | **< 2.5s** | Zero heavy video loads; lightweight WebP camera poster frame |
| **Cumulative Layout Shift (CLS)** | **< 0.1** | Explicit `aspect-ratio: 16/9` on CCTV canvas; fixed grid heights |

---

## 5. Responsive Viewport Matrix

| Width | Device Class | Expected Layout Behavior |
|---|---|---|
| **360px** | Mobile Small | 1-column stack, sidebar collapsed to hamburger drawer, 2x2 signal grid |
| **768px** | Tablet Portrait | CCTV feed full width, map stacked below, bottom row cards 1-col |
| **1100px** | Breakpoint | Sidebar drawer reveals on toggle; main layout transitions to 2-column |
| **1440px** | Desktop Command | Full 2-column split (CCTV + Map side-by-side), expanded persistent sidebar |
