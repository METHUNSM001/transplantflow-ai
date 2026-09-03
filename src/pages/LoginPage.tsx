import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Mail, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle soft blue background accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none opacity-60" />

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto shadow-sm text-white">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            TRANSPLANT<span className="text-blue-600">FLOW</span> AI
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Intelligent Organ Transplant Coordination & Cold-Ischemia Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Coordinator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Select Access Role</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
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
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
          >
            Access Command Center <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Prototype and clinical decision-support demonstration. Synthetic data only.
        </div>
      </div>
    </div>
  );
};
