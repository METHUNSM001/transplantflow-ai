import React from 'react';
import { AlertCircle, Clock, ShieldCheck, Timer } from 'lucide-react';
import { ColdIschemiaCalculation } from '../../types/engine.types';
import { StatusBadge } from '../common/StatusBadge';

interface ColdIschemiaGaugeProps {
  calculation: ColdIschemiaCalculation;
  organType: string;
}

export const ColdIschemiaGauge: React.FC<ColdIschemiaGaugeProps> = ({
  calculation,
  organType,
}) => {
  const {
    maximumMinutes,
    elapsedMinutes,
    remainingMinutes,
    formattedRemaining,
    formattedElapsed,
    percentageUsed,
    safetyMarginMinutes,
    status,
    isExpired,
  } = calculation;

  // Visual status color
  const statusColor =
    status === 'SAFE'
      ? 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/30'
      : status === 'WARNING'
      ? 'from-amber-500 to-orange-500 text-amber-400 border-amber-500/30'
      : status === 'CRITICAL'
      ? 'from-rose-500 to-red-600 text-rose-400 border-rose-500/40 animate-pulse'
      : 'from-slate-600 to-neutral-700 text-neutral-400 border-neutral-700';

  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background glowing gradient */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${statusColor}`}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Cold-Ischemia Intelligence
          </h4>
        </div>
        <StatusBadge type="safety" value={status} />
      </div>

      {/* Main Countdown Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-5">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Preservation Remaining
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
            {formattedRemaining}
            <span className="text-xs font-sans font-medium text-slate-400">
              ({remainingMinutes}m left)
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Elapsed: <span className="font-mono text-slate-300">{formattedElapsed}</span></span>
            <span>•</span>
            <span>Limit: <span className="font-mono text-slate-300">{maximumMinutes}m ({Math.round(maximumMinutes / 60)}h)</span></span>
          </div>
        </div>

        {/* Safety Margin Callout */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Safety Margin
            </span>
            <span className="text-[10px] text-slate-400">Time - ETA</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 flex items-baseline gap-1.5">
            <span
              className={
                safetyMarginMinutes >= 30
                  ? 'text-emerald-400'
                  : safetyMarginMinutes >= 10
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }
            >
              {safetyMarginMinutes > 0 ? `+${safetyMarginMinutes}` : safetyMarginMinutes}
            </span>
            <span className="text-xs font-sans text-slate-400 font-normal">minutes buffer</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
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
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>Cold-Storage Utilization</span>
          <span className="font-mono">{percentageUsed}% used</span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${statusColor}`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div>
    </div>
  );
};
