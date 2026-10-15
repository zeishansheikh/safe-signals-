import React from 'react';
import { 
  Video, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  ShieldAlert, 
  Cpu, 
  Wifi, 
  Sliders,
  ExternalLink
} from 'lucide-react';

export default function CctvSources({ 
  cameras, 
  activeCamId, 
  onSelectCamera, 
  onNavigate, 
  showToast 
}) {
  return (
    <div className="flex flex-col gap-4 animate-tab-fade">
      {/* Header Bar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-text-primary">
                Municipal CCTV Edge Streams (Abbottabad SafeCity Network)
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              6 H.264 / RTSP surveillance streams feeding real-time YOLOv8 emergency vehicle inference engines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('All 6 municipal CCTV RTSP video streams re-synchronized.')}
              className="btn btn-secondary text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-sync All Feeds</span>
            </button>
            <button
              onClick={() => showToast('YOLOv8 Edge inference latency check: 18ms nominal.')}
              className="btn btn-primary text-xs font-bold"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Run AI Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 6 Cameras */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cameras.map((cam) => {
          const isSelected = activeCamId === cam.id;
          const isOnline = cam.status === 'online';

          return (
            <div 
              key={cam.id} 
              className={`card p-4 flex flex-col justify-between transition-all duration-200 ${
                isSelected ? 'ring-2 ring-accent border-accent' : 'border-border'
              }`}
            >
              <div>
                {/* Camera Title & Badges */}
                <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase bg-accent-surface text-accent px-1.5 py-0.5 rounded">
                      {cam.id.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-text-primary truncate max-w-[170px]">
                      {cam.name.replace(/CAM-\d+\s*/, '')}
                    </span>
                  </div>
                  <span className={`badge ${isOnline ? 'badge-success' : 'badge-warning'}`}>
                    {isOnline ? 'Online' : 'Standby'}
                  </span>
                </div>

                {/* Real Video / Snapshot Preview Screen */}
                <div className="relative bg-slate-950 rounded-sm aspect-video overflow-hidden border border-border flex items-center justify-center group mb-3">
                  {/* Real Media Layer */}
                  {cam.id === 'cam-01' ? (
                    <video
                      src="/traffic_sample.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover block"
                    />
                  ) : cam.id === 'cam-02' ? (
                    <img src="/sample_bus.jpg" alt={cam.name} className="w-full h-full object-cover block" />
                  ) : cam.id === 'cam-03' ? (
                    <img src="/sample_ambulance.jpg" alt={cam.name} className="w-full h-full object-cover block" />
                  ) : cam.id === 'cam-04' ? (
                    <img src="/test_amb_1.jpg" alt={cam.name} className="w-full h-full object-cover block" />
                  ) : cam.id === 'cam-05' ? (
                    <img src="/amb3.jpg" alt={cam.name} className="w-full h-full object-cover block" />
                  ) : (
                    <img src="/amb4.jpg" alt={cam.name} className="w-full h-full object-cover block" />
                  )}

                  {/* Optical Scanline / Dark Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Camera Details Overlay */}
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/10">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-warning'}`} />
                    <span>{cam.resolution}</span>
                    <span className="text-slate-400">|</span>
                    <span className="tabular-nums">{cam.fps.toFixed(1)} FPS</span>
                  </div>

                  {/* Detection Bounding Box on Cam-01 */}
                  {cam.id === 'cam-01' && (
                    <div className="absolute inset-x-12 inset-y-8 border-2 border-danger rounded bg-danger/15 flex flex-col justify-between p-1.5 pointer-events-none shadow-md">
                      <div className="bg-danger text-white text-[9px] font-extrabold px-1 py-0.5 rounded self-start flex items-center gap-1 shadow-sm">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        <span>AMBULANCE #AB-901</span>
                      </div>
                      <div className="text-[9px] text-danger font-mono font-bold self-end bg-black/80 px-1 rounded">
                        CONF: 0.942
                      </div>
                    </div>
                  )}

                  {/* Active Monitor Indicator */}
                  {isSelected && (
                    <div className="absolute bottom-2 right-2 bg-accent text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>MASTER FEED</span>
                    </div>
                  )}
                </div>

                {/* Telemetry info */}
                <div className="space-y-1.5 text-xs text-text-secondary mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Installation Node:</span>
                    <span className="font-semibold text-text-primary">{cam.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Protocol & Codec:</span>
                    <span className="font-mono text-[11px]">RTSP / H.264 Baseline</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Network Latency:</span>
                    <span className="font-mono text-success tabular-nums font-bold">14ms</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectCamera(cam.id);
                    onNavigate('monitor');
                    showToast(`Switched Live Monitor master stream to ${cam.name}.`);
                  }}
                  className={`btn text-xs flex-1 font-bold ${
                    isSelected ? 'btn-secondary' : 'btn-primary'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Viewing on Monitor' : 'Select Master Feed'}</span>
                </button>
                <button
                  onClick={() => showToast(`${cam.id.toUpperCase()}: YOLOv8 model weights reloaded.`)}
                  className="btn btn-secondary text-xs px-2.5"
                  title="Recalibrate YOLO weights"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
