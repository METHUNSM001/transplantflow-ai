import { useEffect, useRef, useState } from 'react';
import { localStore } from '../lib/storage';
import { Alert, Organ, TimelineEvent, Transport } from '../types/database.types';

export interface DemoStep {
  stepNumber: number;
  title: string;
  description: string;
  actionSummary: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: 'Heart Procurement Initiated',
    description: 'Donor heart retrieved at Massachusetts General Hospital. Cold-storage cross clamp placed.',
    actionSummary: 'Created new donor heart record with 240-minute preservation window.',
  },
  {
    stepNumber: 2,
    title: 'Candidate Ranking Generated',
    description: 'Matching engine evaluated 10 waitlist recipients across ABO, urgency, and distance.',
    actionSummary: 'Candidate REC-NYP-9021 ranked #1 with 90.5% feasibility match score.',
  },
  {
    stepNumber: 3,
    title: 'Cold-Ischemia Timer Started',
    description: 'Perfusion pump activated. Dynamic preservation countdown begins ticking down second-by-second.',
    actionSummary: 'Timer active: 240 mins maximum cold-ischemia countdown initialized.',
  },
  {
    stepNumber: 4,
    title: 'Medevac Transport Dispatched',
    description: 'Boston MedFlight helicopter assigned and airborne from Logan helipad toward NYC.',
    actionSummary: 'Transport dispatched. Initial ETA set to 45 minutes.',
  },
  {
    stepNumber: 5,
    title: 'Live Telemetry & Marker Movement',
    description: 'Helicopter transponder reports waypoint crossing over Connecticut airspace.',
    actionSummary: 'GPS coordinates updated: 41.5000, -72.5000.',
  },
  {
    stepNumber: 6,
    title: 'Dynamic ETA Recalibration',
    description: 'Telemetry engine recalculates flight duration based on ground speed.',
    actionSummary: 'ETA calibrated: 52 minutes remaining to destination helipad.',
  },
  {
    stepNumber: 7,
    title: 'Simulated Weather Delay Induced',
    description: 'Air traffic control issues 20-minute detour around severe convective thunderstorm cell.',
    actionSummary: '+20 minute delay injected into transport telemetry.',
  },
  {
    stepNumber: 8,
    title: 'Safety Margin Degradation',
    description: 'Safety margin compresses from safe 45 minutes down to critical 12 minutes.',
    actionSummary: 'Cold-ischemia safety margin drops into WARNING/CRITICAL zone.',
  },
  {
    stepNumber: 9,
    title: 'Risk Engine Escalation',
    description: 'Multi-factor risk score elevates to 78% (CRITICAL) due to compound time pressure.',
    actionSummary: 'Risk engine status changes from LOW (24%) to CRITICAL (78%).',
  },
  {
    stepNumber: 10,
    title: 'Automated Real-Time Alert Broadcast',
    description: 'Audible and visual clinical warning issued to transplant coordinator console.',
    actionSummary: 'CRITICAL Alert generated: Heart Safety Margin Compressed.',
  },
  {
    stepNumber: 11,
    title: 'Receiving Hospital Readiness Triage',
    description: 'NewYork-Presbyterian reports post-op ICU bed sanitized and surgical team scrubbed in.',
    actionSummary: 'Hospital readiness score restored to 100% (all 5 criteria cleared).',
  },
  {
    stepNumber: 12,
    title: 'What-If Simulation Benchmarking',
    description: 'Coordinator tests impact of an additional 30-minute delay on recipient survival window.',
    actionSummary: 'What-If engine confirms +30m delay would breach preservation deadline.',
  },
  {
    stepNumber: 13,
    title: 'Alternative Aviation Corridor Cleared',
    description: 'Air corridor priority clearance granted, saving 18 minutes and safeguarding the organ.',
    actionSummary: 'Scenario Comparison recommends Direct Priority Rotorway. Organ delivered safely!',
  },
];

