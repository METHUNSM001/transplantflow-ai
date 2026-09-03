-- ==============================================================================
-- TRANSPLANTFLOW AI — ROW LEVEL SECURITY & PROFILE TRIGGERS
-- Migration: 002_rls_policies.sql
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to check if current user is admin or coordinator
CREATE OR REPLACE FUNCTION public.is_coordinator_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'TRANSPLANT_COORDINATOR')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL TO authenticated USING (public.current_user_role() = 'ADMIN');

-- 2. General Read Access for Authenticated Users (Clinical situational awareness)
CREATE POLICY "Authenticated users can view hospitals" ON public.hospitals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view donors" ON public.donors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view organs" ON public.organs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view recipients" ON public.recipients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view transports" ON public.transports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view hospital readiness" ON public.hospital_readiness FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view alerts" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view timeline events" ON public.timeline_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view simulations" ON public.simulations FOR SELECT TO authenticated USING (true);

-- 3. Operational Write Access: Coordinators and Admins
CREATE POLICY "Coordinators and Admins can manage organs" 
ON public.organs FOR ALL TO authenticated 
USING (public.is_coordinator_or_admin());

CREATE POLICY "Coordinators and Admins can manage donors" 
ON public.donors FOR ALL TO authenticated 
USING (public.is_coordinator_or_admin());

CREATE POLICY "Coordinators and Admins can manage recipients" 
ON public.recipients FOR ALL TO authenticated 
USING (public.is_coordinator_or_admin());

CREATE POLICY "Coordinators and Admins can manage matches" 
ON public.matches FOR ALL TO authenticated 
USING (public.is_coordinator_or_admin());

CREATE POLICY "Coordinators and Admins can manage alerts" 
ON public.alerts FOR ALL TO authenticated 
USING (public.is_coordinator_or_admin());

CREATE POLICY "Coordinators and Admins can create timeline events" 
ON public.timeline_events FOR INSERT TO authenticated 
WITH CHECK (public.is_coordinator_or_admin());

CREATE POLICY "Coordinators and Admins can create simulations" 
ON public.simulations FOR ALL TO authenticated 
USING (public.is_coordinator_or_admin());

-- 4. Hospital Staff Specific Updates
CREATE POLICY "Hospital staff can update their own hospital readiness" 
ON public.hospital_readiness FOR ALL TO authenticated 
USING (
  public.is_coordinator_or_admin() OR 
  hospital_id IN (SELECT hospital_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Hospital staff can update their hospital record" 
ON public.hospitals FOR UPDATE TO authenticated 
USING (
  public.is_coordinator_or_admin() OR 
  id IN (SELECT hospital_id FROM public.profiles WHERE id = auth.uid())
);

-- 5. Transport Coordinator Specific Updates
CREATE POLICY "Transport coordinators can update transports" 
ON public.transports FOR ALL TO authenticated 
USING (
  public.is_coordinator_or_admin() OR 
  public.current_user_role() = 'TRANSPORT_COORDINATOR'
);

-- 6. Trigger for Automatic Profile Creation on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'TRANSPLANT_COORDINATOR')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
