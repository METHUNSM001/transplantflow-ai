import { Organ, Transport } from '../types/database.types';
import { RouteScenarioOption } from '../types/engine.types';
import { calculateColdIschemia, formatMinutes } from './coldIschemiaEngine';
import { calculateRisk } from './riskEngine';

/**
 * Generates and evaluates multi-modal transport scenarios (Ground Ambulance, Medevac Helicopter, Fixed-Wing Air)
 * for clinical decision-support routing.
 */
export function evaluateAlternativeScenarios(
  organ: Organ,
  currentTransport?: Transport,
  baseDistanceKm: number = 280,
  hospitalReadinessScore: number = 80
): RouteScenarioOption[] {
  const remainingPreservationMins = calculateColdIschemia(
    organ.preservation_start_time,
    organ.maximum_preservation_minutes
  ).remainingMinutes;

  const scenarios: Omit<RouteScenarioOption, 'isRecommended'>[] = [
    {
      id: 'scenario-ground-direct',
      mode: 'Ambulance',
      name: 'Route A — Ground Highway Express',
      routeDescription: 'Interstate highway transit via dedicated emergency vehicle with continuous telemetry',
      distanceKm: Math.round(baseDistanceKm * 1.15),
      durationMinutes: Math.round((baseDistanceKm * 1.15 / 80) * 60) + 15, // ~80 km/h + 15m traffic buffer
      etaFormatted: '',
      safetyMarginMinutes: 0,
      riskScore: 0,
      riskLevel: 'LOW',
      weatherRisk: 'CLEAR',
      costEstimateUSD: 3500,
    },
    {
      id: 'scenario-ground-bypass',
      mode: 'Ambulance',
      name: 'Route B — Ground Secondary Bypass',
      routeDescription: 'State arterial bypass routing avoiding major metropolitan arterial choke points',
      distanceKm: Math.round(baseDistanceKm * 1.35),
      durationMinutes: Math.round((baseDistanceKm * 1.35 / 70) * 60) + 10,
      etaFormatted: '',
      safetyMarginMinutes: 0,
      riskScore: 0,
      riskLevel: 'LOW',
      weatherRisk: 'CLEAR',
      costEstimateUSD: 3800,
    },
    {
      id: 'scenario-helicopter',
      mode: 'Helicopter',
      name: 'Route C — Medevac Air Rotor (Direct)',
      routeDescription: 'Hospital helipad to hospital helipad point-to-point flight vector',
      distanceKm: Math.round(baseDistanceKm * 0.95),
      durationMinutes: Math.round((baseDistanceKm * 0.95 / 220) * 60) + 25, // 220 km/h + 25m warmup/ATC
      etaFormatted: '',
      safetyMarginMinutes: 0,
      riskScore: 0,
      riskLevel: 'LOW',
      weatherRisk: 'CAUTION',
      costEstimateUSD: 14200,
    },
    {
      id: 'scenario-fixed-wing',
      mode: 'Air Ambulance',
      name: 'Route D — Fixed-Wing Turboprop Transport',
      routeDescription: 'Regional airfield to regional airfield with ground ambulance transfers at both ends',
      distanceKm: Math.round(baseDistanceKm * 1.05),
      durationMinutes: Math.round((baseDistanceKm * 1.05 / 450) * 60) + 55, // 450 km/h + 55m ground transfer/ATC
      etaFormatted: '',
      safetyMarginMinutes: 0,
      riskScore: 0,
      riskLevel: 'LOW',
      weatherRisk: 'CLEAR',
      costEstimateUSD: 22500,
    },
  ];

  // Evaluate each scenario through the cold-ischemia and risk engines
  const evaluatedScenarios = scenarios.map((scenario) => {
    const safetyMarginMinutes = remainingPreservationMins - scenario.durationMinutes;

    const risk = calculateRisk({
      remainingPreservationMinutes: remainingPreservationMins,
      maximumPreservationMinutes: organ.maximum_preservation_minutes,
      etaMinutes: scenario.durationMinutes,
      delayMinutes: 0,
      distanceKm: scenario.distanceKm,
      hospitalReadinessScore,
      transportStatus: 'SCHEDULED',
      priority: organ.priority,
      routeCondition: scenario.weatherRisk === 'CAUTION' ? 'MEDIUM' : 'LOW',
    });

    return {
      ...scenario,
      etaFormatted: formatMinutes(scenario.durationMinutes),
      safetyMarginMinutes,
      riskScore: risk.score,
      riskLevel: risk.level,
    };
  });

  // Find scenario with lowest operational risk and adequate safety margin (> 15m)
  let lowestRiskIndex = 0;
  let minRiskScore = Infinity;

  evaluatedScenarios.forEach((s, idx) => {
    // Penalize breach heavily
    const effectiveRisk = s.safetyMarginMinutes < 10 ? s.riskScore + 100 : s.riskScore;
    if (effectiveRisk < minRiskScore) {
      minRiskScore = effectiveRisk;
      lowestRiskIndex = idx;
    }
  });

  return evaluatedScenarios.map((s, idx) => ({
    ...s,
    isRecommended: idx === lowestRiskIndex,
  }));
}
