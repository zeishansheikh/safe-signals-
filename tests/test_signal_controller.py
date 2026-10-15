"""Tests for route-aware traffic signal controller and conflict safety rules."""

import pytest
from safecity.routing.route_engine import RoadNetworkGraph
from safecity.simulation.signal_simulator import (
    CorridorSignalController,
    SimulatedIntersection,
    SignalState,
)


def test_corridor_activation_sets_priority_green_only_on_route():
    """Verify that priority green is applied strictly to intersections on the route."""
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_CITY")  # Route traverses INT_1, INT_2, INT_3
    
    controller = CorridorSignalController()
    controller.activate_corridor(route)
    
    # Intersections on route should have priority
    assert controller.intersections["INT_1"].is_on_route is True
    assert controller.intersections["INT_2"].is_on_route is True
    assert controller.intersections["INT_3"].is_on_route is True
    
    # INT_1 approach NORTH_SOUTH must be PRIORITY_GREEN
    assert controller.intersections["INT_1"].approaches["NORTH_SOUTH"].state == SignalState.PRIORITY_GREEN
    
    # INT_4 is NOT on this route; must NOT have priority
    assert controller.intersections["INT_4"].is_on_route is False
    assert controller.intersections["INT_4"].priority_approach is None


def test_conflicting_movements_never_green_simultaneously():
    """Verify safety invariant: NORTH_SOUTH and EAST_WEST can NEVER both be green."""
    controller = CorridorSignalController()
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_CITY")
    
    # Check across normal cycle stepping
    for _ in range(60):
        controller.step(delta_seconds=1.0)
        for int_obj in controller.intersections.values():
            ns = int_obj.approaches["NORTH_SOUTH"].state
            ew = int_obj.approaches["EAST_WEST"].state
            
            # Neither can both be GREEN or PRIORITY_GREEN
            ns_green = ns in (SignalState.GREEN, SignalState.PRIORITY_GREEN)
            ew_green = ew in (SignalState.GREEN, SignalState.PRIORITY_GREEN)
            assert not (ns_green and ew_green), f"Safety violation at {int_obj.id}: NS={ns}, EW={ew}"

    # Check during emergency priority
    controller.activate_corridor(route)
    for int_obj in controller.intersections.values():
        ns = int_obj.approaches["NORTH_SOUTH"].state
        ew = int_obj.approaches["EAST_WEST"].state
        ns_green = ns in (SignalState.GREEN, SignalState.PRIORITY_GREEN)
        ew_green = ew in (SignalState.GREEN, SignalState.PRIORITY_GREEN)
        assert not (ns_green and ew_green), f"Safety violation in priority at {int_obj.id}: NS={ns}, EW={ew}"


def test_passed_intersection_releases_priority_without_releasing_corridor():
    """Verify that advancing past an intersection releases only that intersection."""
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_CITY")
    
    controller = CorridorSignalController()
    controller.activate_corridor(route)
    
    # Initial state: INT_1, INT_2, INT_3 all have active priority
    assert controller.intersections["INT_1"].priority_approach is not None
    assert controller.intersections["INT_2"].priority_approach is not None
    assert controller.intersections["INT_3"].priority_approach is not None
    
    # Advance ambulance past INT_1
    passed_id, logs = controller.advance_passed_intersection()
    assert passed_id == "INT_1"
    
    # INT_1 is passed and priority released
    assert controller.intersections["INT_1"].is_passed is True
    assert controller.intersections["INT_1"].priority_approach is None
    
    # Crucially, INT_2 and INT_3 still retain their green priority!
    assert controller.intersections["INT_2"].priority_approach is not None
    assert controller.intersections["INT_3"].priority_approach is not None
    assert controller.corridor_active is True


def test_mission_completion_restores_all_signals_sequentially():
    """Verify that reaching hospital destination releases all remaining priority signals."""
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_CITY")
    
    controller = CorridorSignalController()
    controller.activate_corridor(route)
    
    logs = controller.complete_mission()
    assert controller.corridor_active is False
    assert controller.active_route is None
    
    # All intersections must have returned to normal plan without conflict
    for int_obj in controller.intersections.values():
        assert int_obj.priority_approach is None
        assert int_obj.is_on_route is False
        ns = int_obj.approaches["NORTH_SOUTH"].state
        ew = int_obj.approaches["EAST_WEST"].state
        assert not (ns in (SignalState.GREEN, SignalState.PRIORITY_GREEN) and ew in (SignalState.GREEN, SignalState.PRIORITY_GREEN))


def test_manual_reset_restores_normal_states():
    """Verify that manual reset cancels priority and restores normal cycling."""
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_CITY")
    
    controller = CorridorSignalController()
    controller.activate_corridor(route)
    assert controller.corridor_active is True
    
    controller.reset()
    assert controller.corridor_active is False
    assert controller.active_route is None
    for int_obj in controller.intersections.values():
        assert int_obj.is_on_route is False
