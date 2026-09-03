import React, { useEffect, useState } from 'react';
import { AlertOctagon, Filter } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { localStore, subscribeToStore } from '../lib/storage';
import { Alert } from '../types/database.types';

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
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-red-600" />
          Real-Time Clinical Alert Center
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Automated warnings triggered when cold-ischemia safety margins compress, transport delays
          accumulate, or hospital readiness drops.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Severity:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                severityFilter === sev
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
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
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
            No alerts match the selected criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
                alert.status === 'RESOLVED'
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : alert.severity === 'CRITICAL'
                  ? 'bg-red-50/40 border-red-200'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <StatusBadge type="severity" value={alert.severity} />
                  <span className="font-mono text-xs text-slate-500 font-medium">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {alert.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                <p className="text-xs text-slate-600">{alert.message}</p>
              </div>

              {/* Actions */}
              {alert.status !== 'RESOLVED' && (
                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
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
