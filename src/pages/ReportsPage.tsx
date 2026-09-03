import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Download, FileSpreadsheet, Layers, ShieldCheck } from 'lucide-react';
import { calculateColdIschemia } from '../engines/coldIschemiaEngine';
import { calculateRisk } from '../engines/riskEngine';
import { localStore, subscribeToStore } from '../lib/storage';
import { Alert, Hospital, Organ, Transport } from '../types/database.types';

export const ReportsPage: React.FC = () => {
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadData = () => {
    setOrgans(localStore.getOrgans());
    setTransports(localStore.getTransports());
    setHospitals(localStore.getHospitals());
    setAlerts(localStore.getAlerts());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  // 1. Organs by status
  const statusCounts: Record<string, number> = {};
  organs.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const organStatusData = Object.keys(statusCounts).map((k) => ({
    name: k.replace(/_/g, ' '),
    value: statusCounts[k],
  }));

  const PIE_COLORS = ['#06b6d4', '#10b981', '#a855f7', '#f59e0b', '#f43f5e', '#64748b'];

  // 2. Risk Distribution
  let lowRisk = 0;
  let medRisk = 0;
  let highRisk = 0;
  let critRisk = 0;

  organs.forEach((o) => {
    const t = transports.find((trans) => trans.organ_id === o.id);
    const eta = t?.estimated_duration_minutes || 45;
    const pres = calculateColdIschemia(o.preservation_start_time, o.maximum_preservation_minutes, eta);
    const risk = calculateRisk({
      remainingPreservationMinutes: pres.remainingMinutes,
      maximumPreservationMinutes: o.maximum_preservation_minutes,
      etaMinutes: eta,
      delayMinutes: t?.delay_minutes || 0,
      distanceKm: t ? Number(t.estimated_distance_km) : 100,
      hospitalReadinessScore: 80,
      priority: o.priority,
      routeCondition: t?.route_risk,
    });

    if (risk.level === 'LOW') lowRisk++;
    else if (risk.level === 'MEDIUM') medRisk++;
    else if (risk.level === 'HIGH') highRisk++;
    else if (risk.level === 'CRITICAL') critRisk++;
  });

  const riskDistData = [
    { level: 'LOW (0-30%)', count: lowRisk, fill: '#10b981' },
    { level: 'MEDIUM (31-55%)', count: medRisk, fill: '#06b6d4' },
    { level: 'HIGH (56-75%)', count: highRisk, fill: '#f59e0b' },
    { level: 'CRITICAL (76-100%)', count: critRisk, fill: '#f43f5e' },
  ];

  // 3. Hospital Readiness Ranking
  const hospitalData = hospitals.map((h) => ({
    name: h.name.split(' ')[0],
    readiness: h.readiness_score,
  }));

  // CSV Export Handler
  const handleExportCSV = () => {
    const rows = [
      ['Organ ID', 'Organ Type', 'Blood Group', 'Status', 'Max Preservation (min)', 'Elapsed (min)', 'Remaining (min)', 'Safety Margin (min)', 'Risk Level'],
    ];

    organs.forEach((o) => {
      const t = transports.find((trans) => trans.organ_id === o.id);
      const eta = t?.estimated_duration_minutes || 45;
      const pres = calculateColdIschemia(o.preservation_start_time, o.maximum_preservation_minutes, eta);
      const risk = calculateRisk({
        remainingPreservationMinutes: pres.remainingMinutes,
        maximumPreservationMinutes: o.maximum_preservation_minutes,
        etaMinutes: eta,
        delayMinutes: t?.delay_minutes || 0,
        distanceKm: t ? Number(t.estimated_distance_km) : 100,
        hospitalReadinessScore: 80,
        priority: o.priority,
        routeCondition: t?.route_risk,
      });

      rows.push([
        o.id,
        o.organ_type,
        o.blood_group,
        o.status,
        String(o.maximum_preservation_minutes),
        String(pres.elapsedMinutes),
        String(pres.remainingMinutes),
        String(pres.safetyMarginMinutes),
        risk.level,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transplantflow_telemetry_audit_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Executive Analytics & Audit Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Preservation utilization analytics, risk distributions, and logistics compliance benchmarks.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs flex items-center gap-2 shadow-md transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Export Audit Log (CSV)
        </button>
      </div>

      {/* Grid of Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Organs by Status */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Organ Registry Status Distribution
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={organStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                >
                  {organStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Profile Breakdown */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Cold-Ischemia Risk Tier Allocation
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="level" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Organs in Tier" radius={[4, 4, 0, 0]}>
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Partner Hospital Readiness Scores */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-2 lg:col-span-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Partner Hospital Preparedness Benchmark (%)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="readiness" fill="#06b6d4" name="Readiness Score (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
