import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, FileSpreadsheet } from 'lucide-react';
import { calculateColdIschemia } from '../engines/coldIschemiaEngine';
import { calculateRisk } from '../engines/riskEngine';
import { localStore, subscribeToStore } from '../lib/storage';
import { Alert, Hospital, Organ, Transport } from '../types/database.types';

export const ReportsPage: React.FC = () => {
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [, setAlerts] = useState<Alert[]>([]);

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

  const PIE_COLORS = ['#2563eb', '#059669', '#6366f1', '#d97706', '#dc2626', '#64748b'];

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
    { level: 'LOW (0-30%)', count: lowRisk, fill: '#059669' },
    { level: 'MEDIUM (31-55%)', count: medRisk, fill: '#2563eb' },
    { level: 'HIGH (56-75%)', count: highRisk, fill: '#d97706' },
    { level: 'CRITICAL (76-100%)', count: critRisk, fill: '#dc2626' },
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
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Executive Analytics & Audit Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Preservation utilization analytics, risk distributions, and logistics compliance benchmarks.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-white" />
          Export Audit Log (CSV)
        </button>
      </div>

      {/* Grid of Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Organs by Status */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    color: '#0f172a',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Profile Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cold-Ischemia Risk Tier Allocation
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="level" stroke="#64748b" fontSize={11} fontStyle="bold" />
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
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-3 lg:col-span-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Partner Hospital Preparedness Benchmark (%)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontStyle="bold" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} fontStyle="bold" />
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
                <Bar dataKey="readiness" fill="#2563eb" name="Readiness Score (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
