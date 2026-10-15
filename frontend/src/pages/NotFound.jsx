import React from 'react';
import { AlertCircle, ArrowLeft, Home, Radio } from 'lucide-react';

export default function NotFound({ onNavigateHome }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-tab-fade">
      <div className="w-16 h-16 rounded-full bg-danger-surface text-danger flex items-center justify-center mb-4 border border-danger/30 shadow-inner">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="text-[11px] font-extrabold uppercase text-danger tracking-wider">
        HTTP 404 • Resource Not Located
      </div>
      <h2 className="text-xl font-bold text-text-primary mt-1">
        Corridor Telemetry Node Not Found
      </h2>
      <p className="text-xs text-text-secondary mt-2 max-w-md leading-relaxed">
        The requested municipal navigation node or CCTV telemetry feed does not exist on the Abbottabad SafeCity network.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onNavigateHome}
          className="btn btn-primary text-xs font-bold px-4 py-2"
        >
          <Home className="w-4 h-4" />
          <span>Return to Live Monitor</span>
        </button>
      </div>
    </div>
  );
}
