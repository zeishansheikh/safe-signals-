"""Route-aware traffic signal simulator with conflict clearance safety.

Guarantees that conflicting movements never display green simultaneously,
enforces amber/all-red clearance intervals, and provides route-specific priority.
"""

import time
from enum import Enum
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from ..routing.route_engine import RouteResult, RouteIntersection


class SignalState(Enum):
    RED = "RED"
    AMBER = "AMBER"
    GREEN = "GREEN"
    ALL_RED_CLEARANCE = "ALL_RED_CLEARANCE"
    PRIORITY_GREEN = "PRIORITY_GREEN"


@dataclass
class ApproachState:
    """State of an individual movement direction at an intersection."""
    approach_id: str  # 'NORTH_SOUTH' or 'EAST_WEST'
    state: SignalState = SignalState.RED
    seconds_remaining: int = 15
    last_change_time: float = field(default_factory=time.time)


class SimulatedIntersection:
    """A realistic signalized intersection managing conflicting approaches."""

    CYCLE_GREEN_DURATION = 15.0
    CYCLE_AMBER_DURATION = 3.0
    CYCLE_ALL_RED_DURATION = 1.0

    def __init__(self, intersection_id: str, name: str):
        self.id = intersection_id
        self.name = name

        # Two primary conflicting approaches
        self.approaches: Dict[str, ApproachState] = {
            "NORTH_SOUTH": ApproachState(approach_id="NORTH_SOUTH", state=SignalState.GREEN, seconds_remaining=15),
            "EAST_WEST": ApproachState(approach_id="EAST_WEST", state=SignalState.RED, seconds_remaining=15),
        }

        self.is_on_route = False
        self.is_passed = False
        self.priority_approach: Optional[str] = None
        self.current_phase_index = 0  # 0: NS Green, 1: NS Amber, 2: All-Red, 3: EW Green, 4: EW Amber, 5: All-Red
        self.last_update_time = time.time()

    @property
    def summary_state(self) -> SignalState:
        """Dominant state of the intersection (priority or active green)."""
        if self.priority_approach and self.approaches[self.priority_approach].state == SignalState.PRIORITY_GREEN:
            return SignalState.PRIORITY_GREEN
        if any(a.state == SignalState.ALL_RED_CLEARANCE for a in self.approaches.values()):
            return SignalState.ALL_RED_CLEARANCE
        if any(a.state == SignalState.AMBER for a in self.approaches.values()):
            return SignalState.AMBER
        if any(a.state == SignalState.GREEN for a in self.approaches.values()):
            return SignalState.GREEN
        return SignalState.RED

    def apply_priority(self, route_approach: str) -> List[str]:
        """Request emergency green priority for the specified approach.

        Transitions conflicting approaches through amber/all-red if currently green.
        """
        logs = []
        self.is_on_route = True
        self.is_passed = False
        self.priority_approach = route_approach

        conflicting = "EAST_WEST" if route_approach == "NORTH_SOUTH" else "NORTH_SOUTH"

        # If conflicting movement was green, clear it safely
        if self.approaches[conflicting].state in (SignalState.GREEN, SignalState.AMBER):
            self.approaches[conflicting].state = SignalState.ALL_RED_CLEARANCE
            self.approaches[conflicting].seconds_remaining = int(self.CYCLE_ALL_RED_DURATION)
            logs.append(f"[{self.id}] Cleared conflicting approach {conflicting} to ALL_RED_CLEARANCE.")

        # Conflicting approach MUST be held at RED
        self.approaches[conflicting].state = SignalState.RED
        self.approaches[conflicting].seconds_remaining = 0

        # Target route approach receives PRIORITY_GREEN
        self.approaches[route_approach].state = SignalState.PRIORITY_GREEN
        self.approaches[route_approach].seconds_remaining = 99
        self.approaches[route_approach].last_change_time = time.time()
        logs.append(f"[{self.id}] Activated PRIORITY_GREEN on approach {route_approach} for emergency route.")

        return logs

    def mark_passed(self) -> List[str]:
        """Ambulance has cleared this intersection. Release priority and resume normal plan."""
        logs = []
        if not self.is_on_route or self.is_passed:
            return logs

        self.is_passed = True
        prev_priority = self.priority_approach
        self.priority_approach = None

        # Transition the previously priority approach through Amber before returning to normal plan
        if prev_priority and self.approaches[prev_priority].state == SignalState.PRIORITY_GREEN:
            self.approaches[prev_priority].state = SignalState.AMBER
            self.approaches[prev_priority].seconds_remaining = int(self.CYCLE_AMBER_DURATION)
            logs.append(f"[{self.id}] Ambulance passed. Transitioning {prev_priority} from priority to AMBER.")

        return logs

    def restore_normal_plan(self) -> List[str]:
        """Fully restore normal cyclic scheduling, ensuring no conflicting greens."""
        logs = []
        self.is_on_route = False
        self.is_passed = False
        self.priority_approach = None

        # Standard safe initialization: NS Green, EW Red
        self.approaches["NORTH_SOUTH"].state = SignalState.GREEN
        self.approaches["NORTH_SOUTH"].seconds_remaining = int(self.CYCLE_GREEN_DURATION)
        self.approaches["NORTH_SOUTH"].last_change_time = time.time()

        self.approaches["EAST_WEST"].state = SignalState.RED
        self.approaches["EAST_WEST"].seconds_remaining = int(self.CYCLE_GREEN_DURATION)
        self.approaches["EAST_WEST"].last_change_time = time.time()

        self.current_phase_index = 0
        logs.append(f"[{self.id}] Restored to normal cyclic schedule (NORTH_SOUTH: GREEN, EAST_WEST: RED).")
        return logs

    def advance_time(self, delta_seconds: float = 1.0) -> None:
        """Step forward the signal clock and advance cyclic phases if not held in priority."""
        if self.priority_approach is not None:
            # Held in emergency priority mode
            return

        # Advance normal cycle
        ns = self.approaches["NORTH_SOUTH"]
        ew = self.approaches["EAST_WEST"]

        # Phase 0: NS Green (15s)
        # Phase 1: NS Amber (3s)
        # Phase 2: All-Red (1s)
        # Phase 3: EW Green (15s)
        # Phase 4: EW Amber (3s)
        # Phase 5: All-Red (1s)
        phases = [
            (SignalState.GREEN, SignalState.RED, self.CYCLE_GREEN_DURATION),
            (SignalState.AMBER, SignalState.RED, self.CYCLE_AMBER_DURATION),
            (SignalState.ALL_RED_CLEARANCE, SignalState.ALL_RED_CLEARANCE, self.CYCLE_ALL_RED_DURATION),
            (SignalState.RED, SignalState.GREEN, self.CYCLE_GREEN_DURATION),
            (SignalState.RED, SignalState.AMBER, self.CYCLE_AMBER_DURATION),
            (SignalState.ALL_RED_CLEARANCE, SignalState.ALL_RED_CLEARANCE, self.CYCLE_ALL_RED_DURATION),
        ]

        # Update remaining seconds
        active_phase = phases[self.current_phase_index]
        ns_target, ew_target, duration = active_phase

        ns.seconds_remaining = max(0, ns.seconds_remaining - int(delta_seconds))
        ew.seconds_remaining = max(0, ew.seconds_remaining - int(delta_seconds))

        if ns.seconds_remaining <= 0 and ew.seconds_remaining <= 0:
            self.current_phase_index = (self.current_phase_index + 1) % len(phases)
            next_ns, next_ew, next_dur = phases[self.current_phase_index]
            ns.state = next_ns
            ns.seconds_remaining = int(next_dur)
            ew.state = next_ew
            ew.seconds_remaining = int(next_dur)


