import React, { useEffect, useState } from 'react';
import { Activity, Bell, Clock, Database, Menu, Moon, Play, RotateCcw, Shield, Sun, User } from 'lucide-react';
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
  isDark,
  onToggleTheme,
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
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <Activity className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                TRANSPLANT<span className="text-cyan-400 font-black">FLOW</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                Organ Digital Twin & Cold-Ischemia Risk Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Clock telemetry */}
        <div className="hidden xl:flex items-center gap-4 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-slate-400">LOCAL:</span>
            <span className="font-semibold">{currentTime}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="text-slate-400">ZULU:</span>
            <span className="font-semibold">{utcTime}</span>
          </div>
        </div>

        {/* Right: Actions, Demo Mode, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Run Live Demo Button */}
          <button
            onClick={onStartDemo}
            disabled={isDemoActive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/40 disabled:opacity-50 transition transform active:scale-95"
            title="Start automated 13-stage clinical scenario"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run</span> Live Demo
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleResetData}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs flex items-center gap-1"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Seed</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-lg text-xs">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={currentRole}
              onChange={(e) => onSwitchRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer text-xs pr-1"
              title="Switch user perspective"
            >
              <option value="TRANSPLANT_COORDINATOR" className="bg-slate-900 text-slate-200">
                Coordinator
              </option>
              <option value="ADMIN" className="bg-slate-900 text-slate-200">
                Admin
              </option>
              <option value="HOSPITAL_STAFF" className="bg-slate-900 text-slate-200">
                Hospital Staff
              </option>
              <option value="TRANSPORT_COORDINATOR" className="bg-slate-900 text-slate-200">
                Transport Lead
              </option>
              <option value="VIEWER" className="bg-slate-900 text-slate-200">
                Viewer
              </option>
            </select>
          </div>

          {/* Active Alerts Bell */}
          <a
            href="/alerts"
            className="relative p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
            title="View alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold rounded-full text-[10px] flex items-center justify-center animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </a>

          {/* Dark/Light Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
