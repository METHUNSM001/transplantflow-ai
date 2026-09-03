import React, { useEffect, useState } from 'react';
import { Navigation } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LiveTransportMap } from '../components/maps/LiveTransportMap';
import { localStore, subscribeToStore } from '../lib/storage';
import { Hospital, Organ, Transport } from '../types/database.types';

export const TransportsPage: React.FC = () => {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [, setOrgans] = useState<Organ[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedTransportId, setSelectedTransportId] = useState<string>('');

  const loadData = () => {
    const t = localStore.getTransports();
    const o = localStore.getOrgans();
    const h = localStore.getHospitals();

    setTransports(t);
    setOrgans(o);
    setHospitals(h);

    if (!selectedTransportId && t.length > 0) {
      setSelectedTransportId(t[0].id);
    }
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const selectedTransport = transports.find((t) => t.id === selectedTransportId) || transports[0];
  const originHosp = selectedTransport
    ? hospitals.find((h) => h.id === selectedTransport.origin_hospital_id)
    : undefined;
  const destHosp = selectedTransport
    ? hospitals.find((h) => h.id === selectedTransport.destination_hospital_id)
    : undefined;

  const handleAddDelay = (mins: number) => {
    if (!selectedTransport) return;
    const nextDelay = (selectedTransport.delay_minutes || 0) + mins;
    localStore.updateTransportLocation(
      selectedTransport.id,
      selectedTransport.current_latitude || 41.5,
      selectedTransport.current_longitude || -72.5,
      nextDelay
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Navigation className="w-6 h-6 text-blue-600" />
          Real-Time Transport Telemetry & Map
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Live GPS tracking, route delay detection, dynamic ETA calculations, and vehicle simulation.
        </p>
      </div>

      {/* Selected Transport Live Map View */}
      {selectedTransport && (
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Live Mission Telemetry
              </span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {selectedTransport.transport_mode} — {originHosp?.name} ➔ {destHosp?.name}
              </h3>
            </div>

            {/* Delay Injection Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Inject Delay:</span>
              <button
                onClick={() => handleAddDelay(10)}
                className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition"
              >
                +10m
              </button>
              <button
                onClick={() => handleAddDelay(20)}
                className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition"
              >
                +20m
              </button>
            </div>
          </div>

          <LiveTransportMap
            transport={selectedTransport}
            originHospital={originHosp}
            destinationHospital={destHosp}
            heightClass="h-96"
            allowSimulatedMovement={true}
          />
        </div>
      )}

      {/* Transports Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Active Transport Manifest
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Transport ID</th>
                <th className="py-3.5 px-4">Modality</th>
                <th className="py-3.5 px-4">Origin Center</th>
                <th className="py-3.5 px-4">Destination Center</th>
                <th className="py-3.5 px-4">ETA Window</th>
                <th className="py-3.5 px-4">Delay</th>
                <th className="py-3.5 px-4">Route Risk</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transports.map((t) => {
                const oHosp = hospitals.find((h) => h.id === t.origin_hospital_id);
                const dHosp = hospitals.find((h) => h.id === t.destination_hospital_id);
                const isSelected = t.id === selectedTransportId;

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTransportId(t.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {t.transport_mode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{oHosp?.name || 'Unknown'}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{dHosp?.name || 'Unknown'}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">
                      {new Date(t.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {t.delay_minutes > 0 ? (
                        <span className="text-amber-700 font-bold">+{t.delay_minutes}m</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0m</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="risk" value={t.route_risk} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="status" value={t.status} />
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
