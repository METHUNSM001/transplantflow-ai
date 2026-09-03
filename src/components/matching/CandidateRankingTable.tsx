import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ChevronRight, Eye, HeartHandshake, Info } from 'lucide-react';
import { CandidateMatchResult } from '../../types/engine.types';
import { StatusBadge } from '../common/StatusBadge';
import { MatchExplanationDrawer } from './MatchExplanationDrawer';

interface CandidateRankingTableProps {
  candidates: CandidateMatchResult[];
  organSummary: string;
}

export const CandidateRankingTable: React.FC<CandidateRankingTableProps> = ({
  candidates,
  organSummary,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchResult | null>(null);

  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Title & Important Clinical Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-purple-400" />
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Decision-Support Candidate Ranking
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/50 px-3 py-1 rounded-full border border-purple-500/30">
          Target: {organSummary}
        </span>
      </div>

      {/* Prominent Mandatory Clinical Disclaimer */}
      <div className="bg-slate-950/80 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs text-slate-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-amber-300">Decision-Support Notice: </strong>
          Candidate ranking is generated solely to assist transplant coordinators in evaluating
          time feasibility, immunological compatibility, and clinical acuity. It does NOT determine
          final organ allocation, which must follow authorized national organ procurement policy.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Rank</th>
              <th className="py-3 px-3">Recipient Ref</th>
              <th className="py-3 px-3">ABO Group</th>
              <th className="py-3 px-3">Urgency Tier</th>
              <th className="py-3 px-3">Hospital Center</th>
              <th className="py-3 px-3">Transit Est.</th>
              <th className="py-3 px-3">Feasibility</th>
              <th className="py-3 px-3">Overall Match</th>
              <th className="py-3 px-3 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {candidates.map((cand, idx) => (
              <tr
                key={cand.recipientId}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                onClick={() => setSelectedCandidate(cand)}
              >
                <td className="py-3 px-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                      idx === 0
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                </td>

                <td className="py-3 px-3 font-bold font-mono text-white">
                  {cand.recipientReference}
                </td>

                <td className="py-3 px-3">
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
                    {cand.bloodGroup}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <StatusBadge type="urgency" value={cand.urgencyLevel} />
                </td>

                <td className="py-3 px-3 font-medium text-slate-200">{cand.hospitalName}</td>

                <td className="py-3 px-3 font-mono">
                  {cand.estimatedTransitMins}m ({cand.distanceKm} km)
                </td>

                <td className="py-3 px-3 font-mono font-bold text-slate-300">
                  {cand.timeFeasibilityScore}%
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-purple-300">
                      {cand.overallScore}%
                    </span>
                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${cand.overallScore}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCandidate(cand);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                    title="Inspect scoring breakdown"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Audit Breakdown Drawer */}
      {selectedCandidate && (
        <MatchExplanationDrawer
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};
