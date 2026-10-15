"""Legacy entry point wrapper forwarding to main.py."""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from main import parse_args, run_pipeline

if __name__ == "__main__":
    args = parse_args()
    run_pipeline(args)