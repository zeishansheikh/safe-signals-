"""SafeCity AI - Intelligent Ambulance Green Corridor Streamlit Dashboard.

Complies with the approved light-theme UI specification, providing real-time
CCTV video analysis, Dijkstra road network routing, multi-intersection signal
simulation with conflicting movement clearance, and full audit event history.
"""

import os
import sys
import time
import tempfile
from pathlib import Path
import cv2
import numpy as np
import streamlit as st

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from safecity.config import config
from safecity.detection.inference_adapter import AmbulanceDetector, InferenceStatus, DetectionBox
from safecity.detection.detection_logic import TemporalDebounceFilter
from safecity.routing.route_engine import RoadNetworkGraph, RouteResult, RoutingError
from safecity.simulation.signal_simulator import CorridorSignalController, SignalState
from safecity.events.event_manager import EventManager, SystemLifecycleState
from safecity.utils.visualization import annotate_frame, draw_detections

# ==============================================================================
# STREAMLIT PAGE CONFIGURATION & CUSTOM LIGHT-THEME STYLING
# ==============================================================================
st.set_page_config(
    page_title="SafeCity AI — Ambulance Green Corridor",
    page_icon="🚑",
    layout="wide",
    initial_sidebar_state="expanded",
)

LIGHT_THEME_CSS = """
<style>
    /* Main Background & Typography */
    .stApp {
        background-color: #f8fafc;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Header & Navigation Elements */
    header[data-testid="stHeader"] {
        background-color: #ffffff;
        border-bottom: 1px solid #e2e8f0;
    }
    
    /* Card Containers */
    .metric-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        margin-bottom: 0.75rem;
    }
    .metric-card-title {
        font-size: 0.8rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
    }
    .metric-card-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
    }
    .metric-card-sub {
        font-size: 0.75rem;
        color: #94a3b8;
        margin-top: 0.25rem;
    }
    
    /* Status Badges */
    .badge-emergency {
        background-color: #fee2e2;
        color: #dc2626;
        border: 1px solid #fca5a5;
        border-radius: 9999px;
        padding: 0.25rem 0.75rem;
        font-weight: 700;
        font-size: 0.75rem;
        display: inline-block;
    }
    .badge-priority {
        background-color: #d1fae5;
        color: #059669;
        border: 1px solid #6ee7b7;
        border-radius: 9999px;
        padding: 0.25rem 0.75rem;
        font-weight: 700;
        font-size: 0.75rem;
        display: inline-block;
    }
    .badge-monitoring {
        background-color: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
        border-radius: 9999px;
        padding: 0.25rem 0.75rem;
        font-weight: 600;
        font-size: 0.75rem;
        display: inline-block;
    }
    .badge-amber {
        background-color: #fef3c7;
        color: #d97706;
        border: 1px solid #fcd34d;
        border-radius: 9999px;
        padding: 0.25rem 0.75rem;
        font-weight: 700;
        font-size: 0.75rem;
        display: inline-block;
    }
    
    /* Prototype Disclaimer Banner */
    .disclaimer-banner {
        background-color: #eff6ff;
        border-left: 4px solid #3b82f6;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.82rem;
        color: #1e40af;
        margin-bottom: 1rem;
    }
    
    /* Route Progress Steps */
    .route-step {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        margin-bottom: 0.4rem;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
    }
    .route-step-active {
        background-color: #ecfdf5;
        border-color: #a7f3d0;
    }
    .route-step-passed {
        background-color: #f1f5f9;
        opacity: 0.7;
    }
</style>
"""
st.markdown(LIGHT_THEME_CSS, unsafe_allow_html=True)


# ==============================================================================
# SESSION STATE INITIALIZATION
# ==============================================================================
if "event_manager" not in st.session_state:
    st.session_state.event_manager = EventManager()

if "route_engine" not in st.session_state:
    st.session_state.route_engine = RoadNetworkGraph()

if "signal_controller" not in st.session_state:
    st.session_state.signal_controller = CorridorSignalController()

if "debounce_filter" not in st.session_state:
    st.session_state.debounce_filter = TemporalDebounceFilter(
        required_consecutive_hits=config.confirmation_frames,
        dropout_tolerance=config.dropout_tolerance_frames,
    )

if "active_route" not in st.session_state:
    st.session_state.active_route = None

if "last_processed_frame" not in st.session_state:
    st.session_state.last_processed_frame = None

if "last_detections" not in st.session_state:
    st.session_state.last_detections = []

