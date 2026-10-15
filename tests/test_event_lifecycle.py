"""Tests for emergency event lifecycle state machine and audit event logging."""

import pytest
from safecity.events.event_manager import EventManager, SystemLifecycleState


def test_initial_state_is_monitoring():
    mgr = EventManager()
    assert mgr.state == SystemLifecycleState.MONITORING
    history = mgr.get_history()
    assert len(history) >= 1
    assert history[0].event_type == "SYSTEM_INITIALIZED"


def test_valid_lifecycle_progression():
    """Verify standard progression: MONITORING -> CANDIDATE -> CONFIRMED -> ROUTE -> CORRIDOR -> COMPLETED -> MONITORING."""
    mgr = EventManager()
    
    # 1. Candidate detected
    mgr.on_candidate_detected(0.85)
    assert mgr.state == SystemLifecycleState.CANDIDATE_DETECTED
    
    # 2. Confirmed
    mgr.on_ambulance_confirmed(0.92)
    assert mgr.state == SystemLifecycleState.AMBULANCE_CONFIRMED
    
    # 3. Route calculated
    mgr.on_route_calculated("City General Hospital", 3, 1.5)
    assert mgr.state == SystemLifecycleState.ROUTE_CALCULATED
    
    # 4. Corridor activated
    mgr.on_corridor_activated("City General Hospital")
    assert mgr.state == SystemLifecycleState.CORRIDOR_ACTIVE
    
    # 5. Intermediate pass
    mgr.on_intersection_passed("1st Ave & Main St", "INT_1")
    assert mgr.state == SystemLifecycleState.CORRIDOR_ACTIVE
    
    # 6. Completed
    mgr.on_mission_completed()
    assert mgr.state == SystemLifecycleState.MONITORING
    
    # Verify event ordering (newest first)
    history = mgr.get_history()
    assert history[0].event_type == "MONITORING_RESUMED"
    assert history[1].event_type == "CORRIDOR_MISSION_COMPLETED"


def test_operator_manual_reset_transitions_to_cancelled_then_monitoring():
    mgr = EventManager()
    mgr.on_candidate_detected(0.85)
    mgr.on_ambulance_confirmed(0.90)
    
    mgr.on_manual_reset()
    assert mgr.state == SystemLifecycleState.MONITORING
    
    history = mgr.get_history()
    assert history[0].event_type == "MONITORING_RESUMED"
    assert history[1].event_type == "OPERATOR_RESET"


def test_invalid_transition_rejected():
    mgr = EventManager()
    # Cannot jump directly from MONITORING to COMPLETED
    success = mgr.transition_to(
        SystemLifecycleState.COMPLETED,
        event_type="TEST_INVALID",
        message="Invalid transition jump",
    )
    assert success is False
    assert mgr.state == SystemLifecycleState.MONITORING
