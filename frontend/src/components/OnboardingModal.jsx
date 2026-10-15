import React, { useState } from 'react';
import { Video, SlidersHorizontal, Building2, ChevronRight, ChevronLeft, CheckCircle2, X } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, showToast }) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Automated CCTV Vehicle Inference',
      icon: Video,
      description: 'Municipal cameras run local YOLOv8 edge detection models. When an ambulance is detected with confidence > 90%, SafeCity AI calculates approach velocity and flags the corridor without cloud dependencies.',
      highlight: 'Zero latency edge vision processing (< 18ms).'
    },
    {
      step: 2,
      title: 'NTCIP-1202 Dynamic Signal Preemption',
      icon: SlidersHorizontal,
      description: 'SCATS controllers at Main Blvd, Cantt Chowk, Mandian, and Hospital Chowk synchronize a rolling green wave. Cross-traffic is held safely after standard yellow clearance phases.',
      highlight: 'NTCIP fail-safe timeout prevents deadlock or gridlock.'
    },
    {
      step: 3,
      title: 'Trauma Resus Bay Early Notification',
      icon: Building2,
      description: 'Incoming patient ETA alerts reach City Hospital, ATH, or DHQ triage bays before arrival. Resuscitation suites and ICU beds are automatically prepared for immediate emergency handover.',
      highlight: '4.2 minutes average golden-hour time saved per mission.'
    }
  ];

  const currentStep = steps[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-tab-fade">
      <div 
        className="w-full max-w-lg bg-surface border border-border rounded-lg shadow-2xl overflow-hidden p-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-accent-surface text-accent px-2 py-0.5 rounded">
              Operator Onboarding
            </span>
            <span className="text-xs text-text-muted">
              Step {step} of 3
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-surface text-accent flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <StepIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-text-primary">
            {currentStep.title}
          </h3>
          <p className="text-xs text-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
            {currentStep.description}
          </p>
          <div className="mt-4 p-2.5 rounded bg-surface-elevated border border-border text-[11px] font-semibold text-accent max-w-xs mx-auto">
            {currentStep.highlight}
          </div>
        </div>

        {/* Step Indicator dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all ${
                s === step ? 'w-6 bg-accent' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <button
            onClick={() => {
              onClose();
              showToast('Onboarding guide skipped. You can reopen it anytime from Profile.');
            }}
            className="btn btn-secondary text-xs"
          >
            Skip Guide
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn btn-secondary text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn btn-primary text-xs font-bold"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  showToast('Operator onboarding completed! Welcome to SafeCity AI.');
                }}
                className="btn btn-primary text-xs font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Tour</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
