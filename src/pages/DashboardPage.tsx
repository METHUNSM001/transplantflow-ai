import React, { useEffect, useState } from 'react';
import { CriticalAlertsWidget } from '../components/dashboard/CriticalAlertsWidget';
import { HospitalReadinessWidget } from '../components/dashboard/HospitalReadinessWidget';
import { KpiStats } from '../components/dashboard/KpiStats';
import { OrganCommandCenter } from '../components/dashboard/OrganCommandCenter';
import { LiveTransportMap } from '../components/maps/LiveTransportMap';
import { calculateColdIschemia } from '../engines/coldIschemiaEngine';
import { calculateRisk } from '../engines/riskEngine';
import { localStore, subscribeToStore } from '../lib/storage';
import { Alert, Hospital, Organ, Transport } from '../types/database.types';

export const DashboardPage: React.FC = () => {
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadData = () => {
    setOrgans(localStore.getOrgans());
    setTransports(localStore.getTransports());
    setHospitals(localStore.getHospitals());
    setAlerts(localStore.getAlerts());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  // Compute KPIs
  const activeOrgans = organs.filter((o) => ['AVAILABLE', 'MATCHED', 'IN_TRANSIT'].includes(o.status));
  const inTransit = transports.filter((t) => t.status === 'IN_TRANSIT');

  // Critical Margins (< 10 min) and High Risk counts
  let criticalMarginCount = 0;
  let highRiskCount = 0;

  activeOrgans.forEach((organ) => {
    const t = transports.find((trans) => trans.organ_id === organ.id);
    const etaMins = t?.estimated_duration_minutes || 45;
    const pres = calculateColdIschemia(organ.preservation_start_time, organ.maximum_preservation_minutes, etaMins);
    const risk = calculateRisk({
      remainingPreservationMinutes: pres.remainingMinutes,
      maximumPreservationMinutes: organ.maximum_preservation_minutes,
      etaMinutes: etaMins,
      delayMinutes: t?.delay_minutes || 0,
      distanceKm: t ? Number(t.estimated_distance_km) : 100,
      hospitalReadinessScore: 80,
      priority: organ.priority,
      routeCondition: t?.route_risk,
    });

    if (pres.safetyMarginMinutes < 10) criticalMarginCount++;
    if (risk.score > 55) highRiskCount++;
  });

  const avgReadiness = hospitals.length
    ? Math.round(hospitals.reduce((acc, h) => acc + h.readiness_score, 0) / hospitals.length)
    : 100;

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').length;

  // Active in-transit transport for live map preview
  const primaryTransport = inTransit[0] || transports[0];
  const originHosp = primaryTransport ? hospitals.find((h) => h.id === primaryTransport.origin_hospital_id) : undefined;
  const destHosp = primaryTransport ? hospitals.find((h) => h.id === primaryTransport.destination_hospital_id) : undefined;

  return (
    <div className="space-y-6">
      {/* 1. Executive Healthcare KPI Cards */}
      <KpiStats
        activeOrgans={activeOrgans.length}
        criticalOrgans={criticalMarginCount}
        inTransit={inTransit.length}
        highRiskCount={highRiskCount}
        avgReadiness={avgReadiness}
        activeAlerts={activeAlerts}
      />

      {/* 2. Multi-Organ Command Center */}
      <OrganCommandCenter organs={activeOrgans} transports={transports} />

      {/* 3. Live Active Transit Map & Telemetry Bar */}
      {primaryTransport && (
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Active Medevac Transit Telemetry
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring high-priority transit corridor: {originHosp?.name} ➔ {destHosp?.name}
              </p>
            </div>
            <a
              href="/transports"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
            >
              All Transports
            </a>
          </div>

          <LiveTransportMap
            transport={primaryTransport}
            originHospital={originHosp}
            destinationHospital={destHosp}
            heightClass="h-80"
          />
        </div>
      )}

      {/* 4. Bottom Grid: Critical Alerts & Hospital Readiness Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriticalAlertsWidget alerts={alerts} />
        <HospitalReadinessWidget hospitals={hospitals} />
      </div>
    </div>
  );
};
