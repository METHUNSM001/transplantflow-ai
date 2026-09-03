export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type OperationStatus = 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXPIRED'

export function summariseRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'LOW'
  if (score <= 55) return 'MEDIUM'
  if (score <= 75) return 'HIGH'
  return 'CRITICAL'
}

export function calculateSafetyMargin(params: {
  remainingMinutes: number
  etaMinutes: number | null
}): { safetyMarginMinutes: number; warning: string | null } {
  if (etaMinutesIsMissing(params.etaMinutes)) {
    return { safetyMarginMinutes: params.remainingMinutes, warning: 'ETA missing' }
  }

  const etaMinutes = params.etaMinutes ?? params.remainingMinutes

  return {
    safetyMarginMinutes: Math.max(0, params.remainingMinutes - etaMinutes),
    warning: null,
  }
}

export function calculateColdIschemia(params: {
  remainingMinutes: number
  etaMinutes: number | null
  thresholds: { warning: number; critical: number }
}): {
  safetyMarginMinutes: number
  status: OperationStatus
  warning: string | null
} {
  const { safetyMarginMinutes, warning } = calculateSafetyMargin({
    remainingMinutes: params.remainingMinutes,
    etaMinutes: params.etaMinutes,
  })

  if (params.remainingMinutes <= 0 || params.etaMinutes !== null && params.etaMinutes >= params.remainingMinutes) {
    return { safetyMarginMinutes: 0, status: 'EXPIRED', warning: 'Preservation window expired' }
  }

  if (safetyMarginMinutes < params.thresholds.critical) {
    return { safetyMarginMinutes, status: 'CRITICAL', warning: warning ?? 'Critical threshold reached' }
  }

  if (safetyMarginMinutes < params.thresholds.warning) {
    return { safetyMarginMinutes, status: 'WARNING', warning: warning ?? 'Warning threshold reached' }
  }

  return { safetyMarginMinutes, status: 'SAFE', warning: warning ?? null }
}

export function calculateRiskScore(params: {
  remainingMinutes: number
  etaMinutes: number
  delayMinutes: number
  distanceKm: number
  hospitalReadiness: number
  transportStatus: string
  priority: string
  routeCondition: string
}): {
  score: number
  level: RiskLevel
  reasons: string[]
} {
  let score = 0

  if (params.remainingMinutes <= 60) score += 35
  else if (params.remainingMinutes <= 120) score += 20
  else score += 8

  if (params.delayMinutes > 25) score += 20
  else if (params.delayMinutes > 10) score += 12

  if (params.hospitalReadiness < 60) score += 20
  else if (params.hospitalReadiness < 80) score += 10

  if (params.transportStatus === 'DELAYED') score += 18
  if (params.priority === 'CRITICAL') score += 12
  if (params.routeCondition === 'HEAVY_TRAFFIC') score += 10
  if (params.distanceKm > 70) score += 8
  if (params.etaMinutes > params.remainingMinutes) score += 12

  const finalScore = Math.min(100, score)

  return {
    score: finalScore,
    level: summariseRiskLevel(finalScore),
    reasons: [
      params.remainingMinutes <= 60 ? 'Preservation window is narrow.' : 'Preservation window remains acceptable.',
      params.delayMinutes > 10 ? 'Transport delay detected.' : 'No major delay detected.',
      params.hospitalReadiness < 80 ? 'Hospital readiness is incomplete.' : 'Hospital readiness is acceptable.',
    ],
  }
}

export function calculateMatchingScore(params: {
  organType: string
  bloodGroup: string
  candidates: Array<{
    id: string
    bloodGroup: string
    urgencyLevel: string
    waitingSince: number
    distanceKm: number
    etaMinutes: number
    preservationMinutes: number
    readiness: number
  }>
  weights: {
    compatibility: number
    urgency: number
    time: number
    distance: number
    waiting: number
  }
}): Array<{ id: string; overall: number; reasons: string[] }> {
  const candidateScores = params.candidates.map((candidate) => {
    const compatibility = candidate.bloodGroup === params.bloodGroup ? 95 : 60
    const urgency = candidate.urgencyLevel === 'CRITICAL' ? 95 : candidate.urgencyLevel === 'HIGH' ? 80 : 65
    const time = Math.max(0, 100 - candidate.etaMinutes / 2)
    const distance = Math.max(0, 100 - candidate.distanceKm * 1.1)
    const waiting = Math.min(100, 40 + candidate.waitingSince * 2)

    const overall =
      compatibility * params.weights.compatibility +
      urgency * params.weights.urgency +
      time * params.weights.time +
      distance * params.weights.distance +
      waiting * params.weights.waiting

    return {
      id: candidate.id,
      overall: Number(overall.toFixed(1)),
      reasons: [
        `Compatibility match: ${compatibility}%`,
        `Urgency: ${urgency}%`,
        `Time feasibility: ${time.toFixed(0)}%`,
        `Distance score: ${distance.toFixed(0)}%`,
      ],
    }
  })

  return candidateScores.sort((a, b) => b.overall - a.overall)
}

export function calculateSimulationOutcome(params: {
  currentEtaMinutes: number
  currentRemainingMinutes: number
  delayMinutes: number
  thresholdWarning: number
  thresholdCritical: number
}): {
  newEtaMinutes: number
  newSafetyMarginMinutes: number
  riskLevel: RiskLevel
  predictedOutcome: string
} {
  const newEtaMinutes = params.currentEtaMinutes + params.delayMinutes
  const safetyMarginMinutes = Math.max(0, params.currentRemainingMinutes - newEtaMinutes)
  const riskLevel = safetyMarginMinutes < params.thresholdCritical
    ? 'CRITICAL'
    : safetyMarginMinutes < params.thresholdWarning
      ? 'HIGH'
      : 'MEDIUM'

  return {
    newEtaMinutes,
    newSafetyMarginMinutes: safetyMarginMinutes,
    riskLevel,
    predictedOutcome: safetyMarginMinutes <= 0 ? 'Critical delay consumes the preservation margin.' : 'Arrival remains feasible with monitoring.',
  }
}

export function evaluateHospitalReadiness(params: {
  orReady: boolean
  icuReady: boolean
  surgicalTeamReady: boolean
  bloodReady: boolean
  recipientReady: boolean
}): {
  score: number
  status: 'READY' | 'PARTIAL' | 'NOT_READY'
  checklist: { label: string; ready: boolean }[]
} {
  const checklist = [
    { label: 'Operating Room', ready: params.orReady },
    { label: 'ICU', ready: params.icuReady },
    { label: 'Surgical Team', ready: params.surgicalTeamReady },
    { label: 'Blood Preparation', ready: params.bloodReady },
    { label: 'Recipient Readiness', ready: params.recipientReady },
  ]

  const score = Math.round((checklist.filter((item) => item.ready).length / checklist.length) * 100)

  const status = score >= 80 ? 'READY' : score >= 50 ? 'PARTIAL' : 'NOT_READY'

  return { score, status, checklist }
}

function etaMinutesIsMissing(value: number | null): boolean {
  return value === null || Number.isNaN(value)
}
