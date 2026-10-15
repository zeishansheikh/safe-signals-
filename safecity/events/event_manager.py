"""Event lifecycle state machine and audit event log manager.

Enforces valid state transitions across the full corridor lifecycle:
MONITORING -> CANDIDATE_DETECTED -> AMBULANCE_CONFIRMED -> ROUTE_CALCULATED -> CORRIDOR_ACTIVE -> COMPLETED -> MONITORING
"""

import time
import uuid
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any


class SystemLifecycleState(Enum):
    MONITORING = "MONITORING"
    CANDIDATE_DETECTED = "CANDIDATE_DETECTED"
    AMBULANCE_CONFIRMED = "AMBULANCE_CONFIRMED"
    ROUTE_CALCULATED = "ROUTE_CALCULATED"
    CORRIDOR_ACTIVE = "CORRIDOR_ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


@dataclass
class EmergencyEvent:
    """An individual timestamped lifecycle or operational event."""
    event_id: str
    timestamp: str
    state: SystemLifecycleState
    event_type: str
    message: str
    source: str  # 'MODEL_INFERENCE', 'SIMULATION', 'OPERATOR_ACTION', 'ROUTING_ENGINE'
    metadata: Dict[str, Any] = field(default_factory=dict)


class EventManager:
    """Manages system lifecycle transitions and chronological event logs."""

    VALID_TRANSITIONS = {
        SystemLifecycleState.MONITORING: {
            SystemLifecycleState.CANDIDATE_DETECTED,
            SystemLifecycleState.AMBULANCE_CONFIRMED,
            SystemLifecycleState.MONITORING,
        },
        SystemLifecycleState.CANDIDATE_DETECTED: {
            SystemLifecycleState.AMBULANCE_CONFIRMED,
            SystemLifecycleState.MONITORING,
            SystemLifecycleState.CANCELLED,
        },
        SystemLifecycleState.AMBULANCE_CONFIRMED: {
            SystemLifecycleState.ROUTE_CALCULATED,
            SystemLifecycleState.CANCELLED,
            SystemLifecycleState.MONITORING,
        },
        SystemLifecycleState.ROUTE_CALCULATED: {
            SystemLifecycleState.CORRIDOR_ACTIVE,
            SystemLifecycleState.CANCELLED,
            SystemLifecycleState.MONITORING,
        },
        SystemLifecycleState.CORRIDOR_ACTIVE: {
            SystemLifecycleState.COMPLETED,
            SystemLifecycleState.CANCELLED,
            SystemLifecycleState.CORRIDOR_ACTIVE,  # Intersection pass updates
        },
        SystemLifecycleState.COMPLETED: {
            SystemLifecycleState.MONITORING,
        },
        SystemLifecycleState.CANCELLED: {
            SystemLifecycleState.MONITORING,
        },
    }

    def __init__(self):
        self.current_state = SystemLifecycleState.MONITORING
        self.events: List[EmergencyEvent] = []
        self._record_event(
            event_type="SYSTEM_INITIALIZED",
            message="SafeCity AI event monitoring subsystem online.",
            source="SIMULATION",
        )

    @property
    def state(self) -> SystemLifecycleState:
        return self.current_state

    def _record_event(
        self,
        event_type: str,
        message: str,
        source: str = "SIMULATION",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> EmergencyEvent:
        """Create and store a timestamped event."""
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        evt = EmergencyEvent(
            event_id=str(uuid.uuid4())[:8],
            timestamp=now_str,
            state=self.current_state,
            event_type=event_type,
            message=message,
            source=source,
            metadata=metadata or {},
        )
        self.events.append(evt)
        return evt

    def transition_to(
        self,
        new_state: SystemLifecycleState,
        event_type: str,
        message: str,
        source: str = "SIMULATION",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Attempt a validated state machine transition."""
        allowed = self.VALID_TRANSITIONS.get(self.current_state, set())
        if new_state not in allowed:
            self._record_event(
                event_type="INVALID_TRANSITION_ATTEMPT",
                message=f"Rejected transition from {self.current_state.value} to {new_state.value}.",
                source="SYSTEM",
                metadata={"attempted_state": new_state.value},
            )
            return False

        self.current_state = new_state
        self._record_event(event_type=event_type, message=message, source=source, metadata=metadata)
        return True

    def on_candidate_detected(self, confidence: float, source: str = "MODEL_INFERENCE") -> None:
        """Single-frame detection observed."""
        if self.current_state == SystemLifecycleState.MONITORING:
            self.transition_to(
                new_state=SystemLifecycleState.CANDIDATE_DETECTED,
                event_type="AMBULANCE_CANDIDATE_DETECTED",
                message=f"Candidate emergency vehicle observed (Confidence: {confidence:.2%}). Verifying...",
                source=source,
                metadata={"confidence": confidence},
            )

    def on_ambulance_confirmed(self, peak_confidence: float, source: str = "MODEL_INFERENCE") -> None:
        """Multi-frame temporal confirmation achieved."""
        if self.current_state in (SystemLifecycleState.MONITORING, SystemLifecycleState.CANDIDATE_DETECTED):
            self.transition_to(
                new_state=SystemLifecycleState.AMBULANCE_CONFIRMED,
                event_type="AMBULANCE_CONFIRMED",
                message=f"Emergency vehicle verified across consecutive frames (Confidence: {peak_confidence:.2%}).",
                source=source,
                metadata={"peak_confidence": peak_confidence},
            )

    def on_route_calculated(self, destination: str, num_intersections: int, eta_minutes: float) -> None:
        """Route engine successfully computed Dijkstra shortest path."""
        if self.current_state == SystemLifecycleState.AMBULANCE_CONFIRMED:
            self.transition_to(
                new_state=SystemLifecycleState.ROUTE_CALCULATED,
                event_type="ROUTE_CALCULATED",
                message=f"Dijkstra path calculated to {destination}: {num_intersections} intersections, ETA {eta_minutes} min.",
                source="ROUTING_ENGINE",
                metadata={"destination": destination, "intersections": num_intersections, "eta": eta_minutes},
            )

    def on_corridor_activated(self, destination: str) -> None:
        """Green signals assigned to route intersections."""
        if self.current_state == SystemLifecycleState.ROUTE_CALCULATED:
            self.transition_to(
                new_state=SystemLifecycleState.CORRIDOR_ACTIVE,
                event_type="GREEN_CORRIDOR_ACTIVATED",
                message=f"Emergency Green Corridor is now ACTIVE for route to {destination}.",
                source="SIMULATION",
            )

    def on_intersection_passed(self, intersection_name: str, intersection_id: str) -> None:
        """Ambulance traversed an intermediate intersection."""
        if self.current_state == SystemLifecycleState.CORRIDOR_ACTIVE:
            self._record_event(
                event_type="INTERSECTION_PASSED",
                message=f"Ambulance cleared intersection {intersection_name} ({intersection_id}). Priority released.",
                source="SIMULATION",
                metadata={"intersection_id": intersection_id},
            )

    def on_mission_completed(self) -> None:
        """Ambulance reached destination hospital."""
        if self.current_state == SystemLifecycleState.CORRIDOR_ACTIVE:
            self.transition_to(
                new_state=SystemLifecycleState.COMPLETED,
                event_type="CORRIDOR_MISSION_COMPLETED",
                message="Ambulance arrived at hospital destination. Emergency corridor concluded.",
                source="SIMULATION",
            )
            # Automatic return to monitoring
            self.transition_to(
                new_state=SystemLifecycleState.MONITORING,
                event_type="MONITORING_RESUMED",
                message="All signals returned to normal. SafeCity AI monitoring resumed.",
                source="SIMULATION",
            )

    def on_manual_reset(self) -> None:
        """Operator pressed cancel or reset."""
        if self.current_state != SystemLifecycleState.MONITORING:
            self.transition_to(
                new_state=SystemLifecycleState.CANCELLED,
                event_type="OPERATOR_RESET",
                message="Operator triggered manual corridor reset. Cancelling active states.",
                source="OPERATOR_ACTION",
            )
            self.transition_to(
                new_state=SystemLifecycleState.MONITORING,
                event_type="MONITORING_RESUMED",
                message="System reset complete. Ready for new scenario.",
                source="SIMULATION",
            )

    def log_inference_error(self, error_message: str) -> None:
        """Record model/API inference error without crashing."""
        self._record_event(
            event_type="INFERENCE_ERROR",
            message=f"Computer vision inference error: {error_message}",
            source="MODEL_INFERENCE",
        )

    def get_history(self, limit: int = 50) -> List[EmergencyEvent]:
        """Return newest events first."""
        return list(reversed(self.events[-limit:]))
