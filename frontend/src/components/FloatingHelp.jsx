import React, { useState } from 'react';
import { Phone, ArrowUp, X, Copy, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function FloatingHelp({ showToast }) {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} (${text}) to clipboard.`);
  };

  const scrollToTop = () => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Buttons Group (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className="w-9 h-9 rounded-full bg-surface border border-border shadow-md flex items-center justify-center text-text-muted hover:text-accent hover:border-accent transition-all hover:-translate-y-0.5 active:translate-y-0"
          title="Back to Top"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Floating Dial Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-accent-hover transition-all hover:scale-105 active:scale-95"
          title="Emergency Contacts & Assistance"
          aria-label="Emergency contact lines"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Phone className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Assistance Card */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-40 w-80 bg-surface border border-border rounded-lg shadow-2xl p-4 animate-tab-fade">
          <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-danger" />
              <h4 className="text-xs font-bold text-text-primary">
                Municipal Emergency Hotline Directory
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-surface-elevated rounded border border-border flex items-center justify-between">
              <div>
                <div className="font-bold text-text-primary">Rescue 1122 Abbottabad</div>
                <div className="text-[10px] text-text-muted">Direct ambulance priority dispatcher</div>
              </div>
              <button
                onClick={() => copyToClipboard('+92 992 112201', 'Rescue 1122')}
                className="btn btn-secondary text-[11px] p-1.5"
                title="Copy Hotline"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2.5 bg-surface-elevated rounded border border-border flex items-center justify-between">
              <div>
                <div className="font-bold text-text-primary">SCATS Signal Master Desk</div>
                <div className="text-[10px] text-text-muted">KPK Traffic Control Headquarters</div>
              </div>
              <button
                onClick={() => copyToClipboard('+92 992 931011', 'SCATS Control')}
                className="btn btn-secondary text-[11px] p-1.5"
                title="Copy Hotline"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2.5 bg-surface-elevated rounded border border-border flex items-center justify-between">
              <div>
                <div className="font-bold text-text-primary">Ayub Medical Complex ER</div>
                <div className="text-[10px] text-text-muted">Level-1 trauma resuscitation bay</div>
              </div>
              <button
                onClick={() => copyToClipboard('+92 992 381907', 'ATH Trauma Bay')}
                className="btn btn-secondary text-[11px] p-1.5"
                title="Copy Hotline"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
