import React, { useEffect, useState } from 'react';
import { CandidateRankingTable } from '../components/matching/CandidateRankingTable';
import { MatchingCriteriaWeightControls } from '../components/matching/MatchingCriteriaWeightControls';
import { calculateColdIschemia } from '../engines/coldIschemiaEngine';
import { DEFAULT_MATCHING_WEIGHTS, rankCandidatesForOrgan } from '../engines/matchingEngine';
import { localStore, subscribeToStore } from '../lib/storage';
import { Hospital, Organ, Recipient, Transport } from '../types/database.types';
import { MatchingWeights } from '../types/engine.types';

export const MatchingPage: React.FC = () => {
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);

  const [selectedOrganId, setSelectedOrganId] = useState<string>('');
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_MATCHING_WEIGHTS);

  const loadData = () => {
    const o = localStore.getOrgans();
    const r = localStore.getRecipients();
    const h = localStore.getHospitals();
    const t = localStore.getTransports();

    setOrgans(o);
    setRecipients(r);
    setHospitals(h);
    setTransports(t);

    if (!selectedOrganId && o.length > 0) {
      setSelectedOrganId(o[0].id);
    }
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const selectedOrgan = organs.find((o) => o.id === selectedOrganId) || organs[0];

  const remainingPreservationMins = selectedOrgan
    ? calculateColdIschemia(selectedOrgan.preservation_start_time, selectedOrgan.maximum_preservation_minutes)
        .remainingMinutes
    : 180;

  const rankedCandidates = selectedOrgan
    ? rankCandidatesForOrgan(selectedOrgan, recipients, hospitals, remainingPreservationMins, weights)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Decision-Support Organ-Recipient Matching
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multi-criteria algorithmic ranking evaluating immunological compatibility, cold-ischemia
            feasibility, and clinical acuity.
          </p>
        </div>

        {/* Organ Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-300 font-semibold whitespace-nowrap">
            Select Organ:
          </label>
          <select
            value={selectedOrganId}
            onChange={(e) => setSelectedOrganId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-purple-500"
          >
            {organs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.organ_type} ({o.blood_group}) — {o.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Criteria Weight Sliders */}
      <MatchingCriteriaWeightControls weights={weights} onChange={setWeights} />

      {/* Candidate Ranking Table */}
      {selectedOrgan && (
        <CandidateRankingTable
          candidates={rankedCandidates}
          organSummary={`${selectedOrgan.organ_type} (${selectedOrgan.blood_group})`}
        />
      )}
    </div>
  );
};
