import React from 'react';
import { AlertSeverity, OrganStatus, PriorityLevel, RouteRiskLevel, UrgencyLevel } from '../../types/database.types';
import { PreservationStatus, RiskLevel } from '../../types/engine.types';

interface BadgeProps {
  type: 'status' | 'safety' | 'risk' | 'urgency' | 'severity' | 'priority';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-500';
  let label = value.replace(/_/g, ' ');

  if (type === 'safety') {
    const s = value as PreservationStatus;
    if (s === 'SAFE') {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      label = '🟢 SAFE MARGIN';
    } else if (s === 'WARNING') {
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      label = '🟠 WARNING';
    } else if (s === 'CRITICAL') {
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      dotColor = 'bg-rose-500';
      label = '🔴 CRITICAL';
    } else if (s === 'EXPIRED') {
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      label = '⚫ EXPIRED';
    }
  } else if (type === 'risk' || type === 'severity') {
    const r = value as RiskLevel | AlertSeverity;
    if (r === 'LOW' || r === 'INFO') {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
    } else if (r === 'MEDIUM') {
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
    } else if (r === 'HIGH') {
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
    } else if (r === 'CRITICAL') {
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      dotColor = 'bg-rose-500';
    }
  } else if (type === 'status') {
    const st = value as OrganStatus;
    if (st === 'IN_TRANSIT') {
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-600 animate-ping';
    } else if (st === 'AVAILABLE') {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
    } else if (st === 'MATCHED') {
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dotColor = 'bg-indigo-500';
    } else if (st === 'ARRIVED' || st === 'TRANSPLANTED') {
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
      dotColor = 'bg-teal-500';
    } else if (st === 'EXPIRED') {
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      dotColor = 'bg-red-500';
    }
  } else if (type === 'urgency') {
    const u = value as UrgencyLevel;
    if (u === 'CRITICAL') {
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      dotColor = 'bg-rose-500';
    } else if (u === 'HIGH') {
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
    } else if (u === 'MEDIUM') {
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
    } else {
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
