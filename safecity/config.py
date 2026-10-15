"""Configuration management for SafeCity AI."""

import os
from pathlib import Path
from dataclasses import dataclass
from dotenv import load_dotenv

# Load .env file if available
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


@dataclass
class SafeCityConfig:
    """System configuration parameters."""
    
    # Model configuration
    # Primary preferred model: ambulance-4bova-a3goa/4
    # Documented fallback: ambulance-detection-wdbvs/1
    roboflow_api_key: str = os.getenv("ROBOFLOW_API_KEY", "")
    roboflow_model_id: str = os.getenv("ROBOFLOW_MODEL_ID", "ambulance-4bova-a3goa/4")
    roboflow_fallback_model_id: str = "ambulance-detection-wdbvs/1"
    
    # Detection thresholds
    confidence_threshold: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.50"))
    
    # Temporal confirmation & debouncing (number of consecutive frames)
    confirmation_frames: int = int(os.getenv("CONFIRMATION_FRAMES", "3"))
    dropout_tolerance_frames: int = int(os.getenv("DROPOUT_TOLERANCE_FRAMES", "20"))
    frame_skip: int = int(os.getenv("FRAME_SKIP", "2"))
    
    # Routing defaults
    default_start_node: str = os.getenv("DEFAULT_START_NODE", "START_CCTV")
    default_destination: str = os.getenv("DEFAULT_DESTINATION", "HOSPITAL_CITY")
    
    # Media paths
    sample_video_path: Path = BASE_DIR / "data" / "traffic_sample.mp4"
    yolo_local_weights: Path = BASE_DIR / "yolov8n.pt"


config = SafeCityConfig()
