import React from 'react';
import { GitCompare, ShieldCheck } from 'lucide-react';
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
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Alternative Route & Multi-Modal Scenario Comparison
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
          Decision-Support Guidance
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Compares alternative routing corridors and transit modalities (Ground Ambulance, Medevac
        Helicopter, Fixed-Wing Air) to evaluate the lowest-risk operational vector.
      </p>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Scenario / Modality</th>
              <th className="py-3.5 px-4">Distance</th>
              <th className="py-3.5 px-4">Transit ETA</th>
              <th className="py-3.5 px-4">Safety Margin</th>
              <th className="py-3.5 px-4">Risk Score</th>
              <th className="py-3.5 px-4">Est. Cost</th>
              <th className="py-3.5 px-4 text-center">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scenarios.map((s) => (
              <tr
                key={s.id}
                className={`transition-colors ${
                  s.isRecommended
                    ? 'bg-blue-50/50 hover:bg-blue-50/80 font-medium'
                    : 'hover:bg-slate-50/60'
                }`}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {s.mode === 'Helicopter' ? '🚁' : s.mode === 'Air Ambulance' ? '✈️' : '🚑'}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {s.name}
                        {s.isRecommended && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Optimal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {s.routeDescription}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono font-medium">{s.distanceKm} km</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.etaFormatted}</td>

                <td className="py-3.5 px-4 font-mono">
                  <span
                    className={
                      s.safetyMarginMinutes >= 30
                        ? 'text-emerald-700 font-bold'
                        : s.safetyMarginMinutes >= 10
                        ? 'text-amber-700 font-bold'
                        : 'text-red-600 font-bold'
                    }
                  >
                    {s.safetyMarginMinutes > 0 ? `+${s.safetyMarginMinutes}m` : `${s.safetyMarginMinutes}m`}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{s.riskScore}%</span>
                    <StatusBadge type="risk" value={s.riskLevel} />
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-slate-500">
                  ${s.costEstimateUSD.toLocaleString()}
                </td>

                <td className="py-3.5 px-4 text-center">
                  {s.isRecommended ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Recommended
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
