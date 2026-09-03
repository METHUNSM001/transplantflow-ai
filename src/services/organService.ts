import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { localStore } from '../lib/storage';
import { Organ } from '../types/database.types';

export const organService = {
  async getAll(): Promise<Organ[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('organs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Organ[];
    }
    return localStore.getOrgans();
  },

  async getById(id: string): Promise<Organ | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('organs')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data as Organ;
    }
    const organs = localStore.getOrgans();
    return organs.find((o) => o.id === id) || null;
  },

  async save(organ: Organ): Promise<Organ> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('organs')
        .upsert(organ)
        .select()
        .single();
      if (!error && data) return data as Organ;
    }
    localStore.saveOrgan(organ);
    return organ;
  },

  async updateStatus(id: string, status: Organ['status']): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('organs').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    }
    const organ = await this.getById(id);
    if (organ) {
      localStore.saveOrgan({ ...organ, status });
    }
  },
};
