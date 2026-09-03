import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Clock, HelpCircle, ShieldAlert, Sliders } from 'lucide-react';
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
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            "What-If" Preservation Delay Simulation
          </h4>
        </div>
        <span className="text-xs text-cyan-400 font-mono bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/30">
          Interactive Workbench
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Simulate the compound impact of highway traffic, meteorological delays, or runway holdovers
        on this organ's cold-ischemia safety margin before decisions are locked in.
      </p>

      {/* Preset Delay Buttons + Custom Slider */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Simulate Transit Delay:
          </span>
          <div className="flex items-center gap-1.5">
            {presets.map((mins) => (
              <button
                key={mins}
                onClick={() => setDelayMinutes(mins)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  delayMinutes === mins
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-900/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
            className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="w-20 text-center font-mono font-bold text-sm bg-slate-900 border border-slate-700 py-1 rounded-lg text-cyan-400">
            +{delayMinutes} min
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: Current State vs Simulated State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current State */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 uppercase">Current Nominal State</span>
            <StatusBadge type="risk" value={simulation.originalRiskLevel} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Estimated Duration</span>
              <span className="font-mono font-semibold text-white text-base">
                {simulation.originalEta}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Safety Margin</span>
              <span className="font-mono font-semibold text-emerald-400 text-base">
                +{simulation.originalSafetyMargin}m
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Composite Risk</span>
              <span className="font-mono font-semibold text-slate-200 text-base">
                {simulation.originalRiskScore}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status</span>
              <span className="text-emerald-400 font-semibold">Viable</span>
            </div>
          </div>
        </div>

        {/* Simulated State */}
        <div
          className={`p-4 rounded-xl border space-y-3 transition-all ${
            simulation.simulatedSafetyMargin < 0
              ? 'bg-rose-950/30 border-rose-500/40 shadow-rose-950/20 shadow-lg'
              : simulation.simulatedSafetyMargin < 10
              ? 'bg-amber-950/30 border-amber-500/40'
              : 'bg-slate-950/50 border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
              Simulated State (+{delayMinutes}m Delay)
            </span>
            <StatusBadge type="risk" value={simulation.simulatedRiskLevel} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">New Total Transit</span>
              <span className="font-mono font-semibold text-white text-base">
                {simulation.simulatedEta}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">New Safety Margin</span>
              <span
                className={`font-mono font-semibold text-base ${
                  simulation.simulatedSafetyMargin < 0
                    ? 'text-rose-400 animate-pulse'
                    : simulation.simulatedSafetyMargin < 10
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {simulation.simulatedSafetyMargin > 0
                  ? `+${simulation.simulatedSafetyMargin}m`
                  : `${simulation.simulatedSafetyMargin}m`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">New Risk Score</span>
              <span
                className={`font-mono font-semibold text-base ${
                  simulation.simulatedRiskScore >= 75
                    ? 'text-rose-400'
                    : simulation.simulatedRiskScore >= 55
                    ? 'text-amber-400'
                    : 'text-slate-200'
                }`}
              >
                {simulation.simulatedRiskScore}%{' '}
                <span className="text-[10px] text-rose-400">
                  (+{simulation.simulatedRiskScore - simulation.originalRiskScore}%)
                </span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Predicted Outcome</span>
              <span
                className={`font-bold ${
                  simulation.predictedOutcome === 'PRESERVATION_BREACH'
                    ? 'text-rose-400'
                    : simulation.predictedOutcome === 'CRITICAL_RISK'
                    ? 'text-orange-400'
                    : simulation.predictedOutcome === 'BORDERLINE'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
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
        className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
          simulation.predictedOutcome === 'PRESERVATION_BREACH'
            ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            : simulation.predictedOutcome === 'CRITICAL_RISK'
            ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
        }`}
      >
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Simulation Engine Verdict:</strong>
          <p>{simulation.summary}</p>
        </div>
      </div>
    </div>
  );
};
