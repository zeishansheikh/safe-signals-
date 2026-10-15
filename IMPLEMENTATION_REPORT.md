# SafeCity AI: Implementation & Code Cleanup Report

**Project:** SafeCity AI — Intelligent Ambulance Green Corridor  
**Execution Date:** 2026-10-15  
**Engineer:** Senior Python Engineer, Computer-Vision Engineer & Traffic-Simulation Architect  
**Location:** `/home/zeeshan/Desktop/Hackatho`  
**Status:** Completed & Fully Verified (24/24 Automated Tests Passing)

---

## 1. Executive Summary

In accordance with the directives of the SafeCity AI task, the repository at [`/home/zeeshan/Desktop/Hackatho`](file:///home/zeeshan/Desktop/Hackatho) has been transformed from an incomplete, buggy CLI prototype into a production-grade, hackathon-ready **Intelligent Ambulance Green Corridor MVP**.

### Core Milestones Achieved:
1. **Architectural Realignment:** Replaced the legacy 4-file CLI script with a modular, domain-driven package (`safecity/`) matching the technical architecture in [`SafeCity_AI_Technical_Architecture_and_Flow.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_Technical_Architecture_and_Flow.md).
2. **Eliminated False-Positive Classifications:** Eradicated the critical flaw where standard COCO buses and trucks were treated as ambulances. Integrated the preferred model [`ambulance-4bova-a3goa/4`](https://universe.roboflow.com/lakshmishrees-workspace/ambulance-4bova-a3goa) via `inference-sdk`, successfully verified online inference, and implemented temporal multi-frame confirmation to prevent false triggers.
3. **Corrected Signal Simulation Logic:** Replaced the flawed controller (which previously set all lights to red during emergencies and turned all conflicting directions green on normal resumption) with a route-aware multi-intersection controller supporting `RED`, `AMBER`, `GREEN`, `ALL_RED_CLEARANCE`, and `PRIORITY_GREEN`. Conflicting movements can never display green simultaneously.
4. **Dijkstra Road Graph Engine:** Implemented a NetworkX-based topological road graph with configurable hospital destinations (`HOSPITAL_CITY` and `HOSPITAL_TRAUMA`), positive travel-time weights, simulated ETA calculations, and automatic mapping of intersection approach vectors.
5. **Robust Event Lifecycle State Machine:** Built a validated state machine (`MONITORING -> CANDIDATE_DETECTED -> AMBULANCE_CONFIRMED -> ROUTE_CALCULATED -> CORRIDOR_ACTIVE -> COMPLETED -> MONITORING`) with a chronological event audit store.
6. **Polished Light-Theme Streamlit Dashboard:** Created [`app.py`](file:///home/zeeshan/Desktop/Hackatho/app.py) adhering strictly to the PRD's light-theme design system, featuring live CCTV video overlays, status KPI cards, an interactive route progress step tracker, dynamic traffic signal cards, and comprehensive operator controls.
7. **Comprehensive Test Suite:** Authored 24 unit, regression, and integration tests covering all critical paths. All 24 tests pass in 1.31s.

---

## 2. File Action Log: Cleanup, Additions & Modifications

| File Path | Action | Rationale |
| :--- | :--- | :--- |
| [`safecity/__init__.py`](file:///home/zeeshan/Desktop/Hackatho/safecity/__init__.py) | **Created** | Package initialization for the new domain-driven architecture. |
| [`safecity/config.py`](file:///home/zeeshan/Desktop/Hackatho/safecity/config.py) | **Created** | Centralized configuration loading thresholds, model IDs, and environment variables. |
| [`safecity/detection/inference_adapter.py`](file:///home/zeeshan/Desktop/Hackatho/safecity/detection/inference_adapter.py) | **Created** | Roboflow Serverless inference adapter and local weights handler; strictly enforces ambulance class labels. |
| [`safecity/detection/detection_logic.py`](file:///home/zeeshan/Desktop/Hackatho/safecity/detection/detection_logic.py) | **Created** | Temporal debouncing filter requiring multi-frame confirmation and preventing duplicate events. |
| [`safecity/routing/route_engine.py`](file:///home/zeeshan/Desktop/Hackatho/safecity/routing/route_engine.py) | **Created** | NetworkX road network graph and Dijkstra shortest path routing engine. |
| [`safecity/simulation/signal_simulator.py`](file:///home/zeeshan/Desktop/Hackatho/safecity/simulation/signal_simulator.py) | **Created** | Route-aware signal controller enforcing amber/all-red clearances and sequential corridor release. |
| [`safecity/events/event_manager.py`](file:///home/zeeshan/Desktop/Hackatho/safecity/events/event_manager.py) | **Created** | State machine lifecycle and audit event store. |
| [`safecity/utils/visualization.py`](file:///home/zeeshan/Desktop/Hackatho/safecity/utils/visualization.py) | **Created** | High-visibility frame annotation utilities; resolves fatal type bug in legacy visualization script. |
| [`app.py`](file:///home/zeeshan/Desktop/Hackatho/app.py) | **Created** | Streamlit command center dashboard matching PRD specifications. |
| [`main.py`](file:///home/zeeshan/Desktop/Hackatho/main.py) | **Created** | CLI video pipeline runner supporting headless and mock modes. |
| [`data/traffic_sample.mp4`](file:///home/zeeshan/Desktop/Hackatho/data/traffic_sample.mp4) | **Created / Ingested** | Reusable 1.1 MB MP4 video asset ingested from `AmbuRouteAI-stable` to provide verified test media. |
| [`pytest.ini`](file:///home/zeeshan/Desktop/Hackatho/pytest.ini) | **Created** | Configured `pythonpath = .` to ensure seamless test execution. |
| [`.env.example`](file:///home/zeeshan/Desktop/Hackatho/.env.example) | **Created** | Clean template for environment variables and secrets. |
| [`requirements.txt`](file:///home/zeeshan/Desktop/Hackatho/requirements.txt) | **Modified** | Updated to include `networkx`, `streamlit`, `inference-sdk`, and `python-dotenv`. |
| [`.gitignore`](file:///home/zeeshan/Desktop/Hackatho/.gitignore) | **Modified** | Hardened to exclude `.env`, `.venv/`, `__pycache__/`, while preserving `traffic_sample.mp4` and `yolov8n.pt`. |
| [`README.md`](file:///home/zeeshan/Desktop/Hackatho/README.md) | **Modified** | Completely rewritten with accurate architecture, installation, Streamlit launch, and CLI commands. |
| [`src/detection/detector.py`](file:///home/zeeshan/Desktop/Hackatho/src/detection/detector.py) | **Modified** | Refactored into a backward-compatible facade delegating to `safecity.detection`. |
| [`src/simulation/traffic_controller.py`](file:///home/zeeshan/Desktop/Hackatho/src/simulation/traffic_controller.py) | **Modified** | Refactored into a backward-compatible facade delegating to `safecity.simulation`. |
| [`src/utils/visualization.py`](file:///home/zeeshan/Desktop/Hackatho/src/utils/visualization.py) | **Modified** | Refactored into a backward-compatible facade delegating to `safecity.utils`. |
| [`src/main.py`](file:///home/zeeshan/Desktop/Hackatho/src/main.py) | **Modified** | Updated to forward CLI execution to the root `main.py`. |
| [`tests/test_traffic_controller.py`](file:///home/zeeshan/Desktop/Hackatho/tests/test_traffic_controller.py) | **Modified** | Fixed legacy tests that incorrectly asserted that all lights should turn red during an emergency. |
| [`tests/test_detection.py`](file:///home/zeeshan/Desktop/Hackatho/tests/test_detection.py) | **Created** | 5 unit tests verifying ambulance-only filtering, confidence thresholds, and temporal debouncing. |
| [`tests/test_routing.py`](file:///home/zeeshan/Desktop/Hackatho/tests/test_routing.py) | **Created** | 5 unit tests for Dijkstra routing, ETA calculations, approach mapping, and disconnected error cases. |
| [`tests/test_signal_controller.py`](file:///home/zeeshan/Desktop/Hackatho/tests/test_signal_controller.py) | **Created** | 5 unit tests verifying conflict safety, clearance transitions, and sequential corridor release. |
| [`tests/test_event_lifecycle.py`](file:///home/zeeshan/Desktop/Hackatho/tests/test_event_lifecycle.py) | **Created** | 4 unit tests verifying state machine progression, invalid transitions, and audit event logging. |
| [`tests/test_dashboard.py`](file:///home/zeeshan/Desktop/Hackatho/tests/test_dashboard.py) | **Created** | 2 integration tests verifying end-to-end subsystem orchestration and frame annotation. |
| [`SafeCity_AI_PRD.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_PRD.md) | **Retained** | Unmodified core product specification. |
| [`SafeCity_AI_Technical_Architecture_and_Flow.md`](file:///home/zeeshan/Desktop/Hackatho/SafeCity_AI_Technical_Architecture_and_Flow.md) | **Retained** | Unmodified architecture document. |
| [`yolov8n.pt`](file:///home/zeeshan/Desktop/Hackatho/yolov8n.pt) | **Retained** | 6.5 MB local weights asset preserved for baseline testing. |
| [`download_sample_video.py`](file:///home/zeeshan/Desktop/Hackatho/download_sample_video.py) | **Retained** | Optional utility script retained for stock video retrieval. |

---

## 3. Computer Vision & Ambulance Detection Verification

### 3.1 Model Integration Details
- **Preferred Model:** `ambulance-4bova-a3goa/4` on Roboflow Universe.
- **Inference Client:** `inference-sdk>=1.7.0` configured with header-based authorization (`https://serverless.roboflow.com`).
- **Class Label Inspection:** Inspects prediction tags and strictly enforces membership in `{"ambulance", "ambulances", "emergency_vehicle", "ems"}`.
- **Documented Fallback:** `ambulance-detection-wdbvs/1`.

### 3.2 Live Verification Results
Inference was tested against a real video frame from `data/traffic_sample.mp4`:
```
Frame shape: (360, 640, 3)
Detector status: ONLINE_ROBOFLOW
Status message: Connected to Roboflow model: ambulance-4bova-a3goa/4
Inference status: NO_DETECTIONS
Detections count: 0 (Normal traffic correctly produced 0 false positives)
```

### 3.3 Temporal Debounce Filter Verification
- **Required Consecutive Hits:** 3 frames.
- **Dropout Tolerance:** 20 frames.
- **Behavior:**
  - Transient single-frame detections (hits = 1 or 2) transition the system to `CANDIDATE_DETECTED`, but do not activate priority.
  - On the 3rd consecutive frame, `AMBULANCE_CONFIRMED` is emitted, triggering corridor route planning.
  - While the corridor is active, single-frame drops (e.g. occlusion behind trees or overhead signs) do not terminate the corridor.

---

## 4. Signal Controller Logic & Clearance Verification

### 4.1 Corrected State Transitions
The simulator implements realistic phase transitions:
$$\text{Normal Cycle: } \text{NS GREEN (15s)} \rightarrow \text{NS AMBER (3s)} \rightarrow \text{ALL-RED (1s)} \rightarrow \text{EW GREEN (15s)} \rightarrow \dots$$

### 4.2 Emergency Priority Preemption
When the route traverses an intersection (e.g. `INT_1` via approach `NORTH_SOUTH`):
1. If the conflicting approach (`EAST_WEST`) was active, it transitions immediately through `ALL_RED_CLEARANCE`.
2. The conflicting approach is locked in `RED`.
3. The approaching movement (`NORTH_SOUTH`) receives `PRIORITY_GREEN`.
4. Non-route intersections (e.g. `INT_4`) continue their independent cyclic plans without interruption.

### 4.3 Sequential Corridor Progression
When the vehicle passes `INT_1`:
1. `advance_passed_intersection()` marks `INT_1` as `PASSED`.
2. Priority at `INT_1` is released; its signal transitions through Amber before resuming the normal cyclic plan.
3. Priority at unpassed route intersections (`INT_2`, `INT_3`) is **strictly preserved**.
4. Upon reaching the hospital destination, `complete_mission()` restores all remaining signals to normal.

---

## 5. Automated Test Results

The full test suite was executed using Pytest:

```bash
.venv/bin/python -m pytest tests/ -v
```

### Execution Log:
```
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.1.1, pluggy-1.6.0 -- .venv/bin/python
cachedir: .pytest_cache
rootdir: /home/zeeshan/Desktop/Hackatho
configfile: pytest.ini
collected 24 items                                                             

tests/test_dashboard.py::test_dashboard_core_state_integration PASSED    [  4%]
tests/test_dashboard.py::test_dashboard_annotation_rendering PASSED      [  8%]
tests/test_detection.py::test_ambulance_class_filtering_rejects_buses_and_trucks PASSED [ 12%]
tests/test_detection.py::test_ambulance_detection_accepts_valid_ambulance PASSED [ 16%]
tests/test_detection.py::test_confidence_threshold_filtering PASSED      [ 20%]
tests/test_detection.py::test_temporal_confirmation_and_debounce PASSED  [ 25%]
tests/test_detection.py::test_temporal_debounce_event_reset_after_dropout PASSED [ 29%]
tests/test_event_lifecycle.py::test_initial_state_is_monitoring PASSED   [ 33%]
tests/test_event_lifecycle.py::test_valid_lifecycle_progression PASSED   [ 37%]
tests/test_event_lifecycle.py::test_operator_manual_reset_transitions_to_cancelled_then_monitoring PASSED [ 41%]
tests/test_event_lifecycle.py::test_invalid_transition_rejected PASSED   [ 45%]
tests/test_routing.py::test_dijkstra_route_calculation_to_city_hospital PASSED [ 50%]
tests/test_routing.py::test_dijkstra_route_to_trauma_center PASSED       [ 54%]
tests/test_routing.py::test_intersection_approach_mapping PASSED         [ 58%]
tests/test_routing.py::test_disconnected_node_raises_routing_error PASSED [ 62%]
tests/test_routing.py::test_invalid_node_raises_routing_error PASSED     [ 66%]
tests/test_signal_controller.py::test_corridor_activation_sets_priority_green_only_on_route PASSED [ 70%]
tests/test_signal_controller.py::test_conflicting_movements_never_green_simultaneously PASSED [ 75%]
tests/test_signal_controller.py::test_passed_intersection_releases_priority_without_releasing_corridor PASSED [ 79%]
tests/test_signal_controller.py::test_mission_completion_restores_all_signals_sequentially PASSED [ 83%]
tests/test_signal_controller.py::test_manual_reset_restores_normal_states PASSED [ 87%]
tests/test_traffic_controller.py::test_traffic_light_initialization PASSED [ 91%]
tests/test_traffic_controller.py::test_emergency_priority_mode_sets_priority_green PASSED [ 95%]
tests/test_traffic_controller.py::test_normal_operation_resumes_safely PASSED [100%]

============================== 24 passed in 1.31s ==============================
```

---

## 6. Technical Limitations & Post-Hackathon Roadmap

### Current Scope & Boundaries:
- **Simulation Prototype:** The signal preemption and vehicle movements are simulated in software. The application does not issue physical NTCIP commands to municipal traffic controllers.
- **Fixed Topology:** The road network graph is defined programmatically in `RoadNetworkGraph` with simulated edge weights. It does not ingest live OpenStreetMap or Google Live Traffic congestion feeds.
- **External API Rate Limits:** Roboflow Serverless Free Tier permits up to 1,000 monthly calls. To protect usage during rehearsal, frame skipping (`FRAME_SKIP=2`) and the `--mock` switch are available.

### Post-Hackathon Roadmap:
1. **Physical Roadside Integration:** Implement NTCIP 1202 / SNMP protocols to communicate with 2070/ATC traffic controllers.
2. **Official Emergency Dispatch:** Interface with municipal CAD (Computer-Aided Dispatch) via secure APIs.
3. **Multi-Camera Tracking:** Integrate deep SORT or ByteTrack to track vehicles across overlapping camera views.
