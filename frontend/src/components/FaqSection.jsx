import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, HeartPulse, Cpu, Radio } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does SafeCity AI eliminate cross-traffic collision risks during preemption?',
      a: 'The preemption engine respects NTCIP-1202 yellow clearance and all-red pedestrian flush intervals (minimum 8 seconds). Signals never snap instantaneously to green; cross-traffic is flushed safely before the green corridor phase is engaged.',
      icon: ShieldCheck
    },
    {
      q: 'What occurs if CCTV stream or internet connectivity fails during an active corridor run?',
      a: 'All SCATS intersection controllers utilize local hardware heartbeat timers. If heartbeat pulses from the edge vision node cease for more than 500ms, intersections instantly default to local autonomous actuation cycling with zero human intervention required.',
      icon: Cpu
    },
    {
      q: 'What is the clinical value of saving 4.2 minutes on the Abbottabad corridor?',
      a: 'Clinical trauma guidelines dictate that irreversible brain ischemia begins within 4 to 6 minutes of cardiac arrest. Compressing the transit from Main Boulevard to City Hospital from 11.2 minutes down to 4.8 minutes preserves neurological viability prior to emergency physician resuscitation.',
      icon: HeartPulse
    },
    {
      q: 'Does SafeCity AI store civilian license plates or camera video archives?',
      a: 'No. In compliance with the KP Data Protection Act, our YOLOv8 vision pipeline executes in transient edge RAM. Detections only output vehicle class classification and confidence tokens. All raw frames are wiped within a rolling 24-hour circular buffer.',
      icon: Radio
    }
  ];

  return (
    <div className="card p-4 space-y-3">
      <div className="card-header pb-2 mb-2">
        <div className="card-title">
          <HelpCircle className="w-4 h-4 text-accent" />
          <span>Technical Architecture & Clinical FAQ</span>
        </div>
        <span className="text-[11px] text-text-muted font-mono font-bold">DeepBuild 2026</span>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const Icon = faq.icon;
          return (
            <div 
              key={idx} 
              className="border border-border rounded-md overflow-hidden bg-surface-elevated transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-3 text-left flex items-center justify-between text-xs font-bold text-text-primary hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{faq.q}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="p-3 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border/50 mt-1">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
