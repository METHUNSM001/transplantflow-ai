import React from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import { DEFAULT_MATCHING_WEIGHTS } from '../../engines/matchingEngine';
import { MatchingWeights } from '../../types/engine.types';

interface MatchingCriteriaWeightControlsProps {
  weights: MatchingWeights;
  onChange: (weights: MatchingWeights) => void;
}

export const MatchingCriteriaWeightControls: React.FC<MatchingCriteriaWeightControlsProps> = ({
  weights,
  onChange,
}) => {
  const handleSlider = (key: keyof MatchingWeights, value: number) => {
    onChange({
      ...weights,
      [key]: value / 100,
    });
  };

  const handleReset = () => {
    onChange(DEFAULT_MATCHING_WEIGHTS);
  };

  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-purple-400" />
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Matching Criteria Weight Configuration
          </h4>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Default
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Compatibility */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Compatibility</span>
            <span className="font-mono text-purple-400 font-bold">
              {Math.round(weights.compatibilityWeight * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="70"
            value={Math.round(weights.compatibilityWeight * 100)}
            onChange={(e) => handleSlider('compatibilityWeight', Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Urgency */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Clinical Urgency</span>
            <span className="font-mono text-purple-400 font-bold">
              {Math.round(weights.urgencyWeight * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={Math.round(weights.urgencyWeight * 100)}
            onChange={(e) => handleSlider('urgencyWeight', Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Feasibility */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Time Feasibility</span>
            <span className="font-mono text-purple-400 font-bold">
              {Math.round(weights.timeFeasibilityWeight * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={Math.round(weights.timeFeasibilityWeight * 100)}
            onChange={(e) => handleSlider('timeFeasibilityWeight', Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Distance */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Proximity</span>
            <span className="font-mono text-purple-400 font-bold">
              {Math.round(weights.distanceWeight * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            value={Math.round(weights.distanceWeight * 100)}
            onChange={(e) => handleSlider('distanceWeight', Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Waiting time */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Waitlist Time</span>
            <span className="font-mono text-purple-400 font-bold">
              {Math.round(weights.waitingTimeWeight * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            value={Math.round(weights.waitingTimeWeight * 100)}
            onChange={(e) => handleSlider('waitingTimeWeight', Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
