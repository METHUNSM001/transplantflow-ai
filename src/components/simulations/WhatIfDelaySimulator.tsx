import React, { useState } from 'react';
import { AlertCircle, Sliders } from 'lucide-react';
import { simulateDelay } from '../../engines/simulationEngine';
import { Organ, Transport } from '../../types/database.types';
import { StatusBadge } from '../common/StatusBadge';

interface WhatIfDelaySimulatorProps {
  organ: Organ;
  transport?: Transport;
  hospitalReadinessScore?: number;
}

export const WhatIfDelaySimulator: React.FC<WhatIfDelaySimulatorProps> = ({
  organ,
  transport,
  hospitalReadinessScore = 80,
}) => {
  const [delayMinutes, setDelayMinutes] = useState<number>(30);

  const simulation = simulateDelay(organ, transport, delayMinutes, hospitalReadinessScore);

  const presets = [10, 20, 30, 60];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            "What-If" Delay Simulation Workbench
          </h4>
        </div>
        <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Predictive Sensitivity
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Simulate the compound impact of highway congestion, weather diversions, or flight delays
        on this organ's cold-ischemia safety margin before decisions are finalized.
      </p>

      {/* Preset Delay Buttons + Custom Slider */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Simulate Added Delay:
          </span>
          <div className="flex items-center gap-1.5">
            {presets.map((mins) => (
              <button
                key={mins}
                onClick={() => setDelayMinutes(mins)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                  delayMinutes === mins
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                +{mins}m
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(Number(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="w-20 text-center font-mono font-bold text-sm bg-white border border-slate-300 py-1 rounded-lg text-blue-700 shadow-2xs">
            +{delayMinutes} min
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: Current State vs Simulated State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current State */}
        <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nominal Baseline State</span>
            <StatusBadge type="risk" value={simulation.originalRiskLevel} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Estimated Duration</span>
              <span className="font-mono font-bold text-slate-900 text-base">
                {simulation.originalEta}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Safety Margin</span>
              <span className="font-mono font-bold text-emerald-700 text-base">
                +{simulation.originalSafetyMargin}m
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Composite Risk</span>
              <span className="font-mono font-bold text-slate-800 text-base">
                {simulation.originalRiskScore}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Viability Status</span>
              <span className="text-emerald-700 font-bold text-sm">Viable</span>
            </div>
          </div>
        </div>

        {/* Simulated State */}
        <div
          className={`p-5 rounded-xl border space-y-3 transition-all ${
            simulation.simulatedSafetyMargin < 0
              ? 'bg-red-50/50 border-red-300 ring-1 ring-red-200'
              : simulation.simulatedSafetyMargin < 10
              ? 'bg-amber-50/50 border-amber-300'
              : 'bg-blue-50/40 border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              Simulated (+{delayMinutes}m Added Delay)
            </span>
            <StatusBadge type="risk" value={simulation.simulatedRiskLevel} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">New Duration</span>
              <span className="font-mono font-bold text-slate-900 text-base">
                {simulation.simulatedEta}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">New Safety Margin</span>
              <span
                className={`font-mono font-bold text-base ${
                  simulation.simulatedSafetyMargin < 0
                    ? 'text-red-600 animate-pulse'
                    : simulation.simulatedSafetyMargin < 10
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {simulation.simulatedSafetyMargin > 0
                  ? `+${simulation.simulatedSafetyMargin}m`
                  : `${simulation.simulatedSafetyMargin}m`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">New Risk Score</span>
              <span
                className={`font-mono font-bold text-base ${
                  simulation.simulatedRiskScore >= 75
                    ? 'text-red-700'
                    : simulation.simulatedRiskScore >= 55
                    ? 'text-amber-700'
                    : 'text-slate-900'
                }`}
              >
                {simulation.simulatedRiskScore}%{' '}
                <span className="text-xs text-red-600 font-semibold">
                  (+{simulation.simulatedRiskScore - simulation.originalRiskScore}%)
                </span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">Predicted Outcome</span>
              <span
                className={`font-bold ${
                  simulation.predictedOutcome === 'PRESERVATION_BREACH'
                    ? 'text-red-600'
                    : simulation.predictedOutcome === 'CRITICAL_RISK'
                    ? 'text-orange-600'
                    : simulation.predictedOutcome === 'BORDERLINE'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {simulation.predictedOutcome.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Outcome Summary Callout */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          simulation.predictedOutcome === 'PRESERVATION_BREACH'
            ? 'bg-red-50 border-red-200 text-red-900'
            : simulation.predictedOutcome === 'CRITICAL_RISK'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}
      >
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block mb-0.5">Simulation Engine Assessment:</strong>
          <p>{simulation.summary}</p>
        </div>
      </div>
    </div>
  );
};
