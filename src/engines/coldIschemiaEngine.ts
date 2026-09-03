import { ColdIschemiaCalculation, PreservationStatus } from '../types/engine.types';

export interface ColdIschemiaThresholds {
  safeMarginMinutes: number;    // default 30
  warningMarginMinutes: number; // default 10
}

export const DEFAULT_THRESHOLDS: ColdIschemiaThresholds = {
  safeMarginMinutes: 30,
  warningMarginMinutes: 10,
};

/**
 * Calculates real-time cold-ischemia countdown, elapsed time, and safety margin.
 *
 * @param preservationStartTime ISO string or Date when perfusion / cold storage started
 * @param maximumPreservationMinutes maximum cold-ischemia limit (e.g. 240 for Heart, 1440 for Kidney)
 * @param etaMinutes estimated duration until arrival in minutes (or from target ETA)
 * @param thresholds configurable thresholds for SAFE and WARNING statuses
 * @param currentTime optional reference time for deterministic testing
 */
export function calculateColdIschemia(
  preservationStartTime: string | Date,
  maximumPreservationMinutes: number,
  etaMinutes: number = 0,
  thresholds: ColdIschemiaThresholds = DEFAULT_THRESHOLDS,
  currentTime: Date = new Date()
): ColdIschemiaCalculation {
  const startTime = new Date(preservationStartTime).getTime();
  const now = currentTime.getTime();

  if (isNaN(startTime) || maximumPreservationMinutes <= 0) {
    return {
      maximumMinutes: Math.max(0, maximumPreservationMinutes || 0),
      elapsedMinutes: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedRemaining: '00:00:00',
      formattedElapsed: '00:00:00',
      percentageUsed: 100,
      etaMinutes,
      safetyMarginMinutes: 0,
      status: 'EXPIRED',
      isExpired: true,
    };
  }

  const elapsedMs = Math.max(0, now - startTime);
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
  const maximumMs = maximumPreservationMinutes * 60 * 1000;
  const remainingMs = maximumMs - elapsedMs;

  const isExpired = remainingMs <= 0;
  const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const remainingMinutes = Math.floor(remainingSeconds / 60);

  // Safety Margin = Remaining Preservation Time - Transport ETA
  // Can be negative if ETA exceeds remaining preservation
  const safetyMarginMinutes = remainingMinutes - Math.max(0, etaMinutes);

  let status: PreservationStatus = 'SAFE';
  if (isExpired || remainingMinutes <= 0) {
    status = 'EXPIRED';
  } else if (safetyMarginMinutes < thresholds.warningMarginMinutes) {
    status = 'CRITICAL';
  } else if (safetyMarginMinutes < thresholds.safeMarginMinutes) {
    status = 'WARNING';
  } else {
    status = 'SAFE';
  }

  const percentageUsed = Math.min(
    100,
    Math.max(0, Math.round((elapsedMs / maximumMs) * 100))
  );

  return {
    maximumMinutes: maximumPreservationMinutes,
    elapsedMinutes,
    remainingMinutes,
    remainingSeconds,
    formattedRemaining: formatSeconds(remainingSeconds),
    formattedElapsed: formatSeconds(Math.floor(elapsedMs / 1000)),
    percentageUsed,
    etaMinutes,
    safetyMarginMinutes,
    status,
    isExpired,
  };
}

export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}
