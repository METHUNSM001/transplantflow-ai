import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { RiskAssessment } from '../../types/engine.types';
import { StatusBadge } from '../common/StatusBadge';

interface RiskRadarProps {
  assessment: RiskAssessment;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ assessment }) => {
  const { score, level, reasons, recommendedActions, factors } = assessment;

  const scoreColor =
    level === 'LOW'
      ? 'text-emerald-400'
      : level === 'MEDIUM'
      ? 'text-sky-400'
      : level === 'HIGH'
      ? 'text-amber-400'
      : 'text-rose-400 animate-pulse';

  const progressBg =
    level === 'LOW'
      ? 'from-emerald-500 to-teal-500'
      : level === 'MEDIUM'
      ? 'from-sky-500 to-blue-500'
      : level === 'HIGH'
      ? 'from-amber-500 to-orange-500'
      : 'from-rose-600 to-red-600';

  const factorBars = [
    { label: 'Time Pressure', weight: '40%', score: factors.timePressureScore },
    { label: 'Transport Delay', weight: '20%', score: factors.transportDelayScore },
    { label: 'Hospital Readiness Deficit', weight: '20%', score: factors.hospitalReadinessScore },
    { label: 'Route Risk', weight: '10%', score: factors.routeRiskScore },
    { label: 'Operational Priority', weight: '10%', score: factors.operationalFactorScore },
  ];

  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Predictive Risk Engine
          </h4>
        </div>
        <StatusBadge type="risk" value={level} />
      </div>

      {/* Main Score Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${scoreColor}`}>
            {score}%
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Calculated Composite Risk
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Level: <strong className="text-slate-200">{level}</strong> • Multi-factor predictive evaluation
            </p>
          </div>
        </div>

        {/* Mini Meter */}
        <div className="w-full sm:w-48">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
            <span>0</span>
            <span>30</span>
            <span>55</span>
            <span>75</span>
            <span>100</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressBg} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div>
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Contributing Risk Factors</span>
          <span className="text-[10px] font-normal text-slate-400">Formula Weights</span>
        </h5>
        <div className="space-y-2">
          {factorBars.map((f) => (
            <div key={f.label} className="text-xs">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>
                  {f.label} <span className="text-[10px] text-slate-400 font-mono">({f.weight})</span>
                </span>
                <span className="font-mono text-slate-200">{f.score}/100</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500/80 rounded-full"
                  style={{ width: `${Math.min(100, f.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Reasons */}
      <div>
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Identified Contributing Factors
        </h5>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {reasons.map((r, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Operational Actions */}
      <div className="border-t border-slate-800/80 pt-4">
        <h5 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Recommended Coordinator Actions (Non-Clinical)
        </h5>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {recommendedActions.map((act, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-cyan-950/20 border border-cyan-500/20 p-2 rounded-lg">
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{act}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
