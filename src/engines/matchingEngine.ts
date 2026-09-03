import { BloodGroup, Hospital, Organ, Recipient } from '../types/database.types';
import { CandidateMatchResult, MatchingWeights } from '../types/engine.types';

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  compatibilityWeight: 0.40,
  urgencyWeight: 0.20,
  timeFeasibilityWeight: 0.20,
  distanceWeight: 0.10,
  waitingTimeWeight: 0.10,
};

/**
 * Standard clinical ABO blood group compatibility check.
 */
export function checkBloodGroupCompatibility(donor: BloodGroup, recipient: BloodGroup): { isCompatible: boolean; score: number; reason: string } {
  // Identical match is ideal
  if (donor === recipient) {
    return { isCompatible: true, score: 100, reason: `ABO Identical match (${donor} -> ${recipient})` };
  }

  // O- is universal donor
  if (donor === 'O-') {
    return { isCompatible: true, score: 90, reason: `Universal donor match (O- -> ${recipient})` };
  }

  // O+ can donate to O+, A+, B+, AB+
  if (donor === 'O+' && ['O+', 'A+', 'B+', 'AB+'].includes(recipient)) {
    return { isCompatible: true, score: 85, reason: `Compatible Rh-positive match (O+ -> ${recipient})` };
  }

  // A- can donate to A-, A+, AB-, AB+
  if (donor === 'A-' && ['A-', 'A+', 'AB-', 'AB+'].includes(recipient)) {
    return { isCompatible: true, score: 85, reason: `Compatible blood group (A- -> ${recipient})` };
  }

  // A+ can donate to A+, AB+
  if (donor === 'A+' && ['A+', 'AB+'].includes(recipient)) {
    return { isCompatible: true, score: 80, reason: `Compatible match (A+ -> ${recipient})` };
  }

  // B- can donate to B-, B+, AB-, AB+
  if (donor === 'B-' && ['B-', 'B+', 'AB-', 'AB+'].includes(recipient)) {
    return { isCompatible: true, score: 85, reason: `Compatible blood group (B- -> ${recipient})` };
  }

  // B+ can donate to B+, AB+
  if (donor === 'B+' && ['B+', 'AB+'].includes(recipient)) {
    return { isCompatible: true, score: 80, reason: `Compatible match (B+ -> ${recipient})` };
  }

  // AB- can donate to AB-, AB+
  if (donor === 'AB-' && ['AB-', 'AB+'].includes(recipient)) {
    return { isCompatible: true, score: 80, reason: `Compatible match (AB- -> ${recipient})` };
  }

  // Incompatible
  return { isCompatible: false, score: 0, reason: `ABO Incompatible (${donor} -> ${recipient})` };
}

/**
 * Calculates Haversine distance in kilometers between two geo-coordinates.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Ranks recipient candidates for an available organ using transparent multi-criteria weighting.
 */
