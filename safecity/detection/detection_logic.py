"""Temporal confirmation and debouncing logic for emergency vehicle detection.

Prevents single-frame false triggers and duplicate emergency events while
maintaining stability during temporary optical occlusions.
"""

from typing import List, Optional
from dataclasses import dataclass
from .inference_adapter import DetectionBox


@dataclass
class FilterResult:
    """Outcome of temporal debouncing on the current frame."""
    is_confirmed: bool           # True when temporal threshold is reached
    is_new_trigger: bool         # True only on the exact transition frame from unconfirmed -> confirmed
    consecutive_hits: int        # Number of consecutive frames with positive detections
    consecutive_misses: int      # Number of consecutive frames without detection
    best_box: Optional[DetectionBox]
    peak_confidence: float


class TemporalDebounceFilter:
    """Stateful filter requiring multi-frame confirmation before emergency triggering."""

    def __init__(
        self,
        required_consecutive_hits: int = 3,
        dropout_tolerance: int = 20,
    ):
        """
        Args:
            required_consecutive_hits: Number of consecutive positive frames required to confirm.
            dropout_tolerance: Number of consecutive miss frames allowed before resetting confirmed state.
        """
        self.required_consecutive_hits = required_consecutive_hits
        self.dropout_tolerance = dropout_tolerance

        self.consecutive_hits = 0
        self.consecutive_misses = 0
        self.is_currently_confirmed = False
        self.peak_confidence = 0.0
        self.active_event_emitted = False

    def update(self, detections: List[DetectionBox]) -> FilterResult:
        """Process detections from the current frame.

        Args:
            detections: List of DetectionBox objects from the inference adapter.

        Returns:
            FilterResult containing temporal state and trigger status.
        """
        # Find best ambulance detection in current frame
        ambulance_boxes = [d for d in detections if d.is_ambulance]
        best_box = max(ambulance_boxes, key=lambda d: d.confidence) if ambulance_boxes else None

        is_new_trigger = False

        if best_box is not None:
            self.consecutive_hits += 1
            self.consecutive_misses = 0
            self.peak_confidence = max(self.peak_confidence, best_box.confidence)

            # Check if we crossed the confirmation threshold
            if self.consecutive_hits >= self.required_consecutive_hits:
                if not self.is_currently_confirmed:
                    self.is_currently_confirmed = True
                    if not self.active_event_emitted:
                        is_new_trigger = True
                        self.active_event_emitted = True
        else:
            self.consecutive_misses += 1
            # Reset hits if we have not yet reached confirmed threshold
            if not self.is_currently_confirmed:
                self.consecutive_hits = 0

            # If confirmed, only release after dropout tolerance is exceeded
            if self.is_currently_confirmed and self.consecutive_misses >= self.dropout_tolerance:
                self.reset()

        return FilterResult(
            is_confirmed=self.is_currently_confirmed,
            is_new_trigger=is_new_trigger,
            consecutive_hits=self.consecutive_hits,
            consecutive_misses=self.consecutive_misses,
            best_box=best_box,
            peak_confidence=self.peak_confidence,
        )

    def reset(self) -> None:
        """Reset internal filter state."""
        self.consecutive_hits = 0
        self.consecutive_misses = 0
        self.is_currently_confirmed = False
        self.peak_confidence = 0.0
        self.active_event_emitted = False
