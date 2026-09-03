import React from 'react';
import { Clock, ShieldCheck, Timer } from 'lucide-react';
import { ColdIschemiaCalculation } from '../../types/engine.types';
import { StatusBadge } from '../common/StatusBadge';

interface ColdIschemiaGaugeProps {
  calculation: ColdIschemiaCalculation;
  organType: string;
}

export const ColdIschemiaGauge: React.FC<ColdIschemiaGaugeProps> = ({
  calculation,
}) => {
  const {
    maximumMinutes,
    remainingMinutes,
    formattedRemaining,
    formattedElapsed,
    percentageUsed,
    safetyMarginMinutes,
    status,
  } = calculation;

  const barColor =
    status === 'SAFE'
      ? 'bg-emerald-500'
      : status === 'WARNING'
      ? 'bg-amber-500'
      : status === 'CRITICAL'
      ? 'bg-red-500'
      : 'bg-slate-400';

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Cold-Ischemia Intelligence
          </h4>
        </div>
        <StatusBadge type="safety" value={status} />
      </div>

      {/* Main Countdown Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-5">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Preservation Remaining
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 flex items-baseline gap-2">
            {formattedRemaining}
            <span className="text-xs font-sans font-semibold text-slate-500">
              ({remainingMinutes}m remaining)
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
            <span>Elapsed: <span className="font-mono text-slate-700 font-semibold">{formattedElapsed}</span></span>
            <span>•</span>
            <span>Limit: <span className="font-mono text-slate-700 font-semibold">{maximumMinutes}m ({Math.round(maximumMinutes / 60)}h)</span></span>
          </div>
        </div>

        {/* Safety Margin Callout */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Safety Margin
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Remaining − ETA</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 flex items-baseline gap-1.5">
            <span
              className={
                safetyMarginMinutes >= 30
                  ? 'text-emerald-700'
                  : safetyMarginMinutes >= 10
                  ? 'text-amber-700'
                  : 'text-red-600'
              }
            >
              {safetyMarginMinutes > 0 ? `+${safetyMarginMinutes}` : safetyMarginMinutes}
            </span>
            <span className="text-xs font-sans text-slate-500 font-normal">minutes buffer</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {safetyMarginMinutes >= 30
              ? '🟢 Safe operating window'
              : safetyMarginMinutes >= 10
              ? '🟠 Margin compressed — monitor traffic'
              : '🔴 Critical threshold — imminent degradation'}
          </p>
        </div>
      </div>

      {/* Preservation Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <span>Cold-Storage Window Utilization</span>
          <span className="font-mono font-bold text-slate-700">{percentageUsed}% used</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div>
    </div>
  );
};
