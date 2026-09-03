import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <FileQuestion className="w-16 h-16 text-cyan-400 opacity-80" />
      <h2 className="text-2xl font-black text-white">404 — Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested routing corridor or clinical page does not exist in the current system topology.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Command Center
      </Link>
    </div>
  );
};
