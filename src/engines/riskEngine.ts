import { PriorityLevel, RouteRiskLevel, TransportStatus } from '../types/database.types';
import { RiskAssessment, RiskLevel } from '../types/engine.types';

export interface RiskEngineInputs {
  remainingPreservationMinutes: number;
  maximumPreservationMinutes: number;
  etaMinutes: number;
  delayMinutes: number;
  distanceKm: number;
  hospitalReadinessScore: number; // 0 - 100
  transportStatus?: TransportStatus;
  priority?: PriorityLevel;
  routeCondition?: RouteRiskLevel;
}

export interface RiskEngineWeights {
  timePressureWeight: number;    // default 0.40
  transportDelayWeight: number;  // default 0.20
  hospitalReadinessWeight: number; // default 0.20
  routeRiskWeight: number;       // default 0.10
  operationalWeight: number;     // default 0.10
}

export const DEFAULT_RISK_WEIGHTS: RiskEngineWeights = {
  timePressureWeight: 0.40,
  transportDelayWeight: 0.20,
  hospitalReadinessWeight: 0.20,
  routeRiskWeight: 0.10,
  operationalWeight: 0.10,
};

/**
 * Multi-Factor Predictive Risk Engine for Organ Preservation & Transport.
 * Calculates normalized 0-100 operational risk with audit breakdown.
 */
export function calculateRisk(
  inputs: RiskEngineInputs,
  weights: RiskEngineWeights = DEFAULT_RISK_WEIGHTS
): RiskAssessment {
  const reasons: string[] = [];
  const recommendedActions: string[] = [];

  const remaining = Math.max(0, inputs.remainingPreservationMinutes);
  const eta = Math.max(0, inputs.etaMinutes);
  const safetyMargin = remaining - eta;
  const maxPres = Math.max(60, inputs.maximumPreservationMinutes);

  // 1. Time Pressure Score (0 - 100)
  // Evaluates safety margin ratio and absolute margin
  let timePressureScore = 0;
  if (remaining <= 0) {
    timePressureScore = 100;
    reasons.push('Organ preservation window has expired');
  } else if (safetyMargin < 0) {
    timePressureScore = 95;
    reasons.push(`Transport ETA exceeds preservation deadline by ${Math.abs(safetyMargin)} minutes`);
  } else if (safetyMargin < 10) {
    timePressureScore = 85;
    reasons.push(`Critical safety margin of only ${safetyMargin} minutes remaining`);
  } else if (safetyMargin < 30) {
    timePressureScore = 65;
    reasons.push(`Compressed safety margin of ${safetyMargin} minutes remaining`);
  } else if (safetyMargin < 60) {
    timePressureScore = 40;
    reasons.push(`Moderate safety margin (${safetyMargin} min) to destination`);
  } else {
    timePressureScore = Math.max(5, Math.round((1 - remaining / maxPres) * 30));
  }

  // 2. Transport Delay Score (0 - 100)
  let transportDelayScore = 0;
  const delay = Math.max(0, inputs.delayMinutes);
  if (delay >= 45) {
    transportDelayScore = 95;
    reasons.push(`Major transit delay detected (+${delay} min)`);
  } else if (delay >= 25) {
    transportDelayScore = 75;
    reasons.push(`Significant transit delay (+${delay} min)`);
  } else if (delay > 0) {
    transportDelayScore = Math.min(60, delay * 2.5);
    reasons.push(`Active transit delay of ${delay} minutes`);
  }

  // 3. Hospital Readiness Incompletion Score (0 - 100)
  const readiness = Math.max(0, Math.min(100, inputs.hospitalReadinessScore));
  const hospitalReadinessScore = 100 - readiness;
  if (readiness < 50) {
    reasons.push(`Receiving hospital readiness is critically low (${readiness}%)`);
  } else if (readiness < 80) {
    reasons.push(`Receiving hospital preparations incomplete (${readiness}%)`);
  }

  // 4. Route Risk Score (0 - 100)
  let routeRiskScore = 15;
  if (inputs.routeCondition === 'CRITICAL') {
    routeRiskScore = 90;
    reasons.push('Severe weather or routing obstruction reported along transit path');
  } else if (inputs.routeCondition === 'HIGH') {
    routeRiskScore = 70;
    reasons.push('Elevated route congestion or adverse transit conditions');
  } else if (inputs.routeCondition === 'MEDIUM') {
    routeRiskScore = 45;
  } else {
    routeRiskScore = 15;
  }

  // 5. Operational / Priority Factors (0 - 100)
  let operationalFactorScore = 20;
  if (inputs.priority === 'CRITICAL_RESCUE') {
    operationalFactorScore = 75;
    reasons.push('High-acuity rescue allocation: zero tolerance for secondary delays');
  } else if (inputs.priority === 'URGENT') {
    operationalFactorScore = 45;
  }

  // Weighted sum
  let rawScore =
    timePressureScore * weights.timePressureWeight +
    transportDelayScore * weights.transportDelayWeight +
    hospitalReadinessScore * weights.hospitalReadinessWeight +
    routeRiskScore * weights.routeRiskWeight +
    operationalFactorScore * weights.operationalWeight;

  // Severe time pressure floor: if transport ETA exceeds preservation window or remaining is 0,
  // the scenario is an acute clinical breach -> minimum 82% CRITICAL risk
  if (safetyMargin < 0 || remaining <= 0) {
    rawScore = Math.max(rawScore, 82);
  }

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Risk Level Classification
  // 0–30 = LOW
  // 31–55 = MEDIUM
  // 56–75 = HIGH
  // 76–100 = CRITICAL
  let level: RiskLevel = 'LOW';
  if (score >= 76) {
    level = 'CRITICAL';
  } else if (score >= 56) {
    level = 'HIGH';
  } else if (score >= 31) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  // Generate operational actions
  if (level === 'CRITICAL') {
    recommendedActions.push('Immediately notify primary transplant coordinator on emergency line');
    recommendedActions.push('Dispatch police escort or activate alternate aviation corridor if applicable');
    recommendedActions.push('Alert receiving surgical team for urgent OR standby readiness');
    recommendedActions.push('Evaluate rapid rerouting or secondary backup recipient candidates');
  } else if (level === 'HIGH') {
    recommendedActions.push('Confirm receiving hospital OR and ICU turnover ETA');
    recommendedActions.push('Establish direct communication link with transit driver/pilot');
    recommendedActions.push('Monitor telemetry for any additional deceleration or route deviation');
  } else if (level === 'MEDIUM') {
    recommendedActions.push('Verify blood bank cross-match readiness at destination hospital');
    recommendedActions.push('Maintain standard 10-minute telemetry tracking pings');
  } else {
    recommendedActions.push('Transport progressing within standard preservation parameters');
    recommendedActions.push('Routine status notification sent to receiving coordinator');
  }

  return {
    score,
    level,
    reasons: reasons.length > 0 ? reasons : ['All telemetry within nominal preservation tolerance'],
    recommendedActions,
    factors: {
      timePressureScore,
      transportDelayScore,
      hospitalReadinessScore,
      routeRiskScore,
      operationalFactorScore,
    },
  };
}
