import React from 'react';
import { AlertCircle, ChevronRight, ShieldAlert, Sparkles } from 'lucide-react';
import { RiskAssessment } from '../../types/engine.types';
import { StatusBadge } from '../common/StatusBadge';

interface RiskRadarProps {
  assessment: RiskAssessment;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ assessment }) => {
  const { score, level, reasons, recommendedActions, factors } = assessment;

  const scoreColor =
    level === 'LOW'
      ? 'text-emerald-700'
      : level === 'MEDIUM'
      ? 'text-blue-700'
      : level === 'HIGH'
      ? 'text-amber-700'
      : 'text-red-700';

  const progressBg =
    level === 'LOW'
      ? 'bg-emerald-500'
      : level === 'MEDIUM'
      ? 'bg-blue-600'
      : level === 'HIGH'
      ? 'bg-amber-500'
      : 'bg-red-600';

  const factorBars = [
    { label: 'Time Pressure', weight: '40%', score: factors.timePressureScore },
    { label: 'Transport Delay', weight: '20%', score: factors.transportDelayScore },
    { label: 'Hospital Readiness Deficit', weight: '20%', score: factors.hospitalReadinessScore },
    { label: 'Route Risk', weight: '10%', score: factors.routeRiskScore },
    { label: 'Operational Priority', weight: '10%', score: factors.operationalFactorScore },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Predictive Risk Engine
          </h4>
        </div>
        <StatusBadge type="risk" value={level} />
      </div>

      {/* Main Score Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-4">
          <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${scoreColor}`}>
            {score}%
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Composite Risk Score
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: <strong className="text-slate-800">{level}</strong> • Multi-factor algorithmic model
            </p>
          </div>
        </div>

        {/* Mini Meter */}
        <div className="w-full sm:w-48">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono font-medium">
            <span>0%</span>
            <span>30%</span>
            <span>55%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressBg} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div>
        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Contributing Risk Factors</span>
          <span className="text-[11px] font-normal text-slate-400">Relative Weight</span>
        </h5>
        <div className="space-y-2.5">
          {factorBars.map((f) => (
            <div key={f.label} className="text-xs">
              <div className="flex justify-between text-slate-700 mb-1 font-medium">
                <span>
                  {f.label} <span className="text-[11px] text-slate-400 font-mono">({f.weight})</span>
                </span>
                <span className="font-mono text-slate-800 font-bold">{f.score}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, f.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Reasons */}
      <div>
        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Identified Contributing Factors
        </h5>
        <ul className="space-y-2 text-xs text-slate-700">
          {reasons.map((r, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Operational Actions */}
      <div className="border-t border-slate-200 pt-4">
        <h5 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Recommended Coordinator Actions (Non-Clinical)
        </h5>
        <ul className="space-y-1.5 text-xs text-slate-700">
          {recommendedActions.map((act, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-blue-50/60 border border-blue-100 p-2.5 rounded-lg">
              <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>{act}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
