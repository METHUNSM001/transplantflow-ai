import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { localStore } from '../lib/storage';
import { Transport } from '../types/database.types';

export const transportService = {
  async getAll(): Promise<Transport[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('transports').select('*');
      if (!error && data) return data as Transport[];
    }
    return localStore.getTransports();
  },

  async getByOrganId(organId: string): Promise<Transport | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('transports')
        .select('*')
        .eq('organ_id', organId)
        .maybeSingle();
      if (!error && data) return data as Transport;
    }
    const list = localStore.getTransports();
    return list.find((t) => t.organ_id === organId) || null;
  },

  async updateTelemetry(transportId: string, lat: number, lon: number, delayMinutes?: number): Promise<void> {
    if (isSupabaseConfigured) {
      const updateData: Record<string, any> = {
        current_latitude: lat,
        current_longitude: lon,
        updated_at: new Date().toISOString(),
      };
      if (delayMinutes !== undefined) updateData.delay_minutes = delayMinutes;
      await supabase.from('transports').update(updateData).eq('id', transportId);
    }
    localStore.updateTransportLocation(transportId, lat, lon, delayMinutes);
  },
};
