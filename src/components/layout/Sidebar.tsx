import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Building2,
  GitCompare,
  HeartHandshake,
  Layers,
  MapPin,
  Navigation,
  Sliders,
  Users,
  X,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../config/supabaseClient';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrgansCount: number;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeOrgansCount,
  activeAlertsCount,
}) => {
  const navItems = [
    {
      to: '/',
      label: 'Command Center',
      icon: Activity,
      badge: null,
    },
    {
      to: '/organs',
      label: 'Active Organs',
      icon: Layers,
      badge: activeOrgansCount,
    },
    {
      to: '/matching',
      label: 'Decision Matching',
      icon: HeartHandshake,
      badge: null,
    },
    {
      to: '/transports',
      label: 'Transit Telemetry & Map',
      icon: Navigation,
      badge: null,
    },
    {
      to: '/hospitals',
      label: 'Hospital Readiness',
      icon: Building2,
      badge: null,
    },
    {
      to: '/simulations',
      label: 'What-If Simulations',
      icon: Sliders,
      badge: 'PRO',
    },
    {
      to: '/alerts',
      label: 'Critical Alerts',
      icon: AlertOctagon,
      badge: activeAlertsCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      to: '/recipients',
      label: 'Waitlist Candidates',
      icon: Users,
      badge: null,
    },
    {
      to: '/reports',
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header (Mobile close) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 lg:hidden">
          <span className="font-bold text-slate-100 text-sm">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operations Console
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-cyan-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Database / System Connection Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 text-[11px]">Backend Sync</span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
                }`}
              />
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo LocalDB'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Predictive Cold-Ischemia Telemetry v2.4.0
          </p>
        </div>
      </aside>
    </>
  );
};
