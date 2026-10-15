"""Tests for Streamlit dashboard state and component integration."""

import pytest
from safecity.config import config
from safecity.routing.route_engine import RoadNetworkGraph
from safecity.simulation.signal_simulator import CorridorSignalController
from safecity.events.event_manager import EventManager, SystemLifecycleState
from safecity.detection.inference_adapter import AmbulanceDetector, DetectionBox
from safecity.utils.visualization import annotate_frame
import numpy as np


def test_dashboard_core_state_integration():
    """Verify that all core subsystems instantiate and interact seamlessly."""
    event_manager = EventManager()
    route_engine = RoadNetworkGraph()
    signal_controller = CorridorSignalController()
    
    # 1. State machine starts in MONITORING
    assert event_manager.state == SystemLifecycleState.MONITORING
    
    # 2. Origin & destination route calculation
    route = route_engine.calculate_route(config.default_start_node, config.default_destination)
    assert route is not None
    assert len(route.intersections) >= 2
    
    # 3. Trigger priority corridor
    event_manager.on_ambulance_confirmed(0.95)
    event_manager.on_route_calculated(route.destination_name, len(route.intersections), route.estimated_eta_minutes)
    signal_controller.activate_corridor(route)
    event_manager.on_corridor_activated(route.destination_name)
    
    assert signal_controller.corridor_active is True
    assert event_manager.state == SystemLifecycleState.CORRIDOR_ACTIVE
    
    # 4. Advance through intersections
    passed_id, logs = signal_controller.advance_passed_intersection()
    assert passed_id == route.intersections[0].node_id
    event_manager.on_intersection_passed(route.intersections[0].name, passed_id)
    
    # 5. Complete mission
    signal_controller.complete_mission()
    event_manager.on_mission_completed()
    assert signal_controller.corridor_active is False
    assert event_manager.state == SystemLifecycleState.MONITORING


def test_dashboard_annotation_rendering():
    """Verify that dashboard frame annotation renders smoothly without exceptions."""
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    boxes = [DetectionBox(bbox=(100, 100, 300, 300), confidence=0.88, class_name="ambulance", is_ambulance=True)]
    
    annotated = annotate_frame(frame, boxes, is_emergency=True, corridor_status="ACTIVE")
    assert annotated.shape == frame.shape
    assert isinstance(annotated, np.ndarray)
