import React from 'react';
import { Building2, Check, CheckCircle2, ShieldCheck, X, XCircle } from 'lucide-react';
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
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Hospital Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">{hospital.name}</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {hospital.city}, {hospital.state} • {hospital.contact_phone || 'Emergency Desk: +1 (800) 555-OR'}
          </p>
        </div>

        {/* Readiness Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Readiness Score
            </span>
            <span
              className={`text-2xl font-black font-mono ${
                score === 100
                  ? 'text-emerald-400'
                  : score >= 80
                  ? 'text-cyan-400'
                  : score >= 60
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {score}%
            </span>
          </div>

          <div
            className={`w-3 h-3 rounded-full ${
              score === 100
                ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                : score >= 60
                ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                : 'bg-rose-500 animate-ping'
            }`}
          />
        </div>
      </div>

      {/* 5-Point Readiness Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {checks.map((item) => {
          const isReady = Boolean(hospital[item.key]);

          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isInteractive ? 'cursor-pointer' : ''
              } ${
                isReady
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isReady
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {isReady ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <span className={`text-xs font-bold ${isReady ? 'text-slate-100' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              </div>

              {isInteractive && (
                <span className="text-[10px] text-slate-400 underline decoration-dotted">
                  {isReady ? 'Clear' : 'Pending'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
