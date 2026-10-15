import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  HeartPulse, 
  Send, 
  Activity,
  Bed
} from 'lucide-react';

export default function HospitalLocations({ 
  hospitals, 
  targetHospitalId, 
  onSetTargetHospital, 
  onNavigate, 
  showToast 
}) {
  return (
    <div className="flex flex-col gap-4 animate-tab-fade">
      {/* Header Info */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-text-primary">
                Hospital Network & Trauma Receiving Facilities (Abbottabad)
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Live hospital triage coordination with Rescue 1122 Abbottabad Control & Ayub Medical Complex.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Dispatched encrypted pre-arrival trauma telemetry to active hospital.')}
              className="btn btn-primary text-xs font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Patient Vitals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hospitals.map((hosp) => {
          const isTarget = hosp.id === targetHospitalId;

          return (
            <div 
              key={hosp.id} 
              className={`card p-4 flex flex-col justify-between transition-all duration-200 ${
                isTarget 
                  ? 'ring-2 ring-accent border-accent bg-accent-surface/20' 
                  : 'border-border'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-2 border-b border-border mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-accent tracking-wider">
                      {hosp.type}
                    </span>
                    <h3 className="text-sm font-bold text-text-primary mt-0.5">
                      {hosp.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                      <MapPin className="w-3 h-3 text-text-muted" />
                      <span>{hosp.address}</span>
                    </div>
                  </div>
                  <span className={`badge ${
                    hosp.triageStatus === 'On Standby' ? 'badge-warning' :
                    hosp.triageStatus === 'Available' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {hosp.triageStatus}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 my-3">
                  <div className="bg-surface-elevated p-2.5 rounded-md border border-border">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-accent" />
                      <span>Transit ETA</span>
                    </div>
                    <div className="text-lg font-extrabold text-text-primary font-mono tabular-nums mt-0.5">
                      {hosp.eta}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {hosp.distanceKm} km via corridor
                    </div>
                  </div>

                  <div className="bg-surface-elevated p-2.5 rounded-md border border-border">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                      <Bed className="w-3 h-3 text-success" />
                      <span>ICU Resus Beds</span>
                    </div>
                    <div className="text-lg font-extrabold text-success font-mono tabular-nums mt-0.5">
                      {hosp.icuBeds} <span className="text-xs font-normal text-text-muted">Available</span>
                    </div>
                    <div className="text-[10px] text-text-muted">
                      Level 1 Resus Ready
                    </div>
                  </div>
                </div>

                {/* Direct Hotline */}
                <div className="bg-surface-elevated p-2.5 rounded-md border border-border text-xs mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-text-secondary">Emergency Desk:</span>
                  </div>
                  <span className="font-mono font-bold text-text-primary">{hosp.phone}</span>
                </div>

                {/* Target Destination Indicator */}
                {isTarget && (
                  <div className="p-2.5 rounded-md bg-accent-surface border border-accent/30 text-accent text-xs font-bold flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Active Corridor Destination Selected</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex flex-col gap-2">
                <button
                  onClick={() => {
                    onSetTargetHospital(hosp.id);
                    showToast(`Active corridor destination set to ${hosp.name}. Route recalculated.`);
                  }}
                  className={`btn text-xs font-bold w-full ${
                    isTarget ? 'btn-secondary cursor-default' : 'btn-primary'
                  }`}
                  disabled={isTarget}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isTarget ? 'Current Corridor Target' : 'Set as Corridor Target'}</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('route');
                    showToast(`Navigated to corridor route map for ${hosp.name}.`);
                  }}
                  className="btn btn-secondary text-xs w-full"
                >
                  View Route in Corridor Map
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Protocol Information Box */}
      <div className="card p-4 bg-surface-elevated">
        <div className="flex items-start gap-3">
          <HeartPulse className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">
              Pre-Arrival Trauma Protocol (Khyber Pakhtunkhwa Health Department)
            </h4>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              When an ambulance approaches within 3.0 km of the destination facility, SafeCity AI automatically transmits ETA alerts to the ER trauma bay, activates hospital ingress gate preemption, and reserves the primary resuscitation suite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
