import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertOctagon, Check, CheckCircle2, Filter, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { localStore, subscribeToStore } from '../lib/storage';
import { Alert, AlertSeverity, AlertStatus } from '../types/database.types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadAlerts = () => {
    setAlerts(localStore.getAlerts());
  };

  useEffect(() => {
    loadAlerts();
    return subscribeToStore(loadAlerts);
  }, []);

  const handleAcknowledge = (id: string) => {
    localStore.updateAlertStatus(id, 'ACKNOWLEDGED');
  };

  const handleResolve = (id: string) => {
    localStore.updateAlertStatus(id, 'RESOLVED');
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchStat = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSev && matchStat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-rose-400" />
          Real-Time Clinical Alert Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated warnings triggered when cold-ischemia safety margins compress, transport delays
          accumulate, or hospital readiness drops.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                severityFilter === sev
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/80 rounded-xl p-8 border border-slate-800 text-center text-xs text-slate-400">
            No alerts match the selected criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                alert.status === 'RESOLVED'
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  : alert.severity === 'CRITICAL'
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <StatusBadge type="severity" value={alert.severity} />
                  <span className="font-mono text-[11px] text-slate-400">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {alert.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                <p className="text-xs text-slate-300">{alert.message}</p>
              </div>

              {/* Actions */}
              {alert.status !== 'RESOLVED' && (
                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition"
                  >
                    Resolve Alert
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
