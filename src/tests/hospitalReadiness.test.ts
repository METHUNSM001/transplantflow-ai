import { describe, expect, it } from 'vitest';
import { localStore } from '../lib/storage';

describe('Hospital Readiness Scoring System', () => {
  it('correctly calculates 20 points per cleared operational criteria in the 5-point checklist', () => {
    const hosp = localStore.getHospitals()[0];
    expect(hosp).toBeDefined();

    // Toggle all 5 to true -> 100%
    localStore.updateHospitalReadinessToggle(hosp.id, {
      or_available: true,
      icu_available: true,
      surgical_team_available: true,
      blood_preparation_ready: true,
      recipient_ready: true,
    });

    const updated100 = localStore.getHospitals().find((h) => h.id === hosp.id);
    expect(updated100?.readiness_score).toBe(100);

    // Toggle 2 items to false -> 3 remaining * 20 = 60%
    localStore.updateHospitalReadinessToggle(hosp.id, {
      icu_available: false,
      blood_preparation_ready: false,
    });

    const updated60 = localStore.getHospitals().find((h) => h.id === hosp.id);
    expect(updated60?.readiness_score).toBe(60);
  });
});
