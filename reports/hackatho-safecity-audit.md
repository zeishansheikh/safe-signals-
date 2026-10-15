# Repository Audit: SafeCity AI (Hackatho)

**Target Repository Path:** `/home/zeeshan/Desktop/Hackatho`  
**Audit Date:** 2026-10-15  
**Auditor:** Senior Software Architect & Technical Analyst  
**Audit Scope:** Full codebase, specifications (PRD & Architecture), unit tests, dependency manifests, and runtime verification.

---

## 1. Executive Summary & Repository Purpose

The **SafeCity AI (Hackatho)** repository is intended to be a hackathon-grade proof-of-concept (PoC) demonstrating an **"Ambulance Green Corridor"** system. According to its Product Requirements Document ([`SafeCity_AI_PRD.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_PRD.md)) and Technical Architecture document ([`SafeCity_AI_Technical_Architecture_and_Flow.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_Technical_Architecture_and_Flow.md)), the project aims to detect an approaching emergency vehicle from CCTV/webcam video feeds, calculate an optimal route across a simulated multi-intersection road network using Dijkstra's algorithm, automatically set traffic signals along that corridor to `PRIORITY_GREEN`, and visualize the end-to-end operation in a rich web dashboard.

However, a deep inspection of the repository reveals a **critical divergence (architectural drift)** between the project documentation and the actual implementation code:
- The existing source code in [`src/`](file:///home/zeeshan/Desktop/Hackatho/src) is a legacy command-line script inherited from `Ambulance-Identification-main`.
- **0% of the planned web dashboard exists** (no Streamlit or web UI files).
- **0% of the routing logic exists** (no NetworkX or Dijkstra graph implementation).
- **0% of the emergency event lifecycle exists** (no debounce, event store, or state machine).
- The detection module relies on default COCO pre-trained YOLOv8 weights ([`yolov8n.pt`](file:///home/zeeshan/Desktop/Hackatho/yolov8n.pt)), which has **no ambulance class** and erroneously treats commercial buses and trucks as emergency vehicles.
- The traffic controller implementation contains severe logic bugs that freeze intersections or turn all conflicting approaches green simultaneously.

---

## 2. Technology Stack & Directory Structure

### 2.1 Technology Stack

| Layer | Documented Specification (PRD/Arch) | Actual Code Implementation | Status / Gap |
| :--- | :--- | :--- | :--- |
| **Language** | Python 3.11+ | Python 3.12 compatible code | Aligned |
| **User Interface** | Streamlit Dashboard (Light theme, navy typography, rounded cards) | Local OpenCV window (`cv2.imshow`) in CLI loop | **Completely Missing** |
| **Computer Vision** | Roboflow hosted inference (`ambulance-detection-wdbvs/1`) or local custom ambulance YOLO weights | Ultralytics YOLOv8 with standard COCO weights (`yolov8n.pt`) | **Invalid Model (detects buses/trucks, not ambulances)** |
| **Graph & Routing** | NetworkX with Dijkstra's shortest path algorithm | None | **Completely Missing** |
| **Signal Simulation**| Multi-intersection controller with `PRIORITY_GREEN`, `RED`, `AMBER`, `GREEN` | Single 4-light dictionary, all turning `RED` on emergency and all `GREEN` simultaneously on resume | **Broken / Primitive** |
| **Event Lifecycle** | State machine: `Monitoring -> CandidateDetected -> AmbulanceConfirmed -> RouteCalculated -> CorridorActive -> Completed` | Binary boolean toggle `emergency_mode = True/False` inside detector frame loop | **Missing Lifecycle** |
| **Video I/O** | Uploaded video file / webcam stream | OpenCV `VideoCapture` (CLI path argument) | Partial (CLI only) |
| **Testing** | Comprehensive unit & regression tests with Pytest | 1 test file ([`tests/test_traffic_controller.py`](file:///home/zeeshan/Desktop/Hackatho/tests/test_traffic_controller.py)) | Broken environment / Pytest not installed |

### 2.2 Directory Tree

```
/home/zeeshan/Desktop/Hackatho/
├── .gitignore                                      # Standard Python/IDE ignore rules + model/video ignores
├── README.md                                       # Legacy project documentation (mentions non-existent paths)
├── requirements.txt                                # Dependency list (torch, torchvision, opencv, ultralytics, etc.)
├── SafeCity_AI_PRD.md                              # Comprehensive Product Requirements Document (457 lines)
├── SafeCity_AI_Technical_Architecture_and_Flow.md  # Detailed Technical Architecture & Flow Specification (465 lines)
├── download_sample_video.py                        # Utility script to fetch Pexels stock video to data/ (never run)
├── yolov8n.pt                                      # 6.5 MB standard COCO pre-trained YOLOv8 nano model
├── src/
│   ├── main.py                                     # CLI entry point parsing --input, --model, --conf
│   ├── detection/
│   │   └── detector.py                             # AmbulanceDetector class wrapping YOLO and OpenCV loop
│   ├── simulation/
│   │   └── traffic_controller.py                   # TrafficLight, TrafficLightController, and LightState Enum
│   └── utils/
│       └── visualization.py                        # Abandoned drawing helpers (contains fatal bug)
└── tests/
    └── test_traffic_controller.py                  # 3 basic unit tests for traffic light controller
```

---

## 3. Architecture & Data Flow Analysis

### 3.1 Documented Target Architecture

```
[Video / Camera Feed]
         │
         ▼
[OpenCV Frame Reader] ──▶ [Frame Sampling & Resize]
                                     │
                                     ▼
                     [Ambulance Inference Adapter]
                     (Roboflow API or Custom Weights)
                                     │
                                     ▼
                     [Detection Parser & Conf Filter]
                                     │
                                     ▼
                     [Temporal Confirmation / Debounce]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼ (Stable)                              ▼ (No stable detection)
    [Emergency Event Manager]                   [Continue Monitoring]
                 │
                 ├──▶ [Route Engine: NetworkX + Dijkstra]
                 │               │
                 │               ▼
                 ├──▶ [Simulated Signal Controller] (PRIORITY_GREEN)
                 │               │
                 └──▶ [Event Logger & History]
                                 │
                                 ▼
                     [Streamlit / Web Dashboard]
```

### 3.2 Actual Implemented Code Path & Execution Flow

```
User runs: python src/main.py --input <video_path>
         │
         ▼
[src/main.py: parse_args()] ──▶ Instantiates AmbulanceDetector & TrafficLightController
         │
         ▼
[AmbulanceDetector.process_video(video_path, controller)]
         │
         ├── cap = cv2.VideoCapture(video_path)
         ├── Frame Loop: Reads frame-by-frame
         │     │
         │     ├── If frame_count % 2 == 0:
         │     │     │
         │     │     ├── process_frame(frame): Runs self.model(frame) [COCO yolov8n.pt]
         │     │     │     └── Checks if class in [2 (car), 5 (bus), 7 (truck)]
         │     │     │
         │     │     ├── If any vehicle is class 5 (bus) or 7 (truck):
         │     │     │     └── controller.prioritize_emergency()  <-- ALL lights turn RED
         │     │     └── Else:
         │     │           └── controller.normal_operation()      <-- ALL lights turn GREEN
         │     │
         │     ├── Annotates bounding boxes and mode on frame inline
         │     └── cv2.imshow('Ambulance Detection System', frame)
         │
         └── cap.release() / cv2.destroyAllWindows()
```

### 3.3 Critical Architectural Flaws in Current Code
1. **Tight Coupling & Violation of Separation of Concerns:**  
   [`src/detection/detector.py`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py#L37-L72) directly controls the `traffic_controller`. The detector class should only emit detection events. Instead, it owns the video processing loop, GUI rendering (`cv2.imshow`), and traffic light state transitions.
2. **Missing Routing & Road Network Subsystem:**  
   There is no representation of roads, nodes, intersections, or hospitals. The controller only manages a hardcoded set of 4 lights at a single unspecified intersection.
3. **No Event Management or Debouncing:**  
   Every frame that contains a bus or truck immediately triggers emergency mode, and every frame without one immediately turns it off. This creates high-frequency strobe oscillations if detections drop for even a single frame.

---

## 4. Module-by-Module Code Analysis

### 4.1 Entry Point: [`src/main.py`](file:///home/zeeshan/Desktop/Hackatho/src/main.py)
- **Lines 1–10:** Defines `parse_args()` with options `--input`, `--model` (default `'yolov8n.pt'`), and `--conf` (default `0.25`).
- **Lines 12–21:** Instantiates detector and controller, then executes `detector.process_video(args.input, controller)`.
- **Findings:**
  - **Import fragility:** Lines 2–3 use `from detection.detector import AmbulanceDetector` and `from simulation.traffic_controller import TrafficLightController`. This succeeds *only* if `src/` is in `sys.path`. When imported as a package or executed via `python -m src.main`, it raises `ModuleNotFoundError`.
  - **No fallback / validation:** If `--input` is not supplied, `args.input` is `None`. `cv2.VideoCapture(None)` fails silently, causing the program to exit immediately without user feedback.

### 4.2 Detection Engine: [`src/detection/detector.py`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py)
- **Lines 7–13:** Initializes YOLO with COCO class IDs `[2, 5, 7]`.
- **Lines 14–35 (`process_frame`):** Iterates over boxes returned by `self.model(frame)`. Filters detections by `cls_id in [2, 5, 7]` and `conf >= self.conf_threshold`.
- **Lines 37–103 (`process_video`):**
  - Line 56: Frame skipping (`frame_count % 2 == 0`).
  - Lines 63–71: Logic treating buses (class 5) and trucks (class 7) as emergency vehicles.
  - Lines 73–92: Inlined OpenCV drawing of bounding boxes and emergency banner.
  - Lines 95–99: `cv2.imshow` and `cv2.waitKey(1)`.
- **Findings:**
  - **False Positive Disaster:** City buses and delivery trucks trigger full emergency priority. Real ambulances (which resemble vans/sprinters or have specialized emergency livery) are either misclassified as cars (class 2) or ignored.
  - **Frame Stutter / UI Glitch:** Odd frames (`frame_count % 2 != 0`) bypass detection and annotation, but are still passed directly to `cv2.imshow` at Line 95. The viewer sees the image rapidly flicker between annotated and unannotated video.
  - **Headless Incompatibility:** Calling `cv2.imshow` crashes on headless servers, Docker containers, or environments without an active X11/Wayland display.

### 4.3 Simulation Controller: [`src/simulation/traffic_controller.py`](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py)
- **Lines 4–7:** `LightState` Enum with `RED`, `YELLOW`, `GREEN`.
- **Lines 9–18:** `TrafficLight` class holding `id`, `state`, and `last_change`.
- **Lines 19–30:** `TrafficLightController` initializing a dictionary of 4 `TrafficLight` objects.
- **Lines 32–40 (`prioritize_emergency`):** Sets all lights to `LightState.RED`.
- **Lines 41–47 (`normal_operation`):** Checks `if self.emergency_mode:`, sets it to `False`, and calls `_update_normal_pattern()`.
- **Lines 48–62 (`_update_normal_pattern`):** Calculates `time_in_cycle = (current_time - light.last_change) % cycle_duration`. Sets light to GREEN (< 20s), YELLOW (< 25s), or RED (>= 25s).
- **Findings:**
  - **Fatal Emergency Logic Error:** Line 37 comment claims: *"Set all lights to red except the ones in ambulance's path"*. But Line 38–39 unconditionally sets `light.set_state(LightState.RED)` for *every* light. The ambulance gets a red light, halting the green corridor before it starts!
  - **Simultaneous All-Green Hazard:** In `_update_normal_pattern()`, because all lights had their `last_change` timestamp updated at the exact same moment when emergency mode ended, `time_in_cycle` is identical (~0 seconds) for all 4 lights. Thus, **all 4 conflicting approaches turn GREEN at the same time**.
  - **Static State Progression Bug:** `_update_normal_pattern()` is *only* called once upon exiting emergency mode. If `normal_operation()` is called repeatedly (as `detector.py` does on line 71 whenever no emergency vehicle is present), lines 43–46 do nothing because `self.emergency_mode` is already `False`. The lights never cycle; they remain frozen on GREEN indefinitely.

### 4.4 Visualization Utilities: [`src/utils/visualization.py`](file:///home/zeeshan/Desktop/Hackatho/src/utils/visualization.py)
- **Lines 4–25 (`draw_traffic_lights`):** Draws 4 circle indicators at the four corners of the frame.
- **Lines 27–44 (`annotate_frame`):** Calls `draw_traffic_lights`, iterates over `detections` to draw bounding boxes, and prints "EMERGENCY MODE" banner.
- **Findings:**
  - **Dead / Unused Code:** This module is never imported by `main.py` or `detector.py`.
  - **Fatal Type Bug:** Line 33 does `for box in detections: x1, y1, x2, y2 = map(int, box)`. However, `detector.process_frame()` returns a list of dictionaries (`{'bbox': np.array(...), 'confidence': 0.8, 'class': 5}`). Passing this output into `annotate_frame` causes `box` to be a `dict`. `map(int, box)` attempts to parse `'bbox'` as an integer and immediately throws `ValueError: invalid literal for int() with base 10: 'bbox'`.

### 4.5 Sample Video Script: [`download_sample_video.py`](file:///home/zeeshan/Desktop/Hackatho/download_sample_video.py)
- Downloads a 1080p stock traffic video from Pexels into `data/traffic_sample.mp4`.
- **Findings:**
  - The script has never been executed; the `data/` directory does not exist in the repository.
  - The stock video linked is general city traffic, not an ambulance emergency response clip.

### 4.6 Unit Test Suite: [`tests/test_traffic_controller.py`](file:///home/zeeshan/Desktop/Hackatho/tests/test_traffic_controller.py)
- Tests controller initialization, emergency mode transition, and normal operation toggle.
- **Findings:**
  - Tests only pass because they assert the existing buggy behavior (`assert light.state == LightState.RED` during emergency).
  - Cannot be run with `pytest` out-of-the-box because `pytest` is not installed in the system environment.

---

## 5. Confirmed Issues & Technical Limitations

| Issue ID | Severity | Category | Description & Evidence |
| :--- | :--- | :--- | :--- |
| **ISSUE-01** | **Critical** | Model / AI | Standard COCO model (`yolov8n.pt`) lacks an `ambulance` class. Code in [`detector.py:65`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py#L65) uses COCO buses and trucks as emergency proxies, violating PRD FR-02. |
| **ISSUE-02** | **Critical** | Simulation | Emergency mode sets all lights to `RED` ([`traffic_controller.py:38-39`](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py#L38-L39)), including the ambulance's path. No green priority corridor is ever created. |
| **ISSUE-03** | **Critical** | Simulation | Resuming normal operation sets all 4 lights to `GREEN` simultaneously ([`traffic_controller.py:57-58`](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py#L57-L58)), creating simulated traffic collisions. |
| **ISSUE-04** | **Critical** | Feature Gap | **0% of the specified Streamlit/Web dashboard exists**. The code only renders a raw OpenCV window. |
| **ISSUE-05** | **Critical** | Feature Gap | **0% of the Dijkstra routing engine exists**. There is no road network graph, hospital node, or ETA calculation. |
| **ISSUE-06** | **High** | Code Quality | [`src/utils/visualization.py`](file:///home/zeeshan/Desktop/Hackatho/src/utils/visualization.py#L33) is dead code containing a fatal `ValueError` bug (`map(int, box)` on dictionary keys). |
| **ISSUE-07** | **High** | Architecture | Absence of temporal confirmation / debouncing. Single-frame detection drops cause rapid flickering of emergency mode. |
| **ISSUE-08** | **High** | Stability | GUI rendering (`cv2.imshow`) in [`detector.py:95`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py#L95) will crash in headless or remote server environments. |
| **ISSUE-09** | **Medium** | Architecture | Inconsistent module imports (`from detection.detector` in `main.py` vs `from src.simulation...` in tests). |
| **ISSUE-10** | **Medium** | Assets | No sample video or test media exists in the repository. `download_sample_video.py` was never run. |
| **ISSUE-11** | **Low** | Docs | [`README.md`](file:///home/zeeshan/Desktop/Hackatho/README.md) references non-existent directories (`data/`, `models/`) and commands (`simulate.py`, `train.py`). |

---

## 6. Verification & Test Execution Results

All verification steps were performed non-destructively:

### Test 1: Python Environment & Pytest Execution
- **Command:** `python3 -m pytest tests/`
- **Result:** **Failed** (`ModuleNotFoundError: No module named 'pytest'`). Pytest is listed in `requirements.txt` but not installed in the system Python environment.

### Test 2: Direct Traffic Controller Logic Verification
- **Command:**
  ```python
  python3 -c "import sys; sys.path.insert(0, '.'); from src.simulation.traffic_controller import TrafficLightController, LightState
  c = TrafficLightController()
  c.prioritize_emergency()
  print('Emergency States:', [l.state.value for l in c.lights.values()])
  c.normal_operation()
  print('Normal States:', [l.state.value for l in c.lights.values()])"
  ```
- **Outcome:**
  ```
  Emergency States: ['RED', 'RED', 'RED', 'RED']
  Normal States: ['GREEN', 'GREEN', 'GREEN', 'GREEN']
  ```
- **Conclusion:** Confirmed **ISSUE-02** and **ISSUE-03**. Emergency mode sets all lights to RED. Normal operation turns all 4 lights to GREEN simultaneously.

### Test 3: Dead Code & Type Bug in `visualization.py`
- **Analysis:** Lines 27–37 of `visualization.py` iterate over `detections`. When passed `detector.process_frame()` output:
  `box` is `{'bbox': array([...]), 'confidence': 0.85, 'class': 5}`.
  `map(int, box)` evaluates `int('bbox')` $\rightarrow$ raises `ValueError`. Confirmed **ISSUE-06**.

---

## 7. Reusable Code & Assets

Despite the issues identified, several components can be leveraged or repurposed:
1. **[`SafeCity_AI_PRD.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_PRD.md) & [`SafeCity_AI_Technical_Architecture_and_Flow.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_Technical_Architecture_and_Flow.md):** High-quality, comprehensive product and architecture specifications ready to guide implementation.
2. **[`yolov8n.pt`](file:///home/zeeshan/Desktop/Hackatho/yolov8n.pt):** Standard YOLOv8 nano model (6.5 MB), usable for baseline general vehicle counting or local testing fallback.
3. **[`TrafficLight` and `LightState` classes:](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py#L4-L18)** Good foundation for simulated intersection signals, easily extensible to support `PRIORITY_GREEN` and approach IDs.

---

## 8. Prioritized Recommendations

- **Critical:**
  1. Replace COCO bus/truck proxy detection with a dedicated ambulance model (Roboflow hosted endpoint `ambulance-detection-wdbvs/1` via `inference-sdk` or validated custom ambulance weights).
  2. Implement the complete **SafeCity AI Web Dashboard** (Streamlit or modern web app) as specified in PRD Section 10.
  3. Build the road network graph using NetworkX and implement Dijkstra route calculation to destination hospitals.
  4. Fix traffic light simulation: assign green priority *only* to route intersections and keep conflicting approaches red.
- **High:**
  5. Introduce an `EmergencyEventManager` state machine with temporal debounce (3–5 consecutive frames) to prevent strobe switching.
  6. Implement a web-safe video stream or canvas rendering to replace `cv2.imshow`.
  7. Delete or refactor [`src/utils/visualization.py`](file:///home/zeeshan/Desktop/Hackatho/src/utils/visualization.py) to fix the fatal type bug.
- **Medium:**
  8. Standardize package structure (`safecity/` package with proper `__init__.py` files and uniform absolute imports).
  9. Add actual sample test videos with emergency vehicles.
- **Low:**
  10. Update `README.md` to remove references to non-existent scripts (`simulate.py`, `train.py`).
