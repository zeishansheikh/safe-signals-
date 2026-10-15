"""Frame annotation utilities for SafeCity AI.

Safely annotates bounding boxes, class labels, confidence scores,
and emergency priority banners on image frames without type crashes.
"""

from typing import List, Union, Dict, Any, Optional
import cv2
import numpy as np
from ..detection.inference_adapter import DetectionBox
from ..simulation.signal_simulator import SignalState


def draw_detections(
    frame: np.ndarray,
    detections: List[Union[DetectionBox, Dict[str, Any], Any]],
) -> np.ndarray:
    """Draw bounding boxes and confidence labels on frame.

    Supports DetectionBox objects, dicts with 'bbox' key, or raw coordinates.
    """
    out_frame = frame.copy()
    
    for item in detections:
        # Extract coordinates and labels polymorphically
        if isinstance(item, DetectionBox):
            x1, y1, x2, y2 = item.bbox
            conf = item.confidence
            label_text = f"Ambulance: {conf:.0%}" if item.is_ambulance else f"{item.class_name}: {conf:.0%}"
            is_amb = item.is_ambulance
        elif isinstance(item, dict):
            coords = item.get("bbox", (0, 0, 0, 0))
            x1, y1, x2, y2 = map(int, coords)
            conf = float(item.get("confidence", 0.0))
            c_name = str(item.get("class", "Vehicle"))
            is_amb = item.get("is_ambulance", False) or c_name.lower() in ("ambulance", "ems")
            label_text = f"Ambulance: {conf:.0%}" if is_amb else f"{c_name}: {conf:.0%}"
        elif isinstance(item, (tuple, list)) and len(item) == 4:
            x1, y1, x2, y2 = map(int, item)
            label_text = "Detection"
            is_amb = True
        else:
            continue

        # Color: Red/Green for ambulance
        color = (0, 0, 230) if is_amb else (255, 140, 0)

        # Draw bounding rectangle
        cv2.rectangle(out_frame, (x1, y1), (x2, y2), color, 3)

        # Text banner background
        font = cv2.FONT_HERSHEY_SIMPLEX
        scale = 0.55
        thickness = 2
        (tw, th), baseline = cv2.getTextSize(label_text, font, scale, thickness)
        
        bg_y1 = max(0, y1 - th - 10)
        bg_y2 = y1
        cv2.rectangle(out_frame, (x1, bg_y1), (x1 + tw + 10, bg_y2), color, -1)
        cv2.putText(out_frame, label_text, (x1 + 5, bg_y2 - 5), font, scale, (255, 255, 255), thickness)

    return out_frame


def draw_signal_overlay(
    frame: np.ndarray,
    is_emergency: bool = False,
    corridor_status: str = "MONITORING",
) -> np.ndarray:
    """Draw top emergency corridor banner and status pill."""
    out_frame = frame.copy()
    h, w = out_frame.shape[:2]

    # Overlay banner bar on top
    overlay = out_frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 45), (15, 23, 42), -1)
    cv2.addWeighted(overlay, 0.75, out_frame, 0.25, 0, out_frame)

    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(out_frame, "SAFECITY AI CCTV MONITOR", (15, 28), font, 0.6, (255, 255, 255), 2)

    # Status badge on top right
    status_text = f"CORRIDOR: {corridor_status}"
    badge_color = (0, 200, 50) if is_emergency else (150, 150, 150)
    (tw, th), _ = cv2.getTextSize(status_text, font, 0.5, 2)
    cv2.rectangle(out_frame, (w - tw - 30, 8), (w - 15, 36), badge_color, -1)
    cv2.putText(out_frame, status_text, (w - tw - 22, 27), font, 0.5, (0, 0, 0) if is_emergency else (255, 255, 255), 2)

    return out_frame


def annotate_frame(
    frame: np.ndarray,
    detections: List[Any],
    is_emergency: bool = False,
    corridor_status: str = "MONITORING",
) -> np.ndarray:
    """Annotate full frame with detections and status overlay."""
    annotated = draw_detections(frame, detections)
    annotated = draw_signal_overlay(annotated, is_emergency, corridor_status)
    return annotated
