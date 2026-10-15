import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-surface border border-border shadow-xl px-4 py-3 rounded-md flex items-center gap-2.5 text-xs font-semibold text-text-primary animate-tab-fade">
      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
      <span>{message}</span>
    </div>
  );
}
