import React from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles, X } from 'lucide-react';
import { DemoStep } from '../../hooks/useLiveDemo';

interface DemoBannerProps {
  currentStep: DemoStep;
  currentStepIndex: number;
  totalSteps: number;
  isAutoPlaying: boolean;
  onNext: () => void;
  onPrev: () => void;
  onToggleAutoPlay: () => void;
  onStop: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  isAutoPlaying,
  onNext,
  onPrev,
  onToggleAutoPlay,
  onStop,
}) => {
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b-2 border-cyan-500 shadow-2xl px-4 py-3 text-slate-100 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Step Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold shrink-0">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                Live Clinical Demo
              </span>
              <span className="text-xs text-cyan-300 font-mono">
                Stage {currentStep.stepNumber} of {totalSteps}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              {currentStep.title}
            </h4>
          </div>
        </div>

        {/* Action description */}
        <div className="text-xs text-slate-300 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 max-w-xl line-clamp-2 md:line-clamp-none w-full md:w-auto">
          <span className="text-cyan-400 font-semibold">Simulated Action: </span>
          {currentStep.actionSummary}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleAutoPlay}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Auto
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Play Auto
              </>
            )}
          </button>
          <button
            onClick={onNext}
            disabled={currentStepIndex === totalSteps - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onStop}
            className="p-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-700/50 ml-1"
            title="Exit Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/60 h-1 rounded-full mt-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
