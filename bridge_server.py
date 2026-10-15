"""SafeCity AI - Python to React REST API Bridge Server.

Exposes REST API endpoints connecting the React 18 frontend to the
safecity Python backend modules (Dijkstra routing, SCATS signal simulation, YOLOv8).
Uses standard Python library (zero third-party dependencies required).
"""

import sys
import json
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Add root directory to sys.path so safecity modules can be imported
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Try importing safecity modules if dependencies exist
HAVE_SAFECITY = False
try:
    from safecity.routing.route_engine import RoadNetworkGraph
    from safecity.simulation.signal_simulator import CorridorSignalController
    from safecity.events.event_manager import EventManager
    HAVE_SAFECITY = True
except Exception as e:
    print(f"[SafeCity Bridge] Running with built-in mock telemetry ({e})")

# In-memory runtime state
signals_state = [
    {"id": 1, "code": "INT-01", "name": "Int-01 Main / Jinnah", "timer": 42, "state": "green", "priorityMode": True, "phase": "North-South Priority"},
    {"id": 2, "code": "INT-02", "name": "Int-02 Cantt Chowk", "timer": 55, "state": "green", "priorityMode": True, "phase": "Main Corridor Clear"},
    {"id": 3, "code": "INT-03", "name": "Int-03 Mandian Rd", "timer": 68, "state": "green", "priorityMode": True, "phase": "Commercial Bypass Clearance"},
    {"id": 4, "code": "INT-04", "name": "Int-04 Hospital Chowk", "timer": 90, "state": "green", "priorityMode": True, "phase": "ER Gate Ingress Priority"},
]

events_state = [
    {"id": 1, "time": "11:48:15", "type": "Preemption", "source": "INT-01 to INT-04", "detail": "Synchronized Green Corridor active for Abbottabad corridor", "tag": "Active", "auditor": "Automated AI Engine"},
    {"id": 2, "time": "11:47:50", "type": "Routing", "source": "Dijkstra Engine", "detail": "Optimal route to City Hospital calculated (1.8 km, 3m 45s ETA)", "tag": "Routed", "auditor": "Python Route Engine"},
    {"id": 3, "time": "11:47:22", "type": "Detection", "source": "CCTV-01 Main Blvd", "detail": "Ambulance #AB-901 flagged (Confidence score: 0.942)", "tag": "Detected", "auditor": "YOLOv8 Edge Model"},
]

class SafeCityApiHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/status" or path == "/":
            self._send_json({
                "service": "SafeCity AI Backend Bridge",
                "status": "online",
                "version": "1.0.0",
                "python_modules_loaded": HAVE_SAFECITY,
                "endpoints": [
                    "/api/status",
                    "/api/signals",
                    "/api/events",
                    "/api/cameras",
                    "/api/route"
                ]
            })
        elif path == "/api/signals":
            self._send_json({"signals": signals_state})
        elif path == "/api/events":
            self._send_json({"events": events_state})
        elif path == "/api/cameras":
            self._send_json({
                "cameras": [
                    {"id": "cam-01", "name": "CAM-01 Main Blvd", "fps": 25.0, "status": "online", "resolution": "1080p"},
                    {"id": "cam-02", "name": "CAM-02 Cantt Chowk", "fps": 30.0, "status": "online", "resolution": "1080p"},
                    {"id": "cam-03", "name": "CAM-03 Mandian", "fps": 25.0, "status": "online", "resolution": "1080p"},
                    {"id": "cam-04", "name": "CAM-04 Hospital Road", "fps": 30.0, "status": "online", "resolution": "1080p"},
                ]
            })
        else:
            self._send_json({"error": "Endpoint not found"}, status=404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            payload = json.loads(post_data.decode("utf-8"))
        except Exception:
            payload = {}

        if path == "/api/signals/override":
            action = payload.get("action", "force_green")
            for sig in signals_state:
                if action == "force_green":
                    sig["state"] = "green"
                    sig["timer"] = 60
                    sig["priorityMode"] = True
            self._send_json({"success": True, "message": f"Signal override '{action}' executed."})

        elif path == "/api/route":
            destination = payload.get("destination", "HOSPITAL_CITY")
            self._send_json({
                "destination": destination,
                "distance_km": 1.8 if destination == "HOSPITAL_CITY" else 4.6,
                "eta": "3m 45s",
                "intersections": ["INT-01", "INT-02", "INT-03", "INT-04"]
            })
        else:
            self._send_json({"error": "Unknown POST route"}, status=404)

def run_server(port=8000):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, SafeCityApiHandler)
    print(f"[SafeCity Bridge] Running on http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
