# API Specification & Mock Contracts — SafeCity AI

> **Contract Rule:** Frontend builds against these exact JSON shapes immediately. If the backend or ML model is delayed, these routes return deterministic mock fixtures so the frontend UI is never blocked.

---

## 1. Core Endpoints

### 1.1 `POST /api/detect`
Analyzes a CCTV frame (or returns scripted demo frame detections).
- **Request Body:**
  ```json
  {
    "cameraId": "cctv-01",
    "frameTimestamp": "2026-10-15T11:00:00Z"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "cameraId": "cctv-01",
    "detections": [
      { "class": "ambulance", "confidence": 0.942, "bbox": [175, 75, 140, 105] },
      { "class": "car", "confidence": 0.821, "bbox": [50, 150, 100, 90] },
      { "class": "car", "confidence": 0.763, "bbox": [350, 45, 110, 84] },
      { "class": "motorcycle", "confidence": 0.710, "bbox": [375, 195, 75, 66] }
    ]
  }
  ```

---

### 1.2 `GET /api/route`
Returns pre-calculated corridor geometry and ETA.
- **Query Params:** `session` (optional UUID)
- **Response (200 OK):**
  ```json
  {
    "sessionId": "demo-session-abbottabad",
    "origin": { "name": "CCTV-01 Main Boulevard", "lat": 34.1688, "lng": 73.2215 },
    "destination": { "name": "City Hospital", "lat": 34.1750, "lng": 73.2350 },
    "distance_km": 1.8,
    "eta_seconds": 225,
    "time_saved_seconds": 255,
    "stops": [
      { "id": "int-01", "name": "Main/Jinnah", "distance_m": 350 },
      { "id": "int-02", "name": "Cantt Chowk", "distance_m": 800 },
      { "id": "int-03", "name": "Mandian Road", "distance_m": 1300 },
      { "id": "int-04", "name": "Hospital Chowk", "distance_m": 1750 }
    ],
    "polyline": "encoded_geojson_polyline_data"
  }
  ```

---

### 1.3 `GET /api/signals` & `POST /api/signals/priority`
Reads status or triggers green corridor preemption across all 4 intersections.
- **`POST /api/signals/priority` Request Body:**
  ```json
  {
    "corridorId": "main-boulevard",
    "durationSeconds": 120
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "priorityEngaged": true,
    "signals": [
      { "id": "int-01", "name": "Int-01 Main/Jinnah", "state": "green", "countdown": 42 },
      { "id": "int-02", "name": "Int-02 Cantt Chowk", "state": "green", "countdown": 55 },
      { "id": "int-03", "name": "Int-03 Mandian Rd", "state": "green", "countdown": 68 },
      { "id": "int-04", "name": "Int-04 Hospital Chowk", "state": "green", "countdown": 90 }
    ]
  }
  ```

---

### 1.4 `GET /api/events` & `POST /api/events/alert-rescue`
Retrieves logs or dispatches emergency webhook notification.
- **`POST /api/events/alert-rescue` Request Body:**
  ```json
  {
    "ambulanceId": "AB-901",
    "corridor": "Main Boulevard",
    "eta": "3m 45s"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "eventId": "evt-9912",
    "message": "Rescue 1122 dispatch central alerted successfully",
    "dispatchedAt": "2026-10-15T11:00:15Z"
  }
  ```

---

### 1.5 `GET /api/health`
Health check for uptime monitors.
- **Response:** `{"status": "ok", "service": "safecity-api", "timestamp": "2026-10-15T11:00:00Z"}`

---

## 2. Standard Error Format
All endpoints return standard RFC-7807 compliant error bodies:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Field 'durationSeconds' must be between 30 and 300",
    "details": [{ "field": "durationSeconds", "issue": "Too small" }]
  }
}
```

---

## 3. Realtime Channels (Supabase / Broadcast)
- `signals`: Broadcasts signal countdown updates every 1 second.
- `events`: Pushes newly logged dispatch and preemption records.
- `ambulance_sessions`: Broadcasts ambulance coordinates and current speed.
