import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { localStore } from '../lib/storage';
import { Recipient } from '../types/database.types';

export const recipientService = {
  async getAll(): Promise<Recipient[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .order('urgency_level', { ascending: false });
      if (!error && data) return data as Recipient[];
    }
    return localStore.getRecipients();
  },

  async save(recipient: Recipient): Promise<Recipient> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('recipients')
        .upsert(recipient)
        .select()
        .single();
      if (!error && data) return data as Recipient;
    }
    localStore.saveRecipient(recipient);
    return recipient;
  },
};