if "video_frame_index" not in st.session_state:
    st.session_state.video_frame_index = 0

if "is_video_playing" not in st.session_state:
    st.session_state.is_video_playing = False


# ==============================================================================
# SIDEBAR CONFIGURATION & OPERATOR CONTROLS
# ==============================================================================
with st.sidebar:
    st.markdown("### 🚑 SafeCity AI")
    st.markdown("**Emergency Green Corridor System**")
    st.markdown("---")

    # Section 1: Destination Selection
    st.markdown("#### 🏥 Destination Hospital")
    destinations = st.session_state.route_engine.get_available_destinations()
    selected_dest_id = st.selectbox(
        "Select Hospital Destination:",
        options=list(destinations.keys()),
        format_func=lambda x: f"{destinations[x]} ({x})",
        index=0,
    )
    st.caption("ℹ️ Destination is selected by dispatch simulation, not inferred from vision.")

    st.markdown("---")

    # Section 2: Video Source Selection
    st.markdown("#### 📹 Video Source")
    video_source_type = st.radio(
        "Input Feed:",
        options=["Bundled Sample Video", "Upload Video File", "Static Test Frame"],
        index=0,
    )

    video_file_path = None
    if video_source_type == "Bundled Sample Video":
        if config.sample_video_path.exists():
            video_file_path = str(config.sample_video_path)
            st.success(f"Loaded: `{config.sample_video_path.name}` (1.1 MB)")
        else:
            st.error("Bundled sample video not found in data/.")
    elif video_source_type == "Upload Video File":
        uploaded_file = st.file_uploader("Upload Traffic Video:", type=["mp4", "avi", "mov"])
        if uploaded_file is not None:
            tfile = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
            tfile.write(uploaded_file.read())
            video_file_path = tfile.name
            st.success(f"Uploaded: {uploaded_file.name}")
    else:
        st.info("Using synthetic traffic frame for static testing.")

    st.markdown("---")

    # Section 3: Operator Action Controls
    st.markdown("#### 🎮 Operator Controls")
    col_ctrl1, col_ctrl2 = st.columns(2)

    with col_ctrl1:
        if st.button("▶️ Step Frame", use_container_width=True):
            st.session_state.video_frame_index += config.frame_skip

        if st.button("🚑 Simulate Detection", use_container_width=True):
            # Deterministic manual trigger for demonstration purposes
            st.session_state.event_manager.on_ambulance_confirmed(
                peak_confidence=0.94,
                source="OPERATOR_ACTION",
            )
            try:
                route = st.session_state.route_engine.calculate_route(
                    start_node=config.default_start_node,
                    destination_node=selected_dest_id,
                )
                st.session_state.active_route = route
                st.session_state.event_manager.on_route_calculated(
                    destination=route.destination_name,
                    num_intersections=len(route.intersections),
                    eta_minutes=route.estimated_eta_minutes,
                )
                st.session_state.signal_controller.activate_corridor(route)
                st.session_state.event_manager.on_corridor_activated(route.destination_name)
                st.rerun()
            except RoutingError as e:
                st.error(f"Routing failed: {e}")

    with col_ctrl2:
        if st.button("⏭️ Pass Intersection", use_container_width=True):
            passed_id, logs = st.session_state.signal_controller.advance_passed_intersection()
            if passed_id:
                name = RoadNetworkGraph.INTERSECTION_NAMES.get(passed_id, passed_id)
                st.session_state.event_manager.on_intersection_passed(name, passed_id)
            st.rerun()

        if st.button("✅ Mark Arrived", use_container_width=True):
            st.session_state.signal_controller.complete_mission()
            st.session_state.event_manager.on_mission_completed()
            st.session_state.active_route = None
            st.rerun()

    if st.button("🔄 Reset Corridor", use_container_width=True):
        st.session_state.signal_controller.reset()
        st.session_state.debounce_filter.reset()
        st.session_state.event_manager.on_manual_reset()
        st.session_state.active_route = None
        st.session_state.video_frame_index = 0
        st.rerun()

    st.markdown("---")

    # Section 4: Model & API Settings
    st.markdown("#### ⚙️ Model Settings")
    roboflow_key = st.text_input(
        "Roboflow API Key:",
        value=config.roboflow_api_key,
        type="password",
        help="Free Roboflow API key for hosted ambulance inference",
    )
    model_id = st.text_input(
        "Model ID:",
        value=config.roboflow_model_id,
        help="Preferred model: ambulance-4bova-a3goa/4",
    )
    conf_thresh = st.slider(
        "Confidence Threshold:",
        min_value=0.10,
        max_value=0.95,
        value=config.confidence_threshold,
        step=0.05,
    )
    st.caption("🛡️ Never substitutes buses or trucks for emergency vehicles.")


