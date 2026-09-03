import React, { useEffect, useState } from 'react';
import { Clock, Navigation, Plus, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LiveTransportMap } from '../components/maps/LiveTransportMap';
import { localStore, subscribeToStore } from '../lib/storage';
import { Hospital, Organ, Transport } from '../types/database.types';

export const TransportsPage: React.FC = () => {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [organs, setOrgans] = useState<Organ[]>([]);
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
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Navigation className="w-6 h-6 text-cyan-400" />
          Real-Time Transport Telemetry & Map
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Live GPS tracking, route delay detection, dynamic ETA calculations, and vehicle simulation.
        </p>
      </div>

      {/* Selected Transport Live Map View */}
      {selectedTransport && (
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                Live Mission Telemetry
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {selectedTransport.transport_mode} — {originHosp?.name} ➔ {destHosp?.name}
              </h3>
            </div>

            {/* Delay Injection Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Inject Delay:</span>
              <button
                onClick={() => handleAddDelay(10)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700"
              >
                +10m
              </button>
              <button
                onClick={() => handleAddDelay(20)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold border border-slate-700"
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
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Transport Manifest
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/80">
              {transports.map((t) => {
                const oHosp = hospitals.find((h) => h.id === t.origin_hospital_id);
                const dHosp = hospitals.find((h) => h.id === t.destination_hospital_id);
                const isSelected = t.id === selectedTransportId;

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTransportId(t.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/30' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {t.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {t.transport_mode}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{oHosp?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate-300">{dHosp?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300">
                      {new Date(t.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {t.delay_minutes > 0 ? (
                        <span className="text-amber-400 font-bold">+{t.delay_minutes}m</span>
                      ) : (
                        <span className="text-emerald-400">0m</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="risk" value={t.route_risk} />
                    </td>
                    <td className="py-3 px-4">
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
