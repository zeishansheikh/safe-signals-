import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Play, 
  RotateCcw, 
  Gauge, 
  Clock, 
  Send, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export default function RouteMap({ showToast }) {
  const [ambulanceX, setAmbulanceX] = useState(120);
  const [simSpeed, setSimSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAmbulanceX((prev) => (prev > 620 ? 80 : prev + 1.2 * simSpeed));
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-tab-fade">
      {/* Interactive Map Viewport (Cols 1-8) */}
      <div className="lg:col-span-8 flex flex-col gap-3">
        <div className="card p-4 flex-1 flex flex-col">
          <div className="card-header">
            <div className="card-title">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Full Interactive Corridor Navigation (Abbottabad Grid)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAmbulanceX(80);
                  setIsPlaying(true);
                  showToast('Ambulance transit simulation restarted from origin.');
                }}
                className="btn btn-secondary text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Transit</span>
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn btn-primary text-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>
            </div>
          </div>

          {/* Widescreen SVG Map Canvas */}
          <div className="flex-1 min-h-[380px] bg-slate-950 rounded-sm border border-border relative overflow-hidden flex items-center justify-center p-2">
            <svg className="w-full h-full block" viewBox="0 0 720 420">
              {/* Arterial Corridors */}
              <path d="M50 210 L670 210" stroke="#334155" strokeWidth="22" fill="none" />
              <path d="M150 50 L150 370" stroke="#1e293b" strokeWidth="12" fill="none" />
              <path d="M290 50 L290 370" stroke="#1e293b" strokeWidth="12" fill="none" />
              <path d="M430 50 L430 370" stroke="#1e293b" strokeWidth="12" fill="none" />
              <path d="M570 50 L570 370" stroke="#1e293b" strokeWidth="12" fill="none" />

              {/* Preempted Green Wave Line */}
              <path 
                d="M50 210 L670 210" 
                stroke="var(--success)" 
                strokeWidth="8" 
                strokeDasharray="14 8" 
                className="animate-corridor-dash" 
                fill="none" 
              />

              {/* Intersections Along Route */}
              <g transform="translate(150, 210)">
                <circle cx="0" cy="0" r="14" fill="var(--success)" />
                <text x="0" y="32" fill="#94a3b8" fontSize="11" fontWeight="700" textAnchor="middle">Int-01 Jinnah (42s)</text>
              </g>

              <g transform="translate(290, 210)">
                <circle cx="0" cy="0" r="14" fill="var(--success)" />
                <text x="0" y="32" fill="#94a3b8" fontSize="11" fontWeight="700" textAnchor="middle">Int-02 Cantt (55s)</text>
              </g>

              <g transform="translate(430, 210)">
                <circle cx="0" cy="0" r="14" fill="var(--success)" />
                <text x="0" y="32" fill="#94a3b8" fontSize="11" fontWeight="700" textAnchor="middle">Int-03 Mandian (68s)</text>
              </g>

              <g transform="translate(570, 210)">
                <circle cx="0" cy="0" r="14" fill="var(--success)" />
                <text x="0" y="32" fill="#94a3b8" fontSize="11" fontWeight="700" textAnchor="middle">Int-04 Hospital (90s)</text>
              </g>

              {/* Dynamic Moving Ambulance Beacon */}
              <g transform={`translate(${ambulanceX}, 210)`}>
                <circle cx="0" cy="0" r="16" fill="none" stroke="var(--danger)" className="beacon-ripple" />
                <circle cx="0" cy="0" r="16" fill="var(--danger)" stroke="#ffffff" strokeWidth="2.5" />
                <path d="M-6 -2 H-2 V-6 H2 V-2 H6 V2 H2 V6 H-2 V2 H-6 Z" fill="#ffffff" />
              </g>

              {/* City Hospital Destination */}
              <g transform="translate(670, 210)">
                <rect x="-18" y="-18" width="36" height="36" rx="6" fill="var(--accent)" stroke="#ffffff" strokeWidth="2" />
                <path d="M-8 -3 H-3 V-8 H3 V-3 H8 V3 H3 V8 H-3 V3 H-8 Z" fill="#ffffff" />
                <text x="0" y="32" fill="var(--accent)" fontSize="11" fontWeight="800" textAnchor="middle">City Hospital</text>
              </g>
            </svg>
          </div>

          {/* Speed Controls Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 p-3 bg-surface-elevated border border-border rounded-md text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-secondary">Simulation Multiplier:</span>
              <button 
                onClick={() => { setSimSpeed(1); showToast('Speed: 1x Normal Transit'); }}
                className={`btn text-xs py-1 px-2.5 ${simSpeed === 1 ? 'btn-primary' : 'btn-secondary'}`}
              >
                1x Normal
              </button>
              <button 
                onClick={() => { setSimSpeed(2); showToast('Speed: 2x Fast Transit'); }}
                className={`btn text-xs py-1 px-2.5 ${simSpeed === 2 ? 'btn-primary' : 'btn-secondary'}`}
              >
                2x Fast
              </button>
              <button 
                onClick={() => { setSimSpeed(4); showToast('Speed: 4x Rush Transit'); }}
                className={`btn text-xs py-1 px-2.5 ${simSpeed === 4 ? 'btn-primary' : 'btn-secondary'}`}
              >
                4x Rush
              </button>
            </div>
            <div className="text-success font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Continuous Preemption Maintained Across All 4 Intersections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corridor Telemetry Cards (Cols 9-12) */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        <div className="card p-4 flex flex-col gap-3">
          <div className="card-header">
            <div className="card-title">
              <Gauge className="w-4 h-4 text-accent" />
              <span>Route Telemetry Profile</span>
            </div>
          </div>

          <div className="p-3 bg-surface-elevated border border-border rounded-md text-xs">
            <div className="text-[10px] uppercase font-bold text-text-muted">Origin Node</div>
            <div className="text-sm font-bold text-text-primary mt-0.5">CCTV-01 Main Boulevard / Jinnah Rd</div>
            <div className="text-[11px] text-text-secondary mt-0.5">Coordinates: 34.1688° N, 73.2215° E</div>
          </div>

          <div className="p-3 bg-surface-elevated border border-border rounded-md text-xs">
            <div className="text-[10px] uppercase font-bold text-text-muted">Destination Node</div>
            <div className="text-sm font-bold text-text-primary mt-0.5">City Hospital Abbottabad (Emergency ER)</div>
            <div className="text-[11px] text-text-secondary mt-0.5">Coordinates: 34.1750° N, 73.2350° E</div>
          </div>

          <div className="p-3 bg-surface-elevated border border-border rounded-md text-xs">
            <div className="text-[10px] uppercase font-bold text-text-muted">Impact Metrics Comparison</div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border">
              <div>
                <div className="text-[10px] text-text-muted">Standard</div>
                <div className="text-base font-extrabold text-danger tabular-nums">8m 05s</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted">Corridor</div>
                <div className="text-base font-extrabold text-success tabular-nums">3m 45s</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted">Saved</div>
                <div className="text-base font-extrabold text-accent tabular-nums">+4.2m</div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => showToast('Corridor route packet transmitted to Rescue 1122 active dispatch network.')}
            className="btn btn-primary w-full justify-center text-xs py-2.5 font-bold mt-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Telemetry to Rescue 1122</span>
          </button>
        </div>
      </div>
    </div>
  );
}
