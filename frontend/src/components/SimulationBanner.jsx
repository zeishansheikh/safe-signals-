import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SimulationBanner() {
  return (
    <div className="bg-warning-surface text-warning border-b border-warning-border text-[11px] font-bold py-1 px-4 tracking-wider uppercase flex items-center justify-center gap-2 select-none z-50">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      <span>DEMONSTRATION MODE: Signal preemption logic is simulated. Real municipal signals are never controlled.</span>
    </div>
  );
}
