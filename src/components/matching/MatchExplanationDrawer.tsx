import React from 'react';
import { AlertCircle, CheckCircle, CheckCircle2, ChevronRight, HelpCircle, X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 p-6 h-full overflow-y-auto flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                Candidate Score Audit
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {candidate.recipientReference}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{candidate.hospitalName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overall Score Banner */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block">
                Overall Feasibility Score
              </span>
              <span className="text-3xl font-black font-mono text-purple-200">
                {candidate.overallScore}%
              </span>
            </div>
            <StatusBadge type="urgency" value={candidate.urgencyLevel} />
          </div>

          {/* Weighted Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Scoring Formula Decomposition
            </h4>
            <div className="space-y-2.5">
              {criteria.map((c) => (
                <div key={c.label} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">{c.label}</span>
                    <span className="font-mono text-purple-300 font-bold">{c.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Reasons List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Qualitative Audit Rationale
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {candidate.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Audit Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
