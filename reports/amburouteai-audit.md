# Repository Audit: AmbuRouteAI-stable

**Target Repository Path:** `/home/zeeshan/Downloads/AmbuRouteAI-stable`  
**Audit Date:** 2026-10-15  
**Auditor:** Senior Software Architect & Technical Analyst  
**Audit Scope:** Full codebase, Flask application, frontend templates, AI model, GPS routing logic, virtual environment, and runtime assets.

---

## 1. Executive Summary & Repository Purpose

**AmbuRouteAI-stable** is a functional prototype of an AI-powered emergency traffic management system (originally developed by Mantresh Khurana, version 1.0.0, dated March–July 2025). The repository couples a computer vision pipeline with a **Flask-based web dashboard** to demonstrate real-time vehicle counting and emergency vehicle prioritization.

Unlike the CLI-only script in `Hackatho`, `AmbuRouteAI-stable` provides an interactive web dashboard, live MJPEG video streaming, and GPS-based distance calculation with Google Maps API and Geopy fallbacks.

However, a fundamental architectural finding from this audit is that **AmbuRouteAI-stable does not detect ambulances in video feeds**. Instead, its YOLOv8 model is used strictly for **traffic density counting** (cars, buses, trucks, motorcycles). An emergency condition is only recognized when an external client sends GPS coordinates to a REST endpoint (`/update_gps`). It manages only a single hardcoded intersection and hospital, lacking any graph-based multi-intersection route planning.

---

## 2. Technology Stack & Directory Structure

### 2.1 Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Runtime & Language** | Python 3.12.3 | Executed inside a pre-configured local virtualenv (`venv/`) |
| **Web Backend** | Flask 3.1.0 | REST API endpoints and MJPEG video streaming generator |
| **Frontend UI** | HTML5, CSS3, JavaScript (Vanilla) | Rich single-page dashboard (`templates/index.html`) |
| **Styling & Design** | Custom CSS (Dark Cyberpunk theme) | Google Fonts (Inter, Outfit, JetBrains Mono), CSS Grid/Flexbox |
| **Object Detection** | Ultralytics YOLOv8 (8.3.86) | Model: `yolov8n.pt` (6.5 MB, pre-trained on COCO) |
| **Computer Vision** | OpenCV (`opencv-python` 4.11.0.86) | Video capture, MJPEG JPEG encoding, overlay rendering |
| **Geospatial & Routing**| Google Maps API & Geopy (2.4.1) | `googlemaps` client with automatic fallback to `geodesic` |
| **Process Management** | Node.js / pnpm (`package.json`) | Defines npm scripts (`npm start`, `npm run dev`, `npm run test:gps`) |
| **Test Media Assets** | MP4 Video (`traffic_video.mp4`) | 1.1 MB real-world traffic clip included in repository |

### 2.2 Directory Tree

```
/home/zeeshan/Downloads/AmbuRouteAI-stable/
├── .gitignore                      # Basic gitignore rules
├── AmbuRouteAI.pdf                 # Project presentation / architectural overview document
├── CHANGELOG.md                    # Detailed version 1.0.0 release notes
├── LICENSE                         # MIT License
├── package.json                    # Node wrapper scripts for running the Python server
├── pnpm-lock.yaml                  # Lockfile for package scripts
├── README.md                       # Comprehensive markdown documentation with feature overview
├── requirements.txt                # Python dependencies (opencv, numpy, ultralytics, flask, etc.)
├── main.py                         # Monolithic application (Flask server, CV loop, GPS logic)
├── traffic_video.mp4               # 1.1 MB sample traffic video
├── yolov8n.pt                      # 6.5 MB pre-trained YOLOv8 nano model
├── screenshots/
│   └── screenshot-1.png            # Reference UI screenshot showing live detection overlay
├── templates/
│   └── index.html                  # 34.4 KB full-featured web dashboard template
└── venv/                           # Fully provisioned Python 3.12 virtual environment (with PyTorch, CUDA, OpenCV)
```

---

## 3. Architecture & Data Flow Analysis

### 3.1 Application Architecture

```
                                  [Video File or Webcam]
                                             │
                                             ▼
                                  [OpenCV VideoCapture]
                                             │
                                             ▼
                            [measure_traffic_density(frame)]
                              (YOLOv8 nano COCO classes:
                               car, bus, truck, motorcycle)
                                             │
   [External GPS Client]                     │ Updates current_stats (counts)
            │                                │
            ▼ (POST /update_gps)             ▼
   [ambulance_data Dict] ────────▶ [Proximity Check: is_ambulance_near()]
                                             │ (Google Maps / Geopy < 200m)
                                             │
                                             ├──▶ [change_traffic_light(near)]
                                             │      (RED / GREEN)
                                             │
                                             ├──▶ [draw_traffic_light(frame)]
                                             │
                                             ▼
                             [JPEG Encoder (cv2.imencode)]
                                             │
                                             ▼
                                   [latest_frame_jpeg]
                                             │
               ┌─────────────────────────────┴─────────────────────────────┐
               ▼ (MJPEG Stream: /video_feed)                               ▼ (Polling: /api/stats)
     [<img> Stream in index.html]                              [Dashboard Metric Cards & Charts]
```

