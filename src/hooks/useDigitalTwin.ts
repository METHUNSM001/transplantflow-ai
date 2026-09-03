import { useEffect, useState } from 'react';
import { calculateColdIschemia } from '../engines/coldIschemiaEngine';
import { calculateRisk } from '../engines/riskEngine';
import { localStore, subscribeToStore } from '../lib/storage';
import { Alert, Hospital, HospitalReadiness, Organ, TimelineEvent, Transport } from '../types/database.types';
import { OrganDigitalTwin } from '../types/digitalTwin.types';

export function useDigitalTwin(organId: string | undefined): {
  twin: OrganDigitalTwin | null;
  isLoading: boolean;
  refresh: () => void;
} {
  const [twin, setTwin] = useState<OrganDigitalTwin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const computeTwin = () => {
    if (!organId) {
      setTwin(null);
      setIsLoading(false);
      return;
    }

    const organs = localStore.getOrgans();
    const organ = organs.find((o) => o.id === organId);

    if (!organ) {
      setTwin(null);
      setIsLoading(false);
      return;
    }

    const transports = localStore.getTransports();
    const transport = transports.find((t) => t.organ_id === organId);

    const hospitals = localStore.getHospitals();
    const originHospital = transport ? hospitals.find((h) => h.id === transport.origin_hospital_id) : undefined;
    const destinationHospital = transport
      ? hospitals.find((h) => h.id === transport.destination_hospital_id)
      : undefined;

    const readinessRecords = localStore.getReadinessRecords();
    const readiness = readinessRecords.find((r) => r.organ_id === organId);

    // If specific readiness record doesn't exist, use destination hospital's score
    const hospitalReadinessScore = readiness?.readiness_score ?? destinationHospital?.readiness_score ?? 80;

    const alerts = localStore.getAlerts().filter((a) => a.organ_id === organId && a.status === 'ACTIVE');
    const events = localStore.getTimelineEvents().filter((e) => e.organ_id === organId);

    const etaMinutes = transport?.estimated_duration_minutes ?? 45;

    const coldIschemia = calculateColdIschemia(
      organ.preservation_start_time,
      organ.maximum_preservation_minutes,
      etaMinutes
    );

    const risk = calculateRisk({
      remainingPreservationMinutes: coldIschemia.remainingMinutes,
      maximumPreservationMinutes: organ.maximum_preservation_minutes,
      etaMinutes,
      delayMinutes: transport?.delay_minutes ?? 0,
      distanceKm: transport ? Number(transport.estimated_distance_km) : 100,
      hospitalReadinessScore,
      transportStatus: transport?.status,
      priority: organ.priority,
      routeCondition: transport?.route_risk,
    });

    setTwin({
      organ,
      transport,
      originHospital,
      destinationHospital,
      hospitalReadiness: readiness,
      coldIschemia,
      risk,
      recentEvents: events,
      activeAlerts: alerts,
      lastTelemetryPing: new Date().toISOString(),
    });
    setIsLoading(false);
  };

  useEffect(() => {
    computeTwin();
    const unsubscribe = subscribeToStore(() => {
      computeTwin();
    });
    // Interval update for dynamic countdowns
    const timer = setInterval(() => {
      computeTwin();
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [organId]);

  return {
    twin,
    isLoading,
    refresh: computeTwin,
  };
}