# ==============================================================================
# MAIN DASHBOARD INTERFACE
# ==============================================================================

# Top Prototype Disclaimer
st.markdown(
    """
    <div class="disclaimer-banner">
        <strong>⚠️ HACKATHON SIMULATION PROTOTYPE:</strong> SafeCity AI demonstrates software route planning 
        and simulated green corridor prioritization. This prototype does not connect to real physical traffic 
        signals and does not dispatch actual Rescue 1122 emergency services. All ETAs and road speeds are simulated values.
    </div>
    """,
    unsafe_allow_html=True,
)

# Header Row
col_hdr1, col_hdr2 = st.columns([8, 4])
with col_hdr1:
    st.markdown("## 🚑 SafeCity AI — Ambulance Green Corridor")
    st.markdown(
        "<span style='color: #64748b; font-size: 0.95rem;'>"
        "Real-Time Emergency Vehicle Detection, Dijkstra Pathfinding & Intelligent Signal Preemption"
        "</span>",
        unsafe_allow_html=True,
    )

with col_hdr2:
    current_state = st.session_state.event_manager.state
    if current_state == SystemLifecycleState.CORRIDOR_ACTIVE:
        state_badge = '<span class="badge-priority">● GREEN CORRIDOR ACTIVE</span>'
    elif current_state in (SystemLifecycleState.CANDIDATE_DETECTED, SystemLifecycleState.AMBULANCE_CONFIRMED):
        state_badge = '<span class="badge-emergency">● AMBULANCE DETECTED</span>'
    else:
        state_badge = '<span class="badge-monitoring">● MONITORING ROADWAY</span>'

    st.markdown(
        f"<div style='text-align: right; padding-top: 0.5rem;'>{state_badge}</div>",
        unsafe_allow_html=True,
    )

st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)


# ==============================================================================
# STATUS KPI CARDS (TOP ROW)
# ==============================================================================
kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)

# Detector instantiation
detector = AmbulanceDetector(
    api_key=roboflow_key,
    model_id=model_id,
    conf_threshold=conf_thresh,
    local_weights_path=str(config.yolo_local_weights),
)

with kpi1:
    is_amb = st.session_state.debounce_filter.is_currently_confirmed or (
        st.session_state.event_manager.state in (
            SystemLifecycleState.AMBULANCE_CONFIRMED,
            SystemLifecycleState.ROUTE_CALCULATED,
            SystemLifecycleState.CORRIDOR_ACTIVE,
        )
    )
    val = "DETECTED" if is_amb else "ABSENT"
    sub = f"Peak Conf: {st.session_state.debounce_filter.peak_confidence:.0%}" if is_amb else "Monitoring..."
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-card-title">Ambulance Status</div>
            <div class="metric-card-value" style="color: {'#dc2626' if is_amb else '#64748b'};">{val}</div>
            <div class="metric-card-sub">{sub}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with kpi2:
    corridor_on = st.session_state.signal_controller.corridor_active
    val = "PRIORITY ACTIVE" if corridor_on else "NORMAL CYCLE"
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-card-title">Corridor Mode</div>
            <div class="metric-card-value" style="color: {'#059669' if corridor_on else '#475569'};">{val}</div>
            <div class="metric-card-sub">Simulated Intersection Control</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with kpi3:
    if st.session_state.active_route:
        eta_val = f"{st.session_state.active_route.estimated_eta_minutes:.1f} min"
        dist_val = f"{st.session_state.active_route.total_distance_meters:.0f} m (Simulated)"
    else:
        eta_val = "--"
        dist_val = "Select route"
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-card-title">Simulated ETA</div>
            <div class="metric-card-value" style="color: #2563eb;">{eta_val}</div>
            <div class="metric-card-sub">{dist_val}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with kpi4:
    dest_name = destinations.get(selected_dest_id, selected_dest_id)
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-card-title">Destination</div>
            <div class="metric-card-value" style="font-size: 1.15rem; color: #0f172a;">{dest_name.split()[0]} Hospital</div>
            <div class="metric-card-sub">{selected_dest_id}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with kpi5:
    m_status = detector.status.value
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-card-title">Model Service</div>
            <div class="metric-card-value" style="font-size: 1.05rem; color: #475569;">{m_status}</div>
            <div class="metric-card-sub">{model_id.split('/')[0]}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.markdown("<div style='height: 15px;'></div>", unsafe_allow_html=True)


