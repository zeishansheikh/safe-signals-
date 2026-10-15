"""Tests for legacy TrafficLightController facade, verifying corrected priority logic."""

import pytest
from src.simulation.traffic_controller import TrafficLightController, LightState
from safecity.routing.route_engine import RoadNetworkGraph


def test_traffic_light_initialization():
    controller = TrafficLightController()
    assert len(controller.lights) == 4
    assert not controller.emergency_mode


def test_emergency_priority_mode_sets_priority_green():
    """Verify that emergency mode activates PRIORITY_GREEN on the route rather than all RED."""
    controller = TrafficLightController()
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_CITY")

    # Activate emergency priority with route
    controller.prioritize_emergency(route=route)

    assert controller.emergency_mode is True
    
    # In the corrected simulation, the route intersection has PRIORITY_GREEN
    int1_state = controller.controller.intersections["INT_1"].summary_state
    assert int1_state == LightState.PRIORITY_GREEN


def test_normal_operation_resumes_safely():
    """Verify that normal operation resumes without conflicting greens."""
    controller = TrafficLightController()
    controller.prioritize_emergency()
    assert controller.emergency_mode is True

    controller.normal_operation()
    assert controller.emergency_mode is False
    
    # Controller must not be in priority green
    int1_state = controller.controller.intersections["INT_1"].summary_state
    assert int1_state != LightState.PRIORITY_GREEN