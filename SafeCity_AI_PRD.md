# SafeCity AI --- Product Requirements Document (PRD)

**Product:** SafeCity AI --- Ambulance Green Corridor\
**Version:** 1.0\
**Status:** Hackathon MVP\
**Primary interface reference:** User-provided SafeCity AI dashboard
image\
**Target build time:** Approximately 3 hours

------------------------------------------------------------------------

## 1. Executive Summary

SafeCity AI is a Python-based hackathon prototype that demonstrates an
ambulance receiving priority through a simulated sequence of traffic
intersections. It detects an ambulance in recorded CCTV-style video or
an optional webcam feed, calculates a route to a selected hospital on a
simulated road graph, and activates simulated green signals along that
route.

The dashboard presents video detections, route status, estimated demo
ETA, simulated traffic-light states, route progress, and an event log in
one interface.

The project does not control real traffic infrastructure and does not
dispatch actual emergency services.

## 2. Problem Statement

Ambulances can lose time in congested traffic. Conventional fixed-time
traffic signals do not automatically respond to an approaching emergency
vehicle. SafeCity AI demonstrates a possible software workflow for
identifying an ambulance and coordinating simulated intersection
priority along a selected route.

## 3. Product Vision

Create a clear, visually compelling proof of concept showing how
computer vision and route planning can work together to simulate an
ambulance green corridor.

## 4. Objectives and Success Criteria

### Objectives

-   Demonstrate ambulance detection using an existing pre-trained model.
-   Connect detection to an emergency event workflow.
-   Calculate a path to a selected hospital using Dijkstra's algorithm.
-   Update simulated signal states for route intersections.
-   Present the complete flow in a polished Streamlit dashboard.
-   Complete a repeatable demo within the hackathon time limit.

### MVP success criteria

1.  A sample image or video can be processed by the selected model.
2.  The dashboard shows the model's actual prediction, confidence, and
    bounding box when available.
3.  A confirmed detection creates one emergency event, not one event per
    frame.
4.  The route engine returns a valid route for the configured graph.
5.  Route intersections switch to simulated priority-green state.
6.  Event Log records detection, route calculation, corridor activation,
    and completion/reset.
7.  The demo can recover from a missing API key, inference failure, or
    invalid video without crashing.
8.  All simulated values are clearly labelled.

No accuracy or response-time guarantee is claimed until measured on a
representative test set.

## 5. Users

### Primary user: Hackathon judge

Needs to understand the problem, see the AI detection, and observe an
end-to-end result quickly.

### Secondary user: Demo operator

Loads a clip, selects a destination, starts monitoring, observes the
corridor, and resets the scenario.

### Future stakeholder: Traffic/emergency systems evaluator

Would assess real-world safety, camera integration, traffic-signal
protocols, and dispatch integration. These are outside the MVP.

## 6. Scope

### In scope --- MVP

-   Python application.
-   Streamlit dashboard inspired by the reference image.
-   Recorded video upload.
-   Optional webcam input if it can be implemented reliably.
-   One ambulance-specific pre-trained model through hosted Roboflow
    inference or compatible local weights.
-   Confidence threshold and basic temporal confirmation.
-   Simulated road network with several intersections.
-   Hospital destination selection (one default hospital is sufficient).
-   Dijkstra route calculation.
-   Simulated signal-priority state changes.
-   Route progress panel.
-   Event history.
-   Manual "arrived" and "reset corridor" controls.
-   Clear status and error messages.

### Out of scope

-   Real traffic signal hardware control.
-   Real Rescue 1122 dispatch or messaging.
-   Real-time city map routing or live traffic APIs.
-   Training a model from scratch.
-   Multi-camera tracking.
-   Reliable siren recognition.
-   Automatic hospital choice based on medical condition.
-   Crash detection.
-   General vehicle-counting/adaptive signal optimisation.
-   Production authentication, user roles, audit infrastructure, and
    deployment hardening.

## 7. User Journey

1.  Operator opens the dashboard.
2.  Operator chooses a recorded video and a destination hospital.
3.  System reads video frames and requests inference.
4.  System filters model predictions and waits for stable ambulance
    detection.
5.  Dashboard shows the detected ambulance and confidence.
6.  System creates an emergency event.
7.  Route engine calculates the shortest route to the selected hospital.
8.  Signal simulator marks intersections on the route as
    `PRIORITY_GREEN`.
9.  Dashboard updates route progress, signal cards, ETA, and event log.
10. Operator marks the demo journey complete or resets the scenario.
11. System restores normal simulated signal states and retains the event
    in history.

## 8. Functional Requirements

### FR-01: Video source

-   The system shall accept a supported uploaded video file.
-   Webcam input may be offered as an optional source.
-   Invalid or unreadable video shall produce a visible error.

