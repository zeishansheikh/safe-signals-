"""Tests for ambulance-specific detection, confidence filtering, and temporal debouncing."""

import numpy as np
import pytest
from safecity.detection.inference_adapter import (
    AmbulanceDetector,
    DetectionBox,
    InferenceStatus,
)
from safecity.detection.detection_logic import TemporalDebounceFilter


def test_ambulance_class_filtering_rejects_buses_and_trucks():
    """Verify that city buses and commercial trucks are NEVER treated as ambulances."""
    detector = AmbulanceDetector(conf_threshold=0.50, use_mock=False)
    
    # Simulate raw predictions containing bus, truck, and car
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Mock Roboflow response with bus and truck
    mock_predictions = [
        {"class": "bus", "confidence": 0.88, "x": 100, "y": 100, "width": 50, "height": 50},
        {"class": "truck", "confidence": 0.92, "x": 200, "y": 200, "width": 60, "height": 60},
        {"class": "car", "confidence": 0.85, "x": 300, "y": 300, "width": 40, "height": 40},
    ]
    
    # Custom client returning the mock predictions
    class MockRoboflowClient:
        def infer(self, frame, model_id):
            return {"predictions": mock_predictions}
            
    detector.roboflow_client = MockRoboflowClient()
    detections, status, msg = detector.infer_frame(dummy_frame)
    
    # Assert zero ambulance detections returned
    assert len(detections) == 0
    assert status == InferenceStatus.NO_DETECTIONS


def test_ambulance_detection_accepts_valid_ambulance():
    """Verify that genuine ambulance class is accepted and parsed accurately."""
    detector = AmbulanceDetector(conf_threshold=0.50, use_mock=False)
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    mock_predictions = [
        {"class": "ambulance", "confidence": 0.89, "x": 200, "y": 150, "width": 80, "height": 60},
        {"class": "car", "confidence": 0.91, "x": 400, "y": 300, "width": 70, "height": 50},
    ]
    
    class MockRoboflowClient:
        def infer(self, frame, model_id):
            return {"predictions": mock_predictions}
            
    detector.roboflow_client = MockRoboflowClient()
    detections, status, msg = detector.infer_frame(dummy_frame)
    
    assert len(detections) == 1
    assert detections[0].is_ambulance is True
    assert detections[0].class_name == "ambulance"
    assert detections[0].confidence == 0.89
    assert detections[0].bbox == (160, 120, 240, 180)  # cx - w/2, cy - h/2, cx + w/2, cy + h/2


def test_confidence_threshold_filtering():
    """Verify that predictions below the confidence threshold are discarded."""
    detector = AmbulanceDetector(conf_threshold=0.75, use_mock=False)
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    mock_predictions = [
        {"class": "ambulance", "confidence": 0.65, "x": 200, "y": 150, "width": 80, "height": 60},
    ]
    
    class MockRoboflowClient:
        def infer(self, frame, model_id):
            return {"predictions": mock_predictions}
            
    detector.roboflow_client = MockRoboflowClient()
    detections, status, msg = detector.infer_frame(dummy_frame)
    
    assert len(detections) == 0


def test_temporal_confirmation_and_debounce():
    """Verify that emergency confirmation requires N consecutive positive frames."""
    debounce = TemporalDebounceFilter(required_consecutive_hits=3, dropout_tolerance=5)
    
    amb_box = [DetectionBox(bbox=(10, 10, 50, 50), confidence=0.90, class_name="ambulance", is_ambulance=True)]
    empty = []
    
    # Frame 1: Hit 1 -> Not confirmed yet
    res1 = debounce.update(amb_box)
    assert not res1.is_confirmed
    assert not res1.is_new_trigger
    assert res1.consecutive_hits == 1
    
    # Frame 2: Hit 2 -> Not confirmed yet
    res2 = debounce.update(amb_box)
    assert not res2.is_confirmed
    assert not res2.is_new_trigger
    assert res2.consecutive_hits == 2
    
    # Frame 3: Hit 3 -> CONFIRMED & NEW TRIGGER
    res3 = debounce.update(amb_box)
    assert res3.is_confirmed
    assert res3.is_new_trigger
    assert res3.consecutive_hits == 3
    
    # Frame 4: Hit 4 -> Still confirmed, but NOT a new trigger (prevents duplicate events)
    res4 = debounce.update(amb_box)
    assert res4.is_confirmed
    assert not res4.is_new_trigger
    
    # Frame 5: Temporary occlusion / single-frame drop -> Should NOT immediately reset
    res5 = debounce.update(empty)
    assert res5.is_confirmed
    assert res5.consecutive_misses == 1


def test_temporal_debounce_event_reset_after_dropout():
    """Verify that confirmed state resets after consecutive misses exceed dropout tolerance."""
    debounce = TemporalDebounceFilter(required_consecutive_hits=2, dropout_tolerance=3)
    amb_box = [DetectionBox(bbox=(10, 10, 50, 50), confidence=0.90, class_name="ambulance", is_ambulance=True)]
    
    debounce.update(amb_box)
    debounce.update(amb_box)
    assert debounce.is_currently_confirmed
    
    # Miss 1, 2
    debounce.update([])
    debounce.update([])
    assert debounce.is_currently_confirmed
    
    # Miss 3 -> Exceeds tolerance
    debounce.update([])
    assert not debounce.is_currently_confirmed
