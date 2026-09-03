import { describe, expect, it } from 'vitest';
import { simulateDelay } from '../engines/simulationEngine';
import { Organ, Transport } from '../types/database.types';

describe('What-If Delay Simulation Engine', () => {
  const organ: Organ = {
    id: 'org-sim-test',
    organ_type: 'Heart',
    blood_group: 'O+',
    retrieval_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    preservation_start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    maximum_preservation_minutes: 240, // 180 mins remaining
    status: 'IN_TRANSIT',
    priority: 'URGENT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const transport: Transport = {
    id: 'trans-sim-test',
    organ_id: organ.id,
    origin_hospital_id: 'h1',
    destination_hospital_id: 'h2',
    transport_mode: 'Ambulance',
    status: 'IN_TRANSIT',
    estimated_distance_km: 120,
    estimated_duration_minutes: 90, // Baseline ETA 90 min -> safety margin = 180 - 90 = 90 min
    eta: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    delay_minutes: 0,
    route_risk: 'LOW',
    updated_at: new Date().toISOString(),
  };

  it('calculates expected delta safety margin and higher risk score on +30m delay', () => {
    const baseline = simulateDelay(organ, transport, 0, 80);
    const simulated = simulateDelay(organ, transport, 30, 80);

    expect(simulated.deltaMinutes).toBe(30);
    expect(simulated.simulatedSafetyMargin).toBe(baseline.originalSafetyMargin - 30);
    expect(simulated.simulatedRiskScore).toBeGreaterThan(baseline.originalRiskScore);
  });

  it('flags PRESERVATION_BREACH when delay causes ETA to exceed remaining preservation time', () => {
    // Adding 120 minutes of delay pushes total duration to 90 + 120 = 210 min
    // Remaining preservation is 180 min -> safety margin becomes -30 min
    const simulated = simulateDelay(organ, transport, 120, 80);

    expect(simulated.simulatedSafetyMargin).toBeLessThan(0);
    expect(simulated.predictedOutcome).toBe('PRESERVATION_BREACH');
    expect(simulated.summary).toContain('CRITICAL WARNING');
  });
});
