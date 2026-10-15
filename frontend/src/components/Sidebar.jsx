import React from 'react';
import { 
  Tv, 
  MapPin, 
  SlidersHorizontal, 
  Clock, 
  BarChart2, 
  Video, 
  Building2, 
  Settings, 
  AlertCircle,
  Shield,
  FileText,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ 
  activePage, 
  onSelectPage, 
  isMobileOpen, 
  onCloseMobile,
  onOpenPrivacy,
  onOpenTerms,
  onOpenFaq,
  onOpenReadiness
}) {
  const navItems = [
    { section: 'Transit Operations', items: [
      { key: 'monitor', label: 'Live Monitor', icon: Tv },
      { key: 'route', label: 'Route & Map', icon: MapPin },
      { key: 'signals', label: 'Signal Control', icon: SlidersHorizontal },
      { key: 'events', label: 'Event History', icon: Clock },
    ]},
    { section: 'City Infrastructure', items: [
      { key: 'analytics', label: 'Analytics & Impact', icon: BarChart2 },
      { key: 'cctv', label: 'CCTV Sources', icon: Video },
      { key: 'hospitals', label: 'Hospital Locations', icon: Building2 },
      { key: 'settings', label: 'System Settings', icon: Settings },
    ]}
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-border p-3.5 flex flex-col justify-between flex-shrink-0 overflow-y-auto transition-transform duration-200
        ${isMobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {navItems.map((sec, idx) => (
            <div key={idx} className="mb-4">
              <div className="text-[10px] font-extrabold uppercase text-text-muted px-3 py-1 tracking-wider">
                {sec.section}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onSelectPage(item.key);
                        onCloseMobile();
                      }}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all text-left
                        ${isActive 
                          ? 'bg-accent text-white shadow-sm font-bold' 
                          : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary hover:translate-x-0.5'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Governance & Compliance Section */}
          <div className="mb-4 pt-2 border-t border-border">
            <div className="text-[10px] font-extrabold uppercase text-text-muted px-3 py-1 tracking-wider">
              Governance & Compliance
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <button
                onClick={() => {
                  onOpenReadiness();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-success hover:bg-success-surface/50 text-left transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Production Checklist #100</span>
              </button>
              <button
                onClick={() => {
                  onOpenFaq();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:bg-surface-elevated text-left transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Technical FAQ</span>
              </button>
              <button
                onClick={() => {
                  onOpenPrivacy();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:bg-surface-elevated text-left transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </button>
              <button
                onClick={() => {
                  onOpenTerms();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:bg-surface-elevated text-left transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Terms of Service</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Status Card */}
        <div className="bg-surface-elevated border border-border rounded-md p-3 text-xs mt-2">
          <div className="flex items-center gap-1.5 text-danger font-bold text-xs mb-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Corridor Alert</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-snug">
            Ambulance #AB-901 inbound to City Hospital via Main Blvd. Signal preemption engaged.
          </p>
        </div>
      </aside>
    </>
  );
}
