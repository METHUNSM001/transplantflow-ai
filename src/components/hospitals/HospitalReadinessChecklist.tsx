import React from 'react';
import { Building2, Check, X } from 'lucide-react';
import { Hospital } from '../../types/database.types';

interface HospitalReadinessChecklistProps {
  hospital: Hospital;
  onToggleCheck?: (hospitalId: string, updates: Partial<Hospital>) => void;
  isInteractive?: boolean;
}

export const HospitalReadinessChecklist: React.FC<HospitalReadinessChecklistProps> = ({
  hospital,
  onToggleCheck,
  isInteractive = true,
}) => {
  const checks = [
    { key: 'or_available', label: 'Operating Room Prepped', desc: 'Surgical suite turnover complete' },
    { key: 'icu_available', label: 'ICU Recovery Bed Available', desc: 'Post-op recovery bed sanitized' },
    { key: 'surgical_team_available', label: 'Surgical Transplant Team', desc: 'Primary surgeons and anesthesiologists scrubbed' },
    { key: 'blood_preparation_ready', label: 'Blood Product Reserve', desc: 'Cross-matched PRBC units verified in OR' },
    { key: 'recipient_ready', label: 'Recipient Pre-Op Clear', desc: 'Patient in pre-op staging, vitals stable' },
  ] as const;

  const handleToggle = (key: keyof Hospital) => {
    if (!isInteractive || !onToggleCheck) return;
    const currentVal = Boolean(hospital[key]);
    onToggleCheck(hospital.id, { [key]: !currentVal });
  };

  const score = hospital.readiness_score;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Hospital Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">{hospital.name}</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {hospital.city}, {hospital.state} • {hospital.contact_phone || 'Emergency Desk: +1 (800) 555-OR'}
          </p>
        </div>

        {/* Readiness Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Readiness Score
            </span>
            <span
              className={`text-2xl font-black font-mono ${
                score === 100
                  ? 'text-emerald-700'
                  : score >= 80
                  ? 'text-blue-700'
                  : score >= 60
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}
            >
              {score}%
            </span>
          </div>

          <div
            className={`w-3 h-3 rounded-full ${
              score === 100
                ? 'bg-emerald-500'
                : score >= 60
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* 5-Point Readiness Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((item) => {
          const isReady = Boolean(hospital[item.key]);

          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key)}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                isInteractive ? 'cursor-pointer' : ''
              } ${
                isReady
                  ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isReady
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isReady ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <span className={`text-xs font-bold ${isReady ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
                </div>
              </div>

              {isInteractive && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isReady ? 'Ready' : 'Pending'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