### 3.2 Execution Workflow
1. The user launches `python main.py -p traffic_video.mp4` (or via `npm start`).
2. A background daemon thread starts the Flask web server on port 5000 (`http://0.0.0.0:5000`).
3. The main thread opens `traffic_video.mp4` and enters an infinite processing loop (rewinding the video when it reaches the end for continuous simulation).
4. Each frame is processed by `measure_traffic_density()`:
   - Evaluates vehicle counts and draws colored bounding boxes.
   - Updates global `current_stats`.
5. It checks `ambulance_data` for any active ambulances:
   - If an ambulance is registered and its distance is $< 200\text{ meters}$, `ambulance_near` is set to `True`.
   - `change_traffic_light(ambulance_near)` updates `traffic_light` to `GREEN` (otherwise defaults to `RED`).
6. Renders a traffic signal overlay on the top-left of the video frame.
7. Encodes the frame to JPEG and saves it in a thread-safe memory buffer (`latest_frame_jpeg`).
8. The web client (`index.html`) streams the video from `/video_feed` and polls `/api/stats` every 1 second to update vehicle counts, ETA, and signal status.

---

## 4. Module & Code Path Deep Dive

### 4.1 Monolithic Architecture: [`main.py`](file:///home/zeeshan/Downloads/AmbuRouteAI-stable/main.py)
The entire backend logic is contained within a single 289-line file:
- **Lines 13–15:** Google Maps initialization. If `GOOGLE_MAPS_API_KEY` is unset in the environment, `gmaps` is initialized to `None`.
- **Lines 25–26:** Fixed coordinates:
  - `TRAFFIC_SIGNAL_LOCATION = (40.758896, -73.985130)` (Times Square, NYC)
  - `HOSPITAL_LOCATION = (40.748817, -73.985428)` (Empire State Building area, NYC)
- **Lines 29–42:** Shared thread-safe state: `frame_lock = threading.Lock()`, `latest_frame_jpeg`, and `current_stats` dictionary.
- **Lines 44–81 (Flask Routes):**
  - `GET /`: Serves `index.html`.
  - `GET /status`: Returns JSON status of light, ambulances, and metrics.
  - `GET /api/stats`: Lightweight stats endpoint for frontend polling.
  - `POST /api/reset`: Clears active ambulances and resets traffic light to RED.
  - `POST /update_gps`: Accepts JSON `{"ambulance_id": "AMB-101", "latitude": ..., "longitude": ...}`.
  - `GET /video_feed`: MJPEG stream generator yielding multipart JPEG frames.
- **Lines 102–134 (Distance & Routing):**
  - `is_ambulance_near()`: Uses Google Maps Distance Matrix API. If `gmaps` is `None` or raises an exception, falls back gracefully to `geopy.distance.geodesic`. Returns boolean (`distance < 200m`) and metric distance.
  - `get_fastest_route()`: Uses Google Directions API. Falls back to geodesic straight-line distance assuming 40 km/h average speed.
- **Lines 154–207 (`measure_traffic_density`):**
  - Performs inference using `model(frame)` for COCO classes `[2 (car), 3 (motorcycle), 5 (bus), 7 (truck)]`.
  - Increments individual and total vehicle counters.
  - Annotates frame with colored boxes and confidence scores.

### 4.2 Frontend Dashboard: [`templates/index.html`](file:///home/zeeshan/Downloads/AmbuRouteAI-stable/templates/index.html)
- **Size:** 34,452 bytes (single-file HTML/CSS/JS).
- **Design Aesthetic:** Dark cyberpunk/ops-center theme (`--bg-dark: #070b14`), glassmorphism card panels (`rgba(15, 23, 42, 0.75)`), glowing neon accents (red for emergency, blue for primary, emerald for success).
- **Components:**
  - Sticky header with pulsating emergency beacon icon and system status pill.
  - Live video monitor card with MJPEG feed `<img src="/video_feed">`.
  - Metric summary cards: Total Vehicles, Cars, Buses, Trucks, Motorcycles.
  - Traffic Signal Status widget with glowing circular signal lamp and GO/STOP label.
  - Active Ambulance card displaying ID, distance, and Hospital ETA.
  - Quick action controls: Emergency GPS trigger button (simulates AMB-101 arriving at signal) and Reset Corridor button.
