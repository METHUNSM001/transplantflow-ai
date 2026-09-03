import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { localStore } from '../lib/storage';
import { Hospital, HospitalReadiness } from '../types/database.types';

export const hospitalService = {
  async getAll(): Promise<Hospital[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('hospitals').select('*').order('name');
      if (!error && data) return data as Hospital[];
    }
    return localStore.getHospitals();
  },

  async updateReadinessToggle(hospitalId: string, updates: Partial<Hospital>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('hospitals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', hospitalId);
    }
    localStore.updateHospitalReadinessToggle(hospitalId, updates);
  },

  async getReadinessForOrgan(organId: string): Promise<HospitalReadiness | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('hospital_readiness')
        .select('*')
        .eq('organ_id', organId)
        .maybeSingle();
      if (!error && data) return data as HospitalReadiness;
    }
    const records = localStore.getReadinessRecords();
    return records.find((r) => r.organ_id === organId) || null;
  },

  async saveReadinessRecord(record: HospitalReadiness): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('hospital_readiness').upsert(record);
    }
    localStore.updateReadinessRecord(record);
  },
};
