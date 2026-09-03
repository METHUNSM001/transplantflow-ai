import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { localStore } from '../../lib/storage';
import { Alert } from '../../types/database.types';
import { StatusBadge } from '../common/StatusBadge';

interface CriticalAlertsWidgetProps {
  alerts: Alert[];
}

export const CriticalAlertsWidget: React.FC<CriticalAlertsWidgetProps> = ({ alerts }) => {
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').slice(0, 3);

  const handleAcknowledge = (id: string) => {
    localStore.updateAlertStatus(id, 'ACKNOWLEDGED');
  };

  const handleResolve = (id: string) => {
    localStore.updateAlertStatus(id, 'RESOLVED');
  };

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm text-center py-8">
        <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-900">All Clear — No Active Alerts</h4>
        <p className="text-xs text-slate-500 mt-1">
          All organ transit telemetry and hospital readiness metrics are within safe operational limits.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h4 className="text-sm font-bold text-slate-900">
            Active Clinical Alerts
          </h4>
        </div>
        <a
          href="/alerts"
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition"
        >
          View All ({alerts.length})
        </a>
      </div>

      <div className="space-y-3">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              alert.severity === 'CRITICAL'
                ? 'bg-red-50/50 border-red-200'
                : 'bg-amber-50/50 border-amber-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge type="severity" value={alert.severity} />
                <h5 className="font-bold text-xs text-slate-900">{alert.title}</h5>
              </div>
              <p className="text-xs text-slate-600 line-clamp-1">{alert.message}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAcknowledge(alert.id)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition shadow-sm"
              >
                Acknowledge
              </button>
              <button
                onClick={() => handleResolve(alert.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
