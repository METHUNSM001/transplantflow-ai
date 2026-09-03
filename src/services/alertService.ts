import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { localStore } from '../lib/storage';
import { Alert } from '../types/database.types';

export const alertService = {
  async getAll(): Promise<Alert[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Alert[];
    }
    return localStore.getAlerts();
  },

  async create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('alerts').insert(newAlert).select().single();
      if (!error && data) return data as Alert;
    }
    localStore.addAlert(newAlert);
    return newAlert;
  },

  async updateStatus(id: string, status: 'ACKNOWLEDGED' | 'RESOLVED'): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('alerts')
        .update({
          status,
          resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null,
        })
        .eq('id', id);
    }
    localStore.updateAlertStatus(id, status);
  },
};
