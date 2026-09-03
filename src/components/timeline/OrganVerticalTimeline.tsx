import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, GitCommit, Navigation, ShieldCheck } from 'lucide-react';
import { TimelineEvent } from '../../types/database.types';

interface OrganVerticalTimelineProps {
  events: TimelineEvent[];
}

export const OrganVerticalTimeline: React.FC<OrganVerticalTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 text-center text-slate-500 text-xs shadow-sm">
        No timeline milestones recorded for this organ yet.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'RETRIEVAL':
      case 'PRESERVATION_START':
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case 'MATCH_CONFIRMED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'TRANSPORT_DEPARTED':
        return <Navigation className="w-3.5 h-3.5 text-blue-600" />;
      case 'WEATHER_DELAY':
      case 'TRAFFIC_DELAY':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      case 'HOSPITAL_READY':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <GitCommit className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        Chronological Milestone Audit Log
      </h4>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((event) => {
          const time = new Date(event.event_time);
          const timeFormatted = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateFormatted = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return (
            <div key={event.id} className="relative group">
              {/* Dot marker */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                {getEventIcon(event.event_type)}
              </div>

              {/* Event card */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 transition shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-blue-700 font-semibold">
                    {timeFormatted} • {dateFormatted}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-1.5">{event.description}</p>

                {event.location && (
                  <span className="inline-block text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
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
