import React, { useState, useEffect } from 'react';
import { ShieldCheck, Settings, CheckCircle2, X } from 'lucide-react';

export default function CookieBanner({ showToast, onOpenPrivacy }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [routeCache, setRouteCache] = useState(true);
  const [telemetry, setTelemetry] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('safecity-cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('safecity-cookie-consent', 'all');
    setIsVisible(false);
    showToast('Municipal telemetry & session tokens enabled.');
  };

  const handleSavePreferences = () => {
    localStorage.setItem('safecity-cookie-consent', JSON.stringify({ routeCache, telemetry }));
    setShowPreferences(false);
    setIsVisible(false);
    showToast('Cookie & telemetry preferences saved.');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Bottom Floating Banner */}
      {!showPreferences && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-40 max-w-xl bg-surface border border-border rounded-lg shadow-xl p-4 animate-tab-fade">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-accent-surface text-accent shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-text-primary">
                Municipal Privacy & Operational Telemetry Notice
              </h4>
              <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                SafeCity AI uses strictly functional session tokens and anonymized edge telemetry to authenticate SCATS controller handshakes. Under the KP Data Protection Act, no citizen PII or license plates are retained.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  onClick={handleAcceptAll}
                  className="btn btn-primary text-xs font-bold py-1 px-3"
                >
                  Accept Essential Telemetry
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="btn btn-secondary text-xs py-1 px-2.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
                <button
                  onClick={onOpenPrivacy}
                  className="text-[11px] text-accent hover:underline ml-1"
                >
                  Read Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-tab-fade">
          <div className="w-full max-w-md bg-surface border border-border rounded-lg shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-text-primary">
                Telemetry & Storage Preferences
              </h3>
              <button 
                onClick={() => setShowPreferences(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-surface-elevated rounded border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-text-primary">SCATS Controller Heartbeats</div>
                  <div className="text-[10px] text-text-muted">Mandatory NTCIP 1202 fail-safe session verification.</div>
                </div>
                <span className="badge badge-success">Required</span>
              </div>

              <label className="p-3 bg-surface-elevated rounded border border-border flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-text-primary">OSRM Route Navigation Caching</div>
                  <div className="text-[10px] text-text-muted">Stores transit coordinates locally for rapid corridor plotting.</div>
                </div>
                <input
                  type="checkbox"
                  checked={routeCache}
                  onChange={(e) => setRouteCache(e.target.checked)}
                  className="rounded text-accent focus:ring-accent w-4 h-4"
                />
              </label>

              <label className="p-3 bg-surface-elevated rounded border border-border flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-text-primary">Rescue 1122 Diagnostic Logs</div>
                  <div className="text-[10px] text-text-muted">Anonymous response time analytics for clinical review.</div>
                </div>
                <input
                  type="checkbox"
                  checked={telemetry}
                  onChange={(e) => setTelemetry(e.target.checked)}
                  className="rounded text-accent focus:ring-accent w-4 h-4"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setShowPreferences(false)}
                className="btn btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="btn btn-primary text-xs font-bold"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