# ==============================================================================
# MIDDLE ROW: CCTV VIDEO FEED & ROUTE DIAGRAM
# ==============================================================================
col_video, col_route = st.columns([7, 5])

with col_video:
    st.markdown("#### 📹 Live CCTV Video Feed & Vision Overlay")
    
    # Process current video frame
    frame = None
    if video_file_path and os.path.exists(video_file_path):
        cap = cv2.VideoCapture(video_file_path)
        cap.set(cv2.CAP_PROP_POS_FRAMES, st.session_state.video_frame_index)
        ret, read_frame = cap.read()
        cap.release()
        if ret:
            frame = read_frame
        else:
            # Loop video
            st.session_state.video_frame_index = 0
            cap = cv2.VideoCapture(video_file_path)
            ret, read_frame = cap.read()
            cap.release()
            if ret:
                frame = read_frame

    if frame is None:
        # Create clear synthetic placeholder frame
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 40
        cv2.putText(frame, "TRAFFIC CCTV FEED — CAMERA 04", (30, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)

    # Run inference on current frame
    detections, status, msg = detector.infer_frame(frame)
    st.session_state.last_detections = detections

    # Apply temporal debounce filter
    filter_res = st.session_state.debounce_filter.update(detections)

    # Check for automatic emergency confirmation trigger
    if filter_res.is_new_trigger and not st.session_state.signal_controller.corridor_active:
        st.session_state.event_manager.on_ambulance_confirmed(filter_res.peak_confidence)
        try:
            route = st.session_state.route_engine.calculate_route(
                start_node=config.default_start_node,
                destination_node=selected_dest_id,
            )
            st.session_state.active_route = route
            st.session_state.event_manager.on_route_calculated(
                destination=route.destination_name,
                num_intersections=len(route.intersections),
                eta_minutes=route.estimated_eta_minutes,
            )
            st.session_state.signal_controller.activate_corridor(route)
            st.session_state.event_manager.on_corridor_activated(route.destination_name)
        except RoutingError as e:
            st.session_state.event_manager.log_inference_error(f"Routing failed: {e}")

    # Annotate frame
    is_corridor_on = st.session_state.signal_controller.corridor_active
    corridor_state_label = "PRIORITY_ACTIVE" if is_corridor_on else "MONITORING"
    annotated = annotate_frame(frame, detections, is_corridor_on, corridor_state_label)

    # Streamlit image display (convert BGR to RGB)
    rgb_frame = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
    st.image(rgb_frame, use_container_width=True)

    st.caption(
        f"Frame: `{st.session_state.video_frame_index}` | "
        f"Consecutive Hits: `{filter_res.consecutive_hits}/{config.confirmation_frames}` | "
        f"Detections: `{len(detections)}`"
    )

with col_route:
    st.markdown("#### 🗺️ Road Network & Route Progress")
    
    # Calculate route to show in diagram
    try:
        preview_route = st.session_state.route_engine.calculate_route(
            start_node=config.default_start_node,
            destination_node=selected_dest_id,
        )
    except RoutingError:
        preview_route = None

    if preview_route:
        st.markdown(
            f"**Path: {preview_route.start_node} ➔ {preview_route.destination_name}**  \n"
            f"<span style='color: #64748b; font-size: 0.85rem;'>"
            f"Total Distance: {preview_route.total_distance_meters:.0f}m | Simulated ETA: {preview_route.estimated_eta_minutes} min"
            f"</span>",
            unsafe_allow_html=True,
        )

        # Route Progress Step Visualizer
        curr_passed_idx = st.session_state.signal_controller.current_passed_index
        
        st.markdown(
            """
            <div class="route-step route-step-passed">
                <span>📍</span>
                <div>
                    <strong>START_CCTV</strong> (Camera Entry Node)<br/>
                    <small style="color: #64748b;">Vehicle detected at origin</small>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        for idx, r_int in enumerate(preview_route.intersections):
            is_passed = idx <= curr_passed_idx
            is_current = (idx == curr_passed_idx + 1) and is_corridor_on

            if is_passed:
                step_class = "route-step route-step-passed"
                icon = "✅"
                badge = '<span class="badge-monitoring">PASSED</span>'
            elif is_current:
                step_class = "route-step route-step-active"
                icon = "🚑"
                badge = '<span class="badge-priority">PRIORITY ACTIVE</span>'
            elif is_corridor_on:
                step_class = "route-step"
                icon = "🟢"
                badge = '<span class="badge-priority">PRIORITY HELD</span>'
            else:
                step_class = "route-step"
                icon = "⚪"
                badge = '<span class="badge-monitoring">NORMAL CYCLE</span>'

            st.markdown(
                f"""
                <div class="{step_class}">
                    <span>{icon}</span>
                    <div style="flex-grow: 1;">
                        <strong>{r_int.name}</strong> ({r_int.node_id})<br/>
                        <small style="color: #64748b;">Approach: {r_int.incoming_approach} | Dist: {r_int.distance_meters:.0f}m</small>
                    </div>
                    <div>{badge}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown(
            f"""
            <div class="route-step {'route-step-active' if curr_passed_idx >= len(preview_route.intersections) - 1 and is_corridor_on else ''}">
                <span>🏥</span>
                <div>
                    <strong>{preview_route.destination_name}</strong> (Destination)<br/>
                    <small style="color: #64748b;">Emergency Department Entrance</small>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    else:
        st.warning("No connected route found between origin and destination.")

st.markdown("<div style='height: 15px;'></div>", unsafe_allow_html=True)


# ==============================================================================
# BOTTOM ROW: TRAFFIC SIGNALS STATUS & AUDIT EVENT HISTORY
# ==============================================================================
col_signals, col_events = st.columns([6, 6])

with col_signals:
    st.markdown("#### 🚦 Traffic Signals Network Status")
    
    sig_controller = st.session_state.signal_controller
    intersections = sig_controller.intersections

    grid_cols = st.columns(2)
    for idx, (int_id, int_obj) in enumerate(intersections.items()):
        col_target = grid_cols[idx % 2]
        with col_target:
            ns_state = int_obj.approaches["NORTH_SOUTH"].state
            ew_state = int_obj.approaches["EAST_WEST"].state

            # Helper for color pills
            def get_state_badge(state: SignalState):
                if state == SignalState.PRIORITY_GREEN:
                    return '<span class="badge-priority">PRIORITY GREEN</span>'
                elif state == SignalState.GREEN:
                    return '<span style="color: #059669; font-weight: bold;">● GREEN</span>'
                elif state == SignalState.AMBER:
                    return '<span class="badge-amber">● AMBER</span>'
                elif state == SignalState.ALL_RED_CLEARANCE:
                    return '<span style="color: #b91c1c; font-weight: bold;">● ALL RED</span>'
                else:
                    return '<span style="color: #dc2626; font-weight: bold;">● RED</span>'

            # Route context badge
            if int_obj.is_on_route and not int_obj.is_passed:
                header_tag = '<span class="badge-priority">CORRIDOR ROUTE</span>'
            elif int_obj.is_passed:
                header_tag = '<span class="badge-monitoring">PASSED</span>'
            else:
                header_tag = '<span class="badge-monitoring">NORMAL</span>'

            st.markdown(
                f"""
                <div class="metric-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <strong>{int_obj.name}</strong>
                        {header_tag}
                    </div>
                    <div style="font-size: 0.85rem; margin-bottom: 0.25rem;">
                        <strong>North-South:</strong> {get_state_badge(ns_state)}
                    </div>
                    <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
                        <strong>East-West:</strong> {get_state_badge(ew_state)}
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 0.4rem;">
                        🛡️ Conflicting movements held safely at RED
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

with col_events:
    st.markdown("#### 📜 Chronological Audit Event History")
    
    events = st.session_state.event_manager.get_history(limit=12)
    
    event_container = st.container(height=360)
    with event_container:
        for evt in events:
            source_badge = (
                f"<span style='font-size: 0.7rem; color: #2563eb; background: #dbeafe; padding: 2px 6px; border-radius: 4px;'>"
                f"{evt.source}</span>"
            )
            st.markdown(
                f"""
                <div style="padding: 0.4rem 0; border-bottom: 1px solid #e2e8f0; font-size: 0.82rem;">
                    <div style="display: flex; justify-content: space-between; color: #64748b; font-size: 0.75rem;">
                        <span>{evt.timestamp}</span>
                        {source_badge}
                    </div>
                    <div style="margin-top: 2px;">
                        <strong>{evt.event_type}:</strong> {evt.message}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
