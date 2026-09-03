import React from 'react';
import { Check, CircleDot } from 'lucide-react';
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

  const getStepState = (stepKey: OrganStatus, _index: number) => {
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
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-sm overflow-x-auto">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
        Transplant Digital Twin Journey
      </h4>

      <div className="flex items-center min-w-[620px] justify-between relative px-4">
        {/* Connecting line */}
        <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-200 -z-0" />

        {steps.map((step, idx) => {
          const state = getStepState(step.key, idx);

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 text-center w-28">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  state === 'completed'
                    ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm'
                    : state === 'active'
                    ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100 font-bold'
                    : 'bg-slate-100 border-slate-300 text-slate-400 font-medium'
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
                className={`mt-2.5 text-xs font-bold ${
                  state === 'active'
                    ? 'text-blue-600'
                    : state === 'completed'
                    ? 'text-slate-900'
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight mt-0.5 font-medium">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
