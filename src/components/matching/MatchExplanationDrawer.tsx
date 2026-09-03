import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { CandidateMatchResult } from '../../types/engine.types';
import { StatusBadge } from '../common/StatusBadge';

interface MatchExplanationDrawerProps {
  candidate: CandidateMatchResult;
  onClose: () => void;
}

export const MatchExplanationDrawer: React.FC<MatchExplanationDrawerProps> = ({
  candidate,
  onClose,
}) => {
  const criteria = [
    { label: 'ABO & Immunological Compatibility', weight: '40%', score: candidate.compatibilityScore },
    { label: 'Clinical Urgency Tier', weight: '20%', score: candidate.urgencyScore },
    { label: 'Transit & Cold-Ischemia Feasibility', weight: '20%', score: candidate.timeFeasibilityScore },
    { label: 'Geographic Proximity', weight: '10%', score: candidate.distanceScore },
    { label: 'Waitlist Seniority', weight: '10%', score: candidate.waitingScore },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 p-6 h-full overflow-y-auto flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Candidate Score Audit
              </span>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {candidate.recipientReference}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{candidate.hospitalName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overall Score Banner */}
          <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                Overall Feasibility Score
              </span>
              <span className="text-3xl font-black font-mono text-blue-700">
                {candidate.overallScore}%
              </span>
            </div>
            <StatusBadge type="urgency" value={candidate.urgencyLevel} />
          </div>

          {/* Weighted Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Scoring Formula Decomposition
            </h4>
            <div className="space-y-2.5">
              {criteria.map((c) => (
                <div key={c.label} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-800">{c.label}</span>
                    <span className="font-mono text-blue-700 font-bold">{c.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Reasons List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Qualitative Audit Rationale
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {candidate.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
          >
            Close Audit Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
