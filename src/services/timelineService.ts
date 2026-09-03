import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { localStore } from '../lib/storage';
import { TimelineEvent } from '../types/database.types';

export const timelineService = {
  async getByOrganId(organId: string): Promise<TimelineEvent[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('organ_id', organId)
        .order('event_time', { ascending: false });
      if (!error && data) return data as TimelineEvent[];
    }
    const events = localStore.getTimelineEvents();
    return events
      .filter((e) => e.organ_id === organId)
      .sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime());
  },

  async addEvent(event: Omit<TimelineEvent, 'id' | 'created_at'>): Promise<TimelineEvent> {
    const newEvent: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('timeline_events').insert(newEvent).select().single();
      if (!error && data) return data as TimelineEvent;
    }
    localStore.addTimelineEvent(newEvent);
    return newEvent;
  },
};
