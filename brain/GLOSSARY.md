# Domain Glossary & Naming Standards — SafeCity AI

---

## 1. Emergency Transit & Traffic Domain Terms

| Term | Domain Definition | Usage in SafeCity AI |
|---|---|---|
| **Green Corridor** | A synchronized route where consecutive traffic signals are turned green to allow unimpeded passage of emergency vehicles or organ transplants. | The dynamic path connecting Camera CCTV-01 through Intersections 1–4 to Abbottabad City Hospital. |
| **Traffic Preemption (EVP)** | The immediate interruption of standard cyclic traffic light phases to favor an approaching emergency vehicle (Emergency Vehicle Preemption). | SafeCity's simulated priority signal override system (`POST /api/signals/priority`). |
| **Intersection / Node** | A physical road junction regulated by 3-phase or 4-phase traffic signals. | Represented by entities `Int-01` through `Int-04` with latitude/longitude coordinates and countdown clocks. |
| **Estimated Time of Arrival (ETA)** | Projected transit duration based on distance and average corridor speed. | Computed metric comparing "Standard ETA" (~8 mins) against "Corridor ETA" (~3.8 mins). |
| **Object Detection & Bounding Box (BBox)** | Computer vision inference identifying classes (ambulance, car, motorcycle) with 2D rectangular coordinates `[x, y, w, h]`. | Overlaid visually on the CCTV camera feed canvas. |
| **Confidence Score** | Statistical probability (0.0 to 1.0) output by the vision model that the detected object belongs to the designated vehicle class. | Ambulance preemption triggers only when detection confidence is `>= 0.85` (Demo: 0.942). |
| **Rescue 1122** | The official emergency ambulance, rescue, and fire service operating in Khyber Pakhtunkhwa, Pakistan. | The simulated agency that receives automated green corridor dispatch notifications. |
| **Golden Hour** | The critical first 60 minutes following severe traumatic injury or acute medical emergency where definitive care prevents mortality. | The core life-saving mission metric motivating the SafeCity AI project. |

---

## 2. Naming & Code Conventions

- **Database Tables & Columns:** `snake_case` in plural (`cameras`, `intersections`, `ambulance_sessions`, `stream_url`).
- **TypeScript Interfaces & Types:** `PascalCase` (`AmbulanceSession`, `TrafficIntersection`, `DetectionPayload`).
- **React Components:** `PascalCase` in separate files (`CameraFeed.tsx`, `SignalsPanel.tsx`, `RouteMap.tsx`).
- **REST Endpoints:** `kebab-case` or lowercase nouns (`/api/detect`, `/api/route`, `/api/signals/priority`).
- **CSS Variables / Design Tokens:** `kebab-case` prefixed with token category (`--bg`, `--surface`, `--accent`, `--shadow-md`).
- **Environment Variables:** `SCREAMING_SNAKE_CASE` with framework prefix (`NEXT_PUBLIC_CITY_NAME`).
