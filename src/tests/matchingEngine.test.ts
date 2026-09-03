import { describe, expect, it } from 'vitest';
import { checkBloodGroupCompatibility, rankCandidatesForOrgan } from '../engines/matchingEngine';
import { Hospital, Organ, Recipient } from '../types/database.types';

describe('Organ-Recipient Decision-Support Matching Engine', () => {
  it('correctly assesses ABO blood group compatibility rules', () => {
    // Identical
    expect(checkBloodGroupCompatibility('O+', 'O+').isCompatible).toBe(true);
    expect(checkBloodGroupCompatibility('O+', 'O+').score).toBe(100);

    // Universal donor
    expect(checkBloodGroupCompatibility('O-', 'A+').isCompatible).toBe(true);
    expect(checkBloodGroupCompatibility('O-', 'B-').isCompatible).toBe(true);

    // Incompatible
    expect(checkBloodGroupCompatibility('A+', 'B+').isCompatible).toBe(false);
    expect(checkBloodGroupCompatibility('B+', 'A-').isCompatible).toBe(false);
  });

  it('ranks higher-urgency compatible candidates above lower-urgency candidates', () => {
    const organ: Organ = {
      id: 'org-test-1',
      organ_type: 'Heart',
      blood_group: 'O+',
      retrieval_time: new Date().toISOString(),
      preservation_start_time: new Date().toISOString(),
      maximum_preservation_minutes: 240,
      current_latitude: 42.36,
      current_longitude: -71.06,
      status: 'AVAILABLE',
      priority: 'URGENT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const hospitals: Hospital[] = [
      {
        id: 'hosp-1',
        name: 'Center A',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        latitude: 42.36,
        longitude: -71.06,
        or_available: true,
        icu_available: true,
        surgical_team_available: true,
        blood_preparation_ready: true,
        recipient_ready: true,
        readiness_score: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const recipients: Recipient[] = [
      {
        id: 'rec-low',
        recipient_reference: 'REC-LOW-1',
        organ_type: 'Heart',
        blood_group: 'O+',
        urgency_level: 'LOW',
        waiting_since: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        recipient_hospital_id: 'hosp-1',
        compatibility_data: {},
        status: 'WAITING',
        created_at: new Date().toISOString(),
      },
      {
        id: 'rec-crit',
        recipient_reference: 'REC-CRIT-1',
        organ_type: 'Heart',
        blood_group: 'O+',
        urgency_level: 'CRITICAL',
        waiting_since: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        recipient_hospital_id: 'hosp-1',
        compatibility_data: { hla_match: 5 },
        status: 'WAITING',
        created_at: new Date().toISOString(),
      },
    ];

    const ranked = rankCandidatesForOrgan(organ, recipients, hospitals, 200);

    expect(ranked[0].recipientId).toBe('rec-crit');
    expect(ranked[0].overallScore).toBeGreaterThan(ranked[1].overallScore);
  });
});
