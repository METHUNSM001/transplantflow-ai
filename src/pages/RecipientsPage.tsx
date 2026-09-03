import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, HeartHandshake, Search, Users } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { localStore, subscribeToStore } from '../lib/storage';
import { Hospital, Recipient } from '../types/database.types';

export const RecipientsPage: React.FC = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    setRecipients(localStore.getRecipients());
    setHospitals(localStore.getHospitals());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const filtered = recipients.filter((r) => {
    return (
      r.recipient_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.organ_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.blood_group.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Waitlist Candidate Registry
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Registered transplant candidates across regional partner medical centers with clinical
          urgency tiers and HLA screening data.
        </p>
      </div>

      {/* Search */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate reference, organ type, blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <Link
          to="/matching"
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow transition shrink-0"
        >
          <HeartHandshake className="w-4 h-4" /> Run Matching Engine
        </Link>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Candidate Reference</th>
                <th className="py-3.5 px-4">Organ Needed</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Urgency Tier</th>
                <th className="py-3.5 px-4">Hospital Center</th>
                <th className="py-3.5 px-4">Waitlist Days</th>
                <th className="py-3.5 px-4">Immunological Data</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((r) => {
                const hosp = hospitals.find((h) => h.id === r.recipient_hospital_id);
                const waitDays = Math.max(
                  1,
                  Math.floor(
                    (new Date().getTime() - new Date(r.waiting_since).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                );

                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {r.recipient_reference}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{r.organ_type}</td>
                    <td className="py-3 px-4 font-mono font-bold">{r.blood_group}</td>
                    <td className="py-3 px-4">
                      <StatusBadge type="urgency" value={r.urgency_level} />
                    </td>
                    <td className="py-3 px-4 text-slate-300">{hosp?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 font-mono">{waitDays} days</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {JSON.stringify(r.compatibility_data || {})}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
