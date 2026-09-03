import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { SimulationRecord } from '../types/database.types';

const MOCK_SIMULATIONS_KEY = 'tf_simulations_v1';

export const simulationService = {
  async getByOrganId(organId: string): Promise<SimulationRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('organ_id', organId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as SimulationRecord[];
    }
    try {
      const raw = localStorage.getItem(MOCK_SIMULATIONS_KEY);
      if (raw) {
        const list: SimulationRecord[] = JSON.parse(raw);
        return list.filter((s) => s.organ_id === organId);
      }
    } catch {}
    return [];
  },

  async recordSimulation(sim: Omit<SimulationRecord, 'id' | 'created_at'>): Promise<SimulationRecord> {
    const record: SimulationRecord = {
      ...sim,
      id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('simulations').insert(record).select().single();
      if (!error && data) return data as SimulationRecord;
    }

    try {
      const raw = localStorage.getItem(MOCK_SIMULATIONS_KEY);
      const list: SimulationRecord[] = raw ? JSON.parse(raw) : [];
      list.unshift(record);
      localStorage.setItem(MOCK_SIMULATIONS_KEY, JSON.stringify(list));
    } catch {}

    return record;
  },
};