export function rankCandidatesForOrgan(
  organ: Organ,
  recipients: Recipient[],
  hospitals: Hospital[],
  remainingPreservationMinutes: number,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): CandidateMatchResult[] {
  const organLat = organ.current_latitude || 42.3631;
  const organLon = organ.current_longitude || -71.0686;

  const results: CandidateMatchResult[] = [];

  for (const recipient of recipients) {
    // Organ type must match
    if (recipient.organ_type.toLowerCase() !== organ.organ_type.toLowerCase()) {
      continue;
    }

    const hospital = hospitals.find((h) => h.id === recipient.recipient_hospital_id);
    const hospitalName = hospital ? hospital.name : 'Unknown Medical Center';
    const hospitalLat = hospital?.latitude || organLat;
    const hospitalLon = hospital?.longitude || organLon;

    const reasons: string[] = [];

    // 1. Compatibility
    const bloodCheck = checkBloodGroupCompatibility(organ.blood_group, recipient.blood_group);
    let compatibilityScore = bloodCheck.score;
    reasons.push(bloodCheck.reason);

    // HLA antigen boost if provided
    if (recipient.compatibility_data?.hla_match) {
      const hla = recipient.compatibility_data.hla_match;
      compatibilityScore = Math.min(100, compatibilityScore + (hla >= 5 ? 5 : 0));
      reasons.push(`HLA Antigen Match: ${hla}/6 loci`);
    }

    // 2. Clinical Urgency Score
    let urgencyScore = 25;
    if (recipient.urgency_level === 'CRITICAL') {
      urgencyScore = 100;
      reasons.push('Priority Tier 1: Patient in critical multi-system distress');
    } else if (recipient.urgency_level === 'HIGH') {
      urgencyScore = 80;
      reasons.push('Priority Tier 2: Urgent clinical need');
    } else if (recipient.urgency_level === 'MEDIUM') {
      urgencyScore = 55;
    } else {
      urgencyScore = 30;
    }

    // 3. Distance & Transit Feasibility
    const distanceKm = calculateDistanceKm(organLat, organLon, hospitalLat, hospitalLon);
    // Rough estimate: 65 km/h average speed including logistics + 20m prep
    const estimatedTransitMins = Math.round((distanceKm / 75) * 60) + 15;

    // Distance score: 0km -> 100, 500km -> 50, 1000km+ -> 10
    const distanceScore = Math.max(10, Math.min(100, Math.round(100 - distanceKm / 10)));

    // Time Feasibility Score
    const safetyMargin = remainingPreservationMinutes - estimatedTransitMins;
    let timeFeasibilityScore = 0;
    if (safetyMargin < 0) {
      timeFeasibilityScore = 10;
      reasons.push(`Preservation deficit: Transit exceeds window by ${Math.abs(safetyMargin)} min`);
    } else if (safetyMargin < 30) {
      timeFeasibilityScore = 50;
      reasons.push(`Feasible but compressed safety margin (${safetyMargin} min)`);
    } else {
      timeFeasibilityScore = Math.min(100, 70 + Math.round(safetyMargin / 10));
      reasons.push(`Comfortable transit safety margin (${safetyMargin} min remaining)`);
    }

    // 4. Waiting Time Seniority Score
    const waitDays = Math.max(
      1,
      Math.floor((new Date().getTime() - new Date(recipient.waiting_since).getTime()) / (1000 * 60 * 60 * 24))
    );
    // 365 days = 80 score, 730 days = 100 score
    const waitingScore = Math.min(100, Math.max(20, Math.round((waitDays / 730) * 100)));
    reasons.push(`Waitlist Seniority: ${waitDays} days`);

    // Weighted Overall Score
    let overallScore =
      compatibilityScore * weights.compatibilityWeight +
      urgencyScore * weights.urgencyWeight +
      timeFeasibilityScore * weights.timeFeasibilityWeight +
      distanceScore * weights.distanceWeight +
      waitingScore * weights.waitingTimeWeight;

    // If blood group is strictly incompatible, reduce overall score drastically
    if (!bloodCheck.isCompatible) {
      overallScore = Math.min(25, overallScore * 0.2);
    }

    results.push({
      recipientId: recipient.id,
      recipientReference: recipient.recipient_reference,
      bloodGroup: recipient.blood_group,
      urgencyLevel: recipient.urgency_level,
      hospitalName,
      distanceKm,
      estimatedTransitMins,
      compatibilityScore: Math.round(compatibilityScore),
      urgencyScore: Math.round(urgencyScore),
      distanceScore: Math.round(distanceScore),
      timeFeasibilityScore: Math.round(timeFeasibilityScore),
      waitingScore: Math.round(waitingScore),
      overallScore: Math.round(overallScore * 10) / 10,
      reasons,
      isCompatible: bloodCheck.isCompatible,
    });
  }

  // Sort descending by overall score
  return results.sort((a, b) => b.overallScore - a.overallScore);
}
