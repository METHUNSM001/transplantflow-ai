import React from 'react';
import { Check, CheckCircle, Clock, CircleDot } from 'lucide-react';
import { OrganStatus } from '../../types/database.types';

interface OrganJourneyPipelineProps {
  status: OrganStatus;
}

export const OrganJourneyPipeline: React.FC<OrganJourneyPipelineProps> = ({ status }) => {
  const steps: { key: OrganStatus; label: string; desc: string }[] = [
    { key: 'AVAILABLE', label: 'Retrieved & Preserved', desc: 'Perfusion clock running' },
    { key: 'MATCHED', label: 'Recipient Matched', desc: 'Allocation confirmed' },
    { key: 'IN_TRANSIT', label: 'Transit En Route', desc: 'Live GPS telemetry' },
    { key: 'ARRIVED', label: 'Hospital Arrival', desc: 'Readiness handoff' },
    { key: 'TRANSPLANTED', label: 'Transplantation', desc: 'Reperfusion complete' },
  ];

  const getStepState = (stepKey: OrganStatus, index: number) => {
    const order: OrganStatus[] = ['AVAILABLE', 'MATCHED', 'IN_TRANSIT', 'ARRIVED', 'TRANSPLANTED'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepKey);

    if (status === 'EXPIRED' || status === 'CANCELLED') {
      return 'failed';
    }

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-xl overflow-x-auto">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Transplant Digital Twin Journey
      </h4>

      <div className="flex items-center min-w-[620px] justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />

        {steps.map((step, idx) => {
          const state = getStepState(step.key, idx);

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 text-center w-28">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  state === 'completed'
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-900/40'
                    : state === 'active'
                    ? 'bg-slate-900 border-cyan-400 text-cyan-400 ring-4 ring-cyan-500/20 animate-pulse'
                    : 'bg-slate-950 border-slate-700 text-slate-400'
                }`}
              >
                {state === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : state === 'active' ? (
                  <CircleDot className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-mono">{idx + 1}</span>
                )}
              </div>

              <span
                className={`mt-2 text-xs font-bold ${
                  state === 'active'
                    ? 'text-cyan-400'
                    : state === 'completed'
                    ? 'text-slate-200'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
