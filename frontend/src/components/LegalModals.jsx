import React from 'react';
import { Shield, FileText, Download, X, CheckCircle2 } from 'lucide-react';

export default function LegalModals({ isOpen, type, onClose, showToast }) {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  const handleExportData = () => {
    const sampleData = {
      agency: 'Khyber Pakhtunkhwa Urban Transport / Rescue 1122',
      operatorTerminal: 'Abbottabad-DESK-01',
      sessionData: 'Anonymized session audit hash: 9a8f27c3d4e1',
      retentionPolicy: '24-hour circular buffer; automatic wipe on egress',
      piiCollected: 'NONE (In compliance with KP-DPA 2024)',
      exportTimestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safecity-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded municipal data access & privacy package.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-tab-fade">
      <div 
        className="w-full max-w-2xl bg-surface border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent text-white flex items-center justify-center">
              {isPrivacy ? <Shield className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">
                {isPrivacy ? 'Municipal Privacy Policy & Citizen Safeguards' : 'Corridor Operational Terms of Service'}
              </h2>
              <p className="text-[10px] text-text-muted">
                Khyber Pakhtunkhwa Urban Emergency Infrastructure Governance
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-text-secondary leading-relaxed">
          {isPrivacy ? (
            <>
              <div>
                <h4 className="font-bold text-text-primary text-sm mb-1">
                  1. Data Minimization & Citizen Anonymity
                </h4>
                <p>
                  SafeCity AI operates under strict data minimization guidelines. The computer vision pipeline executes YOLOv8 object detection on edge hardware without retaining passenger faces, civilian license plates, or non-emergency vehicular telemetry.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-text-primary text-sm mb-1">
                  2. 24-Hour Circular Retention Buffer
                </h4>
                <p>
                  Raw CCTV RTSP streams from Abbottabad municipal nodes (Main Blvd, Cantt, Mandian, Hospital Chowk) are processed in real-time RAM buffers and permanently overwritten within 24 hours. No centralized video storage archives civilian footage.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-text-primary text-sm mb-1">
                  3. Emergency Vehicle Preemption Data
                </h4>
                <p>
                  Audit trails store cryptographic event records consisting strictly of timestamp, intersection identifier, preemption duration, and Rescue 1122 vehicle callsign (#AB-901) for municipal performance evaluation.
                </p>
              </div>

              <div className="p-3 bg-surface-elevated rounded border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-text-primary">Data Subject Access & Export Request</div>
                  <div className="text-[11px] text-text-muted">Download complete JSON dump of your terminal session telemetry.</div>
                </div>
                <button
                  onClick={handleExportData}
                  className="btn btn-secondary text-xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export My Data</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-text-primary text-sm mb-1">
                  1. Operational Authority & Clearance
                </h4>
                <p>
                  Manual or autonomous traffic signal preemption is legally restricted to authorized Rescue 1122 emergency dispatches, official trauma transports, and designated traffic controllers licensed under the Khyber Pakhtunkhwa Police and Traffic Act.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-text-primary text-sm mb-1">
                  2. NTCIP 1202 Fail-Safe Mandate
                </h4>
                <p>
                  Under no circumstances shall automated signal preemption override pedestrian safety flash intervals. In the event of network disruption exceeding 500ms, intersections immediately revert to autonomous fail-safe cycling.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-text-primary text-sm mb-1">
                  3. Audit & Liability
                </h4>
                <p>
                  Every manual signal override is logged with operator identification. Deceptive or fraudulent initiation of green corridors is punishable under municipal emergency services regulations.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary text-xs font-bold px-4"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
