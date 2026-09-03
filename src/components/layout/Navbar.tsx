import React, { useEffect, useState } from 'react';
import { Activity, Bell, Clock, Menu, Play, RotateCcw, Shield } from 'lucide-react';
import { UserRole } from '../../types/database.types';
import { localStore } from '../../lib/storage';

interface NavbarProps {
  onToggleSidebar: () => void;
  onStartDemo: () => void;
  isDemoActive: boolean;
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onStartDemo,
  isDemoActive,
  currentRole,
  onSwitchRole,
  activeAlertsCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (organs, transports, alerts) to initial baseline?')) {
      localStore.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-1">
                TRANSPLANT<span className="text-blue-600 font-black">FLOW</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  AI
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Clinical Decision-Support & Cold-Ischemia Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Clock telemetry */}
        <div className="hidden xl:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-400 font-sans">LOCAL:</span>
            <span className="font-semibold text-slate-800">{currentTime}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans">ZULU:</span>
            <span className="font-semibold text-slate-800">{utcTime}</span>
          </div>
        </div>

        {/* Right: Actions, Demo Mode, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Run Live Demo Button */}
          <button
            onClick={onStartDemo}
            disabled={isDemoActive}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50 transition active:scale-95 cursor-pointer"
            title="Start automated 13-stage clinical scenario"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run</span> Live Demo
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleResetData}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition text-xs flex items-center gap-1 font-medium"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Seed</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={currentRole}
              onChange={(e) => onSwitchRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs pr-1"
              title="Switch user perspective"
            >
              <option value="TRANSPLANT_COORDINATOR">Coordinator</option>
              <option value="ADMIN">Admin</option>
              <option value="HOSPITAL_STAFF">Hospital Staff</option>
              <option value="TRANSPORT_COORDINATOR">Transport Lead</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          {/* Active Alerts Bell */}
          <a
            href="/alerts"
            className="relative p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition"
            title="View alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white font-bold rounded-full text-[10px] flex items-center justify-center shadow-sm">
                {activeAlertsCount}
              </span>
            )}
          </a>
        </div>
      </div>
    </header>
  );
};