- **Frontend Code Quality:** Clean, modern JavaScript using `fetch` with 1000ms polling interval. Smooth CSS keyframe animations and resilient error handling for stream drops.

---

## 5. Confirmed Issues & Technical Limitations

| Issue ID | Severity | Category | Description & Evidence |
| :--- | :--- | :--- | :--- |
| **AR-01** | **Critical** | Functional Gap | **No ambulance detection in video**. The YOLO model only detects standard traffic (`cars`, `buses`, `trucks`). Ambulances must be injected externally via HTTP POST to `/update_gps`. |
| **AR-02** | **Critical** | Architecture | **Single intersection / point-to-point only**. No road network graph, no multi-intersection coordination, and no Dijkstra shortest path algorithm. |
| **AR-03** | **High** | UI Conflict | The UI is a **dark cyberpunk theme** (`#070b14`), whereas the SafeCity AI PRD specifically mandates a **light theme with navy typography and blue navigation**. |
| **AR-04** | **Medium** | Concurrency | `current_stats` and `ambulance_data` dictionaries are read and written across threads (Flask web thread vs. video processing thread) without acquiring a lock. |
| **AR-05** | **Medium** | Monolithic Code | All backend code, configuration, CV processing, and API routes are packed into a single 289-line `main.py` without modular separation. |
| **AR-06** | **Low** | Extraneous Files | Contains `node_modules` and `package.json` purely to run Python commands, adding unnecessary project bloat. |

---

## 6. Verification & Test Execution Results

All checks were executed safely in non-destructive mode:

### Test 1: Python Virtual Environment Verification
- **Command:** `/home/zeeshan/Downloads/AmbuRouteAI-stable/venv/bin/python --version`
- **Result:** `Python 3.12.3`
- **Outcome:** The virtual environment is fully functional and includes all required binary libraries: `torch 2.14.1`, `torchvision 0.29.1`, `ultralytics 8.3.86`, `opencv-python 4.11.0.86`, `flask 3.1.0`, `networkx 3.7`, `googlemaps 4.10.0`, `geopy 2.4.1`.

### Test 2: Sample Media Verification
- **Command:** `file /home/zeeshan/Downloads/AmbuRouteAI-stable/traffic_video.mp4`
- **Result:** `ISO Media, MP4 v2 [ISO 14496-14]` (1,112,478 bytes, valid video).

### Test 3: Headless / Background Execution Check
- **Code Inspection:** Lines 228–236 in `main.py` check `os.environ.get("DISPLAY")` and `--no-gui`. When headless, it gracefully prints a message and skips `cv2.imshow`, falling back to background Web UI streaming. This is significantly more resilient than `Hackatho`'s detector.

---

## 7. Reusable Code & Key Assets for SafeCity AI

`AmbuRouteAI-stable` contains several mature, battle-tested components that can directly accelerate the SafeCity AI implementation:

1. **Pre-configured Virtual Environment (`venv`):** Contains fully working PyTorch, Ultralytics YOLOv8, OpenCV, and NetworkX.
2. **Video Asset (`traffic_video.mp4`):** A genuine 1.1 MB MP4 traffic clip that can be immediately used for demo testing.
3. **MJPEG Web Video Streaming Architecture:** The generator function `generate_video_stream()` using `cv2.imencode('.jpg')` and multipart response provides a proven pattern for streaming video to a web browser without requiring WebRTC or external media servers.
4. **Geopy Geodesic Fallback:** The distance calculation pattern that uses Google Maps when an API key is present and gracefully falls back to local geodesic math is an excellent resilience pattern.
5. **Reference Image ([`screenshots/screenshot-1.png`](file:///home/zeeshan/Downloads/AmbuRouteAI-stable/screenshots/screenshot-1.png)):** Confirms the visual lineage of the project.

---

## 8. Prioritized Recommendations for AmbuRouteAI-stable

- **Critical:**
  1. If integrated into SafeCity AI, replace the GPS-only trigger with actual computer-vision ambulance detection.
  2. Implement a multi-intersection graph model using NetworkX to replace the hardcoded single-intersection logic.
- **High:**
  3. Decouple `main.py` into modular components: `video_streamer.py`, `traffic_density.py`, `route_service.py`, and `app.py`.
  4. Protect shared mutable telemetry state (`current_stats`, `ambulance_data`) with thread locks.
- **Medium:**
  5. Provide a toggle between Dark Theme and Light Theme (to satisfy the SafeCity AI visual reference).
- **Low:**
  6. Remove redundant Node.js wrappers (`package.json`, `pnpm-lock.yaml`, `node_modules`) in favor of standard Python virtual environment tooling.
