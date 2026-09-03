import { isSupabaseConfigured, supabase } from '../config/supabaseClient';
import { Profile, UserRole } from '../types/database.types';

const MOCK_USER_KEY = 'tf_current_user_profile';

const DEFAULT_COORDINATOR: Profile = {
  id: 'usr-coord-01',
  full_name: 'Dr. Sarah Lin, MD',
  email: 's.lin@transplantflow.org',
  role: 'TRANSPLANT_COORDINATOR',
  hospital_id: 'hosp-mgh-01',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const authService = {
  async getCurrentProfile(): Promise<Profile> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEFAULT_COORDINATOR;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return (data as Profile) || DEFAULT_COORDINATOR;
    }

    try {
      const stored = localStorage.getItem(MOCK_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_COORDINATOR;
  },

  async switchRole(role: UserRole): Promise<Profile> {
    const current = await this.getCurrentProfile();
    const updated = { ...current, role, updated_at: new Date().toISOString() };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  async login(email: string): Promise<Profile> {
    if (isSupabaseConfigured) {
      await supabase.auth.signInWithOtp({ email });
    }
    const profile: Profile = {
      ...DEFAULT_COORDINATOR,
      email,
      full_name: email.split('@')[0],
    };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(profile));
    return profile;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(MOCK_USER_KEY);
  },
};
