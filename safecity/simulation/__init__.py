"""Route-aware traffic signal simulation module."""

from .signal_simulator import (
    SignalState,
    ApproachState,
    SimulatedIntersection,
    CorridorSignalController,
)

__all__ = [
    "SignalState",
    "ApproachState",
    "SimulatedIntersection",
    "CorridorSignalController",
]
