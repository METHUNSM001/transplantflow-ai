import { describe, expect, it } from 'vitest'
import {
  calculateColdIschemia,
  calculateSafetyMargin,
  calculateRiskScore,
  calculateMatchingScore,
  calculateSimulationOutcome,
  evaluateHospitalReadiness,
  summariseRiskLevel,
} from './engines'

describe('cold ischemia logic', () => {
  it('calculates safe margin for a healthy transplant window', () => {
    const result = calculateColdIschemia({
      remainingMinutes: 130,
      etaMinutes: 90,
      thresholds: { warning: 30, critical: 10 },
    })

    expect(result.safetyMarginMinutes).toBe(40)
    expect(result.status).toBe('SAFE')
  })

  it('marks expired organs when preservation is exhausted', () => {
    const result = calculateColdIschemia({
      remainingMinutes: 0,
      etaMinutes: 15,
      thresholds: { warning: 30, critical: 10 },
    })

    expect(result.status).toBe('EXPIRED')
  })

  it('calculates safety margin and catches invalid ETA', () => {
    const result = calculateSafetyMargin({
      remainingMinutes: 120,
      etaMinutes: null,
    })

    expect(result.safetyMarginMinutes).toBe(120)
    expect(result.warning).toBe('ETA missing')
  })
})

describe('risk engine', () => {
  it('returns low risk for healthy conditions', () => {
    const risk = calculateRiskScore({
      remainingMinutes: 180,
      etaMinutes: 45,
      delayMinutes: 10,
      distanceKm: 28,
      hospitalReadiness: 92,
      transportStatus: 'IN_TRANSIT',
      priority: 'HIGH',
      routeCondition: 'CLEAR',
    })

    expect(risk.level).toBe('LOW')
    expect(risk.score).toBeLessThan(31)
  })

  it('escalates critical risk when hospital readiness is poor and timing is tight', () => {
    const risk = calculateRiskScore({
      remainingMinutes: 20,
      etaMinutes: 35,
      delayMinutes: 40,
      distanceKm: 80,
      hospitalReadiness: 45,
      transportStatus: 'DELAYED',
      priority: 'CRITICAL',
      routeCondition: 'HEAVY_TRAFFIC',
    })

    expect(risk.level).toBe('CRITICAL')
    expect(risk.score).toBeGreaterThanOrEqual(75)
    expect(risk.reasons.length).toBeGreaterThan(0)
  })
})

describe('matching engine', () => {
  it('ranks the best candidate by compatibility and urgency', () => {
    const rankings = calculateMatchingScore({
      organType: 'Heart',
      bloodGroup: 'O+',
      candidates: [
        { id: 'c1', bloodGroup: 'O+', urgencyLevel: 'CRITICAL', waitingSince: 18, distanceKm: 12, etaMinutes: 55, preservationMinutes: 180, readiness: 90 },
        { id: 'c2', bloodGroup: 'A+', urgencyLevel: 'HIGH', waitingSince: 25, distanceKm: 30, etaMinutes: 90, preservationMinutes: 160, readiness: 75 },
      ],
      weights: { compatibility: 0.4, urgency: 0.2, time: 0.2, distance: 0.1, waiting: 0.1 },
    })

    expect(rankings[0].id).toBe('c1')
    expect(rankings[0].overall).toBeGreaterThan(rankings[1].overall)
  })
})

describe('simulation engine', () => {
  it('shows critical outcome when delay consumes the safety margin', () => {
    const outcome = calculateSimulationOutcome({
      currentEtaMinutes: 100,
      currentRemainingMinutes: 130,
      delayMinutes: 30,
      thresholdWarning: 30,
      thresholdCritical: 10,
    })

    expect(outcome.newEtaMinutes).toBe(130)
    expect(outcome.newSafetyMarginMinutes).toBe(0)
    expect(outcome.riskLevel).toBe('CRITICAL')
  })
})

describe('hospital readiness', () => {
  it('computes a percentage from all readiness checks', () => {
    const readiness = evaluateHospitalReadiness({
      orReady: true,
      icuReady: true,
      surgicalTeamReady: true,
      bloodReady: false,
      recipientReady: true,
    })

    expect(readiness.score).toBe(80)
    expect(readiness.status).toBe('READY')
  })
})

describe('risk helpers', () => {
  it('maps score ranges correctly', () => {
    expect(summariseRiskLevel(15)).toBe('LOW')
    expect(summariseRiskLevel(41)).toBe('MEDIUM')
    expect(summariseRiskLevel(70)).toBe('HIGH')
    expect(summariseRiskLevel(88)).toBe('CRITICAL')
  })
})