### FR-02: Ambulance detection

-   The system shall send sampled frames to the configured
    ambulance-specific model.
-   The system shall parse returned class labels, confidence scores, and
    bounding boxes when provided.
-   The system shall expose a configurable confidence threshold.
-   The system shall not assume that standard COCO weights include an
    ambulance class.
-   The system shall display a clear unavailable/error state if
    inference fails.

### FR-03: Detection confirmation

-   The system should require stable detection across a configurable
    number of sampled frames before corridor activation.
-   The system shall avoid generating duplicate detection events for
    every frame.
-   The system shall return to monitoring after detection is absent for
    a configurable interval or after operator reset.

### FR-04: Destination selection

-   The system shall provide at least one configured hospital
    destination.
-   The operator may select a destination if multiple demo destinations
    exist.
-   The UI shall make clear that the destination is selected for the
    simulation and is not inferred from the ambulance.

### FR-05: Route calculation

-   The system shall represent roads as a weighted graph.
-   The system shall calculate a shortest path from the configured
    camera/start node to the selected hospital using Dijkstra's
    algorithm.
-   The system shall show a useful error if no path exists.
-   Route weights and ETA shall be identified as simulated values.

### FR-06: Signal simulation

-   The system shall display each configured intersection and its
    simulated signal state.
-   When the corridor is activated, intersections on the chosen route
    shall change to `PRIORITY_GREEN`.
-   The system shall display an emergency-priority indicator.
-   The system shall restore normal states after completion or reset.
-   The system shall not send commands to real traffic signals.

### FR-07: Route progress

-   The dashboard shall show ordered route nodes and their status, such
    as Current, Priority active, Passed, or Destination.
-   Progress may be advanced by a demo control if automated location
    tracking is not available.

### FR-08: Event history

-   The system shall record timestamped events for detection, route
    calculation, corridor activation, completion/reset, and errors.
-   The latest event shall appear first.
-   In-memory storage is acceptable for the hackathon; JSON or SQLite
    persistence is optional.

### FR-09: Dashboard

-   The dashboard shall follow the supplied visual reference: light
    theme, navy typography, blue navigation, green priority status, red
    emergency indicator, rounded cards.
-   It shall include Live Monitor, Route & Map, Signal Control, Event
    History, and basic settings/source areas.
-   It shall show video, ambulance status, confidence, route, ETA,
    signal states, route progress, and event log.
-   Values not measured from a real source shall be labelled simulated
    or omitted.

### FR-10: Demo controls

-   The operator shall be able to start/stop monitoring.
-   The operator shall be able to mark the ambulance as arrived or reset
    the corridor.
-   Reset shall restore signal states without deleting the event
    history.

## 9. Non-Functional Requirements

-   **Usability:** Judges should understand the main flow within 30
    seconds.
-   **Resilience:** Model or video errors should not crash the whole
    dashboard.
-   **Performance:** Use frame sampling and resizing if inference is
    slow; exact FPS is not guaranteed.
-   **Security:** API keys must be stored in environment variables and
    excluded from Git.
-   **Transparency:** Distinguish actual model predictions from
    simulated data.
-   **Maintainability:** Keep detector, routing, signal simulation, and
    UI logic separate where practical.
-   **Portability:** Run on a typical laptop CPU with reduced frame rate
    if necessary; GPU is optional.

## 10. UI Requirements Based on the Reference Image

### Header

-   SafeCity AI title and "Ambulance Green Corridor" subtitle.
-   Primary navigation.
-   System state indicator.
-   Optional local clock.

### Left sidebar

-   Live Monitor (default selected).
-   Route & Map.
-   Signal Control.
-   Event History.
-   Analytics (basic event count only).
-   CCTV Sources.
-   Hospital Locations.
-   System Settings.

### CCTV card

-   Video frame.
-   Camera/source label.
-   Timestamp.
-   Live or Demo indicator.
-   Ambulance bounding box and confidence when returned by the model.

### Ambulance status cards

-   Ambulance detected: Yes/No.
-   Confidence score.
-   Estimated demo ETA.
-   Distance if configured in graph data.
-   Current speed must be omitted unless actually measured; otherwise
    label it as simulated.

### Route panel

-   Schematic map or route diagram.
-   Current node, hospital destination, route intersections, and demo
    ETA.
-   Do not fabricate a real street map or live traffic data.

### Traffic Signals Status

-   Card per simulated intersection.
-   Current simulated state.
-   Remaining seconds only if the simulator calculates them.

### Route Progress

-   Ordered route steps.
-   Current node and status of each route intersection.
-   Destination status.

### Event Log

