import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Search, Users } from 'lucide-react';
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
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Waitlist Candidate Registry
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Registered transplant candidates across regional partner medical centers with clinical
          urgency tiers and HLA screening data.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate reference, organ type, blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <Link
          to="/matching"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition shrink-0"
        >
          <HeartHandshake className="w-4 h-4" /> Run Matching Engine
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
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
                  <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {r.recipient_reference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{r.organ_type}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{r.blood_group}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="urgency" value={r.urgency_level} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{hosp?.name || 'Unknown'}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{waitDays} days</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {JSON.stringify(r.compatibility_data || {})}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold font-mono text-[10px]">
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
