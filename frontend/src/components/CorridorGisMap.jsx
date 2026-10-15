import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  Eye, 
  Activity, 
  MapPin, 
  ShieldAlert,
  Clock,
  Radio,
  Sliders
} from 'lucide-react';

export default function CorridorGisMap({ 
  signals = [], 
  ambulanceX = 170, 
  destination = 'HOSPITAL_CITY',
  destinationName = 'City Hospital Abbottabad',
  compact = false,
  showToast 
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCongestion, setShowCongestion] = useState(true);
  const [showCctvFov, setShowCctvFov] = useState(true);
  const [showSignalHeads, setShowSignalHeads] = useState(true);
  const [selectedIntersection, setSelectedIntersection] = useState(null);

  // Default signal data fallback if not provided
  const activeSignals = signals.length > 0 ? signals : [
    { id: 1, name: 'Int-01 Main / Jinnah', timer: 42, state: 'green' },
    { id: 2, name: 'Int-02 Cantt Chowk', timer: 55, state: 'green' },
    { id: 3, name: 'Int-03 Mandian Rd', timer: 68, state: 'green' },
    { id: 4, name: 'Int-04 Hospital Chowk', timer: 90, state: 'green' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none bg-slate-950 text-slate-100 rounded-sm">
      {/* Top Map HUD Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left GIS Breadcrumb / Coordinates */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded px-2.5 py-1 flex items-center gap-2 pointer-events-auto shadow-lg">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-[10px] font-mono font-bold tracking-tight text-slate-200">
            GIS: 34.1688° N, 73.2215° E | ABBOTTABAD GRID (N-35)
          </span>
        </div>

        {/* Right Layer Toggles */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {!compact && (
            <>
              <button
                onClick={() => {
                  setShowCongestion(!showCongestion);
                  if (showToast) showToast(showCongestion ? 'Cross-traffic congestion layer hidden.' : 'Cross-traffic congestion layer enabled.');
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${
                  showCongestion 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                    : 'bg-slate-900/80 text-slate-400 border-slate-700'
                }`}
                title="Toggle traffic queue congestion on cross-streets"
              >
                Traffic Queues
              </button>

              <button
                onClick={() => {
                  setShowCctvFov(!showCctvFov);
                  if (showToast) showToast(showCctvFov ? 'CCTV optical FOV hidden.' : 'CCTV optical FOV enabled.');
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${
                  showCctvFov 
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm' 
                    : 'bg-slate-900/80 text-slate-400 border-slate-700'
                }`}
                title="Toggle camera optical field-of-view cone"
              >
                CCTV FOV
              </button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded overflow-hidden shadow-lg">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
              className="px-2 py-1 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 hover:bg-slate-800 text-slate-300 text-[10px] font-mono border-x border-slate-700 transition-colors"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
              className="px-2 py-1 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors"
              title="Zoom Out"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        <svg 
          className="w-full h-full block transition-transform duration-300 origin-center" 
          viewBox="0 0 840 480"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
            </pattern>

            {/* Glowing Corridor Filter */}
            <filter id="corridorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pulsing Beacon Gradient */}
            <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Map Base Canvas Fill & Grid */}
          <rect width="840" height="480" fill="#090d16" />
          <rect width="840" height="480" fill="url(#gisGrid)" />

          {/* Urban District Parcels / Building Blocks */}
          <g opacity="0.35">
            {/* Cantonment Zone */}
            <rect x="50" y="30" width="130" height="150" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="115" y="110" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1">CANTT ZONE</text>

            {/* Supply Commercial Sector */}
            <rect x="220" y="30" width="130" height="150" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="285" y="110" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1">SUPPLY SECTOR</text>

            {/* Medical Complex District */}
            <rect x="390" y="30" width="130" height="150" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="455" y="110" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1">CIVIL SECTOR</text>

            {/* Hospital Perimeter Park */}
            <rect x="560" y="30" width="220" height="150" rx="6" fill="#142838" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 2" />
            <text x="670" y="110" fill="#38bdf8" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="1">HOSPITAL CAMPUS</text>

            {/* Southern Residential Grid */}
            <rect x="50" y="300" width="130" height="140" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="115" y="375" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1">JINNAH COLONY</text>

            <rect x="220" y="300" width="130" height="140" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="285" y="375" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1">MANDIAN BAZAR</text>

            <rect x="390" y="300" width="130" height="140" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="455" y="375" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1">MURREE ROAD LINK</text>

            <rect x="560" y="300" width="220" height="140" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="670" y="375" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="1">TRAUMA REC DISTRICT</text>
          </g>

          {/* Secondary Cross-Streets (Held at RED during preemption) */}
          <g>
            {/* Murree Rd & Jinnah link */}
            <path d="M115 15 L115 465" stroke="#1e293b" strokeWidth="26" fill="none" />
            <path d="M115 15 L115 465" stroke="#334155" strokeWidth="16" fill="none" />
            
            {/* Cantt Commercial link */}
            <path d="M285 15 L285 465" stroke="#1e293b" strokeWidth="26" fill="none" />
            <path d="M285 15 L285 465" stroke="#334155" strokeWidth="16" fill="none" />

            {/* Mandian Bypass Link */}
            <path d="M455 15 L455 465" stroke="#1e293b" strokeWidth="26" fill="none" />
            <path d="M455 15 L455 465" stroke="#334155" strokeWidth="16" fill="none" />

            {/* Hospital ER Way */}
            <path d="M625 15 L625 465" stroke="#1e293b" strokeWidth="26" fill="none" />
            <path d="M625 15 L625 465" stroke="#334155" strokeWidth="16" fill="none" />

            {/* Cross-street lane markings */}
            <line x1="115" y1="20" x2="115" y2="200" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />
            <line x1="115" y1="280" x2="115" y2="460" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />

            <line x1="285" y1="20" x2="285" y2="200" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />
            <line x1="285" y1="280" x2="285" y2="460" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />

            <line x1="455" y1="20" x2="455" y2="200" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />
            <line x1="455" y1="280" x2="455" y2="460" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />

            <line x1="625" y1="20" x2="625" y2="200" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />
            <line x1="625" y1="280" x2="625" y2="460" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />
          </g>

          {/* Traffic Congestion Queue Ribbons (Orange/Red cross-traffic held at Red lights) */}
          {showCongestion && (
            <g opacity="0.85">
              {/* Int-01 North queue */}
              <line x1="115" y1="120" x2="115" y2="210" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <line x1="115" y1="270" x2="115" y2="340" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

              {/* Int-02 queues */}
              <line x1="285" y1="90" x2="285" y2="210" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <line x1="285" y1="270" x2="285" y2="360" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

              {/* Int-03 queues */}
              <line x1="455" y1="110" x2="455" y2="210" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <line x1="455" y1="270" x2="455" y2="330" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {/* Primary Arterial Highway (Karakoram Highway / Main Blvd N-35) */}
          <g>
            {/* Asphalt Base Roadbed */}
            <path d="M20 240 L820 240" stroke="#0f172a" strokeWidth="44" strokeLinecap="round" />
            <path d="M20 240 L820 240" stroke="#1e293b" strokeWidth="36" strokeLinecap="round" />
            <path d="M20 240 L820 240" stroke="#334155" strokeWidth="28" strokeLinecap="round" />

            {/* Road Edge Curb Markings */}
            <line x1="20" y1="225" x2="820" y2="225" stroke="#475569" strokeWidth="1" strokeDasharray="8 4" />
            <line x1="20" y1="255" x2="820" y2="255" stroke="#475569" strokeWidth="1" strokeDasharray="8 4" />

            {/* Glowing Emergency Green Corridor Wave */}
            <path 
              d="M20 240 L820 240" 
              stroke="#22c55e" 
              strokeWidth="10" 
              strokeDasharray="16 8" 
              className="animate-corridor-dash" 
              filter="url(#corridorGlow)"
              fill="none" 
            />

            {/* Arterial Highway Labels */}
            <text x="50" y="215" fill="#94a3b8" fontSize="10" fontWeight="800" letterSpacing="1">
              KARAKORAM HWY (N-35) / MAIN BOULEVARD
            </text>
            <text x="50" y="275" fill="#475569" fontSize="9" fontWeight="700">
              ABBOTTABAD CENTRAL CORRIDOR • SPEED LIMIT: 60 KM/H
            </text>
          </g>

          {/* CCTV-01 Camera Optical Field of View (FOV) Cone */}
          {showCctvFov && (
            <g transform="translate(60, 240)">
              {/* Cone of Vision */}
              <polygon points="0,0 120,-60 120,60" fill="#0284c7" opacity="0.18" />
              <line x1="0" y1="0" x2="120" y2="-60" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
              <line x1="0" y1="0" x2="120" y2="60" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
              {/* CCTV Pole & Icon */}
              <circle cx="0" cy="0" r="12" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <path d="M-4 -3 L2 -3 L6 -5 L6 5 L2 3 L-4 3 Z" fill="#ffffff" />
              <text x="0" y="-18" fill="#38bdf8" fontSize="9" fontWeight="800" textAnchor="middle">
                CCTV-01 (YOLOv8)
              </text>
            </g>
          )}

          {/* 4 Multi-Aspect Traffic Signals Along Corridor */}
          {activeSignals.map((sig, idx) => {
            const cx = 115 + idx * 170;
            const isHovered = selectedIntersection === sig.id;

            return (
              <g 
                key={sig.id} 
                transform={`translate(${cx}, 240)`}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedIntersection(selectedIntersection === sig.id ? null : sig.id);
                  if (showToast) showToast(`Inspecting ${sig.name}: Phase held at PRIORITY_GREEN (${sig.timer}s remaining)`);
                }}
              >
                {/* Intersection Circle Footprint */}
                <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#22c55e" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="14" fill="#22c55e" className="animate-pulse" opacity="0.8" />

                {/* Physical 3-Aspect Traffic Signal Head Graphic */}
                <g transform="translate(18, -45)">
                  {/* Signal Box */}
                  <rect x="-10" y="-2" width="20" height="42" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                  {/* Red Lamp (Cross Traffic) */}
                  <circle cx="0" cy="6" r="4" fill="#ef4444" opacity="0.4" />
                  {/* Amber Lamp */}
                  <circle cx="0" cy="18" r="4" fill="#f59e0b" opacity="0.2" />
                  {/* Green Lamp (Corridor Priority - Glowing) */}
                  <circle cx="0" cy="30" r="5" fill="#22c55e" className="animate-pulse" filter="url(#corridorGlow)" />
                </g>

                {/* Countdown Timer Badge */}
                <g transform="translate(0, 36)">
                  <rect x="-30" y="-10" width="60" height="20" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <text x="0" y="4" fill="#22c55e" fontSize="11" fontWeight="800" textAnchor="middle" className="tabular-nums">
                    {sig.timer}s
                  </text>
                </g>

                {/* Intersection Name Label */}
                <text x="0" y="-30" fill="#e2e8f0" fontSize="10" fontWeight="700" textAnchor="middle">
                  {sig.name.split(' ')[0]}
                </text>
                <text x="0" y="-18" fill="#94a3b8" fontSize="8.5" fontWeight="600" textAnchor="middle">
                  {sig.name.split(' ').slice(1).join(' ')}
                </text>

                {/* Interactive Tooltip Popover */}
                {isHovered && (
                  <g transform="translate(0, -95)" className="z-30">
                    <rect x="-70" y="-15" width="140" height="48" rx="4" fill="#020617" stroke="#22c55e" strokeWidth="1.5" />
                    <text x="0" y="0" fill="#ffffff" fontSize="9.5" fontWeight="800" textAnchor="middle">
                      {sig.name}
                    </text>
                    <text x="0" y="14" fill="#22c55e" fontSize="8.5" fontWeight="700" textAnchor="middle">
                      PRIORITY_GREEN: Hold active
                    </text>
                    <text x="0" y="26" fill="#94a3b8" fontSize="8" textAnchor="middle">
                      Cross approach: Holding Red
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Moving Ambulance Beacon Along Real Coordinates */}
          <g transform={`translate(${ambulanceX || 170}, 240)`}>
            {/* Pulsing Sonar Ring */}
            <circle cx="0" cy="0" r="28" fill="url(#beaconGlow)" className="beacon-ripple" />
            <circle cx="0" cy="0" r="18" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />

            {/* White Emergency Cross on Vehicle */}
            <path d="M-6 -2 H-2 V-6 H2 V-2 H6 V2 H2 V6 H-2 V2 H-6 Z" fill="#ffffff" />

            {/* Vehicle Telemetry Tooltip Pill */}
            <g transform="translate(0, -32)">
              <rect x="-55" y="-11" width="110" height="22" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
              <text x="0" y="4" fill="#ffffff" fontSize="9.5" fontWeight="800" textAnchor="middle">
                AB-901 • 58 KM/H
              </text>
            </g>
          </g>

          {/* Destination Hospital Campus Node (City General Hospital / Ayub Trauma) */}
          <g transform="translate(760, 240)">
            {/* Hospital Geofence Zone Ping */}
            <circle cx="0" cy="0" r="42" fill="#0284c7" opacity="0.1" />
            <circle cx="0" cy="0" r="32" fill="#0284c7" opacity="0.2" className="animate-pulse" />

            {/* Hospital Building Base Block */}
            <rect x="-24" y="-24" width="48" height="48" rx="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
            {/* Hospital Cross Logo */}
            <path d="M-9 -3 H-3 V-9 H3 V-3 H9 V3 H3 V9 H-3 V3 H-9 Z" fill="#ffffff" />

            {/* Helipad Symbol */}
            <g transform="translate(0, -38)">
              <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#38bdf8" fontSize="9" fontWeight="900" textAnchor="middle">H</text>
            </g>

            {/* Destination Name Tag */}
            <g transform="translate(0, 38)">
              <rect x="-65" y="-10" width="130" height="22" rx="4" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
              <text x="0" y="4.5" fill="#38bdf8" fontSize="10" fontWeight="800" textAnchor="middle">
                {destination === 'HOSPITAL_TRAUMA' ? 'AYUB TRAUMA CENTER' : 'CITY GENERAL HOSPITAL'}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Map Status Legend Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-2 px-3 flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span>Green Corridor Wave Active</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse-dot" />
            <span>Ambulance #AB-901</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent" />
            <span>{destinationName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
          <span>NTCIP-1202 PREEMPTION PROTOCOL</span>
          <span>•</span>
          <span className="text-success font-bold">ALL CONFLICTS CLEARED</span>
        </div>
      </div>
    </div>
  );
}
