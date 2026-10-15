# SafeCity AI — Intelligent Ambulance Green Corridor

**SafeCity AI** is a computer-vision and route-planning proof-of-concept demonstrating an automated **Ambulance Green Corridor**. It detects emergency vehicles from video feeds using pre-trained ambulance models, calculates the shortest path across a simulated road graph using **Dijkstra's algorithm**, and coordinates simulated traffic signals along that corridor to grant priority while maintaining strict clearance safety on conflicting approaches.

> [!NOTE]
> **Prototype Disclaimer:** This application is a software simulation developed for hackathon demonstration. It does not interface with physical municipal traffic controllers and does not dispatch real-world emergency services.

---

## Key Features

- **Ambulance-Specific Vision Model:** Integrates dedicated ambulance detection (`ambulance-4bova-a3goa/4`) via Roboflow Serverless Inference, strictly eliminating the proxy misclassification of standard city buses or trucks.
- **Temporal Debounce Filter:** Requires consecutive multi-frame confirmation to prevent transient false triggers, while debouncing to avoid duplicate events for a single visible ambulance.
- **NetworkX Dijkstra Route Engine:** Evaluates optimal paths across a simulated road graph to configurable hospital destinations, calculating simulated travel-time ETAs and mapping intersection approaches.
- **Route-Aware Signal Controller:** Intersections along the emergency route transition to `PRIORITY_GREEN` on the approaching movement while holding cross traffic safely at `RED`. Enforces controlled amber and all-red clearance intervals.
- **Sequential Corridor Release:** As the ambulance traverses each intersection, priority is released at passed signals and normal cyclic scheduling resumes without prematurely terminating the remaining corridor.
- **Light-Theme Streamlit Command Center:** Interactive web dashboard displaying live CCTV overlays, route progress, intersection state cards, and a chronological audit event log.

---

## Project Structure

```
Hackatho/
├── app.py                      # Streamlit web dashboard entry point
├── main.py                     # CLI pipeline runner
├── requirements.txt            # Dependency specifications
├── .env.example                # Environment variables template
├── pytest.ini                  # Pytest configuration
├── yolov8n.pt                  # Local model asset
├── data/
│   └── traffic_sample.mp4      # Verified 1.1 MB MP4 traffic clip
├── safecity/                   # Core Python package
│   ├── config.py               # Central configuration & settings
│   ├── detection/
│   │   ├── inference_adapter.py # Roboflow hosted inference & local model adapter
│   │   └── detection_logic.py   # Multi-frame debounce & confirmation filter
│   ├── routing/
│   │   └── route_engine.py      # NetworkX road graph & Dijkstra shortest path
│   ├── simulation/
│   │   └── signal_simulator.py  # Conflict-aware multi-intersection controller
│   ├── events/
│   │   └── event_manager.py     # State machine lifecycle & event audit store
│   └── utils/
│       └── visualization.py     # High-visibility frame annotations
├── tests/                      # Automated test suite (24 unit & regression tests)
│   ├── test_detection.py
│   ├── test_routing.py
│   ├── test_signal_controller.py
│   ├── test_event_lifecycle.py
│   ├── test_traffic_controller.py
│   └── test_dashboard.py
├── SafeCity_AI_PRD.md          # Product Requirements Document
├── SafeCity_AI_Technical_Architecture_and_Flow.md
└── IMPLEMENTATION_REPORT.md    # Full architectural cleanup & verification report
```

---

## Installation & Setup

### 1. Prerequisites
- Linux / macOS / Windows with Python 3.10+
- (Optional) Roboflow API Key for hosted inference

### 2. Environment Setup
```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Copy the template and configure your credentials:
```bash
cp .env.example .env
```
Edit `.env` to set:
```dotenv
ROBOFLOW_API_KEY=your_roboflow_key_here
ROBOFLOW_MODEL_ID=ambulance-4bova-a3goa/4
CONFIDENCE_THRESHOLD=0.50
FRAME_SKIP=2
CONFIRMATION_FRAMES=3
DEFAULT_DESTINATION=HOSPITAL_CITY
```

---

## Launch Instructions

### 1. Launch the Streamlit Web Dashboard (Recommended)
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501` to view the command center.

### 2. Run the Command-Line Pipeline
```bash
# Run with sample video
python main.py --input data/traffic_sample.mp4

# Run with mock ambulance injection for offline demo
python main.py --input data/traffic_sample.mp4 --mock

# Run in headless mode (no OpenCV GUI window)
python main.py --input data/traffic_sample.mp4 --no-gui
```

### 3. Run Automated Tests
```bash
pytest tests/ -v
```

---

## License

MIT License
