import React from 'react';
import { 
  SlidersHorizontal, 
  Zap, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  Clock, 
  Activity, 
  AlertTriangle,
  ArrowRight,
  Radio
} from 'lucide-react';

export default function SignalControl({ 
  signals, 
  onOverrideSignal, 
  onCorridorAllGreen, 
  onCorridorReset, 
  showToast 
}) {
  return (
    <div className="flex flex-col gap-4 animate-tab-fade">
      {/* Top Banner / Master Corridor Controls */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-text-primary">
                Municipal SCATS / NTCIP Signal Override Console
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Live phase management for Abbottabad Green Corridor (Intersections 01 through 04).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                onCorridorAllGreen();
                showToast('Master Override: All corridor signals locked to GREEN (+60s).');
              }}
              className="btn btn-primary text-xs font-bold flex-1 md:flex-initial"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Corridor All Green</span>
            </button>
            <button
              onClick={() => {
                onCorridorReset();
                showToast('Master Override: Corridor signals reverted to autonomous adaptive cycling.');
              }}
              className="btn btn-secondary text-xs flex-1 md:flex-initial"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Adaptive Cycle</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Intersections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {signals.map((sig) => {
          const isGreen = sig.state === 'green';
          const isRed = sig.state === 'red';
          const isYellow = sig.state === 'yellow';

          return (
            <div 
              key={sig.id} 
              className={`card p-4 flex flex-col justify-between transition-all duration-200 ${
                isGreen ? 'border-success/40' : isRed ? 'border-danger/40' : 'border-border'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                    <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider">
                      {sig.code}
                    </span>
                    <h3 className="text-xs font-bold text-text-primary">
                      {sig.name}
                    </h3>
                  </div>
                  <span className={`badge ${
                    isGreen ? 'badge-success' : isRed ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {sig.priorityMode ? 'AI Priority' : 'Standard'}
                  </span>
                </div>

                {/* Signal Head Visualizer & Timer */}
                <div className="my-4 flex items-center justify-between bg-surface-elevated p-3 rounded-md border border-border">
                  {/* Traffic Light Head */}
                  <div className="bg-slate-950 p-2 rounded-md flex flex-col gap-2 border border-slate-800 shadow-inner">
                    <div 
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        isRed ? 'bg-danger shadow-md shadow-danger/50' : 'bg-danger/20'
                      }`}
                    />
                    <div 
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        isYellow ? 'bg-warning shadow-md shadow-warning/50' : 'bg-warning/20'
                      }`}
                    />
                    <div 
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        isGreen ? 'bg-success shadow-md shadow-success/50' : 'bg-success/20'
                      }`}
                    />
                  </div>

                  {/* Countdown Timer Display */}
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Phase Hold</span>
                    </div>
                    <div className={`text-3xl font-extrabold tabular-nums tracking-tight ${
                      isGreen ? 'text-success' : isRed ? 'text-danger' : 'text-warning'
                    }`}>
                      {String(sig.timer).padStart(2, '0')}<span className="text-xs font-medium text-text-muted ml-0.5">s</span>
                    </div>
                    <div className="text-[10px] text-text-secondary mt-0.5">
                      {sig.phase}
                    </div>
                  </div>
                </div>

                {/* Telemetry rows */}
                <div className="space-y-1.5 text-xs mb-4">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="flex items-center gap-1 text-text-muted">
                      <Radio className="w-3 h-3" />
                      <span>Approach Ingress</span>
                    </span>
                    <span className="font-semibold text-text-primary">Ambulance #AB-901</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="flex items-center gap-1 text-text-muted">
                      <Activity className="w-3 h-3" />
                      <span>Loop Sensor</span>
                    </span>
                    <span className="font-semibold text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Connected</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    onOverrideSignal(sig.id, 'force_green');
                    showToast(`${sig.code}: Forced GREEN phase extended (+60s).`);
                  }}
                  className="btn btn-success text-xs w-full font-bold"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Force Green (+60s)</span>
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      onOverrideSignal(sig.id, 'extend_15');
                      showToast(`${sig.code}: Extended current green hold by +15s.`);
                    }}
                    className="btn btn-secondary text-xs"
                  >
                    +15s Hold
                  </button>
                  <button
                    onClick={() => {
                      onOverrideSignal(sig.id, 'force_red');
                      showToast(`${sig.code}: Manually switched to RED.`);
                    }}
                    className="btn btn-secondary text-xs text-danger hover:border-danger hover:bg-danger-surface"
                  >
                    Force Red
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Protocol Note Card */}
      <div className="card p-4 bg-surface-elevated border-border">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-warning-surface text-warning border border-warning-border shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">
              NTCIP 1202 Standard Fail-Safe Protocol
            </h4>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Manual preemptions are bound by minimum clearance pedestrian intervals (8s flasher phase). If communication with SafeCity AI edge agent drops for &gt; 500ms, signals automatically drop to local actuated coordination mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
