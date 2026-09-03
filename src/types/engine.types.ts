import { AlertSeverity, BloodGroup, OrganType, PriorityLevel, RouteRiskLevel, TransportMode, UrgencyLevel } from './database.types';

export type PreservationStatus = 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXPIRED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ColdIschemiaCalculation {
  maximumMinutes: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedRemaining: string;
  formattedElapsed: string;
  percentageUsed: number;
  etaMinutes: number;
  safetyMarginMinutes: number;
  status: PreservationStatus;
  isExpired: boolean;
}

export interface RiskFactorBreakdown {
  timePressureScore: number;
  transportDelayScore: number;
  hospitalReadinessScore: number;
  routeRiskScore: number;
  operationalFactorScore: number;
}

export interface RiskAssessment {
  score: number; // 0 - 100
  level: RiskLevel;
  reasons: string[];
  recommendedActions: string[];
  factors: RiskFactorBreakdown;
}

export interface MatchingWeights {
  compatibilityWeight: number; // e.g. 0.40
  urgencyWeight: number;       // e.g. 0.20
  timeFeasibilityWeight: number; // e.g. 0.20
  distanceWeight: number;      // e.g. 0.10
  waitingTimeWeight: number;   // e.g. 0.10
}

export interface CandidateMatchResult {
  recipientId: string;
  recipientReference: string;
  bloodGroup: BloodGroup;
  urgencyLevel: UrgencyLevel;
  hospitalName: string;
  distanceKm: number;
  estimatedTransitMins: number;
  compatibilityScore: number;
  urgencyScore: number;
  distanceScore: number;
  timeFeasibilityScore: number;
  waitingScore: number;
  overallScore: number;
  reasons: string[];
  isCompatible: boolean;
}

export interface SimulationResult {
  delayMinutes: number;
  originalEta: string;
  simulatedEta: string;
  originalSafetyMargin: number;
  simulatedSafetyMargin: number;
  originalRiskScore: number;
  simulatedRiskScore: number;
  originalRiskLevel: RiskLevel;
  simulatedRiskLevel: RiskLevel;
  deltaMinutes: number;
  predictedOutcome: 'VIABLE' | 'BORDERLINE' | 'CRITICAL_RISK' | 'PRESERVATION_BREACH';
  summary: string;
}

export interface RouteScenarioOption {
  id: string;
  mode: TransportMode;
  name: string;
  routeDescription: string;
  distanceKm: number;
  durationMinutes: number;
  etaFormatted: string;
  safetyMarginMinutes: number;
  riskScore: number;
  riskLevel: RiskLevel;
  weatherRisk: 'CLEAR' | 'CAUTION' | 'SEVERE';
  costEstimateUSD: number;
  isRecommended: boolean;
}
