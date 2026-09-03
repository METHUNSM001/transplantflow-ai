import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Sliders } from 'lucide-react';
import { RouteComparisonMatrix } from '../components/simulations/RouteComparisonMatrix';
import { WhatIfDelaySimulator } from '../components/simulations/WhatIfDelaySimulator';
import { simulateDelay } from '../engines/simulationEngine';
import { localStore, subscribeToStore } from '../lib/storage';
import { Hospital, Organ, Transport } from '../types/database.types';

export const SimulationsPage: React.FC = () => {
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedOrganId, setSelectedOrganId] = useState<string>('');

  const loadData = () => {
    const o = localStore.getOrgans();
    const t = localStore.getTransports();
    const h = localStore.getHospitals();

    setOrgans(o);
    setTransports(t);
    setHospitals(h);

    if (!selectedOrganId && o.length > 0) {
      setSelectedOrganId(o[0].id);
    }
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const selectedOrgan = organs.find((o) => o.id === selectedOrganId) || organs[0];
  const selectedTransport = transports.find((t) => t.organ_id === selectedOrgan?.id);
  const destHosp = selectedTransport
    ? hospitals.find((h) => h.id === selectedTransport.destination_hospital_id)
    : undefined;

  // Compute delay scenarios for the comparison chart (+0m, +15m, +30m, +45m, +60m)
  const chartData = selectedOrgan
    ? [0, 15, 30, 45, 60].map((delay) => {
        const res = simulateDelay(
          selectedOrgan,
          selectedTransport,
          delay,
          destHosp?.readiness_score || 80
        );
        return {
          delay: `+${delay}m`,
          safetyMargin: Math.max(-10, res.simulatedSafetyMargin),
          riskScore: res.simulatedRiskScore,
        };
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Organ Selector */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            "What-If" Predictive Simulation Workbench
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Stress-test transit delays, meteorological holdovers, and secondary route scenarios
            against clinical preservation thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs text-slate-700 font-bold whitespace-nowrap">
            Target Organ:
          </label>
          <select
            value={selectedOrganId}
            onChange={(e) => setSelectedOrganId(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {organs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.organ_type} ({o.blood_group}) — {o.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main What-If Delay Simulator Component */}
      {selectedOrgan && (
        <WhatIfDelaySimulator
          organ={selectedOrgan}
          transport={selectedTransport}
          hospitalReadinessScore={destHosp?.readiness_score || 80}
        />
      )}

      {/* Visual Delay Progression Chart (Recharts) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Delay Sensitivity Curve: Safety Margin vs Composite Risk
        </h4>
        <p className="text-xs text-slate-500">
          Visualizes how incremental transit delays compress remaining preservation buffer and
          elevate clinical operational risk.
        </p>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="delay" stroke="#64748b" fontSize={11} fontStyle="bold" />
              <YAxis stroke="#64748b" fontSize={11} fontStyle="bold" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: '#0f172a',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="safetyMargin" fill="#059669" name="Safety Margin (Minutes)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="riskScore" fill="#dc2626" name="Predicted Risk Score (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alternative Scenario & Modality Comparison Matrix */}
      {selectedOrgan && (
        <RouteComparisonMatrix organ={selectedOrgan} transport={selectedTransport} />
      )}
    </div>
  );
};
