# SafeCity AI: Proposed Technical Improvement Plan

**Project:** SafeCity AI — Ambulance Green Corridor  
**Location:** `/home/zeeshan/Desktop/Hackatho`  
**Date:** 2026-10-15  
**Document Status:** Pending User Review & Approval  
**Audit Reference:** [`REPOSITORY_AUDIT_REPORT.md`](file:///home/zeeshan/Desktop/Hackatho/REPOSITORY_AUDIT_REPORT.md)

---

## 1. Executive Summary & Strategy

This improvement plan addresses the critical findings identified in the repository audit. The primary objective is to transform the existing legacy CLI prototype in [`/home/zeeshan/Desktop/Hackatho`](file:///home/zeeshan/Desktop/Hackatho) into the production-quality, hackathon-ready **SafeCity AI** system specified in [`SafeCity_AI_PRD.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_PRD.md) and [`SafeCity_AI_Technical_Architecture_and_Flow.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_Technical_Architecture_and_Flow.md).

The plan is structured into four sequential phases:
1. **Must Fix (Critical):** Core architectural bugs, valid ambulance detection, Dijkstra routing engine, and priority signal control.
2. **Should Improve (High):** Interactive web dashboard, temporal debounce filter, headless execution safety, and modular package structure.
3. **Optional Polish (Medium):** Event history store, simulated speed/ETA metrics, UI aesthetics matching visual guidelines, and reset controls.
4. **Future Enhancements (Low / Post-Hackathon):** Live GPS/AVL ambulance feeds, multi-camera tracking, audio siren analysis, and physical IoT controller integrations.

> [!IMPORTANT]
> **Decisions Requiring User Approval:** Several foundational architectural decisions require your explicit input before implementation commences. These are highlighted in [Section 2: Decisions Requiring User Approval](#2-decisions-requiring-user-approval).

---

## 2. Decisions Requiring User Approval

Before any code is created or modified, please confirm your preferences on the following key decisions:

### Decision A: Dashboard Framework Selection
- **Option 1 (Recommended by PRD): Streamlit Dashboard**
  - *Pros:* Native Python architecture, rapid UI iteration, clean integration with NetworkX and OpenCV, easily follows the light-theme requirements specified in PRD Section 10.
  - *Cons:* Less granular control over low-level canvas animations compared to raw HTML/CSS.
- **Option 2: Flask + HTML/CSS Dashboard (Adapting AmbuRouteAI-stable)**
  - *Pros:* Leverages the existing MJPEG streaming server from `AmbuRouteAI-stable`, allows custom DOM manipulation and CSS styling.
  - *Cons:* Requires re-skinning the entire dark cyberpunk UI into the light theme requested by the PRD, and manually managing REST polling/WebSocket sync.
- **User Action:** Choose **Option 1 (Streamlit)** or **Option 2 (Flask + Web UI)**.

### Decision B: Ambulance Detection Model Source
- **Option 1 (Recommended): Hosted Roboflow Inference API (`ambulance-detection-wdbvs/1`)**
  - *Pros:* Specifically trained on real ambulances and emergency vehicles; returns true ambulance bounding boxes and confidence scores; eliminates false positives from buses/trucks.
  - *Cons:* Requires a free Roboflow API key in `.env`; requires internet access during demo.
- **Option 2: Local Fine-Tuned YOLOv8 Ambulance Weights**
  - *Pros:* 100% offline, zero API latency, no external account or key required.
  - *Cons:* Requires locating or downloading pre-trained `.pt` weights specifically containing an ambulance class.
- **Option 3: Hybrid with Simulated Demo Mode**
  - *Pros:* Attempts Roboflow/local model first; if API key is missing or network times out, seamlessly falls back to a simulated demo mode that allows testing the full routing and signal flow without crashing.
  - *Cons:* Must clearly label simulated detections in the UI as required by PRD Section 4.
- **User Action:** Approve **Option 1** (with Roboflow API key), **Option 2**, or **Option 3 (Hybrid Fallback)**.

### Decision C: Python Virtual Environment Strategy
- **Option 1 (Fastest): Reuse Pre-configured Virtual Environment from `AmbuRouteAI-stable`**
  - *Pros:* Copies or links the existing Python 3.12 `venv/` from `/home/zeeshan/Downloads/AmbuRouteAI-stable/venv` directly to `/home/zeeshan/Desktop/Hackatho/.venv`. Contains PyTorch, Torchvision, Ultralytics, OpenCV, NetworkX, and Flask already compiled and ready. Saves 15–30 minutes of downloading gigabytes of binary wheels.
  - *Cons:* Uses packages installed previously in that venv.
- **Option 2: Clean Fresh Install in Workspace**
  - *Pros:* Completely fresh virtual environment created in `/home/zeeshan/Desktop/Hackatho/.venv`.
  - *Cons:* Requires network bandwidth and time to download large PyTorch/CUDA wheels.
- **User Action:** Confirm whether to reuse the existing `AmbuRouteAI-stable` venv (Option 1) or create a fresh one (Option 2).

---

## 3. Detailed Improvement Plan

### 3.1 Must Fix (Critical Priority)

#### FIX-01: Replace COCO Bus/Truck Proxy with Dedicated Ambulance Detection
- **Reason:** In [`src/detection/detector.py:65`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py#L65), standard COCO classes 5 (bus) and 7 (truck) are used as emergency proxies. This causes normal commercial vehicles to trigger emergency signals and fails to detect actual ambulances.
- **Affected Files:** `src/detection/detector.py`, `src/detection/inference_adapter.py` (new), `config/settings.py` (new).
- **Dependencies:** `inference-sdk` (for Roboflow) or custom `ambulance.pt` weights.
- **Expected Outcome:** The system detects only vehicles classified as `ambulance`, returning bounding boxes and genuine confidence metrics.
- **Risks:** Missing or invalid API key could block detection if a fallback is not implemented.
- **Verification:** Feed an image containing an ambulance and an image containing a city bus; verify that only the ambulance produces an emergency detection.

#### FIX-02: Fix Traffic Light Controller Emergency Signal Logic
- **Reason:** In [`src/simulation/traffic_controller.py:38-39`](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py#L38-L39), `prioritize_emergency()` sets *all* lights to `RED`, blocking the ambulance's path instead of granting green priority.
- **Affected Files:** `src/simulation/traffic_controller.py`, `src/simulation/signal_simulator.py` (new).
- **Dependencies:** Road graph route nodes from the routing engine.
- **Expected Outcome:** Signals at intersections along the calculated emergency route transition to `PRIORITY_GREEN`. Conflicting intersecting approaches transition to `RED` / `HOLD`.
- **Risks:** Without route knowledge, a single intersection cannot determine which approach is priority. Must accept route nodes.
- **Verification:** Unit tests asserting that route nodes evaluate to `PRIORITY_GREEN` and cross-street nodes evaluate to `RED`.

#### FIX-03: Fix Normal Signal Cycle Resumption
- **Reason:** In [`src/simulation/traffic_controller.py:54-62`](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py#L54-L62), clearing emergency mode sets all 4 lights to `GREEN` simultaneously, creating immediate simulated vehicle collisions. Furthermore, setting the state resets `last_change`, freezing the timer.
- **Affected Files:** `src/simulation/traffic_controller.py`.
- **Dependencies:** None.
- **Expected Outcome:** Resuming normal operation restores realistic, non-conflicting cyclic phases (e.g., North-South Green while East-West Red, then Yellow, then East-West Green).
- **Risks:** None.
- **Verification:** Step through normal cycle updates over 30 simulated seconds; verify that conflicting directions never share `GREEN` concurrently.

#### FIX-04: Implement NetworkX Road Graph & Dijkstra Routing Engine
- **Reason:** The repository currently has 0% of the road network graph and routing logic required by PRD Section 8 (FR-05).
- **Affected Files:** `src/routing/route_engine.py` (new), `tests/test_route_engine.py` (new).
- **Dependencies:** `networkx>=3.0`.
- **Expected Outcome:** A configurable road graph with nodes (CCTV location, Intersections 1–4, City Hospital, Trauma Center) and weighted edges (simulated travel times). Calling `get_shortest_route(start, destination)` returns the optimal node path and total demo ETA.
- **Risks:** Disconnected graph could raise an unhandled exception if no path exists.
- **Verification:** Test path calculation with known weights; test disconnected nodes to ensure graceful error handling.

---

### 3.2 Should Improve (High Priority)

#### IMP-01: Build the SafeCity AI Web Dashboard
- **Reason:** PRD FR-09 and Technical Architecture Section 11 mandate an interactive dashboard matching the reference layout (Light theme, navy typography, CCTV card, status cards, route panel, signals status, route progress, event log). Currently, no web interface exists in `Hackatho`.
- **Affected Files:** `app.py` (new) or `templates/index.html` (reskinned), `src/ui/components.py` (new).
- **Dependencies:** Streamlit or Flask (based on Decision A).
- **Expected Outcome:** A single-screen command center where judges can observe the video feed, see real-time detections, watch route nodes illuminate, monitor signal states, and view the event log.
- **Risks:** Slow frame rendering if OpenCV processing blocks the UI thread.
- **Verification:** Launch the web app; confirm responsive layout, card rendering, and real-time state updates.

#### IMP-02: Implement Temporal Debounce & Confirmation Filter
- **Reason:** In [`src/detection/detector.py`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py), emergency mode is triggered and cleared on individual frames. If a vehicle flickers between frames, signals strobe rapidly between emergency and normal.
- **Affected Files:** `src/detection/detection_logic.py` (new).
- **Dependencies:** None.
- **Expected Outcome:** Require $N$ (e.g., 3–5) consecutive positive frames above confidence threshold before activating the corridor. Require $M$ consecutive absent frames before returning to monitoring. Emits a single `AMBULANCE_DETECTED` event rather than spamming events every frame.
- **Risks:** Slightly increased latency (~100–200ms) before corridor activation.
- **Verification:** Feed alternating true/false detection mocks; assert that emergency mode only triggers after the threshold is reached and does not toggle on single dropouts.

#### IMP-03: Headless Execution Safety & Video Streaming Decoupling
- **Reason:** [`src/detection/detector.py:95`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py#L95) relies on `cv2.imshow()`, which crashes on headless servers or non-X11 terminals.
- **Affected Files:** `src/detection/detector.py`, `src/video/video_source.py` (new).
- **Dependencies:** OpenCV image encoding (`cv2.imencode`).
- **Expected Outcome:** Frame rendering encodes images directly to memory/JPEG for browser display or returns NumPy arrays for Streamlit rendering. `cv2.imshow` is disabled or guarded with headless checks.
- **Risks:** Memory leaks if frame buffers are not garbage-collected.
- **Verification:** Run the application with `DISPLAY=""`; verify that no OpenCV display errors occur.

#### IMP-04: Resolve Dead Code & Type Mismatch in Visualization
- **Reason:** [`src/utils/visualization.py`](file:///home/zeeshan/Desktop/Hackatho/src/utils/visualization.py) is dead code and will crash with `ValueError` if executed due to iterating over dictionary keys as coordinates.
- **Affected Files:** `src/utils/visualization.py`.
- **Dependencies:** None.
- **Expected Outcome:** Refactor `visualization.py` into a robust annotation utility that accepts structured detection dataclasses or dictionaries (`{'bbox': [x1, y1, x2, y2], ...}`), or eliminate it in favor of web canvas overlays.
- **Risks:** None.
- **Verification:** Unit test passing sample frame and detection dicts; assert clean rendering without exceptions.

#### IMP-05: Adopt Domain-Driven Package Structure
- **Reason:** Inconsistent import paths (`from detection.detector` in `main.py` vs `from src.simulation...` in tests) break package portability.
- **Affected Files:** All files in `src/`.
- **Dependencies:** `__init__.py` files across subpackages.
- **Expected Outcome:** Restructure into a standard Python package (`safecity/`) with consistent absolute imports, allowing both `python -m safecity.main` and standard test runners to operate seamlessly.
- **Risks:** Import path refactoring requires updating test imports.
- **Verification:** Run static analysis and import tests from workspace root.

---

### 3.3 Optional Polish (Medium Priority)

#### POL-01: Implement Structured Emergency Event Lifecycle & History Store
- **Reason:** PRD FR-08 requires an in-memory event log recording timestamped events (`AMBULANCE_DETECTED`, `ROUTE_ASSIGNED`, `CORRIDOR_ACTIVE`, `INTERSECTION_PRIORITY`, `COMPLETED`, `RESET`).
- **Affected Files:** `src/events/event_manager.py`, `src/events/event_models.py`.
- **Dependencies:** Dataclasses, `datetime`.
- **Expected Outcome:** An observable event log displayed in the dashboard showing newest events first, with clear source attribution.
- **Verification:** Verify that each state transition adds exactly one timestamped record to the log.

#### POL-02: Operator Controls (Arrival Simulation & Reset Corridor)
- **Reason:** Operators need manual controls to simulate "Ambulance Arrived at Hospital" or "Reset Corridor" without restarting the application.
- **Affected Files:** Web dashboard UI and event manager.
- **Dependencies:** None.
- **Expected Outcome:** A "Mark Arrived" button and a "Reset Corridor" button that restore normal signal cycling, deactivate emergency mode, and log the completion event.
- **Verification:** Click "Reset Corridor" in the UI; verify signals return to normal and event history is preserved.

#### POL-03: Honest Telemetry & Visual Distinction
- **Reason:** PRD Section 8 (FR-09) and Section 9 strictly mandate that simulated values (speed, graph distance, demo ETA) must never be presented as real measured data.
- **Affected Files:** Dashboard status cards.
- **Dependencies:** None.
- **Expected Outcome:** All simulated metrics are clearly tagged with subtle badges (`SIMULATED`, `ESTIMATED ETA`). True model detections display actual model confidence percentages (`e.g., 87% Confidence`).
- **Verification:** Visual inspection of dashboard metric cards.

---

### 3.4 Future Enhancements (Post-Hackathon / Out of Scope for MVP)

These features are explicitly identified as non-MVP in PRD Section 17 and should be deferred until after the hackathon:
1. **Live GPS/AVL Fleet Integration:** Ingesting live CAD/AVL telemetry from emergency service fleets.
2. **Multi-Camera Intersection Handoff:** Re-identifying the ambulance across a physical citywide CCTV network.
3. **Audio Siren Recognition:** Multi-modal confirmation using acoustic sensor arrays.
4. **Physical Traffic Controller Hardware Integration:** NTCIP or 2070 controller protocols for real roadside signals.
5. **Real-time Live Traffic Optimization:** Dynamic edge weighting using live city traffic congestion APIs.

---

## 4. Implementation Phasing & Estimated Time Budget

Following the 3-hour delivery plan in PRD Section 14:

| Phase | Milestone | Estimated Time | Key Deliverables |
| :---: | :--- | :---: | :--- |
| **Phase 1** | **Environment & Model Setup** | 0:00 – 0:25 | Link/provision virtualenv, install `inference-sdk` & `networkx`, verify ambulance inference on sample frame. |
| **Phase 2** | **Core Routing & Signal Logic** | 0:25 – 0:55 | Build `route_engine.py` (NetworkX graph), fix `traffic_controller.py` (`PRIORITY_GREEN` & sequential cycling), write unit tests. |
| **Phase 3** | **Vision Adapter & Debounce** | 0:55 – 1:25 | Build `detector.py` adapter (Roboflow + local fallback), implement `detection_logic.py` (temporal debounce), test against video. |
| **Phase 4** | **Dashboard & Integration** | 1:25 – 2:20 | Assemble UI dashboard (light theme, video player, status cards, route graph, signal cards, event log). |
| **Phase 5** | **Rehearsal, Polish & Docs** | 2:20 – 3:00 | End-to-end demo dry-run, reset controls verification, honest labeling checks, final README update. |

---

## 5. Summary of Next Actions

To proceed with implementation, please review this plan and provide your approval on:
1. **Dashboard choice:** Streamlit (recommended) vs. Flask/Web UI.
2. **Model choice:** Roboflow inference API (with your API key) vs. local weights vs. hybrid fallback.
3. **Virtualenv choice:** Reuse `AmbuRouteAI-stable/venv` (fastest) vs. clean installation.

Once approved, implementation can proceed immediately according to the phased schedule above.