export function useLiveDemo() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  const activeDemoOrganId = 'organ-demo-heart';

  const applyStepAction = (stepIndex: number) => {
    const step = DEMO_STEPS[stepIndex];
    if (!step) return;

    const now = Date.now();

    switch (step.stepNumber) {
      case 1: {
        // Register demo organ
        const organ: Organ = {
          id: activeDemoOrganId,
          organ_type: 'Heart',
          blood_group: 'O+',
          retrieval_time: new Date(now - 15 * 60 * 1000).toISOString(),
          preservation_start_time: new Date(now - 10 * 60 * 1000).toISOString(),
          maximum_preservation_minutes: 240,
          current_latitude: 42.3631,
          current_longitude: -71.0686,
          status: 'AVAILABLE',
          priority: 'CRITICAL_RESCUE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStore.saveOrgan(organ);
        break;
      }
      case 2: {
        // Candidate match generated
        localStore.saveMatch({
          id: 'match-demo-01',
          organ_id: activeDemoOrganId,
          recipient_id: 'rec-01',
          compatibility_score: 96,
          urgency_score: 100,
          distance_score: 80,
          time_feasibility_score: 85,
          waiting_score: 90,
          overall_score: 92.5,
          status: 'ACCEPTED',
          explanation: { summary: 'Top ABO match, Tier 1 critical urgency' },
          created_at: new Date().toISOString(),
        });
        break;
      }
      case 3: {
        // Status updated to matched
        const organ = localStore.getOrgans().find((o) => o.id === activeDemoOrganId);
        if (organ) {
          localStore.saveOrgan({ ...organ, status: 'MATCHED' });
        }
        break;
      }
      case 4: {
        // Transport dispatched
        const transport: Transport = {
          id: 'trans-demo-01',
          organ_id: activeDemoOrganId,
          origin_hospital_id: 'hosp-mgh-01',
          destination_hospital_id: 'hosp-nyp-03',
          transport_mode: 'Helicopter',
          status: 'IN_TRANSIT',
          estimated_distance_km: 315,
          estimated_duration_minutes: 45,
          current_latitude: 42.1500,
          current_longitude: -71.5000,
          eta: new Date(now + 45 * 60 * 1000).toISOString(),
          delay_minutes: 0,
          route_risk: 'LOW',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const transports = localStore.getTransports().filter((t) => t.id !== transport.id);
        transports.unshift(transport);
        localStore.setTransports(transports);

        const organ = localStore.getOrgans().find((o) => o.id === activeDemoOrganId);
        if (organ) {
          localStore.saveOrgan({ ...organ, status: 'IN_TRANSIT' });
        }
        break;
      }
      case 5: {
        // Update marker
        localStore.updateTransportLocation('trans-demo-01', 41.5000, -72.5000);
        break;
      }
      case 6: {
        // Recalibrate ETA
        const transport = localStore.getTransports().find((t) => t.id === 'trans-demo-01');
        if (transport) {
          transport.estimated_duration_minutes = 52;
          transport.eta = new Date(now + 52 * 60 * 1000).toISOString();
          localStore.setTransports([...localStore.getTransports()]);
        }
        break;
      }
      case 7: {
        // Inject +20 min delay
        localStore.updateTransportLocation('trans-demo-01', 41.2500, -72.8500, 20);
        break;
      }
      case 8: {
        // Timeline event
        const tl: TimelineEvent = {
          id: `demo-tl-${now}`,
          organ_id: activeDemoOrganId,
          event_type: 'WEATHER_DELAY',
          event_time: new Date().toISOString(),
          location: 'Hartford Air Corridor',
          description: 'Thunderstorm detour adds 20m flight time; safety margin reduced to 12 minutes.',
          created_at: new Date().toISOString(),
        };
        localStore.addTimelineEvent(tl);
        break;
      }
      case 9: {
        // Transport route risk elevated
        const transports = localStore.getTransports().map((t) =>
          t.id === 'trans-demo-01' ? { ...t, route_risk: 'CRITICAL' as const } : t
        );
        localStore.setTransports(transports);
        break;
      }
      case 10: {
        // Generate critical alert
        const alert: Alert = {
          id: `demo-alert-${now}`,
          organ_id: activeDemoOrganId,
          transport_id: 'trans-demo-01',
          hospital_id: 'hosp-nyp-03',
          alert_type: 'SAFETY_MARGIN_LOW',
          severity: 'CRITICAL',
          title: 'Heart Safety Margin Compressed (Demo)',
          message: 'Helicopter delayed by 20m. Safety margin is down to 12 minutes! Urgent action needed.',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        };
        localStore.addAlert(alert);
        break;
      }
      case 11: {
        // Hospital readiness updated
        localStore.updateHospitalReadinessToggle('hosp-nyp-03', {
          icu_available: true,
          or_available: true,
          surgical_team_available: true,
          blood_preparation_ready: true,
          recipient_ready: true,
          readiness_score: 100,
        });
        break;
      }
      case 12: {
        // Timeline event for simulation
        const tl: TimelineEvent = {
          id: `demo-tl-sim-${now}`,
          organ_id: activeDemoOrganId,
          event_type: 'SIMULATION_EVALUATION',
          event_time: new Date().toISOString(),
          location: 'Command Center Console',
          description: 'What-If delay analysis indicates +30 min delay causes irreversible cold-ischemia breach.',
          created_at: new Date().toISOString(),
        };
        localStore.addTimelineEvent(tl);
        break;
      }
      case 13: {
        // Resolve demo alert and finalize arrival
        const transports = localStore.getTransports().map((t) =>
          t.id === 'trans-demo-01'
            ? { ...t, current_latitude: 40.8404, current_longitude: -73.9427, delay_minutes: 5, route_risk: 'LOW' as const, status: 'COMPLETED' as const }
            : t
        );
        localStore.setTransports(transports);
        const organ = localStore.getOrgans().find((o) => o.id === activeDemoOrganId);
        if (organ) {
          localStore.saveOrgan({ ...organ, status: 'ARRIVED' });
        }
        break;
      }
    }
  };

  const startDemo = () => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setIsAutoPlaying(true);
    applyStepAction(0);
  };

  const nextStep = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      applyStepAction(nextIdx);
    } else {
      setIsAutoPlaying(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      applyStepAction(prevIdx);
    }
  };

  const stopDemo = () => {
    setIsActive(false);
    setIsAutoPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (isAutoPlaying && isActive) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < DEMO_STEPS.length - 1) {
            const nextIdx = prev + 1;
            applyStepAction(nextIdx);
            return nextIdx;
          } else {
            setIsAutoPlaying(false);
            return prev;
          }
        });
      }, 4000); // 4 seconds per step
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, isActive]);

  return {
    isActive,
    currentStepIndex,
    currentStep: DEMO_STEPS[currentStepIndex],
    totalSteps: DEMO_STEPS.length,
    isAutoPlaying,
    startDemo,
    stopDemo,
    nextStep,
    prevStep,
    toggleAutoPlay,
    activeDemoOrganId,
  };
}
