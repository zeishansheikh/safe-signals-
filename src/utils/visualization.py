"""Legacy compatibility facade for visualization utilities."""

from safecity.utils.visualization import (
    draw_detections,
    draw_signal_overlay,
    annotate_frame,
)

__all__ = ["draw_detections", "draw_signal_overlay", "annotate_frame"]