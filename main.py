"""SafeCity AI - Command-Line Interface & Video Pipeline Runner.

Executes end-to-end ambulance detection, temporal confirmation, Dijkstra routing,
and intelligent green-corridor signal simulation.
"""

import os
import sys
import time
import argparse
import cv2
import numpy as np

from safecity.config import config
from safecity.detection.inference_adapter import AmbulanceDetector, InferenceStatus
from safecity.detection.detection_logic import TemporalDebounceFilter
from safecity.routing.route_engine import RoadNetworkGraph
from safecity.simulation.signal_simulator import CorridorSignalController
from safecity.events.event_manager import EventManager
from safecity.utils.visualization import annotate_frame


def parse_args():
    parser = argparse.ArgumentParser(description="SafeCity AI - Intelligent Green Corridor System")
    parser.add_argument(
        "--input", "-i",
        type=str,
        default=str(config.sample_video_path),
        help="Path to input traffic video file",
    )
    parser.add_argument(
        "--model", "-m",
        type=str,
        default=config.roboflow_model_id,
        help="Roboflow model ID (default: ambulance-4bova-a3goa/4)",
    )
    parser.add_argument(
        "--api-key", "-k",
        type=str,
        default=config.roboflow_api_key,
        help="Roboflow API key (or set via ROBOFLOW_API_KEY env var)",
    )
    parser.add_argument(
        "--conf", "-c",
        type=float,
        default=config.confidence_threshold,
        help="Confidence threshold for ambulance detection",
    )
    parser.add_argument(
        "--dest", "-d",
        type=str,
        default=config.default_destination,
        help="Destination hospital node ID (HOSPITAL_CITY or HOSPITAL_TRAUMA)",
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Enable mock detection mode for offline demo verification",
    )
    parser.add_argument(
        "--no-gui",
        action="store_true",
        help="Run in headless mode without X11 cv2.imshow windows",
    )
    return parser.parse_args()


def run_pipeline(args):
    print("=" * 65)
    print("🚑 SAFECITY AI — AMBULANCE GREEN CORRIDOR PIPELINE")
    print("   Simulation Prototype — Not connected to real traffic signals")
    print("=" * 65)

    # 1. Initialize Subsystems
    detector = AmbulanceDetector(
        api_key=args.api_key,
        model_id=args.model,
        conf_threshold=args.conf,
        local_weights_path=str(config.yolo_local_weights),
        use_mock=args.mock,
    )
    debounce_filter = TemporalDebounceFilter(
        required_consecutive_hits=config.confirmation_frames,
        dropout_tolerance=config.dropout_tolerance_frames,
    )
    route_engine = RoadNetworkGraph()
    signal_controller = CorridorSignalController()
    event_manager = EventManager()

    print(f"[*] Detector Status: {detector.status.value}")
    print(f"[*] Status Message:  {detector.status_message}")
    print(f"[*] Target Hospital: {args.dest}")
    print(f"[*] Input Video:     {args.input}")

    # Check video existence
    if not os.path.exists(args.input):
        print(f"[!] Error: Video file not found at: {args.input}")
        return

    cap = cv2.VideoCapture(args.input)
    if not cap.isOpened():
        print(f"[!] Error: Could not open video file: {args.input}")
        return

    has_display = bool(os.environ.get("DISPLAY")) and not args.no_gui
    frame_count = 0
    route_result = None

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                # Video ended
                break

            frame_count += 1

            # Frame skip for performance
            if frame_count % config.frame_skip != 0:
                continue

            # 2. Run Inference
            detections, inf_status, msg = detector.infer_frame(frame)
            if inf_status == InferenceStatus.API_ERROR:
                event_manager.log_inference_error(msg)

            # 3. Apply Temporal Confirmation
            filter_res = debounce_filter.update(detections)

            if filter_res.best_box:
                event_manager.on_candidate_detected(filter_res.best_box.confidence)

            # 4. Trigger Green Corridor on Confirmed Ambulance
            if filter_res.is_new_trigger and not signal_controller.corridor_active:
                event_manager.on_ambulance_confirmed(filter_res.peak_confidence)
                try:
                    route_result = route_engine.calculate_route(
                        start_node=config.default_start_node,
                        destination_node=args.dest,
                    )
                    event_manager.on_route_calculated(
                        destination=route_result.destination_name,
                        num_intersections=len(route_result.intersections),
                        eta_minutes=route_result.estimated_eta_minutes,
                    )
                    act_logs = signal_controller.activate_corridor(route_result)
                    event_manager.on_corridor_activated(route_result.destination_name)
                    for log_msg in act_logs:
                        print(f"  [SIGNAL] {log_msg}")

                except Exception as e:
                    print(f"[!] Routing failed: {e}")

            # 5. Advance Signals Clock
            signal_controller.step(delta_seconds=0.1)

            # 6. Output / Visualization
            is_emergency = signal_controller.corridor_active
            corridor_label = "ACTIVE" if is_emergency else "MONITORING"
            annotated = annotate_frame(frame, detections, is_emergency, corridor_label)

            if has_display:
                cv2.imshow("SafeCity AI Monitor", annotated)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("[*] User quit video loop.")
                    break
            else:
                if frame_count % 30 == 0:
                    status_line = f"Frame {frame_count:04d} | State: {event_manager.state.value} | Hits: {filter_res.consecutive_hits}"
                    if route_result:
                        status_line += f" | ETA: {route_result.estimated_eta_minutes} min"
                    print(f"[*] {status_line}")

    finally:
        cap.release()
        if has_display:
            cv2.destroyAllWindows()

    print("\n" + "=" * 65)
    print("🏁 PIPELINE EXECUTION SUMMARY")
    print(f"[*] Total Frames Processed: {frame_count}")
    print(f"[*] Final System State:     {event_manager.state.value}")
    print("\n[*] Recent Audit Events:")
    for evt in event_manager.get_history(limit=8):
        print(f"    [{evt.timestamp}] ({evt.source}) {evt.event_type}: {evt.message}")
    print("=" * 65)


if __name__ == "__main__":
    cli_args = parse_args()
    run_pipeline(cli_args)
