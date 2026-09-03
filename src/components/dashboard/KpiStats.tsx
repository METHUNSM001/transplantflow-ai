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
      subtext: 'Preservation active',
      icon: Layers,
      iconBg: 'bg-blue-50 text-blue-600',
      valueColor: 'text-slate-900',
    },
    {
      title: 'Critical Margins',
      value: criticalOrgans,
      subtext: '< 10 min buffer',
      icon: ShieldAlert,
      iconBg: criticalOrgans > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500',
      valueColor: criticalOrgans > 0 ? 'text-red-600 font-bold' : 'text-slate-900',
    },
    {
      title: 'In Transit',
      value: inTransit,
      subtext: 'Live GPS pings',
      icon: Navigation,
      iconBg: 'bg-blue-50 text-blue-600',
      valueColor: 'text-blue-700',
    },
    {
      title: 'High/Critical Risk',
      value: highRiskCount,
      subtext: 'Risk score > 55%',
      icon: AlertOctagon,
      iconBg: highRiskCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500',
      valueColor: highRiskCount > 0 ? 'text-amber-700' : 'text-slate-900',
    },
    {
      title: 'Avg Readiness',
      value: `${avgReadiness}%`,
      subtext: 'OR / ICU readiness',
      icon: Building2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts,
      subtext: 'Requires triage',
      icon: Activity,
      iconBg: activeAlerts > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500',
      valueColor: activeAlerts > 0 ? 'text-red-600' : 'text-slate-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-extrabold tracking-tight ${card.valueColor}`}>
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-1">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
