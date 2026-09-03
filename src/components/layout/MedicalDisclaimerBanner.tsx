import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '../../config/constants';

export const MedicalDisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="w-full bg-amber-950/60 border-b border-amber-800/40 text-amber-300 text-xs py-1 px-4 text-center hover:bg-amber-900/60 transition flex items-center justify-center gap-1.5"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        Clinical Decision Support Demonstration Notice (Click to expand)
      </button>
    );
  }

  return (
    <aside
      aria-label="Clinical Decision Support Notice"
      className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-between shadow-inner relative z-50"
    >
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] shrink-0">
          Decision Support Prototype:
        </span>
        <p className="line-clamp-1 sm:line-clamp-none text-slate-300">
          {MEDICAL_DISCLAIMER}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/80 hover:text-amber-200 p-1 rounded-md hover:bg-amber-900/40 transition shrink-0 ml-2"
        title="Minimize notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
