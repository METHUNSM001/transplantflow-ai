import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Layers, MapPin, RefreshCw, ShieldAlert, Sparkles, User } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ColdIschemiaGauge } from '../components/digitalTwin/ColdIschemiaGauge';
import { OrganJourneyPipeline } from '../components/digitalTwin/OrganJourneyPipeline';
import { RiskRadar } from '../components/digitalTwin/RiskRadar';
import { HospitalReadinessChecklist } from '../components/hospitals/HospitalReadinessChecklist';
import { LiveTransportMap } from '../components/maps/LiveTransportMap';
import { WhatIfDelaySimulator } from '../components/simulations/WhatIfDelaySimulator';
import { OrganVerticalTimeline } from '../components/timeline/OrganVerticalTimeline';
import { ORGAN_ICONS } from '../config/constants';
import { useDigitalTwin } from '../hooks/useDigitalTwin';
import { localStore } from '../lib/storage';

export const OrganDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { twin, isLoading, refresh } = useDigitalTwin(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-cyan-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-xs font-mono">Loading Transplant Digital Twin Telemetry...</span>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-800 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Organ Digital Twin Not Found</h3>
        <p className="text-xs text-slate-400">
          The requested organ ID does not exist or has been archived from active registry.
        </p>
        <Link
          to="/organs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-cyan-400 text-xs font-semibold hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Organ Registry
        </Link>
      </div>
    );
  }

  const {
    organ,
    transport,
    originHospital,
    destinationHospital,
    coldIschemia,
    risk,
    recentEvents,
  } = twin;

  const handleToggleReadiness = (hospId: string, updates: any) => {
    localStore.updateHospitalReadinessToggle(hospId, updates);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Back link & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/organs"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Back to organs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{ORGAN_ICONS[organ.organ_type] || '🧬'}</span>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                {organ.organ_type} Digital Twin
              </h2>
              <StatusBadge type="status" value={organ.status} />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Twin ID: {organ.id} • ABO: <strong>{organ.blood_group}</strong> • Priority: {organ.priority}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/matching"
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
          >
            Candidate Matches
          </Link>
          <Link
            to="/simulations"
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition"
          >
            What-If Simulator
          </Link>
        </div>
      </div>

      {/* 1. Journey Pipeline */}
      <OrganJourneyPipeline status={organ.status} />

      {/* 2. Real-Time Preservation Gauge & Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ColdIschemiaGauge calculation={coldIschemia} organType={organ.organ_type} />
        <RiskRadar assessment={risk} />
      </div>

      {/* 3. Live React-Leaflet Map tracking transport */}
      {transport && (
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Real-Time Transport Telemetry & Map
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Vehicle: {transport.transport_mode}
            </span>
          </div>

          <LiveTransportMap
            transport={transport}
            originHospital={originHospital}
            destinationHospital={destinationHospital}
            heightClass="h-96"
            allowSimulatedMovement={true}
          />
        </div>
      )}

      {/* 4. Destination Hospital Readiness & Interactive Delay Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {destinationHospital ? (
          <HospitalReadinessChecklist
            hospital={destinationHospital}
            onToggleCheck={handleToggleReadiness}
            isInteractive={true}
          />
        ) : (
          <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 text-center text-xs text-slate-400 py-12">
            No destination hospital assigned yet.
          </div>
        )}

        <WhatIfDelaySimulator
          organ={organ}
          transport={transport}
          hospitalReadinessScore={destinationHospital?.readiness_score || 80}
        />
      </div>

      {/* 5. Chronological Milestone Timeline */}
      <OrganVerticalTimeline events={recentEvents} />
    </div>
  );
};
