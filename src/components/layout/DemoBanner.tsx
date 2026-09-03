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
    <div className="bg-blue-900 border-b-2 border-blue-600 shadow-md px-4 py-3 text-white sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Step Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-800 border border-blue-700 text-blue-200 font-bold shrink-0">
            <Sparkles className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                Live Clinical Demo
              </span>
              <span className="text-xs text-blue-200 font-mono">
                Stage {currentStep.stepNumber} of {totalSteps}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              {currentStep.title}
            </h4>
          </div>
        </div>

        {/* Action description */}
        <div className="text-xs text-blue-100 bg-blue-950/60 border border-blue-800/80 rounded-lg px-3 py-1.5 max-w-xl line-clamp-2 md:line-clamp-none w-full md:w-auto">
          <span className="text-blue-300 font-semibold">Simulated Action: </span>
          {currentStep.actionSummary}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-blue-700"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleAutoPlay}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause Auto
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play Auto
              </>
            )}
          </button>
          <button
            onClick={onNext}
            disabled={currentStepIndex === totalSteps - 1}
            className="p-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-blue-700"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onStop}
            className="p-1.5 rounded-lg bg-blue-950 hover:bg-red-800 text-rose-200 border border-blue-800 ml-1"
            title="Exit Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-blue-950/60 h-1 rounded-full mt-2 overflow-hidden">
        <div
          className="bg-blue-400 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
