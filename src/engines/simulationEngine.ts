import { Organ, Transport } from '../types/database.types';
import { SimulationResult } from '../types/engine.types';
import { calculateColdIschemia, formatMinutes } from './coldIschemiaEngine';
import { calculateRisk } from './riskEngine';

/**
 * Runs a predictive "What-If" delay simulation on an in-transit or scheduled organ.
 */
export function simulateDelay(
  organ: Organ,
  transport: Transport | undefined,
  delayMinutes: number,
  hospitalReadinessScore: number = 80
): SimulationResult {
  const currentEtaDate = transport?.eta ? new Date(transport.eta) : new Date(Date.now() + 60 * 60 * 1000);
  const originalEtaMins = transport?.estimated_duration_minutes || 60;
  
  // Baseline calculations
  const baselinePreservation = calculateColdIschemia(
    organ.preservation_start_time,
    organ.maximum_preservation_minutes,
    originalEtaMins
  );

  const baselineRisk = calculateRisk({
    remainingPreservationMinutes: baselinePreservation.remainingMinutes,
    maximumPreservationMinutes: organ.maximum_preservation_minutes,
    etaMinutes: originalEtaMins,
    delayMinutes: transport?.delay_minutes || 0,
    distanceKm: transport?.estimated_distance_km ? Number(transport.estimated_distance_km) : 100,
    hospitalReadinessScore,
    transportStatus: transport?.status,
    priority: organ.priority,
    routeCondition: transport?.route_risk,
  });

  // Simulated calculations
  const simulatedDurationMins = originalEtaMins + delayMinutes;
  const simulatedEtaDate = new Date(currentEtaDate.getTime() + delayMinutes * 60 * 1000);

  const simulatedPreservation = calculateColdIschemia(
    organ.preservation_start_time,
    organ.maximum_preservation_minutes,
    simulatedDurationMins
  );

  const simulatedRisk = calculateRisk({
    remainingPreservationMinutes: simulatedPreservation.remainingMinutes,
    maximumPreservationMinutes: organ.maximum_preservation_minutes,
    etaMinutes: simulatedDurationMins,
    delayMinutes: (transport?.delay_minutes || 0) + delayMinutes,
    distanceKm: transport?.estimated_distance_km ? Number(transport.estimated_distance_km) : 100,
    hospitalReadinessScore,
    transportStatus: transport?.status,
    priority: organ.priority,
    routeCondition: delayMinutes >= 30 ? 'CRITICAL' : delayMinutes >= 15 ? 'HIGH' : transport?.route_risk,
  });

  // Determine predicted outcome category
  let predictedOutcome: SimulationResult['predictedOutcome'] = 'VIABLE';
  let summary = `+${delayMinutes}m delay preserves safe clinical transport margin.`;

  if (simulatedPreservation.safetyMarginMinutes < 0) {
    predictedOutcome = 'PRESERVATION_BREACH';
    summary = `CRITICAL WARNING: Delay of ${delayMinutes}m pushes arrival ${Math.abs(simulatedPreservation.safetyMarginMinutes)}m PAST the cold-ischemia deadline! Organ degradation risk extreme.`;
  } else if (simulatedPreservation.safetyMarginMinutes < 10) {
    predictedOutcome = 'CRITICAL_RISK';
    summary = `HIGH ACUITY: Safety margin drops to ${simulatedPreservation.safetyMarginMinutes} minutes. Imminent risk of exceeding preservation window.`;
  } else if (simulatedPreservation.safetyMarginMinutes < 30) {
    predictedOutcome = 'BORDERLINE';
    summary = `ELEVATED CAUTION: Safety margin reduced from ${baselinePreservation.safetyMarginMinutes}m to ${simulatedPreservation.safetyMarginMinutes}m. Requires priority escort or air reroute.`;
  }

  return {
    delayMinutes,
    originalEta: formatMinutes(originalEtaMins),
    simulatedEta: formatMinutes(simulatedDurationMins),
    originalSafetyMargin: baselinePreservation.safetyMarginMinutes,
    simulatedSafetyMargin: simulatedPreservation.safetyMarginMinutes,
    originalRiskScore: baselineRisk.score,
    simulatedRiskScore: simulatedRisk.score,
    originalRiskLevel: baselineRisk.level,
    simulatedRiskLevel: simulatedRisk.level,
    deltaMinutes: delayMinutes,
    predictedOutcome,
    summary,
  };
}
