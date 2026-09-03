import { useEffect, useState } from 'react';
import { calculateColdIschemia, ColdIschemiaThresholds, DEFAULT_THRESHOLDS } from '../engines/coldIschemiaEngine';
import { ColdIschemiaCalculation } from '../types/engine.types';

export function usePreservationTimer(
  preservationStartTime: string | undefined,
  maximumPreservationMinutes: number,
  etaMinutes: number = 0,
  thresholds: ColdIschemiaThresholds = DEFAULT_THRESHOLDS
): ColdIschemiaCalculation {
  const [calculation, setCalculation] = useState<ColdIschemiaCalculation>(() =>
    calculateColdIschemia(
      preservationStartTime || new Date().toISOString(),
      maximumPreservationMinutes,
      etaMinutes,
      thresholds
    )
  );

  useEffect(() => {
    if (!preservationStartTime) return;

    // Immediately calculate
    setCalculation(
      calculateColdIschemia(preservationStartTime, maximumPreservationMinutes, etaMinutes, thresholds)
    );

    // Update every second for live countdown
    const interval = setInterval(() => {
      setCalculation(
        calculateColdIschemia(preservationStartTime, maximumPreservationMinutes, etaMinutes, thresholds)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [preservationStartTime, maximumPreservationMinutes, etaMinutes, thresholds]);

  return calculation;
}
