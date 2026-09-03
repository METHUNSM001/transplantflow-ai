import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Lock, Mail, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/database.types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('coordinator@transplantflow.org');
  const [role, setRole] = useState<UserRole>('TRANSPLANT_COORDINATOR');
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email);
    await switchRole(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center mx-auto shadow-lg shadow-cyan-900/40">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            TRANSPLANT<span className="text-cyan-400">FLOW</span> AI
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent Organ Transplant Coordination & Cold-Ischemia Risk Prediction
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Coordinator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Access Role</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="TRANSPLANT_COORDINATOR">Transplant Coordinator (Full Operations)</option>
                <option value="ADMIN">System Administrator</option>
                <option value="HOSPITAL_STAFF">Hospital Staff (Readiness Triage)</option>
                <option value="TRANSPORT_COORDINATOR">Transport Coordinator</option>
                <option value="VIEWER">Read-Only Clinical Viewer</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition"
          >
            Access Command Center <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
          Prototype and clinical demonstration mode. Synthetic data only.
        </div>
      </div>
    </div>
  );
};
