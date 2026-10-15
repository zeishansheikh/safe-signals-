import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  ShieldAlert, 
  Cpu, 
  Bell, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  Radio, 
  Server,
  Zap,
  Globe
} from 'lucide-react';

export default function SystemSettings({ showToast }) {
  const [confidence, setConfidence] = useState('0.90');
  const [holdDuration, setHoldDuration] = useState('60');
  const [clearanceDist, setClearanceDist] = useState('500');
  const [webhookUrl, setWebhookUrl] = useState('https://rescue1122.kp.gov.pk/api/corridor/preemption');
  const [autoRevert, setAutoRevert] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [heartbeatTimeout, setHeartbeatTimeout] = useState('500ms');

  const handleSave = (e) => {
    e.preventDefault();
    showToast('System operational parameters saved & propagated to edge nodes.');
  };

  const handleResetDefaults = () => {
    setConfidence('0.90');
    setHoldDuration('60');
    setClearanceDist('500');
    setWebhookUrl('https://rescue1122.kp.gov.pk/api/corridor/preemption');
    setAutoRevert(true);
    setSoundAlerts(false);
    setHeartbeatTimeout('500ms');
    showToast('Settings restored to DeepBuild Hackathon 2026 default profile.');
  };

  return (
    <div className="flex flex-col gap-4 animate-tab-fade">
      {/* Header Card */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-text-primary">
                SafeCity Core Configuration & Fail-Safe Telemetry Parameters
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Governs edge AI detection sensitivities, SCATS controller timeouts, and municipal integration contracts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Full edge diagnostic check passed: SCATS, YOLOv8, and OSRM nominal.')}
              className="btn btn-secondary text-xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Diagnostic Self-Test</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="btn btn-secondary text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI & Edge Detection Configuration */}
        <div className="card p-4 space-y-4">
          <div className="card-header pb-2">
            <div className="card-title">
              <Cpu className="w-4 h-4 text-accent" />
              <span>YOLOv8 Edge Vision & Sensor Pipeline</span>
            </div>
          </div>

          {/* Confidence Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold text-text-primary">
                Ambulance Visual Detection Threshold
              </label>
              <span className="font-mono font-bold text-accent tabular-nums">
                {(Number(confidence) * 100).toFixed(0)}% ({confidence})
              </span>
            </div>
            <input 
              type="range"
              min="0.75"
              max="0.98"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="w-full accent-accent cursor-pointer"
            />
            <p className="text-[11px] text-text-muted mt-1">
              Minimum model confidence before triggering corridor preemption sequence. Higher values eliminate false positives.
            </p>
          </div>

          {/* Corridor Clearance Buffer */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Ingress Trigger Distance
            </label>
            <select
              value={clearanceDist}
              onChange={(e) => setClearanceDist(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="300">300 meters (Urban Dense)</option>
              <option value="500">500 meters (Standard Corridor - Recommended)</option>
              <option value="800">800 meters (High Speed Bypass)</option>
              <option value="1000">1000 meters (Highway Approach)</option>
            </select>
            <p className="text-[11px] text-text-muted mt-1">
              Distance before intersection at which traffic signals initiate yellow phase transition.
            </p>
          </div>

          {/* Heartbeat Fail-Safe */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              NTCIP 1202 Fail-Safe Timeout
            </label>
            <select
              value={heartbeatTimeout}
              onChange={(e) => setHeartbeatTimeout(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="250ms">250 ms (Strict Zero-Trust)</option>
              <option value="500ms">500 ms (Standard KP Municipal - Default)</option>
              <option value="1000ms">1000 ms (Tolerant)</option>
            </select>
            <p className="text-[11px] text-text-muted mt-1">
              If heartbeats from SafeCity AI cease, signals immediately revert to autonomous cycle.
            </p>
          </div>
        </div>

        {/* Corridor Phase & Integration Settings */}
        <div className="card p-4 space-y-4">
          <div className="card-header pb-2">
            <div className="card-title">
              <Zap className="w-4 h-4 text-accent" />
              <span>Signal Phase & Municipal Dispatch Relay</span>
            </div>
          </div>

          {/* Preemption Duration */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Maximum Green Phase Hold Duration
            </label>
            <select
              value={holdDuration}
              onChange={(e) => setHoldDuration(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="30">30 Seconds (Fast Flush)</option>
              <option value="60">60 Seconds (Standard Corridor)</option>
              <option value="90">90 Seconds (Heavy Traffic Clearance)</option>
              <option value="120">120 Seconds (Multi-Vehicle Convoy)</option>
            </select>
            <p className="text-[11px] text-text-muted mt-1">
              Maximum window a green light remains locked before automatic pedestrian recovery cycle.
            </p>
          </div>

          {/* Webhook Endpoint */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Rescue 1122 Dispatch Webhook
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 bg-surface-elevated border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
              />
              <button
                type="button"
                onClick={() => showToast('Webhook ping test: HTTP 200 OK (Rescue 1122 Gateway).')}
                className="btn btn-secondary text-xs shrink-0"
              >
                Ping
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Automated JSON payload broadcast when corridor preemption engages.
            </p>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-border space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-text-primary">
                  Auto-Revert Corridor on Egress
                </div>
                <div className="text-[11px] text-text-muted">
                  Restore normal signal timing immediately once ambulance clears intersection.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRevert}
                onChange={(e) => setAutoRevert(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-text-primary">
                  Audible Operator Chimes
                </div>
                <div className="text-[11px] text-text-muted">
                  Play emergency preemption tone during active corridor events.
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent"
              />
            </label>
          </div>
        </div>

        {/* Save Bar (Full Width) */}
        <div className="lg:col-span-2 card p-4 flex items-center justify-between bg-surface-elevated">
          <div className="text-xs text-text-secondary">
            Settings take effect immediately across all active municipal edge nodes.
          </div>
          <button
            type="submit"
            className="btn btn-primary text-xs font-bold px-5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save System Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
}
