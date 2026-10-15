import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDanger = false, 
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-tab-fade">
      <div 
        className="w-full max-w-md bg-surface border border-border rounded-lg shadow-2xl overflow-hidden p-5 transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${
              isDanger ? 'bg-danger-surface text-danger border border-danger/30' : 'bg-warning-surface text-warning border border-warning/30'
            }`}>
              <AlertTriangle className="w-5 h-5 shrink-0" />
            </div>
            <h3 id="modal-title" className="text-sm font-bold text-text-primary">
              {title}
            </h3>
          </div>
          <button 
            onClick={onCancel}
            className="text-text-muted hover:text-text-primary p-1 rounded transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-secondary mt-3 leading-relaxed">
          {message}
        </p>

        <div className="mt-5 pt-3 border-t border-border flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="btn btn-secondary text-xs px-3.5"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`btn text-xs px-4 font-bold ${
              isDanger ? 'btn-danger' : 'btn-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
