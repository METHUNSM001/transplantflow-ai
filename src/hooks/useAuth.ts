import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { Profile, UserRole } from '../types/database.types';

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    authService.getCurrentProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const switchRole = async (role: UserRole) => {
    const updated = await authService.switchRole(role);
    setProfile(updated);
  };

  const login = async (email: string) => {
    const p = await authService.login(email);
    setProfile(p);
  };

  const logout = async () => {
    await authService.logout();
    setProfile(null);
  };

  return {
    profile,
    loading,
    switchRole,
    login,
    logout,
    role: profile?.role || 'VIEWER',
    isAdmin: profile?.role === 'ADMIN',
    isCoordinator: profile?.role === 'TRANSPLANT_COORDINATOR' || profile?.role === 'ADMIN',
  };
}
