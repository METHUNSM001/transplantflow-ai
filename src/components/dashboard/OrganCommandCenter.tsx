import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ShieldCheck, Timer } from 'lucide-react';
import { ORGAN_ICONS } from '../../config/constants';
import { calculateColdIschemia } from '../../engines/coldIschemiaEngine';
import { calculateRisk } from '../../engines/riskEngine';
import { Organ, Transport } from '../../types/database.types';
import { StatusBadge } from '../common/StatusBadge';

interface OrganCommandCenterProps {
  organs: Organ[];
  transports: Transport[];
}

export const OrganCommandCenter: React.FC<OrganCommandCenterProps> = ({ organs, transports }) => {
  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Timer className="w-5 h-5 text-cyan-400" />
            Transplant Command Center — Multi-Organ Overview
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active cold-ischemia clocks, real-time safety margins, and predictive risk telemetry
          </p>
        </div>
        <Link
          to="/organs"
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
        >
          View All Organs <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Organ Command Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {organs.slice(0, 4).map((organ) => {
          const transport = transports.find((t) => t.organ_id === organ.id);
          const etaMins = transport?.estimated_duration_minutes || 45;

          const preservation = calculateColdIschemia(
            organ.preservation_start_time,
            organ.maximum_preservation_minutes,
            etaMins
          );

          const risk = calculateRisk({
            remainingPreservationMinutes: preservation.remainingMinutes,
            maximumPreservationMinutes: organ.maximum_preservation_minutes,
            etaMinutes: etaMins,
            delayMinutes: transport?.delay_minutes || 0,
            distanceKm: transport ? Number(transport.estimated_distance_km) : 100,
            hospitalReadinessScore: 80,
            priority: organ.priority,
            routeCondition: transport?.route_risk,
          });

          const icon = ORGAN_ICONS[organ.organ_type] || '🧬';

          return (
            <div
              key={organ.id}
              className={`p-4 rounded-xl border bg-slate-950/70 transition-all duration-200 hover:border-slate-700 flex flex-col justify-between ${
                preservation.status === 'CRITICAL'
                  ? 'border-rose-500/50 shadow-rose-950/30 shadow-lg ring-1 ring-rose-500/30'
                  : preservation.status === 'WARNING'
                  ? 'border-amber-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header: Icon, Type, Blood */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        {organ.organ_type}
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                          {organ.blood_group}
                        </span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {organ.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <StatusBadge type="risk" value={risk.level} />
                </div>

                {/* Countdown display */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 mb-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 uppercase font-semibold">
                    <span>Remaining Window</span>
                    <span className="font-mono text-cyan-400">{preservation.percentageUsed}% used</span>
                  </div>
                  <div className="text-xl font-black font-mono tracking-tight text-white">
                    {preservation.formattedRemaining}
                  </div>
                </div>

                {/* Safety Margin */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-400 text-[11px]">Safety Margin:</span>
                  <span
                    className={`font-mono font-bold ${
                      preservation.safetyMarginMinutes >= 30
                        ? 'text-emerald-400'
                        : preservation.safetyMarginMinutes >= 10
                        ? 'text-amber-400'
                        : 'text-rose-400 font-extrabold'
                    }`}
                  >
                    {preservation.safetyMarginMinutes > 0
                      ? `+${preservation.safetyMarginMinutes}m`
                      : `${preservation.safetyMarginMinutes}m`}
                  </span>
                </div>
              </div>

              {/* Digital Twin Link */}
              <Link
                to={`/organs/${organ.id}`}
                className="w-full py-2 rounded-lg bg-slate-800/80 hover:bg-cyan-600 hover:text-white text-cyan-300 font-semibold text-xs text-center border border-slate-700/60 transition flex items-center justify-center gap-1.5"
              >
                Inspect Digital Twin <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
