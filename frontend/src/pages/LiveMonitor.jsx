import React, { useState } from 'react';
import { 
  Video, 
  EyeOff, 
  Flame, 
  MapPin, 
  Clock, 
  Zap, 
  ShieldAlert, 
  SlidersHorizontal,
  CheckCircle2,
  Trash2,
  ChevronRight
} from 'lucide-react';

export default function LiveMonitor({ 
  signals, 
  events, 
  onTriggerRescue, 
  onClearEvents, 
  onNavigate, 
  showToast 
}) {
  const [isOffline, setIsOffline] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-tab-fade">
      {/* CCTV Live Feed (Cols 1-7) */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <div className="card p-4">
          <div className="card-header">
            <div className="card-title">
              <Video className="w-4 h-4 text-accent" />
              <span>Live CCTV Camera Feed — CCTV-01 (Main Blvd)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsOffline(!isOffline);
                  showToast(isOffline ? 'CCTV-01 feed restored.' : 'CCTV-01 offline state simulated.');
                }}
                className="btn btn-secondary text-xs"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{isOffline ? 'Restore Feed' : 'Simulate Offline'}</span>
              </button>
              <button
                onClick={onTriggerRescue}
                className="btn btn-danger text-xs font-bold"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Alert Rescue 1122</span>
              </button>
            </div>
          </div>

          {/* Viewport Stage */}
          <div className="relative bg-slate-950 rounded-sm aspect-video overflow-hidden border border-border flex items-center justify-center">
            {isOffline ? (
              <div className="text-center p-6 text-danger">
                <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-extrabold">CCTV-01 OPTICAL FEED OFFLINE</div>
                <div className="text-xs text-text-muted mt-1">Main Boulevard signal lost. Fail-safe green corridor schedule maintained.</div>
              </div>
            ) : (
              <>
                {/* HUD Badges */}
                <div className="absolute top-2 left-2 z-20 bg-slate-900/90 border border-slate-700 text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
                  <span>CAM-01 | MAIN BLVD / JINNAH RD | 25.0 FPS</span>
                </div>
                <div className="absolute top-2 right-2 z-20 bg-danger text-white text-[10px] font-extrabold px-2 py-0.5 rounded-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                  <span>LIVE</span>
                </div>

                {/* Road Graphic Simulator */}
                <svg className="w-full h-full block" viewBox="0 0 640 360" preserveAspectRatio="none">
                  <rect width="640" height="360" fill="#1e293b" />
                  <line x1="213" y1="0" x2="213" y2="360" stroke="#475569" stroke-width="2" strokeDasharray="16 16" />
                  <line x1="426" y1="0" x2="426" y2="360" stroke="#475569" stroke-width="2" strokeDasharray="16 16" />
                  {/* Traffic Vehicles */}
                  <rect x="235" y="80" width="80" height="130" rx="6" fill="#334155" />
                  <rect x="70" y="170" width="75" height="110" rx="6" fill="#334155" />
                  <rect x="440" y="45" width="85" height="105" rx="6" fill="#334155" />
                  <rect x="470" y="210" width="35" height="60" rx="3" fill="#334155" />
                </svg>

                {/* Bounding Box Overlays */}
                <div className="absolute top-[22%] left-[36%] w-[14%] h-[38%] border-2 border-danger bg-danger/10 z-10 transition-all shadow-lg">
                  <div className="absolute -top-[19px] -left-[2px] bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t-sm flex items-center gap-1 whitespace-nowrap">
                    <span>Ambulance 0.94</span>
                  </div>
                </div>

                <div className="absolute top-[47%] left-[10%] w-[13%] h-[32%] border-2 border-accent bg-accent/10 z-10">
                  <div className="absolute -top-[19px] -left-[2px] bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t-sm">
                    Car 0.82
                  </div>
                </div>

                <div className="absolute top-[12%] left-[68%] w-[14%] h-[30%] border-2 border-accent bg-accent/10 z-10">
                  <div className="absolute -top-[19px] -left-[2px] bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t-sm">
                    Car 0.76
                  </div>
                </div>

                <div className="absolute top-[58%] left-[73%] w-[7%] h-[18%] border-2 border-warning bg-warning/10 z-10">
                  <div className="absolute -top-[19px] -left-[2px] bg-warning text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t-sm">
                    Moto 0.71
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3 Telemetry Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-3.5 hover:-translate-y-0.5 transition-transform">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <span>Detection Confidence</span>
              <ShieldAlert className="w-3.5 h-3.5 text-danger" />
            </div>
            <div className="text-2xl font-extrabold text-danger mt-1.5 tabular-nums">94.2%</div>
            <div className="text-[11px] text-text-secondary mt-0.5">Type-A Emergency Vehicle</div>
          </div>

          <div className="card p-3.5 hover:-translate-y-0.5 transition-transform">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <span>Estimated Arrival</span>
              <Clock className="w-3.5 h-3.5 text-success" />
            </div>
            <div className="text-2xl font-extrabold text-success mt-1.5 tabular-nums">3m 45s</div>
            <div className="text-[11px] text-text-secondary mt-0.5">Distance: 1.8 km to City Hospital</div>
          </div>

          <div className="card p-3.5 hover:-translate-y-0.5 transition-transform">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <span>Corridor Speed</span>
              <Zap className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-2xl font-extrabold text-text-primary mt-1.5 tabular-nums">58 km/h</div>
            <div className="text-[11px] text-success font-bold mt-0.5">Time Saved: +4.2 mins vs normal</div>
          </div>
        </div>
      </div>

      {/* Corridor Map Preview (Cols 8-12) */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <div className="card p-4 flex-1 flex flex-col">
          <div className="card-header">
            <div className="card-title">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Corridor Path (Abbottabad Grid)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-text-secondary">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Green</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger" /> Unit</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Hospital</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="flex-1 min-h-[260px] bg-slate-950 rounded-sm border border-border relative overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full block" viewBox="0 0 500 300">
              {/* Roads */}
              <path d="M40 150 L460 150" stroke="#334155" strokeWidth="14" fill="none" />
              <path d="M120 40 L120 260" stroke="#1e293b" strokeWidth="8" fill="none" />
              <path d="M220 40 L220 260" stroke="#1e293b" strokeWidth="8" fill="none" />
              <path d="M320 40 L320 260" stroke="#1e293b" strokeWidth="8" fill="none" />
              <path d="M420 40 L420 260" stroke="#1e293b" strokeWidth="8" fill="none" />

              {/* Green Corridor Wave */}
              <path 
                d="M40 150 L460 150" 
                stroke="var(--success)" 
                strokeWidth="6" 
                strokeDasharray="10 6" 
                className="animate-corridor-dash" 
                fill="none" 
              />

              {/* Intersections */}
              {signals.map((sig, idx) => {
                const cx = 120 + idx * 100;
                return (
                  <g key={sig.id}>
                    <circle cx={cx} cy="150" r="10" fill="var(--success)" />
                    <text x={cx} y="180" fill="#94a3b8" fontSize="10" fontWeight="700" textAnchor="middle">
                      Int-0{sig.id} ({sig.timer}s)
                    </text>
                  </g>
                );
              })}

              {/* Moving Ambulance Beacon */}
              <g transform="translate(170, 150)">
                <circle cx="0" cy="0" r="12" fill="none" stroke="var(--danger)" className="beacon-ripple" />
                <circle cx="0" cy="0" r="12" fill="var(--danger)" stroke="#ffffff" strokeWidth="2" />
                <path d="M-5 -2 H-2 V-5 H2 V-2 H5 V2 H2 V5 H-2 V2 H-5 Z" fill="#ffffff" />
              </g>

              {/* Destination Hospital Marker */}
              <g transform="translate(460, 150)">
                <rect x="-14" y="-14" width="28" height="28" rx="4" fill="var(--accent)" stroke="#ffffff" strokeWidth="2" />
                <path d="M-6 -2 H-2 V-6 H2 V-2 H6 V2 H2 V6 H-2 V2 H-6 Z" fill="#ffffff" />
              </g>
            </svg>
          </div>

          <button 
            onClick={() => onNavigate('route')}
            className="btn btn-secondary w-full justify-center mt-3 text-xs"
          >
            <span>Open Full Interactive Corridor Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Signals Strip & Event Feed (Full Width 12 Cols) */}
      <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Signals Panel (Cols 1-6) */}
        <div className="lg:col-span-6 card p-4">
          <div className="card-header">
            <div className="card-title">
              <SlidersHorizontal className="w-4 h-4 text-accent" />
              <span>Intersections 1–4 (Preemption Timers)</span>
            </div>
            <button 
              onClick={() => onNavigate('signals')} 
              className="btn btn-secondary text-[11px] py-1 px-2.5"
            >
              Control Center
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {signals.map((sig) => (
              <div key={sig.id} className="bg-surface-elevated border border-border rounded-sm p-3 text-center hover:border-accent transition-colors">
                <div className="text-[11px] font-bold text-text-secondary truncate mb-2">{sig.name}</div>
                <div className="w-7 h-7 rounded-full bg-success border-2 border-success shadow-md mx-auto mb-2 flex items-center justify-center text-white text-[10px] font-bold">
                  ●
                </div>
                <div className="text-lg font-extrabold text-text-primary tabular-nums">{sig.timer}s</div>
                <div className="text-[9px] font-bold text-success uppercase mt-0.5">Preempted</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Feed (Cols 7-12) */}
        <div className="lg:col-span-6 card p-4">
          <div className="card-header">
            <div className="card-title">
              <Clock className="w-4 h-4 text-accent" />
              <span>Corridor Event Log</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onClearEvents}
                className="btn btn-secondary text-[11px] py-1 px-2.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
              <button 
                onClick={() => onNavigate('events')} 
                className="btn btn-secondary text-[11px] py-1 px-2.5"
              >
                <span>Full Audit</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="text-center text-text-muted text-xs py-6">No active corridor alerts.</div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between p-2 rounded-sm bg-surface-elevated border border-border-subtle text-xs hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-text-muted shrink-0 tabular-nums">{evt.time}</span>
                    <span className="truncate">{evt.detail}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm shrink-0 ml-2 uppercase
                    ${evt.tag === 'Active' ? 'bg-success-surface text-success border border-success-border' : 
                      evt.tag === 'Dispatched' ? 'bg-danger-surface text-danger border border-danger-border' : 
                      'bg-accent-surface text-accent'}
                  `}>
                    {evt.tag}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
