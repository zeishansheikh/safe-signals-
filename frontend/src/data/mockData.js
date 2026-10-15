// SafeCity AI — Abbottabad Corridor Mock Data

export const initialCameras = [
  { id: 'cam-01', name: 'CAM-01 Main Blvd / Jinnah Rd', location: 'Main Boulevard, Abbottabad', fps: 25.0, status: 'online', isLive: true, resolution: '1080p' },
  { id: 'cam-02', name: 'CAM-02 Cantt Chowk Junction', location: 'Cantt Area, Abbottabad', fps: 30.0, status: 'online', isLive: false, resolution: '1080p' },
  { id: 'cam-03', name: 'CAM-03 Mandian Commercial', location: 'Mandian, Abbottabad', fps: 25.0, status: 'online', isLive: false, resolution: '1080p' },
  { id: 'cam-04', name: 'CAM-04 Hospital Approach Road', location: 'Hospital Road, Abbottabad', fps: 30.0, status: 'online', isLive: false, resolution: '1080p' },
  { id: 'cam-05', name: 'CAM-05 Karakoram Hwy North', location: 'KKH Bypass, Abbottabad', fps: 0.0, status: 'standby', isLive: false, resolution: '720p' },
  { id: 'cam-06', name: 'CAM-06 Supply Bazar Crossing', location: 'Supply Bazar, Abbottabad', fps: 25.0, status: 'online', isLive: false, resolution: '1080p' },
];

export const initialIntersections = [
  { id: 1, code: 'INT-01', name: 'Int-01 Main / Jinnah', timer: 42, state: 'green', priorityMode: true, phase: 'North-South Priority' },
  { id: 2, code: 'INT-02', name: 'Int-02 Cantt Chowk', timer: 55, state: 'green', priorityMode: true, phase: 'Main Corridor Clear' },
  { id: 3, code: 'INT-03', name: 'Int-03 Mandian Rd', timer: 68, state: 'green', priorityMode: true, phase: 'Commercial Bypass Clearance' },
  { id: 4, code: 'INT-04', name: 'Int-04 Hospital Chowk', timer: 90, state: 'green', priorityMode: true, phase: 'ER Gate Ingress Priority' },
];

export const hospitalsList = [
  {
    id: 'hosp-01',
    name: 'City Hospital Abbottabad',
    type: 'Trauma Center Level-1',
    address: 'Main Boulevard, Abbottabad',
    distanceKm: 1.8,
    eta: '3m 45s',
    icuBeds: 12,
    triageStatus: 'On Standby',
    phone: '+92 992 112201',
    isTarget: true
  },
  {
    id: 'hosp-02',
    name: 'Ayub Teaching Hospital (ATH)',
    type: 'Tertiary Teaching Hospital',
    address: 'Mandian, Abbottabad',
    distanceKm: 4.6,
    eta: '8m 20s',
    icuBeds: 28,
    triageStatus: 'Available',
    phone: '+92 992 381907',
    isTarget: false
  },
  {
    id: 'hosp-03',
    name: 'DHQ Hospital Abbottabad',
    type: 'District Headquarters',
    address: 'Cantt, Abbottabad',
    distanceKm: 3.1,
    eta: '5m 50s',
    icuBeds: 4,
    triageStatus: 'Busy',
    phone: '+92 992 931011',
    isTarget: false
  }
];

export const initialEvents = [
  { id: 1, time: '11:48:15', type: 'Preemption', source: 'INT-01 to INT-04', detail: 'Synchronized Green Corridor active for Abbottabad corridor', tag: 'Active', auditor: 'Automated AI Engine' },
  { id: 2, time: '11:47:50', type: 'Routing', source: 'OSRM Route Engine', detail: 'Route to City Hospital plotted (1.8 km, 3m 45s ETA)', tag: 'Routed', auditor: 'System Core' },
  { id: 3, time: '11:47:22', type: 'Detection', source: 'CCTV-01 Main Blvd', detail: 'Ambulance #AB-901 flagged (Confidence score: 0.942)', tag: 'Detected', auditor: 'YOLOv8 Edge Mock' },
  { id: 4, time: '11:25:04', type: 'Arrival', source: 'City Hospital ER Gate', detail: 'Ambulance #AB-840 completed corridor run. Time saved: 4.5 mins', tag: 'Completed', auditor: 'Rescue 1122 Unit' },
  { id: 5, time: '10:52:10', type: 'Dispatch', source: 'Rescue 1122 Central', detail: 'Critical cardiac trauma dispatch alerted for Main Blvd', tag: 'Dispatched', auditor: 'Operator Desk 02' },
];
