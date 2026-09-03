import React from 'react';
import { CheckCircle, GitCompare, Plane, ShieldCheck, Truck } from 'lucide-react';
import { evaluateAlternativeScenarios } from '../../engines/routeScenarioEngine';
import { Organ, Transport } from '../../types/database.types';
import { StatusBadge } from '../common/StatusBadge';

interface RouteComparisonMatrixProps {
  organ: Organ;
  transport?: Transport;
}

export const RouteComparisonMatrix: React.FC<RouteComparisonMatrixProps> = ({ organ, transport }) => {
  const scenarios = evaluateAlternativeScenarios(
    organ,
    transport,
    transport ? Number(transport.estimated_distance_km) : 280
  );

  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Alternative Route & Multi-Modal Scenario Comparison
          </h4>
        </div>
        <span className="text-xs text-slate-400 font-mono">Decision-Support Guidance</span>
      </div>

      <p className="text-xs text-slate-400">
        Compares alternative routing vectors and transport modalities (Ground Ambulance, Medevac
        Helicopter, Fixed-Wing Air) to determine the safest operational envelope.
      </p>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Scenario / Modality</th>
              <th className="py-3 px-4">Distance</th>
              <th className="py-3 px-4">Transit ETA</th>
              <th className="py-3 px-4">Safety Margin</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Est. Cost</th>
              <th className="py-3 px-4 text-center">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {scenarios.map((s) => (
              <tr
                key={s.id}
                className={`transition-colors ${
                  s.isRecommended
                    ? 'bg-cyan-950/20 hover:bg-cyan-950/30'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {s.mode === 'Helicopter' ? '🚁' : s.mode === 'Air Ambulance' ? '✈️' : '🚑'}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {s.name}
                        {s.isRecommended && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                            Optimal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {s.routeDescription}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 font-mono">{s.distanceKm} km</td>
                <td className="py-3 px-4 font-mono font-semibold text-white">{s.etaFormatted}</td>

                <td className="py-3 px-4 font-mono">
                  <span
                    className={
                      s.safetyMarginMinutes >= 30
                        ? 'text-emerald-400 font-bold'
                        : s.safetyMarginMinutes >= 10
                        ? 'text-amber-400 font-bold'
                        : 'text-rose-400 font-bold'
                    }
                  >
                    {s.safetyMarginMinutes > 0 ? `+${s.safetyMarginMinutes}m` : `${s.safetyMarginMinutes}m`}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">{s.riskScore}%</span>
                    <StatusBadge type="risk" value={s.riskLevel} />
                  </div>
                </td>

                <td className="py-3 px-4 font-mono text-slate-400">
                  ${s.costEstimateUSD.toLocaleString()}
                </td>

                <td className="py-3 px-4 text-center">
                  {s.isRecommended ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" /> Recommended
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Alternative</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
