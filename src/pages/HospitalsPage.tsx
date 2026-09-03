import React, { useEffect, useState } from 'react';
import { Building2, Check, ShieldCheck, X } from 'lucide-react';
import { HospitalReadinessChecklist } from '../components/hospitals/HospitalReadinessChecklist';
import { localStore, subscribeToStore } from '../lib/storage';
import { Hospital } from '../types/database.types';

export const HospitalsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const loadHospitals = () => {
    setHospitals(localStore.getHospitals());
  };

  useEffect(() => {
    loadHospitals();
    return subscribeToStore(loadHospitals);
  }, []);

  const handleToggle = (hospitalId: string, updates: Partial<Hospital>) => {
    localStore.updateHospitalReadinessToggle(hospitalId, updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          Receiving Hospital Readiness Triage
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Real-time tracking of Operating Rooms, ICU beds, surgical staff, and blood bank preparedness.
          Decreased readiness immediately elevates cold-ischemia transit risk.
        </p>
      </div>

      {/* Grid of Hospital Checklist Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hospitals.map((hosp) => (
          <HospitalReadinessChecklist
            key={hosp.id}
            hospital={hosp}
            onToggleCheck={handleToggle}
            isInteractive={true}
          />
        ))}
      </div>
    </div>
  );
};
