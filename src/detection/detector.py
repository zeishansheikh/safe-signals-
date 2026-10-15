"""Legacy compatibility facade for AmbulanceDetector.

Delegates to the verified safecity.detection module while maintaining
backward compatibility for existing callers.
"""

from safecity.detection.inference_adapter import AmbulanceDetector, DetectionBox, InferenceStatus
from safecity.detection.detection_logic import TemporalDebounceFilter

__all__ = ["AmbulanceDetector", "DetectionBox", "InferenceStatus", "TemporalDebounceFilter"]