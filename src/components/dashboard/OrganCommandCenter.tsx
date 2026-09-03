import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Timer } from 'lucide-react';
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
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            Active Organ Tracking & Preservation Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cold-ischemia countdowns, transport ETAs, and predictive safety margins
          </p>
        </div>
        <Link
          to="/organs"
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition self-start sm:self-auto"
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
              className={`p-5 rounded-xl border transition-all duration-150 flex flex-col justify-between bg-white shadow-sm hover:shadow ${
                preservation.status === 'CRITICAL'
                  ? 'border-red-300 ring-1 ring-red-200'
                  : preservation.status === 'WARNING'
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header: Icon, Type, Blood */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {organ.organ_type}
                        <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700">
                          {organ.blood_group}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {organ.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <StatusBadge type="risk" value={risk.level} />
                </div>

                {/* Countdown display */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 mb-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1 uppercase font-semibold">
                    <span>Preservation Window</span>
                    <span className="font-mono text-blue-600 font-bold">{preservation.percentageUsed}% used</span>
                  </div>
                  <div className="text-xl font-black font-mono tracking-tight text-slate-900">
                    {preservation.formattedRemaining}
                  </div>
                </div>

                {/* Safety Margin */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="text-slate-500 text-xs font-medium">Safety Margin:</span>
                  <span
                    className={`font-mono font-bold ${
                      preservation.safetyMarginMinutes >= 30
                        ? 'text-emerald-700'
                        : preservation.safetyMarginMinutes >= 10
                        ? 'text-amber-700'
                        : 'text-red-600 font-black'
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
                className="w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-semibold text-xs text-center border border-blue-200 transition flex items-center justify-center gap-1.5"
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
