# Consolidated Repository Audit Report: SafeCity AI & Related Emergency Vehicle Systems

**Audit Date:** 2026-10-15  
**Auditor:** Senior Software Architect, Code Auditor & Technical Analyst  
**Environment:** Linux (x86_64), Python 3.12.3  
**Audited Repositories:**
1. **Primary Workspace:** `SafeCity AI (Hackatho)` — [`/home/zeeshan/Desktop/Hackatho`](file:///home/zeeshan/Desktop/Hackatho)
2. **Upstream Predecessor:** `Ambulance-Identification-main` — [`/home/zeeshan/Downloads/Ambulance-Identification-main`](file:///home/zeeshan/Downloads/Ambulance-Identification-main)
3. **Sister Implementation:** `AmbuRouteAI-stable` — [`/home/zeeshan/Downloads/AmbuRouteAI-stable`](file:///home/zeeshan/Downloads/AmbuRouteAI-stable)

Individual detailed reports are available under [`reports/`](file:///home/zeeshan/Desktop/Hackatho/reports):
- [`reports/hackatho-safecity-audit.md`](file:///home/zeeshan/Desktop/Hackatho/reports/hackatho-safecity-audit.md)
- [`reports/amburouteai-audit.md`](file:///home/zeeshan/Desktop/Hackatho/reports/amburouteai-audit.md)
- [`reports/ambulance-identification-audit.md`](file:///home/zeeshan/Desktop/Hackatho/reports/ambulance-identification-audit.md)

---

## 1. Cross-Repository Comparative Overview

The audit discovered three interconnected repositories representing different evolutionary branches of the same emergency vehicle traffic priority concept:

```
┌───────────────────────────────────────────────────────────┐
│               Ambulance-Identification-main               │
│          (Downloads/Ambulance-Identification-main)        │
│  - Legacy CLI prototype using OpenCV & YOLOv8 nano        │
│  - No web dashboard, no routing, no event lifecycle       │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼ Copied & Documented
┌───────────────────────────────────────────────────────────┐
│                    Hackatho / SafeCity AI                 │
│                 (/home/zeeshan/Desktop/Hackatho)          │
│  - Retains the exact legacy CLI code from above           │
│  - Adds comprehensive SafeCity AI PRD & Architecture docs │
│  - Severe architectural gap: 0% of PRD is implemented     │
└───────────────────────────────────────────────────────────┘
                              ▲
                              │ Parallel Evolutionary Line
┌─────────────────────────────┴─────────────────────────────┐
│                    AmbuRouteAI-stable                     │
│               (Downloads/AmbuRouteAI-stable)              │
│  - Built with Flask + MJPEG video stream + HTML dashboard │
│  - Does NOT detect ambulances via CV (traffic count only) │
│  - Relies on external GPS push via POST /update_gps       │
│  - Single intersection only; has working Python venv & MP4│
└───────────────────────────────────────────────────────────┘
```

### 1.1 Comparative Matrix

| Feature / Dimension | Hackatho (SafeCity AI) | Ambulance-Identification | AmbuRouteAI-stable | Target PRD Specification |
| :--- | :--- | :--- | :--- | :--- |
| **User Interface** | None (Local `cv2.imshow` CLI window) | None (Local `cv2.imshow` CLI window) | **Flask Web Dashboard** (`templates/index.html`, dark theme) | **Streamlit / Web Dashboard** (Light theme, navy text, blue nav) |
| **Ambulance Detection** | Proxy classes (COCO buses/trucks) | Proxy classes (COCO buses/trucks) | **None** (YOLO counts general traffic density) | **Dedicated Ambulance Model** (Roboflow endpoint or custom weights) |
| **Emergency Trigger** | Single-frame detection of bus/truck | Single-frame detection of bus/truck | **GPS REST API** (`POST /update_gps`) | **Temporal Confirmation** (3–5 stable detection frames) |
| **Road Network & Routing** | **None** (Single 4-light set) | **None** (Single 4-light set) | **Single Link** (Straight line to Times Square signal) | **Graph Engine** (NetworkX + Dijkstra shortest path) |
| **Signal Priority States** | Broken: sets all lights to `RED` | Broken: sets all lights to `RED` | Sets signal to `GREEN` (binary toggle) | Multi-state: `PRIORITY_GREEN` on route, `RED` on conflicting |
| **Normal Cycle Resumption** | Broken: turns all 4 lights `GREEN` simultaneously | Broken: turns all 4 lights `GREEN` simultaneously | Restores `RED` default | Restores staggered cyclic intersection patterns |
| **Event Lifecycle & Store** | None (boolean `emergency_mode`) | None (boolean `emergency_mode`) | In-memory `active_ambulances` dictionary | State Machine: `Monitoring -> Candidate -> Confirmed -> Corridor -> Reset` |
| **Video Ingestion** | CLI path argument (OpenCV) | CLI path argument (OpenCV) | CLI path / Webcam / MJPEG HTTP streaming | Uploaded video / Webcam stream |
| **Bundled Media Assets** | None (script never run) | None (script never run) | **`traffic_video.mp4`** (1.1 MB valid video) | Required: representative traffic video |
| **Runtime Environment** | Missing dependencies (no venv) | Missing dependencies (no venv) | **Complete venv** (PyTorch, Torchvision, Ultralytics, OpenCV, Flask) | Python 3.11+ virtual environment |

---

## 2. Deep Technical Audit: Hackatho (SafeCity AI)

### 2.1 Repository Purpose
The primary workspace for developing **SafeCity AI --- Ambulance Green Corridor**, designed to serve as a 3-hour hackathon demonstration for judges and technical evaluators.

### 2.2 Directory Structure
```
/home/zeeshan/Desktop/Hackatho/
├── SafeCity_AI_PRD.md                              # Complete PRD (457 lines)
├── SafeCity_AI_Technical_Architecture_and_Flow.md  # Architectural specification (465 lines)
├── README.md                                       # Outdated project documentation
├── requirements.txt                                # Dependency definitions
├── download_sample_video.py                        # Pexels download script
├── yolov8n.pt                                      # 6.5 MB standard COCO YOLOv8 nano model
├── src/
│   ├── main.py                                     # Entry point
│   ├── detection/
│   │   └── detector.py                             # Object detector & OpenCV loop
│   ├── simulation/
│   │   └── traffic_controller.py                   # Traffic light state machine
│   └── utils/
│       └── visualization.py                        # Frame annotation helper
└── tests/
    └── test_traffic_controller.py                  # Unit test script
```

### 2.3 Architecture & Data Flow Gaps
The documented architecture in [`SafeCity_AI_Technical_Architecture_and_Flow.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_Technical_Architecture_and_Flow.md#L113-L130) specifies:
1. Video reading & frame sampling.
2. Ambulance inference adapter (Roboflow hosted endpoint `ambulance-detection-wdbvs/1` or local weights).
3. Detection parser & temporal confirmation debounce.
4. Emergency Event Manager.
5. NetworkX Dijkstra route engine.
6. Multi-intersection signal controller (`PRIORITY_GREEN`).
7. Streamlit web dashboard.

**Reality in Code:**
Only steps 1 and a flawed version of 6 exist. The code flow consists of a single loop in `AmbulanceDetector.process_video()` that reads frames, runs `yolov8n.pt`, checks for COCO bus/truck IDs, directly toggles `TrafficLightController`, and calls `cv2.imshow()`.

### 2.4 Confirmed Bugs & Code Path Defects

#### Bug 1: Detection Inversion — Emergency vehicles are buses and trucks
- **Location:** [`src/detection/detector.py:63-69`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py#L63-L69)
- **Code:**
  ```python
  if len(detections) > 0:
      large_vehicles = [d for d in detections if d['class'] in [5, 7]]  # bus or truck
      if large_vehicles:
          traffic_controller.prioritize_emergency()
      else:
          traffic_controller.normal_operation()
  ```
- **Evidence & Impact:** COCO class 5 is `bus` and class 7 is `truck`. The code assumes any large vehicle is an ambulance. In dense traffic, commercial trucks and public buses constantly trigger false-positive emergencies. Real ambulances (which typically share chassis with vans or light vehicles) are ignored.

#### Bug 2: Traffic Controller Halts Emergency Vehicle Instead of Giving Priority
- **Location:** [`src/simulation/traffic_controller.py:32-40`](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py#L32-L40)
- **Code:**
  ```python
  def prioritize_emergency(self):
      """Give priority to emergency vehicles."""
      if not self.emergency_mode:
          self.emergency_mode = True
          # Set all lights to red except the ones in ambulance's path
          for light in self.lights.values():
              light.set_state(LightState.RED)
  ```
- **Evidence & Impact:** Despite the comment claiming lights in the ambulance's path are excepted, the loop sets *all* lights in `self.lights` to `LightState.RED`. The ambulance itself faces a red signal.

#### Bug 3: Resuming Normal Operation Causes Immediate All-Green Collisions
- **Location:** [`src/simulation/traffic_controller.py:54-62`](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py#L54-L62)
- **Code:**
  ```python
  for light in self.lights.values():
      time_in_cycle = (current_time - light.last_change) % cycle_duration
      if time_in_cycle < 20:
          light.set_state(LightState.GREEN)
      elif time_in_cycle < 25:
          light.set_state(LightState.YELLOW)
      else:
          light.set_state(LightState.RED)
  ```
- **Evidence & Impact:** When emergency mode ends, all 4 lights have `last_change` set to `current_time`. Therefore, `time_in_cycle` evaluates to ~0 for all lights, turning all 4 approaches to `LightState.GREEN` simultaneously. Furthermore, calling `set_state(LightState.GREEN)` updates `self.last_change = time.time()`, resetting the timer to 0 on every call and permanently trapping the lights on GREEN.

#### Bug 4: Dead Code with Fatal Type Error in Visualization Helper
- **Location:** [`src/utils/visualization.py:33-35`](file:///home/zeeshan/Desktop/Hackatho/src/utils/visualization.py#L33-L35)
- **Code:**
  ```python
  for box in detections:
      x1, y1, x2, y2 = map(int, box)
  ```
- **Evidence & Impact:** `src/detection/detector.py` returns `detections` as a list of dictionaries (`{'bbox': array([...]), 'confidence': 0.85, 'class': 5}`). If `annotate_frame` is called with this list, `box` is a dictionary; `map(int, box)` attempts to parse `'bbox'` as an integer and crashes with `ValueError: invalid literal for int() with base 10: 'bbox'`.

#### Bug 5: UI & Headless Crash
- **Location:** [`src/detection/detector.py:95`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py#L95)
- **Code:** `cv2.imshow('Ambulance Detection System', frame)`
- **Evidence & Impact:** Calling `cv2.imshow` unconditionally inside a processing script causes immediate crashes when executed in cloud servers, Docker containers, or headless CI/CD systems without an X11 server.

---

## 3. Deep Technical Audit: AmbuRouteAI-stable

### 3.1 Repository Purpose
A full-stack prototype (version 1.0.0) combining Flask, OpenCV, YOLOv8, and Google Maps to simulate real-time traffic signal preemption.

### 3.2 Directory Structure
```
/home/zeeshan/Downloads/AmbuRouteAI-stable/
├── main.py                         # Unified Flask + OpenCV backend (289 lines)
├── requirements.txt                # Dependency list
├── package.json                    # Node wrapper scripts
├── traffic_video.mp4               # 1.1 MB bundled test clip
├── yolov8n.pt                      # 6.5 MB YOLOv8 nano model
├── templates/
│   └── index.html                  # Rich single-page dashboard (34.4 KB)
├── screenshots/
│   └── screenshot-1.png            # Visual reference screenshot
└── venv/                           # Fully functional Python 3.12 virtual environment
```

### 3.3 Functional & Architectural Analysis
1. **Live Web Dashboard:** Unlike `Hackatho`, `AmbuRouteAI-stable` features an interactive, highly polished web interface with live video streaming via an MJPEG multipart response (`/video_feed`).
2. **Missing Computer Vision Ambulance Detection:** `main.py` runs YOLOv8 exclusively in `measure_traffic_density()`, counting cars, motorcycles, buses, and trucks. It has **no code to detect ambulances from video frames**.
3. **External GPS Injection:** Emergency states can *only* be created by sending an HTTP POST request to `/update_gps` with latitude and longitude.
4. **Single-Node Geometry:** Only supports one traffic light location `(40.758896, -73.985130)` and one hospital `(40.748817, -73.985428)`. It does not support network graphs or intermediate intersections.
5. **UI Theme Discrepancy:** The dashboard uses a dark cyberpunk aesthetic (`#070b14`), contrasting with the light theme specified in the SafeCity AI PRD.

---

## 4. Deep Technical Audit: Ambulance-Identification-main

### 4.1 Repository Purpose & Lineage
An unmaintained snapshot in `Downloads/`. Recursive file hashing and diffing confirmed that `Ambulance-Identification-main` is the direct ancestor of `Hackatho`. The code is 100% identical to `Hackatho`'s `src/` and `tests/` directories prior to the addition of `SafeCity_AI_PRD.md` and `SafeCity_AI_Technical_Architecture_and_Flow.md`.

---

## 5. Security, Dependencies & Maintainability Review

### 5.1 Secrets & Environment Configuration
- In `AmbuRouteAI-stable`: `GOOGLE_MAPS_API_KEY` is loaded from `os.environ.get("GOOGLE_MAPS_API_KEY")`. No secrets are hardcoded.
- In `Hackatho`: The architecture document specifies `ROBOFLOW_API_KEY=replace_me` in a `.env.example`. No actual `.env` file exists yet, and no secrets have been committed to git.
- **Risk:** Developers must ensure that when Roboflow or Google Maps API keys are introduced, they are strictly loaded via `.env` and kept in `.gitignore`.

### 5.2 Dependency Management & Execution Environment
- In `Hackatho`, `requirements.txt` specifies `torch>=2.0.0`, `torchvision>=0.15.0`, `opencv-python>=4.8.0`, `ultralytics`, and `pytest>=7.4.0`.
- **Blocker:** None of these packages are installed in the host's system Python environment. Attempting to run `pytest` fails immediately with `ModuleNotFoundError: No module named 'pytest'`.
- **Available Solution:** `AmbuRouteAI-stable` contains a pre-built virtual environment (`venv/`) with PyTorch, Torchvision, Ultralytics, OpenCV, NetworkX, and Flask already installed and verified on Python 3.12.3.

### 5.3 Code Maintainability & Modularity
- In `Hackatho`, logic is scattered across 4 small files with inconsistent import conventions.
- In `AmbuRouteAI-stable`, all backend logic is crammed into a single monolithic 289-line script (`main.py`).
- **Target Clean Architecture:** Follow the domain-driven modular structure outlined in [`SafeCity_AI_Technical_Architecture_and_Flow.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_Technical_Architecture_and_Flow.md#L138-L171):
  ```
  safecity/
  ├── detector.py          # Vision model adapter (Roboflow / Local YOLO)
  ├── detection_logic.py   # Debounce and confidence filtering
  ├── route_engine.py      # NetworkX road graph and Dijkstra pathing
  ├── signal_simulator.py  # Multi-intersection state controller
  ├── event_manager.py     # Emergency event lifecycle manager
  └── ui_components.py     # Reusable dashboard widgets
  ```

---

## 6. Synthesis of Reusable Assets Across Repositories

| Asset | Source Repository | Reusability in SafeCity AI Target Project |
| :--- | :--- | :--- |
| **Comprehensive PRD & Architecture** | `Hackatho` | **100% Reusable**: Authoritative guide for all functional and design requirements. |
| **Pre-built Python Virtual Environment** | `AmbuRouteAI-stable` | **100% Reusable**: Saves extensive installation time for PyTorch, OpenCV, CUDA, and Ultralytics. |
| **Sample Video Asset (`traffic_video.mp4`)** | `AmbuRouteAI-stable` | **100% Reusable**: Verified 1.1 MB MP4 video ready for demo pipeline testing. |
| **MJPEG Video Streaming Generator** | `AmbuRouteAI-stable` | **High**: Proven pattern for streaming annotated frames directly to a web browser. |
| **Geodesic Distance Fallback Logic** | `AmbuRouteAI-stable` | **High**: Resilient distance calculation when external mapping APIs are offline or unconfigured. |
| **Base Traffic Light Classes** | `Hackatho` | **Medium**: `TrafficLight` and `LightState` can be extended with `PRIORITY_GREEN` and intersection approach tracking. |

---

## 7. Strategic Recommendations & Next Steps

### Critical Priority (Must Fix Before Any Demo):
1. **Model Rectification:** Stop using COCO buses and trucks as proxies for ambulances. Connect to the Roboflow ambulance detection model (`ambulance-detection-wdbvs/1`) or load custom ambulance weights.
2. **Signal Controller Rewrite:** Fix the signal logic so that emergency mode turns the ambulance route to `PRIORITY_GREEN` while holding conflicting approaches at `RED`. Fix normal resumption to cycle phases sequentially rather than turning all approaches green simultaneously.
3. **Implement Road Network Graph & Dijkstra Routing:** Build the NetworkX graph with intersections and hospital destinations as required by PRD FR-05.
4. **Implement Web Dashboard:** Build the web interface (either using Streamlit or adapting the Flask dashboard to a light theme matching the PRD).

### High Priority (System Stability & Usability):
5. **Debounce Filter:** Require 3–5 consecutive frames of positive ambulance detection before triggering a corridor activation.
6. **Headless Safety:** Replace `cv2.imshow()` with web-based video streaming or frame capture.
7. **Clean Package Layout:** Refactor into a clean `safecity` Python package with consistent absolute imports.

### Medium Priority (Enhancement & Polish):
8. **Event Log & History:** Build an in-memory event logger recording timestamped corridor activations, route assignments, and completions.
9. **Curate Emergency Video Clips:** Acquire a video clip specifically featuring an ambulance to showcase true CV detection.

---

*(See [`PROPOSED_IMPROVEMENT_PLAN.md`](file:///home/zeeshan/Desktop/Hackatho/PROPOSED_IMPROVEMENT_PLAN.md) for detailed task breakdowns, file impacts, verification criteria, and required approvals).*