class CorridorSignalController:
    """Manages citywide intersection network and coordinates emergency green corridors."""

    def __init__(self):
        self.intersections: Dict[str, SimulatedIntersection] = {}
        self.active_route: Optional[RouteResult] = None
        self.corridor_active: bool = False
        self.current_passed_index: int = -1

        self._initialize_intersections()

    def _initialize_intersections(self) -> None:
        """Instantiate configured simulated intersections."""
        config_map = {
            "INT_1": "1st Ave & Main St",
            "INT_2": "2nd Ave & Central Blvd",
            "INT_3": "3rd Ave & Hospital Way",
            "INT_4": "4th Ave & Riverside Pkwy",
        }
        for i_id, name in config_map.items():
            self.intersections[i_id] = SimulatedIntersection(i_id, name)

    def activate_corridor(self, route: RouteResult) -> List[str]:
        """Activate the green corridor along the route intersections."""
        logs = []
        self.active_route = route
        self.corridor_active = True
        self.current_passed_index = -1

        logs.append(
            f"Activating corridor for route to '{route.destination_name}' "
            f"spanning {len(route.intersections)} intersection(s)."
        )

        # Apply priority strictly to the intersections along the route
        for r_int in route.intersections:
            if r_int.node_id in self.intersections:
                int_obj = self.intersections[r_int.node_id]
                int_logs = int_obj.apply_priority(r_int.incoming_approach)
                logs.extend(int_logs)

        return logs

    def advance_passed_intersection(self) -> Tuple[Optional[str], List[str]]:
        """Mark the next route intersection as passed by the emergency vehicle.

        Releases priority at that intersection while preserving priority at remaining ones.
        """
        logs = []
        if not self.corridor_active or not self.active_route:
            return None, ["Cannot advance: Corridor is not currently active."]

        next_idx = self.current_passed_index + 1
        if next_idx >= len(self.active_route.intersections):
            logs.append("Ambulance has cleared all route intersections.")
            return None, logs

        r_int = self.active_route.intersections[next_idx]
        self.current_passed_index = next_idx

        if r_int.node_id in self.intersections:
            int_obj = self.intersections[r_int.node_id]
            passed_logs = int_obj.mark_passed()
            logs.extend(passed_logs)
            logs.append(f"Intersection {r_int.name} ({r_int.node_id}) cleared by ambulance.")

        return r_int.node_id, logs

    def complete_mission(self) -> List[str]:
        """Ambulance reached destination hospital. Release all remaining priority signals."""
        logs = ["Ambulance arrived at destination hospital. Restoring all signals to normal."]
        self.corridor_active = False

        for int_obj in self.intersections.values():
            restore_logs = int_obj.restore_normal_plan()
            logs.extend(restore_logs)

        self.active_route = None
        self.current_passed_index = -1
        return logs

    def reset(self) -> List[str]:
        """Reset all signals and cancel active corridor."""
        logs = ["Manual reset initiated. Restoring all intersections."]
        self.corridor_active = False

        for int_obj in self.intersections.values():
            restore_logs = int_obj.restore_normal_plan()
            logs.extend(restore_logs)

        self.active_route = None
        self.current_passed_index = -1
        return logs

    def step(self, delta_seconds: float = 1.0) -> None:
        """Step simulation clock forward."""
        for int_obj in self.intersections.values():
            int_obj.advance_time(delta_seconds)
