import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { Hospital } from '../../types/database.types';

interface HospitalReadinessWidgetProps {
  hospitals: Hospital[];
}

export const HospitalReadinessWidget: React.FC<HospitalReadinessWidgetProps> = ({ hospitals }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900">
            Hospital Readiness Status
          </h4>
        </div>
        <Link
          to="/hospitals"
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition"
        >
          Manage Triage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {hospitals.slice(0, 4).map((h) => {
          const score = h.readiness_score;

          return (
            <div
              key={h.id}
              className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h5 className="font-bold text-xs text-slate-900 truncate">{h.name}</h5>
                <span className="text-[11px] text-slate-500 font-medium">
                  {h.city}, {h.state}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className={`h-full rounded-full ${
                      score === 100
                        ? 'bg-emerald-500'
                        : score >= 80
                        ? 'bg-blue-600'
                        : score >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span
                  className={`font-mono font-bold text-xs ${
                    score === 100
                      ? 'text-emerald-700'
                      : score >= 80
                      ? 'text-blue-700'
                      : score >= 60
                      ? 'text-amber-700'
                      : 'text-red-700'
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
