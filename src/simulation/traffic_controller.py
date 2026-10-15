"""Legacy compatibility facade for TrafficLightController.

Delegates to safecity.simulation while providing compatible API for legacy tests.
"""

from safecity.simulation.signal_simulator import (
    SignalState as LightState,
    SimulatedIntersection,
    CorridorSignalController,
)

# Provide compatibility aliases
class TrafficLight:
    def __init__(self, id):
        self.id = id
        self.state = LightState.RED

    def set_state(self, state):
        self.state = state


class TrafficLightController:
    """Legacy controller adapter wrapping CorridorSignalController."""

    def __init__(self):
        self.controller = CorridorSignalController()
        self.lights = {
            i: TrafficLight(i) for i in range(len(self.controller.intersections))
        }
        self.emergency_mode = False

    def prioritize_emergency(self, route=None):
        """Enable priority."""
        self.emergency_mode = True
        if route is not None:
            self.controller.activate_corridor(route)
        else:
            # Default priority on main arterial INT_1
            int1 = self.controller.intersections.get("INT_1")
            if int1:
                int1.apply_priority("NORTH_SOUTH")
        self._sync_lights()

    def normal_operation(self):
        """Restore normal operation."""
        self.emergency_mode = False
        self.controller.reset()
        self._sync_lights()

    def _sync_lights(self):
        for idx, (int_id, int_obj) in enumerate(self.controller.intersections.items()):
            if idx in self.lights:
                self.lights[idx].state = int_obj.summary_state


__all__ = ["LightState", "TrafficLight", "TrafficLightController"]