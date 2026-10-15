# Product Requirements Document (PRD) — SafeCity AI

> **Demo-Critical Feature:** When an ambulance appears in the CCTV feed, the system detects it, computes the route to the hospital, and turns the signals along that route green in real time on the dashboard.

---

## 1. Problem Statement
Emergency vehicle transit in congested urban centers (such as Abbottabad, Pakistan) suffers severe delays at high-traffic intersections along Main Boulevard and Jinnah Road. Patients experiencing cardiac arrests, severe trauma, or acute obstetric distress lose critical "Golden Hour" minutes trapped in gridlock. Traffic wardens lack automated foresight of inbound ambulances, and emergency drivers have no automated green corridor guarantee.

---

## 2. Target Users
1. **Rescue 1122 Dispatchers & Drivers:** Require real-time situational awareness, predicted travel time, and confirmation of pre-empted green corridors.
2. **City Traffic Police Command Center Operators:** Monitor signal operations, track automated corridor preemption, and retain manual override capabilities.

---

## 3. Goals & Non-Goals

### Goals
- Automatically detect emergency ambulances from CCTV feed with high confidence (>= 85%).
- Compute optimal emergency transit route to Abbottabad City Hospital (1.8 km distance).
- Dynamically trigger synchronized green wave signal preemption across 4 consecutive intersections.
- Quantify transit impact through real-time "ETA with corridor vs without corridor" metrics.

### Non-Goals (Hackathon Boundary)
- **NO Real Signal Hardware Control:** This project is strictly a digital twin simulation dashboard. It interfaces with mock controllers and never controls municipal physical hardware.
- **NO Raw Video Archive:** We do NOT record, stream, or store persistent high-resolution citizen video.
- **NO Multi-City Deployment:** Limited specifically to the Abbottabad demonstration corridor.

---

## 4. User Stories & Acceptance Criteria

### US-1: Live CCTV Ambulance Detection (MUST)
- **Story:** As a traffic operator, I want incoming CCTV frames analyzed so emergency vehicles are flagged instantly.
- **Acceptance Criteria:**
  - Bounding boxes render around vehicles (Ambulance in Danger Red, general vehicles in Neutral/Accent).
  - Confidence score displayed prominently (e.g., `0.94 Ambulance`).
  - Toggle available to simulate camera offline error state.

### US-2: Corridor Preemption & Dynamic Map (MUST - Wow Factor)
- **Story:** As an emergency dispatcher, I want to watch the ambulance progress along the map while signals turn green ahead of it.
- **Acceptance Criteria:**
  - Map displays Abbottabad corridor connecting CCTV-01 to City Hospital across 4 intersections.
  - Active ambulance marker moves along the route polyline.
  - Intersections 1–4 transition to Green state with dynamic countdown seconds.
  - Dashboard reports time saved (+4.2 mins).

### US-3: Rescue 1122 Automated Alert (MUST)
- **Story:** As a rescue controller, I want automated dispatch notifications logged with timestamp and route metadata.
- **Acceptance Criteria:**
  - "Alert Rescue 1122" button triggers dispatch event.
  - Event log instantly appends new entry with status badge.

### US-4: Signal Manual Control (SHOULD)
- **Story:** As a police operator, I want to inspect individual signal timers and manually extend or reset priority.
- **Acceptance Criteria:**
  - Grid card shows Intersections 1 to 4 with individual countdowns.
  - Visual status matches route map indicators.

### US-5: Historical Event Log (SHOULD)
- **Story:** As an auditor, I want a log of corridor activations.
- **Acceptance Criteria:**
  - Reverse-chronological event feed.
  - "Clear Log" action restores clean empty state.

---

## 5. Scope Matrix (MoSCoW)

| Tier | Features | Owner | Status |
|---|---|---|---|
| **MUST** | CCTV Monitor + Detection Bounding Boxes | Abdul Wahid | Ready to Port |
| **MUST** | Corridor Map + Moving Marker + Signal Icons | Abdul Wahid | Ready to Port |
| **MUST** | Stat Cards (Confidence, ETA, Corridor Speed) | Abdul Wahid | Ready to Port |
| **MUST** | Mock Contract Endpoint (`/api/detect`, `/api/signals`) | Zeeshan | Mock-first agreed |
| **SHOULD** | Signal Override Panel + Intersections 1–4 Countdowns | Abdul Wahid | Prototype Ready |
| **SHOULD** | Event Log Feed with Empty State | Abdul Wahid | Prototype Ready |
| **COULD** | Real YOLO ML detection on Hugging Face Spaces | Zeeshan / Faseeh | Post-2:30 freeze |
| **COULD** | Historical Analytics & Speed Charts | Abdul Wahid | Cut List Item 2 |
| **COULD** | Multi-camera source switcher | Abdul Wahid | Cut List Item 3 |

---

## 6. Hackathon Scoring & Evaluation Alignment (DeepBuild 2026 — 100 Pts)
- **Idea / Problem (25 pts):** Solves urban ambulance gridlock in Abbottabad; directly addresses the critical "Golden Hour".
- **Scalability / Innovation (25 pts):** CCTV-based software preemption requires no per-vehicle hardware modifications; ready to scale to provincial traffic grids.
- **AI Integration (25 pts):** Computer vision vehicle detection (`/api/detect`) directly drives automated green corridor routing.
- **UI / User Experience (15 pts):** Industrial operations design tokens, WCAG AA compliance, and mobile responsive layout (360px–1440px).
- **Clear Presentation (10 pts):** Structured 2-minute live demo + 1-minute Q&A with offline fault-tolerance demonstration.

---

## 7. Post-Hackathon Roadmap
- Integration with provincial Rescue 1122 CAD (Computer Aided Dispatch) APIs.
- Edge-AI processing directly on CCTV RTSP camera nodes using NVIDIA Jetson.
- NTCIP 1202 protocol bridge for controlled municipal traffic light pilots.
