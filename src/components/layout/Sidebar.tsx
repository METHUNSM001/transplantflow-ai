import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Building2,
  HeartHandshake,
  Layers,
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
      badgeColor: 'bg-red-500 text-white',
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0c2340] text-slate-100 border-r border-blue-950 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header (Mobile close) */}
        <div className="flex items-center justify-between p-4 border-b border-blue-900/60 lg:hidden">
          <span className="font-bold text-white text-sm">Clinical Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-blue-300/80">
            Clinical Operations
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
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100/80 hover:text-white hover:bg-blue-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-blue-300" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-blue-950/80 text-blue-200 border border-blue-800'
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
        <div className="p-4 border-t border-blue-900/60 bg-[#091b33] text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-blue-300/80 text-[11px] font-medium">Backend Sync</span>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-400' : 'bg-blue-400 animate-pulse'
                }`}
              />
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo LocalDB'}
            </span>
          </div>
          <p className="text-[10px] text-blue-400/70 leading-tight">
            TransplantFlow AI Platform v2.4
          </p>
        </div>
      </aside>
    </>
  );
};
