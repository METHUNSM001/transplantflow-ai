import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { Hospital } from '../../types/database.types';

interface HospitalReadinessWidgetProps {
  hospitals: Hospital[];
}

export const HospitalReadinessWidget: React.FC<HospitalReadinessWidgetProps> = ({ hospitals }) => {
  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wide">
            Partner Hospital Readiness Matrix
          </h4>
        </div>
        <Link
          to="/hospitals"
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
        >
          Manage Triage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {hospitals.slice(0, 4).map((h) => {
          const score = h.readiness_score;

          return (
            <div
              key={h.id}
              className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h5 className="font-bold text-xs text-slate-100 truncate">{h.name}</h5>
                <span className="text-[10px] text-slate-400">
                  {h.city}, {h.state}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className={`h-full rounded-full ${
                      score === 100
                        ? 'bg-emerald-400'
                        : score >= 80
                        ? 'bg-cyan-400'
                        : score >= 60
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span
                  className={`font-mono font-bold text-xs ${
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
