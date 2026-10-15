"""Inference adapter supporting Roboflow hosted inference and local model weights.

This module enforces genuine ambulance-specific detection, strictly rejecting
the flawed assumption that standard COCO buses or trucks represent ambulances.
"""

import os
import time
import logging
from enum import Enum
from dataclasses import dataclass
from typing import Optional, List, Tuple
import numpy as np

logger = logging.getLogger("safecity.detector")


class InferenceStatus(Enum):
    ONLINE_ROBOFLOW = "ONLINE_ROBOFLOW"
    LOCAL_WEIGHTS = "LOCAL_WEIGHTS"
    API_KEY_MISSING = "API_KEY_MISSING"
    API_ERROR = "API_ERROR"
    NO_DETECTIONS = "NO_DETECTIONS"
    SUCCESS = "SUCCESS"
    MOCK_MODE = "MOCK_MODE"


@dataclass
class DetectionBox:
    """Standardized bounding box prediction."""
    bbox: Tuple[int, int, int, int]  # (x1, y1, x2, y2)
    confidence: float
    class_name: str
    is_ambulance: bool


class AmbulanceDetector:
    """Vision detector supporting Roboflow hosted API and custom local models."""

    # Authorized ambulance class labels (case-insensitive)
    VALID_AMBULANCE_LABELS = {"ambulance", "ambulances", "emergency_vehicle", "ems"}

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_id: str = "ambulance-4bova-a3goa/4",
        conf_threshold: float = 0.50,
        local_weights_path: Optional[str] = None,
        use_mock: bool = False,
    ):
        self.api_key = api_key or os.getenv("ROBOFLOW_API_KEY", "")
        self.model_id = model_id or os.getenv("ROBOFLOW_MODEL_ID", "ambulance-4bova-a3goa/4")
        self.conf_threshold = conf_threshold
        self.local_weights_path = local_weights_path
        self.use_mock = use_mock

        self.roboflow_client = None
        self.local_model = None
        self.status = InferenceStatus.NO_DETECTIONS
        self.status_message = "Detector initialized."

        self._initialize_backend()

    def _initialize_backend(self) -> None:
        """Initialize either Roboflow API client or local weights."""
        if self.use_mock:
            self.status = InferenceStatus.MOCK_MODE
            self.status_message = "Mock detection mode enabled for testing."
            return

        # Attempt Roboflow hosted inference if API key is provided
        if self.api_key and self.api_key.strip():
            try:
                from inference_sdk import InferenceHTTPClient, InferenceConfiguration
                self.roboflow_client = InferenceHTTPClient(
                    api_url="https://serverless.roboflow.com",
                    api_key=self.api_key.strip()
                ).configure(InferenceConfiguration(
                    api_key_transport="header"
                ))
                self.status = InferenceStatus.ONLINE_ROBOFLOW
                self.status_message = f"Connected to Roboflow model: {self.model_id}"
                logger.info(self.status_message)
                return
            except Exception as e:
                self.status = InferenceStatus.API_ERROR
                self.status_message = f"Roboflow client init failed: {e}"
                logger.error(self.status_message)

        # Fallback to local weights if provided
        if self.local_weights_path and os.path.exists(self.local_weights_path):
            try:
                from ultralytics import YOLO
                self.local_model = YOLO(self.local_weights_path)
                
                # Verify if local model actually has an ambulance class
                model_classes = [c.lower() for c in self.local_model.names.values()]
                has_ambulance_class = any(label in self.VALID_AMBULANCE_LABELS for label in model_classes)
                
                if has_ambulance_class:
                    self.status = InferenceStatus.LOCAL_WEIGHTS
                    self.status_message = f"Loaded local ambulance weights: {self.local_weights_path}"
                else:
                    self.status = InferenceStatus.LOCAL_WEIGHTS
                    self.status_message = (
                        f"Loaded weights ({self.local_weights_path}), but no ambulance class exists "
                        f"in classes: {list(self.local_model.names.values())[:5]}... "
                        f"Standard COCO classes will NOT be misclassified as ambulances."
                    )
                logger.info(self.status_message)
                return
            except Exception as e:
                self.status = InferenceStatus.API_ERROR
                self.status_message = f"Failed to load local model: {e}"
                logger.error(self.status_message)

        if not self.api_key:
            self.status = InferenceStatus.API_KEY_MISSING
            self.status_message = (
                "ROBOFLOW_API_KEY is not set. Please set it in .env or via dashboard settings. "
                "COCO buses/trucks will not be substituted."
            )
            logger.warning(self.status_message)

    def infer_frame(self, frame: np.ndarray) -> Tuple[List[DetectionBox], InferenceStatus, str]:
        """Run inference on a single BGR image frame.

        Returns:
            Tuple of (detections_list, status, message)
        """
        if frame is None or frame.size == 0:
            return [], InferenceStatus.NO_DETECTIONS, "Empty frame provided."

        # Mock mode for deterministic testing without network
        if self.use_mock:
            return self._mock_inference(frame)

        # Path 1: Roboflow Hosted Inference
        if self.roboflow_client is not None:
            return self._infer_roboflow(frame)

        # Path 2: Local YOLO Model (if specialized weights provided)
        if self.local_model is not None:
            return self._infer_local(frame)

        # If no model backend is operational
        return [], self.status, self.status_message

    def _infer_roboflow(self, frame: np.ndarray) -> Tuple[List[DetectionBox], InferenceStatus, str]:
        """Query Roboflow serverless hosted inference."""
        try:
            # Roboflow inference_sdk can accept numpy BGR array directly
            response = self.roboflow_client.infer(frame, model_id=self.model_id)
            predictions = response.get("predictions", [])
            detections = []

            for pred in predictions:
                conf = float(pred.get("confidence", 0.0))
                class_name = str(pred.get("class", "")).strip()

                if conf < self.conf_threshold:
                    continue

                # STRICT AMBULANCE VALIDATION: Never accept bus or truck as ambulance
                is_amb = class_name.lower() in self.VALID_AMBULANCE_LABELS
                if not is_amb:
                    continue

                # Roboflow returns center x, y and box width, height
                cx = float(pred.get("x", 0))
                cy = float(pred.get("y", 0))
                w = float(pred.get("width", 0))
                h = float(pred.get("height", 0))

                x1 = max(0, int(cx - w / 2))
                y1 = max(0, int(cy - h / 2))
                x2 = min(frame.shape[1], int(cx + w / 2))
                y2 = min(frame.shape[0], int(cy + h / 2))

                detections.append(DetectionBox(
                    bbox=(x1, y1, x2, y2),
                    confidence=conf,
                    class_name=class_name,
                    is_ambulance=True
                ))

            status = InferenceStatus.SUCCESS if detections else InferenceStatus.NO_DETECTIONS
            msg = f"Roboflow inference complete: {len(detections)} ambulance(s) detected."
            return detections, status, msg

        except Exception as e:
            error_msg = f"Roboflow inference failed: {e}"
            logger.error(error_msg)
            return [], InferenceStatus.API_ERROR, error_msg

    def _infer_local(self, frame: np.ndarray) -> Tuple[List[DetectionBox], InferenceStatus, str]:
        """Run inference using local YOLO model weights."""
        try:
            results = self.local_model(frame, verbose=False, conf=self.conf_threshold)
            detections = []

            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    class_name = self.local_model.names.get(cls_id, "").lower()
                    conf = float(box.conf[0])

                    # Strict filter: ONLY accept genuine ambulance class
                    if class_name in self.VALID_AMBULANCE_LABELS and conf >= self.conf_threshold:
                        x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                        detections.append(DetectionBox(
                            bbox=(x1, y1, x2, y2),
                            confidence=conf,
                            class_name=class_name,
                            is_ambulance=True
                        ))

            status = InferenceStatus.SUCCESS if detections else InferenceStatus.NO_DETECTIONS
            msg = f"Local inference complete: {len(detections)} ambulance(s) detected."
            return detections, status, msg

        except Exception as e:
            error_msg = f"Local YOLO inference failed: {e}"
            logger.error(error_msg)
            return [], InferenceStatus.API_ERROR, error_msg

    def _mock_inference(self, frame: np.ndarray) -> Tuple[List[DetectionBox], InferenceStatus, str]:
        """Deterministic mock for unit testing and offline demonstrations."""
        h, w = frame.shape[:2]
        # Generate a synthetic ambulance box in the center of the frame
        box = DetectionBox(
            bbox=(int(w * 0.3), int(h * 0.4), int(w * 0.7), int(h * 0.8)),
            confidence=0.92,
            class_name="ambulance",
            is_ambulance=True,
        )
        return [box], InferenceStatus.MOCK_MODE, "Mock ambulance detection emitted."