-   Timestamped events.
-   Detection, route calculation, corridor activation, progress,
    completion, and errors.

### Emergency/support card

-   Show "Simulation only --- no real emergency dispatch connected."
-   Do not imply that Rescue 1122 has been contacted.

## 11. Technical Design Decisions

-   Use Python and Streamlit for rapid delivery.
-   Use an ambulance-specific model through Roboflow hosted inference if
    access and limits are verified.
-   Use local weights only if they are available and compatible.
-   Use OpenCV for video handling and drawing prediction overlays.
-   Use NetworkX for the simulated graph and Dijkstra route.
-   Use an explicit signal simulator, not real hardware integration.
-   Prefer in-memory event history first; add persistence only if time
    remains.

## 12. Error and Edge Cases

  -----------------------------------------------------------------------
  Scenario                            Expected result
  ----------------------------------- -----------------------------------
  No ambulance in frame               Corridor remains inactive

  Confidence below threshold          Prediction shown optionally; no
                                      activation

  Detection appears for one frame     Wait for confirmation
  only                                

  API key invalid                     Clear error and setup guidance

  API timeout                         Show inference unavailable; allow
                                      retry

  Unsupported video                   Explain supported format

  Route graph disconnected            Display no-route error

  User resets corridor                Restore normal simulated states

  No live GPS/location                Do not claim real ambulance
                                      position or live ETA

  API usage limit reached             Show failure; do not fake model
                                      success
  -----------------------------------------------------------------------

## 13. Acceptance Test Plan

-   [ ] A test image produces a valid response from the chosen model.
-   [ ] The returned class labels are inspected and ambulance label
    confirmed.
-   [ ] A clip with no ambulance does not activate priority.
-   [ ] Stable ambulance detections activate exactly one corridor event.
-   [ ] Route calculation returns the expected route on a known graph.
-   [ ] Only route intersections receive priority state.
-   [ ] Completion/reset restores normal states.
-   [ ] Event log contains timestamps and correct event ordering.
-   [ ] API and video failures show useful errors.
-   [ ] UI clearly labels simulated signals, route, ETA, speed, and
    dispatch status.
-   [ ] No real signal or emergency-service endpoint is invoked.

## 14. Three-Hour Delivery Plan

  -----------------------------------------------------------------------
  Time budget                         Priority
  ----------------------------------- -----------------------------------
  0--20 minutes                       Install dependencies and test one
                                      image against the model

  20--50 minutes                      Video input and detection overlay

  50--80 minutes                      Weighted graph and route
                                      calculation

  80--115 minutes                     Signal simulator and event
                                      lifecycle

  115--155 minutes                    Dashboard layout and route/status
                                      panels

  155--180 minutes                    End-to-end rehearsal and bug fixes
  -----------------------------------------------------------------------

### Cut line if behind schedule

1.  Keep recorded video; drop webcam.
2.  Keep one hospital; drop destination configuration.
3.  Use a schematic route instead of a live map.
4.  Keep four simulated intersections.
5.  Drop analytics and nonessential settings.
6.  Do not add siren detection, extra models, training, SMS, or
    real-world integration.

## 15. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Model does not detect ambulance     Test early; inspect classes; use a
  reliably                            suitable ambulance-specific model
                                      or permitted sample data

  Hosted API setup takes too long     Set a strict time limit; switch to
                                      available local weights if possible

  CPU/API inference is slow           Sample fewer frames and resize
                                      frames

  False positive activates corridor   Confidence threshold plus temporal
                                      confirmation and manual cancel

  Map feature consumes too much time  Use a clear schematic route

  Judges mistake simulation for real  Label all simulated values and
  control                             explain the prototype boundary
  -----------------------------------------------------------------------

## 16. Demo Narrative

"SafeCity AI detects an ambulance from a camera feed. Once the detection
is confirmed, it calculates a path to the selected hospital and
activates priority at the route's simulated intersections. The dashboard
tracks the route and records each event. This is a software simulation;
it does not control live signals or contact emergency services."

## 17. Future Enhancements (Not MVP)

-   GPS/AVL input from an authorised ambulance fleet.
-   Real road network and live traffic travel-time weights.
-   Multi-camera handoff and tracking.
-   Siren/audio confirmation.
-   Human verification and safety interlocks.
-   Secure, authorised traffic-signal controller integration.
-   Auditing, access control, reliability monitoring, and field
    validation.
-   Official emergency service integration only with formal approval.

## 18. Final Definition of Done

The MVP is complete when a recorded clip produces a genuine model
response, a confirmed ambulance event triggers a Dijkstra route, route
intersections change in the simulated dashboard, event history is
updated, and the operator can complete/reset the scenario without
crashing the app. All simulated behaviour is clearly labelled.
