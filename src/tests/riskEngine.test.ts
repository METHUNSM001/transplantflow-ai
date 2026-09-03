import { describe, expect, it } from 'vitest';
import { calculateRisk, DEFAULT_RISK_WEIGHTS } from '../engines/riskEngine';

describe('Multi-Factor Predictive Risk Engine', () => {
  it('outputs LOW risk when all telemetry indicators are nominal and hospital is ready', () => {
    const risk = calculateRisk({
      remainingPreservationMinutes: 180,
      maximumPreservationMinutes: 240,
      etaMinutes: 30,
      delayMinutes: 0,
      distanceKm: 40,
      hospitalReadinessScore: 100,
      routeCondition: 'LOW',
    });

    expect(risk.level).toBe('LOW');
    expect(risk.score).toBeLessThanOrEqual(30);
    expect(risk.recommendedActions.length).toBeGreaterThan(0);
  });

  it('escalates to CRITICAL when safety margin is breached or preservation time expires', () => {
    const risk = calculateRisk({
      remainingPreservationMinutes: 20,
      maximumPreservationMinutes: 240,
      etaMinutes: 45, // ETA (45) > remaining (20) -> Safety Margin = -25m
      delayMinutes: 25,
      distanceKm: 150,
      hospitalReadinessScore: 60,
      routeCondition: 'HIGH',
    });

    expect(risk.level).toBe('CRITICAL');
    expect(risk.score).toBeGreaterThanOrEqual(76);
    expect(risk.reasons.some((r) => r.includes('exceeds preservation deadline'))).toBe(true);
    expect(risk.recommendedActions.some((a) => a.includes('Immediately notify'))).toBe(true);
  });

  it('elevates risk when receiving hospital readiness drops to 40%', () => {
    const normalReadinessRisk = calculateRisk({
      remainingPreservationMinutes: 120,
      maximumPreservationMinutes: 240,
      etaMinutes: 40,
      delayMinutes: 0,
      distanceKm: 80,
      hospitalReadinessScore: 100,
    });

    const lowReadinessRisk = calculateRisk({
      remainingPreservationMinutes: 120,
      maximumPreservationMinutes: 240,
      etaMinutes: 40,
      delayMinutes: 0,
      distanceKm: 80,
      hospitalReadinessScore: 40,
    });

    expect(lowReadinessRisk.score).toBeGreaterThan(normalReadinessRisk.score);
    expect(lowReadinessRisk.factors.hospitalReadinessScore).toBe(60);
  });
});
