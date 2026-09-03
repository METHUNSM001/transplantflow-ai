import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, GitCommit, Navigation, ShieldCheck } from 'lucide-react';
import { TimelineEvent } from '../../types/database.types';

interface OrganVerticalTimelineProps {
  events: TimelineEvent[];
}

export const OrganVerticalTimeline: React.FC<OrganVerticalTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800 text-center text-slate-400 text-xs">
        No timeline milestones recorded for this organ yet.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'RETRIEVAL':
      case 'PRESERVATION_START':
        return <Clock className="w-3.5 h-3.5 text-cyan-400" />;
      case 'MATCH_CONFIRMED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'TRANSPORT_DEPARTED':
        return <Navigation className="w-3.5 h-3.5 text-blue-400" />;
      case 'WEATHER_DELAY':
      case 'TRAFFIC_DELAY':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'HOSPITAL_READY':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <GitCommit className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl">
      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-cyan-400" />
        Chronological Milestone Audit Log
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((event) => {
          const time = new Date(event.event_time);
          const timeFormatted = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateFormatted = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return (
            <div key={event.id} className="relative group">
              {/* Dot marker */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center shadow-md">
                {getEventIcon(event.event_type)}
              </div>

              {/* Event card */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 hover:border-slate-700 transition">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-slate-200">
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {timeFormatted} • {dateFormatted}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-1">{event.description}</p>

                {event.location && (
                  <span className="inline-block text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    📍 {event.location}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
