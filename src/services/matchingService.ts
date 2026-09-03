import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { localStore } from '../lib/storage';
import { Match } from '../types/database.types';

export const matchingService = {
  async getByOrganId(organId: string): Promise<Match[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('organ_id', organId)
        .order('overall_score', { ascending: false });
      if (!error && data) return data as Match[];
    }
    const matches = localStore.getMatches();
    return matches.filter((m) => m.organ_id === organId);
  },

  async recordMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<Match> {
    const newMatch: Match = {
      ...match,
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('matches').insert(newMatch).select().single();
      if (!error && data) return data as Match;
    }
    localStore.saveMatch(newMatch);
    return newMatch;
  },
};
