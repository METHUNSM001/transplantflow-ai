import React, { useState } from 'react';
import { AlertCircle, Eye, HeartHandshake } from 'lucide-react';
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
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4">
      {/* Title & Important Clinical Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Decision-Support Candidate Ranking
          </h4>
        </div>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Target Organ: {organSummary}
        </span>
      </div>

      {/* Prominent Mandatory Clinical Disclaimer */}
      <div className="bg-blue-50/70 border-l-4 border-blue-600 p-3.5 rounded-r-lg text-xs text-blue-950 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong className="font-bold">Decision-Support Notice: </strong>
          Candidate ranking is generated solely to assist transplant coordinators in evaluating
          time feasibility, immunological compatibility, and clinical acuity. It does NOT determine
          final organ allocation, which must follow authorized national organ procurement policy.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-3">Rank</th>
              <th className="py-3.5 px-3">Recipient Ref</th>
              <th className="py-3.5 px-3">ABO Group</th>
              <th className="py-3.5 px-3">Urgency Tier</th>
              <th className="py-3.5 px-3">Hospital Center</th>
              <th className="py-3.5 px-3">Transit Est.</th>
              <th className="py-3.5 px-3">Feasibility</th>
              <th className="py-3.5 px-3">Overall Match</th>
              <th className="py-3.5 px-3 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((cand, idx) => (
              <tr
                key={cand.recipientId}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                onClick={() => setSelectedCandidate(cand)}
              >
                <td className="py-3.5 px-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                      idx === 0
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                </td>

                <td className="py-3.5 px-3 font-bold font-mono text-slate-900">
                  {cand.recipientReference}
                </td>

                <td className="py-3.5 px-3">
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                    {cand.bloodGroup}
                  </span>
                </td>

                <td className="py-3.5 px-3">
                  <StatusBadge type="urgency" value={cand.urgencyLevel} />
                </td>

                <td className="py-3.5 px-3 font-semibold text-slate-800">{cand.hospitalName}</td>

                <td className="py-3.5 px-3 font-mono font-medium text-slate-600">
                  {cand.estimatedTransitMins}m ({cand.distanceKm} km)
                </td>

                <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                  {cand.timeFeasibilityScore}%
                </td>

                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-blue-700">
                      {cand.overallScore}%
                    </span>
                    <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${cand.overallScore}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCandidate(cand);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
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
