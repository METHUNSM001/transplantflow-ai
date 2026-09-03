import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter, Layers, Plus, Search } from 'lucide-react';
import { ORGAN_ICONS, ORGAN_MAX_PRESERVATION_MINUTES } from '../config/constants';
import { calculateColdIschemia } from '../engines/coldIschemiaEngine';
import { calculateRisk } from '../engines/riskEngine';
import { localStore, subscribeToStore } from '../lib/storage';
import { BloodGroup, Hospital, Organ, OrganStatus, OrganType, PriorityLevel, Transport } from '../types/database.types';
import { StatusBadge } from '../components/common/StatusBadge';

export const OrgansPage: React.FC = () => {
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New organ form state
  const [newOrganType, setNewOrganType] = useState<OrganType>('Heart');
  const [newBloodGroup, setNewBloodGroup] = useState<BloodGroup>('O+');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('URGENT');

  const loadData = () => {
    setOrgans(localStore.getOrgans());
    setTransports(localStore.getTransports());
    setHospitals(localStore.getHospitals());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const handleCreateOrgan = (e: React.FormEvent) => {
    e.preventDefault();
    const maxPres = ORGAN_MAX_PRESERVATION_MINUTES[newOrganType] || 240;
    const now = new Date();

    const created: Organ = {
      id: `organ-${newOrganType.toLowerCase()}-${Date.now().toString(36)}`,
      organ_type: newOrganType,
      blood_group: newBloodGroup,
      retrieval_time: now.toISOString(),
      preservation_start_time: now.toISOString(),
      maximum_preservation_minutes: maxPres,
      status: 'AVAILABLE',
      priority: newPriority,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    localStore.saveOrgan(created);
    setIsCreateModalOpen(false);
  };

  // Filter logic
  const filteredOrgans = organs.filter((organ) => {
    const matchesSearch =
      organ.organ_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organ.blood_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organ.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || organ.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || organ.organ_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Organ Inventory & Preservation Registry
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time cold-ischemia telemetry, destination hospital coordination, and risk scoring.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Register New Organ
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search organ type, blood group, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="MATCHED">Matched</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="ARRIVED">Arrived</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Organs</option>
            <option value="Heart">Heart</option>
            <option value="Lung">Lung</option>
            <option value="Liver">Liver</option>
            <option value="Kidney">Kidney</option>
            <option value="Pancreas">Pancreas</option>
          </select>
        </div>
      </div>

      {/* Organs Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Organ & ID</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Preservation Remaining</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">ETA Window</th>
                <th className="py-3.5 px-4">Safety Margin</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No organs match your current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredOrgans.map((organ) => {
                  const transport = transports.find((t) => t.organ_id === organ.id);
                  const destHospital = transport
                    ? hospitals.find((h) => h.id === transport.destination_hospital_id)
                    : undefined;

                  const etaMins = transport?.estimated_duration_minutes || 45;
                  const pres = calculateColdIschemia(
                    organ.preservation_start_time,
                    organ.maximum_preservation_minutes,
                    etaMins
                  );

                  const risk = calculateRisk({
                    remainingPreservationMinutes: pres.remainingMinutes,
                    maximumPreservationMinutes: organ.maximum_preservation_minutes,
                    etaMinutes: etaMins,
                    delayMinutes: transport?.delay_minutes || 0,
                    distanceKm: transport ? Number(transport.estimated_distance_km) : 100,
                    hospitalReadinessScore: destHospital?.readiness_score || 80,
                    priority: organ.priority,
                    routeCondition: transport?.route_risk,
                  });

                  return (
                    <tr
                      key={organ.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{ORGAN_ICONS[organ.organ_type] || '🧬'}</span>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{organ.organ_type}</span>
                            <span className="block text-[11px] font-mono text-slate-400">
                              {organ.id.substring(0, 14)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {organ.blood_group}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge type="status" value={organ.status} />
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 text-sm block">
                          {pres.formattedRemaining}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {pres.percentageUsed}% used
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {destHospital ? destHospital.name : 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {transport ? `${etaMins} mins` : '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={
                            pres.safetyMarginMinutes >= 30
                              ? 'text-emerald-700'
                              : pres.safetyMarginMinutes >= 10
                              ? 'text-amber-700'
                              : 'text-red-600'
                          }
                        >
                          {pres.safetyMarginMinutes > 0 ? `+${pres.safetyMarginMinutes}m` : `${pres.safetyMarginMinutes}m`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge type="risk" value={risk.level} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/organs/${organ.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-semibold text-xs transition border border-blue-200"
                        >
                          Digital Twin <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register New Organ Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Register Retrieved Organ
            </h3>
            <p className="text-xs text-slate-500">
              Initializes a new clinical digital twin with automated cold-ischemia countdown.
            </p>

            <form onSubmit={handleCreateOrgan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organ Type</label>
                <select
                  value={newOrganType}
                  onChange={(e) => setNewOrganType(e.target.value as OrganType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Heart">Heart (Max 4 hrs / 240 mins)</option>
                  <option value="Lung">Lung (Max 6 hrs / 360 mins)</option>
                  <option value="Liver">Liver (Max 12 hrs / 720 mins)</option>
                  <option value="Kidney">Kidney (Max 24 hrs / 1440 mins)</option>
                  <option value="Pancreas">Pancreas (Max 12 hrs / 720 mins)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Donor Blood Group</label>
                <select
                  value={newBloodGroup}
                  onChange={(e) => setNewBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none font-mono focus:border-blue-500"
                >
                  <option value="O+">O+ (Rh-positive universal)</option>
                  <option value="O-">O- (Universal donor)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Clinical Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="URGENT">Urgent Allocation</option>
                  <option value="CRITICAL_RESCUE">Critical Rescue Allocation</option>
                  <option value="STANDARD">Standard Protocol</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Start Twin & Clock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
