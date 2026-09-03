import React from 'react';
import { Activity, AlertOctagon, Building2, Layers, Navigation, ShieldAlert } from 'lucide-react';

interface KpiStatsProps {
  activeOrgans: number;
  criticalOrgans: number;
  inTransit: number;
  highRiskCount: number;
  avgReadiness: number;
  activeAlerts: number;
}

export const KpiStats: React.FC<KpiStatsProps> = ({
  activeOrgans,
  criticalOrgans,
  inTransit,
  highRiskCount,
  avgReadiness,
  activeAlerts,
}) => {
  const cards = [
    {
      title: 'Active Organs',
      value: activeOrgans,
      subtext: 'Preservation clocks active',
      icon: Layers,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bg: 'from-cyan-950/20 to-slate-900',
    },
    {
      title: 'Critical Margins',
      value: criticalOrgans,
      subtext: '< 10 min buffer remaining',
      icon: ShieldAlert,
      color: criticalOrgans > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400',
      border: criticalOrgans > 0 ? 'border-rose-500/40' : 'border-slate-800',
      bg: criticalOrgans > 0 ? 'from-rose-950/40 to-slate-900' : 'from-slate-900 to-slate-950',
    },
    {
      title: 'In Transit',
      value: inTransit,
      subtext: 'Live GPS telemetry pings',
      icon: Navigation,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'from-blue-950/20 to-slate-900',
    },
    {
      title: 'High/Critical Risk',
      value: highRiskCount,
      subtext: 'Composite risk score > 55%',
      icon: AlertOctagon,
      color: highRiskCount > 0 ? 'text-amber-400' : 'text-slate-400',
      border: highRiskCount > 0 ? 'border-amber-500/40' : 'border-slate-800',
      bg: 'from-amber-950/20 to-slate-900',
    },
    {
      title: 'Avg Hospital Readiness',
      value: `${avgReadiness}%`,
      subtext: 'OR / ICU / surgical prep',
      icon: Building2,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'from-emerald-950/20 to-slate-900',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts,
      subtext: 'Requires coordinator triage',
      icon: Activity,
      color: activeAlerts > 0 ? 'text-rose-400' : 'text-slate-400',
      border: activeAlerts > 0 ? 'border-rose-500/30' : 'border-slate-800',
      bg: 'from-rose-950/20 to-slate-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-4 rounded-xl border bg-gradient-to-br ${card.bg} ${card.border} shadow-lg flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-black font-mono tracking-tight ${card.color}`}>
                {card.value}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
