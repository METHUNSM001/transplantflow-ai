import React, { useState } from 'react';
import { AlertCircle, ShieldCheck, X } from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '../../config/constants';

export const MedicalDisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="w-full bg-blue-50/80 border-b border-blue-100 text-blue-700 text-xs py-1.5 px-4 text-center hover:bg-blue-100/60 transition flex items-center justify-center gap-1.5 font-medium"
      >
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        Clinical Decision Support Demonstration Notice (Click to view notice)
      </button>
    );
  }

  return (
    <aside
      aria-label="Clinical Decision Support Notice"
      className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-900 flex items-center justify-between relative z-50"
    >
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="font-bold text-blue-800 uppercase tracking-wider text-[11px] shrink-0">
          Decision Support Notice:
        </span>
        <p className="line-clamp-1 sm:line-clamp-none text-blue-950/80 font-normal">
          {MEDICAL_DISCLAIMER}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-100 transition shrink-0 ml-2"
        title="Minimize notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
