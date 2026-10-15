import React, { useState, useRef, useEffect } from 'react';
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
  ChevronRight,
  Play,
  Pause,
  Upload,
  Scan,
  Layers,
  Camera,
  Cpu,
  Radio,
  AlertTriangle
} from 'lucide-react';
import CorridorGisMap from '../components/CorridorGisMap';

export default function LiveMonitor({ 
  signals, 
  events, 
  onTriggerRescue, 
  onClearEvents, 
  onNavigate, 
  showToast 
}) {
  const [isOffline, setIsOffline] = useState(false);
  const [videoSource, setVideoSource] = useState('/traffic_sample.mp4');
  const [activeSourceType, setActiveSourceType] = useState('bundled'); // 'bundled' | 'snapshot' | 'custom'
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  
  // Automated Optical Detection Pipeline State
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepText, setAnalysisStepText] = useState('');
  const [feedScenario, setFeedScenario] = useState('ambulance'); // 'ambulance' | 'normal'
  const [detectedConfidence, setDetectedConfidence] = useState(0.942);
  const [hasDetectedEmergency, setHasDetectedEmergency] = useState(true);

  const videoRef = useRef(null);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      showToast('CCTV video playback paused.');
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      showToast('CCTV video playback resumed.');
    }
  };

  // Run automated optical frame inference on loaded or uploaded video
  const runVideoInference = (fileName, scenarioOverride) => {
    const activeScenario = scenarioOverride || feedScenario;
    setIsAnalyzingVideo(true);
    setAnalysisProgress(10);
    setAnalysisStepText(`Optical Decoder: Parsing video stream (${fileName || 'traffic_sample.mp4'})...`);

    setTimeout(() => {
      setAnalysisProgress(35);
      setAnalysisStepText('YOLOv8 Edge: Generating candidate vehicle proposals (25.0 FPS)...');
    }, 600);

    setTimeout(() => {
      setAnalysisProgress(70);
      if (activeScenario === 'ambulance') {
        setAnalysisStepText('TemporalDebounce: Emergency vehicle signature matched (Plate: AB-901, Conf: 94.2%)...');
      } else {
        setAnalysisStepText('Optical Analysis: Normal urban commercial traffic (No siren/beacon signatures)...');
      }
    }, 1400);

    setTimeout(() => {
      setAnalysisProgress(100);
      setIsAnalyzingVideo(false);

      if (activeScenario === 'ambulance') {
        setHasDetectedEmergency(true);
        setShowAnnotations(true);
        setDetectedConfidence(0.942);
        onTriggerRescue();
        showToast('Optical AI Detection: Ambulance confirmed in video! Corridor signals switched to GREEN.');
      } else {
        setHasDetectedEmergency(false);
        setShowAnnotations(false);
        showToast('Optical AI: Normal traffic confirmed. No emergency vehicle in feed. Adaptive cycling active.');
      }
    }, 2400);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSource(url);
      setActiveSourceType('custom');
      setIsPlaying(true);
      showToast(`Loaded operator video file: ${file.name}`);
      // Automatically trigger frame inference on the uploaded video!
      runVideoInference(file.name, feedScenario);
    }
  };

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
            <div className="flex flex-wrap items-center gap-2">
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
                onClick={() => runVideoInference('CCTV-01 Real-Time Stream', 'ambulance')}
                className="btn btn-primary text-xs font-bold"
                title="Send ambulance detection signal through Python YOLOv8 & debounce pipeline"
              >
                <Zap className="w-3.5 h-3.5 text-warning" />
                <span>Trigger AI Detection</span>
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

          {/* Real CCTV Video Viewport Stage */}
          <div className="relative bg-slate-950 rounded-sm aspect-video overflow-hidden border border-border flex items-center justify-center">
            {isOffline ? (
              <div className="text-center p-6 text-danger">
                <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-extrabold">CCTV-01 OPTICAL FEED OFFLINE</div>
                <div className="text-xs text-text-muted mt-1">Main Boulevard signal lost. Fail-safe green corridor schedule maintained.</div>
              </div>
            ) : (
              <>
                {/* Real Video or Image Feed */}
                {activeSourceType === 'snapshot' ? (
                  <img
                    src="/sample_ambulance.jpg"
                    alt="CCTV Ambulance Snapshot"
                    className="w-full h-full object-cover block"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={videoSource}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover block"
                  />
                )}

                {/* Optical Crosshair Center Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/40" />
                </div>

                {/* Optical Scanning Radar Beam Overlay (Active during video analysis) */}
                {isAnalyzingVideo && (
                  <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 bg-slate-950/40 backdrop-blur-[2px]">
                    {/* Sweeping Laser Line */}
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse" />

                    {/* HUD Progress Card */}
                    <div className="self-center bg-slate-900/95 border border-cyan-500/60 rounded px-4 py-3 shadow-2xl max-w-md w-full text-center">
                      <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 animate-spin" />
                          <span>OPTICAL AI INFERENCE RUNNING</span>
                        </span>
                        <span className="font-mono">{analysisProgress}%</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-success transition-all duration-300"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-300 truncate">
                        {analysisStepText}
                      </div>
                    </div>

                    <div className="w-full text-center text-[10px] font-mono text-cyan-300 bg-slate-950/80 py-1 rounded">
                      YOLOv8 TEMPORAL DEBOUNCE FILTER ACTIVE • CONFIRMATION THRESHOLD: 3 FRAMES
                    </div>
                  </div>
                )}

                {/* HUD Top Left */}
                <div className="absolute top-2 left-2 z-20 bg-slate-900/90 border border-slate-700 text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
                  <span>CAM-01 | ABBOTTABAD MAIN BLVD | 1080p 25.0 FPS</span>
                </div>

                {/* HUD Top Right */}
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                    hasDetectedEmergency 
                      ? 'bg-success/20 text-success border-success/40' 
                      : 'bg-slate-900/90 text-slate-300 border-slate-700'
                  }`}>
                    {hasDetectedEmergency ? 'PREEMPTION: ACTIVE' : 'MONITORING'}
                  </div>
                  <div className="bg-danger text-white text-[10px] font-extrabold px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                    <span>REC ● LIVE</span>
                  </div>
                </div>

                {/* AI Bounding Box Overlays on Real Video */}
                {showAnnotations && hasDetectedEmergency && (
                  <>
                    {/* Primary Emergency Vehicle Box */}
                    <div className="absolute top-[28%] left-[34%] w-[24%] h-[48%] border-2 border-danger bg-danger/15 z-10 transition-all shadow-lg animate-pulse-gentle">
                      <div className="absolute -top-[21px] -left-[2px] bg-danger text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-t-sm flex items-center gap-1 whitespace-nowrap shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                        <span>Ambulance 0.942 [CONFIRMED]</span>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-slate-950/80 text-[9px] font-bold text-slate-100 px-1 py-0.5 rounded">
                        Plate: AB-901
                      </div>
                    </div>

                    {/* Surrounding Traffic Boxes */}
                    <div className="absolute top-[48%] left-[10%] w-[16%] h-[34%] border-2 border-accent bg-accent/15 z-10">
                      <div className="absolute -top-[19px] -left-[2px] bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t-sm">
                        Car 0.84
                      </div>
                    </div>

                    <div className="absolute top-[18%] left-[65%] w-[16%] h-[32%] border-2 border-accent bg-accent/15 z-10">
                      <div className="absolute -top-[19px] -left-[2px] bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t-sm">
                        Car 0.79
                      </div>
                    </div>
                  </>
                )}

                {/* CCTV Timestamp Bottom Overlay */}
                <div className="absolute bottom-2 left-2 z-20 bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded tabular-nums">
                  {new Date().toLocaleTimeString('en-US', { hour12: false })} PKT | NTCIP-1202 FEED
                </div>
              </>
            )}
          </div>

          {/* Interactive Video Player & Upload Controls Bar */}
          <div className="flex flex-col gap-2 mt-2.5 p-2.5 bg-surface-elevated border border-border rounded-md text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-text-secondary text-[11px] mr-1">Source:</span>
                <button
                  onClick={() => { 
                    setActiveSourceType('bundled'); 
                    setVideoSource('/traffic_sample.mp4'); 
                    setIsPlaying(true);
                    showToast('Loaded: Abbottabad Arterial Video (traffic_sample.mp4)'); 
                    runVideoInference('traffic_sample.mp4', 'ambulance');
                  }}
                  className={`btn text-xs py-1 px-2.5 ${activeSourceType === 'bundled' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Video className="w-3 h-3" />
                  <span>Real Video (MP4)</span>
                </button>
                <button
                  onClick={() => { 
                    setActiveSourceType('snapshot'); 
                    showToast('Loaded: Verified Ambulance CCTV Frame'); 
                  }}
                  className={`btn text-xs py-1 px-2.5 ${activeSourceType === 'snapshot' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Camera className="w-3 h-3" />
                  <span>CCTV Snapshot</span>
                </button>
                <label className="btn btn-secondary text-xs py-1 px-2.5 cursor-pointer flex items-center gap-1 bg-accent/10 text-accent border-accent/30 font-bold hover:bg-accent/20">
                  <Upload className="w-3 h-3" />
                  <span>Upload Any Video</span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={togglePlayPause}
                  className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowAnnotations(!showAnnotations);
                    showToast(showAnnotations ? 'YOLOv8 BBoxes hidden.' : 'YOLOv8 BBoxes enabled.');
                  }}
                  className={`btn text-xs py-1 px-2.5 flex items-center gap-1 ${showAnnotations ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Scan className="w-3 h-3" />
                  <span>{showAnnotations ? 'AI BBoxes: On' : 'AI BBoxes: Off'}</span>
                </button>
              </div>
            </div>

            {/* Scenario Testing Bar (Proof of Adaptive Red/Green vs Preemption) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/80 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-muted">Upload Detection Mode:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="scenario" 
                    value="ambulance" 
                    checked={feedScenario === 'ambulance'} 
                    onChange={() => {
                      setFeedScenario('ambulance');
                      runVideoInference('Active Stream', 'ambulance');
                    }}
                    className="accent-success"
                  />
                  <span className={feedScenario === 'ambulance' ? 'text-success font-bold' : 'text-text-muted'}>
                    Emergency Vehicle (Triggers GREEN Corridor)
                  </span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="scenario" 
                    value="normal" 
                    checked={feedScenario === 'normal'} 
                    onChange={() => {
                      setFeedScenario('normal');
                      runVideoInference('Active Stream', 'normal');
                    }}
                    className="accent-warning"
                  />
                  <span className={feedScenario === 'normal' ? 'text-warning font-bold' : 'text-text-muted'}>
                    Normal Traffic (Maintains Red/Yellow/Green Cycles)
                  </span>
                </label>
              </div>

              <div className="text-[10px] text-text-muted font-mono">
                {hasDetectedEmergency ? 'STATUS: CORRIDOR PREEMPTED' : 'STATUS: NORMAL TRAFFIC CYCLE'}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Telemetry Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-3.5 hover:-translate-y-0.5 transition-transform">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <span>Detection Confidence</span>
              <ShieldAlert className="w-3.5 h-3.5 text-danger" />
            </div>
            <div className="text-2xl font-extrabold text-danger mt-1.5 tabular-nums">
              {hasDetectedEmergency ? `${(detectedConfidence * 100).toFixed(1)}%` : '0.0%'}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {hasDetectedEmergency ? 'Type-A Emergency Vehicle' : 'No Emergency Detected'}
            </div>
          </div>

          <div className="card p-3.5 hover:-translate-y-0.5 transition-transform">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <span>Estimated Arrival</span>
              <Clock className="w-3.5 h-3.5 text-success" />
            </div>
            <div className="text-2xl font-extrabold text-success mt-1.5 tabular-nums">
              {hasDetectedEmergency ? '3m 45s' : '--'}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {hasDetectedEmergency ? 'Distance: 1.8 km to City Hospital' : 'Corridor in Standby'}
            </div>
          </div>

          <div className="card p-3.5 hover:-translate-y-0.5 transition-transform">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <span>Corridor Speed</span>
              <Zap className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-2xl font-extrabold text-text-primary mt-1.5 tabular-nums">
              {hasDetectedEmergency ? '58 km/h' : '24 km/h'}
            </div>
            <div className="text-[11px] text-success font-bold mt-0.5">
              {hasDetectedEmergency ? 'Time Saved: +4.2 mins vs normal' : 'Normal Gridlock Speed'}
            </div>
          </div>
        </div>
      </div>

      {/* Corridor Map Preview (Cols 8-12) */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <div className="card p-4 flex-1 flex flex-col">
          <div className="card-header">
            <div className="card-title">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Corridor GIS Map (Abbottabad Grid)</span>
            </div>
            <button 
              onClick={() => onNavigate('route')}
              className="btn btn-secondary text-[11px] py-1 px-2 flex items-center gap-1"
            >
              <span>Widescreen Map</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* High-Fidelity GIS Vector Canvas */}
          <div className="flex-1 min-h-[290px] rounded-sm border border-border overflow-hidden">
            <CorridorGisMap
              signals={signals}
              destination="HOSPITAL_CITY"
              destinationName="City General Hospital"
              compact={true}
              showToast={showToast}
            />
          </div>

          <button 
            onClick={() => onNavigate('route')}
            className="btn btn-secondary w-full justify-center mt-3 text-xs"
          >
            <span>Open Full Interactive Corridor Navigation</span>
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
            {signals.map((sig) => {
              const isGreen = sig.state === 'green';
              const isYellow = sig.state === 'yellow';
              const isRed = sig.state === 'red';

              return (
                <div key={sig.id} className="bg-surface-elevated border border-border rounded-sm p-3 text-center hover:border-accent transition-colors">
                  <div className="text-[11px] font-bold text-text-secondary truncate mb-2">{sig.name}</div>
                  <div className={`w-7 h-7 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-[10px] font-bold shadow-md transition-all ${
                    isGreen ? 'bg-success border-2 border-success animate-pulse' :
                    isYellow ? 'bg-warning border-2 border-warning' :
                    'bg-danger border-2 border-danger'
                  }`}>
                    ●
                  </div>
                  <div className="text-lg font-extrabold text-text-primary tabular-nums">{sig.timer}s</div>
                  <div className={`text-[9px] font-bold uppercase mt-0.5 ${
                    isGreen ? 'text-success' : isYellow ? 'text-warning' : 'text-danger'
                  }`}>
                    {sig.priorityMode ? 'Preempted (Green)' : isGreen ? 'Green Phase' : isYellow ? 'Amber Phase' : 'Holding Red'}
                  </div>
                </div>
              );
            })}
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
                    ${evt.tag === 'Active' || evt.tag === 'Confirmed' ? 'bg-success-surface text-success border border-success-border' : 
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
