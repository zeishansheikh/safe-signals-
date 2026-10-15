"""Ambulance detection and vision inference module."""

from .inference_adapter import AmbulanceDetector, DetectionBox, InferenceStatus
from .detection_logic import TemporalDebounceFilter

__all__ = [
    "AmbulanceDetector",
    "DetectionBox",
    "InferenceStatus",
    "TemporalDebounceFilter",
]
