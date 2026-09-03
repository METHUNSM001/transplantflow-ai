import React from 'react';
import { AlertSeverity, OrganStatus, PriorityLevel, RouteRiskLevel, UrgencyLevel } from '../../types/database.types';
import { PreservationStatus, RiskLevel } from '../../types/engine.types';

interface BadgeProps {
  type: 'status' | 'safety' | 'risk' | 'urgency' | 'severity' | 'priority';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';
  let label = value.replace(/_/g, ' ');

  if (type === 'safety') {
    const s = value as PreservationStatus;
    if (s === 'SAFE') {
      colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
      label = '🟢 SAFE MARGIN';
    } else if (s === 'WARNING') {
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      dotColor = 'bg-amber-400';
      label = '🟠 WARNING';
    } else if (s === 'CRITICAL') {
      colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      dotColor = 'bg-rose-400';
      label = '🔴 CRITICAL';
    } else if (s === 'EXPIRED') {
      colorClasses = 'bg-neutral-800 text-neutral-400 border-neutral-700';
      dotColor = 'bg-neutral-500';
      label = '⚫ EXPIRED';
    }
  } else if (type === 'risk' || type === 'severity') {
    const r = value as RiskLevel | AlertSeverity;
    if (r === 'LOW' || r === 'INFO') {
      colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
    } else if (r === 'MEDIUM') {
      colorClasses = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      dotColor = 'bg-sky-400';
    } else if (r === 'HIGH') {
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      dotColor = 'bg-amber-400';
    } else if (r === 'CRITICAL') {
      colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      dotColor = 'bg-rose-400';
    }
  } else if (type === 'status') {
    const st = value as OrganStatus;
    if (st === 'IN_TRANSIT') {
      colorClasses = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      dotColor = 'bg-cyan-400 animate-ping';
    } else if (st === 'AVAILABLE') {
      colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
    } else if (st === 'MATCHED') {
      colorClasses = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      dotColor = 'bg-purple-400';
    } else if (st === 'ARRIVED' || st === 'TRANSPLANTED') {
      colorClasses = 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      dotColor = 'bg-teal-400';
    } else if (st === 'EXPIRED') {
      colorClasses = 'bg-red-950/80 text-red-400 border-red-800';
      dotColor = 'bg-red-600';
    }
  } else if (type === 'urgency') {
    const u = value as UrgencyLevel;
    if (u === 'CRITICAL') {
      colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      dotColor = 'bg-rose-500';
    } else if (u === 'HIGH') {
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      dotColor = 'bg-amber-400';
    } else if (u === 'MEDIUM') {
      colorClasses = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      dotColor = 'bg-blue-400';
    } else {
      colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
      dotColor = 'bg-slate-500';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
