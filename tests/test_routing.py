"""Tests for NetworkX road graph and Dijkstra route calculation."""

import pytest
from safecity.routing.route_engine import RoadNetworkGraph, RoutingError, RouteResult


def test_dijkstra_route_calculation_to_city_hospital():
    """Verify Dijkstra shortest path to City General Hospital."""
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_CITY")
    
    assert isinstance(route, RouteResult)
    assert route.start_node == "START_CCTV"
    assert route.destination_node == "HOSPITAL_CITY"
    assert route.destination_name == "City General Hospital"
    
    # Expected optimal path: START_CCTV -> INT_1 -> INT_2 -> INT_3 -> HOSPITAL_CITY
    expected_path = ["START_CCTV", "INT_1", "INT_2", "INT_3", "HOSPITAL_CITY"]
    assert route.node_path == expected_path
    
    # Expected intersection nodes
    assert route.intersection_ids == ["INT_1", "INT_2", "INT_3"]
    assert len(route.intersections) == 3
    
    # Expected travel time: 25 + 30 + 20 + 15 = 90 seconds (1.5 minutes)
    assert route.total_travel_time_seconds == 90.0
    assert route.estimated_eta_minutes == 1.5


def test_dijkstra_route_to_trauma_center():
    """Verify routing to alternative destination (St. Jude Trauma Center)."""
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_TRAUMA")
    
    assert route.destination_node == "HOSPITAL_TRAUMA"
    assert "INT_1" in route.intersection_ids
    assert route.total_travel_time_seconds > 0.0


def test_intersection_approach_mapping():
    """Verify that incoming approach identifiers are correctly extracted for each intersection."""
    graph = RoadNetworkGraph()
    route = graph.calculate_route("START_CCTV", "HOSPITAL_CITY")
    
    # INT_1 incoming from START_CCTV is NORTH_SOUTH
    assert route.intersections[0].node_id == "INT_1"
    assert route.intersections[0].incoming_approach == "NORTH_SOUTH"
    
    # INT_2 incoming from INT_1 is EAST_WEST
    assert route.intersections[1].node_id == "INT_2"
    assert route.intersections[1].incoming_approach == "EAST_WEST"


def test_disconnected_node_raises_routing_error():
    """Verify that disconnected nodes raise RoutingError with a clear explanation."""
    graph = RoadNetworkGraph()
    with pytest.raises(RoutingError) as exc_info:
        graph.calculate_route("START_CCTV", "DISCONNECTED_NODE")
    
    assert "No connected route exists" in str(exc_info.value)


def test_invalid_node_raises_routing_error():
    """Verify that non-existent origin or destination raises RoutingError."""
    graph = RoadNetworkGraph()
    with pytest.raises(RoutingError):
        graph.calculate_route("NON_EXISTENT_START", "HOSPITAL_CITY")
    
    with pytest.raises(RoutingError):
        graph.calculate_route("START_CCTV", "NON_EXISTENT_HOSPITAL")
