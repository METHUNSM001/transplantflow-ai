import { describe, expect, it } from 'vitest';
import { calculateColdIschemia, DEFAULT_THRESHOLDS } from '../engines/coldIschemiaEngine';

describe('Cold Ischemia Intelligence Engine', () => {
  const baseTime = new Date('2026-09-03T12:00:00Z');

  it('calculates normal remaining preservation time and positive safety margin correctly', () => {
    // 60 minutes elapsed out of 240 max limit (Heart: 4 hrs)
    // 180 minutes remaining. ETA = 45 minutes.
    // Safety margin = 180 - 45 = 135 minutes -> SAFE
    const startTime = new Date('2026-09-03T11:00:00Z');
    const result = calculateColdIschemia(startTime, 240, 45, DEFAULT_THRESHOLDS, baseTime);

    expect(result.elapsedMinutes).toBe(60);
    expect(result.remainingMinutes).toBe(180);
    expect(result.safetyMarginMinutes).toBe(135);
    expect(result.status).toBe('SAFE');
    expect(result.isExpired).toBe(false);
  });

  it('transitions to WARNING when safety margin is between 10 and 30 minutes', () => {
    // 215 minutes elapsed out of 240 max limit
    // 25 minutes remaining. ETA = 10 minutes.
    // Safety margin = 25 - 10 = 15 minutes (< 30m, >= 10m) -> WARNING
    const startTime = new Date(baseTime.getTime() - 215 * 60 * 1000);
    const result = calculateColdIschemia(startTime, 240, 10, DEFAULT_THRESHOLDS, baseTime);

    expect(result.remainingMinutes).toBe(25);
    expect(result.safetyMarginMinutes).toBe(15);
    expect(result.status).toBe('WARNING');
  });

  it('transitions to CRITICAL when safety margin is under 10 minutes', () => {
    // 215 minutes elapsed out of 240 max limit
    // 25 minutes remaining. ETA = 20 minutes.
    // Safety margin = 25 - 20 = 5 minutes (< 10m) -> CRITICAL
    const startTime = new Date(baseTime.getTime() - 215 * 60 * 1000);
    const result = calculateColdIschemia(startTime, 240, 20, DEFAULT_THRESHOLDS, baseTime);

    expect(result.remainingMinutes).toBe(25);
    expect(result.safetyMarginMinutes).toBe(5);
    expect(result.status).toBe('CRITICAL');
  });

  it('detects EXPIRED organ when remaining preservation reaches zero', () => {
    // 250 minutes elapsed out of 240 max limit -> remaining <= 0
    const startTime = new Date(baseTime.getTime() - 250 * 60 * 1000);
    const result = calculateColdIschemia(startTime, 240, 0, DEFAULT_THRESHOLDS, baseTime);

    expect(result.remainingMinutes).toBe(0);
    expect(result.status).toBe('EXPIRED');
    expect(result.isExpired).toBe(true);
  });

  it('handles missing or zero ETA gracefully without NaN', () => {
    const startTime = new Date(baseTime.getTime() - 60 * 60 * 1000);
    const result = calculateColdIschemia(startTime, 240, 0, DEFAULT_THRESHOLDS, baseTime);

    expect(result.safetyMarginMinutes).toBe(180);
    expect(isNaN(result.safetyMarginMinutes)).toBe(false);
  });
});
