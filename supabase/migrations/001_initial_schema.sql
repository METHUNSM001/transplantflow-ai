-- ==============================================================================
-- TRANSPLANTFLOW AI — INITIAL DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- Description: Core schema for organ digital twin tracking, preservation timers,
--              hospital readiness, transports, matching, alerts, and simulations.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HOSPITALS
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'USA',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    contact_phone TEXT,
    or_available BOOLEAN NOT NULL DEFAULT true,
    icu_available BOOLEAN NOT NULL DEFAULT true,
    surgical_team_available BOOLEAN NOT NULL DEFAULT true,
    blood_preparation_ready BOOLEAN NOT NULL DEFAULT true,
    recipient_ready BOOLEAN NOT NULL DEFAULT true,
    readiness_score INTEGER NOT NULL DEFAULT 100 CHECK (readiness_score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TRANSPLANT_COORDINATOR', 'HOSPITAL_STAFF', 'TRANSPORT_COORDINATOR', 'VIEWER')),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. DONORS
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_reference TEXT UNIQUE NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+')),
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 120),
    gender TEXT NOT NULL,
    donor_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    retrieval_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORGANS
CREATE TABLE IF NOT EXISTS public.organs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE,
    organ_type TEXT NOT NULL CHECK (organ_type IN ('Heart', 'Lung', 'Liver', 'Kidney', 'Pancreas', 'Intestine')),
    blood_group TEXT NOT NULL CHECK (blood_group IN ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+')),
    retrieval_time TIMESTAMP WITH TIME ZONE NOT NULL,
    preservation_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    maximum_preservation_minutes INTEGER NOT NULL CHECK (maximum_preservation_minutes > 0),
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'MATCHED', 'IN_TRANSIT', 'ARRIVED', 'TRANSPLANTED', 'EXPIRED', 'CANCELLED')),
    priority TEXT NOT NULL DEFAULT 'STANDARD' CHECK (priority IN ('STANDARD', 'URGENT', 'CRITICAL_RESCUE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RECIPIENTS
CREATE TABLE IF NOT EXISTS public.recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_reference TEXT UNIQUE NOT NULL,
    organ_type TEXT NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+')),
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    waiting_since TIMESTAMP WITH TIME ZONE NOT NULL,
    recipient_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    compatibility_data JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'MATCHED', 'TRANSPLANTED', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. MATCHES
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organ_id UUID REFERENCES public.organs(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.recipients(id) ON DELETE CASCADE,
    compatibility_score NUMERIC(5, 2) NOT NULL,
    urgency_score NUMERIC(5, 2) NOT NULL,
    distance_score NUMERIC(5, 2) NOT NULL,
    time_feasibility_score NUMERIC(5, 2) NOT NULL,
    waiting_score NUMERIC(5, 2) NOT NULL,
    overall_score NUMERIC(5, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'ACCEPTED', 'DECLINED', 'BYPASSED')),
    explanation JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TRANSPORTS
CREATE TABLE IF NOT EXISTS public.transports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organ_id UUID REFERENCES public.organs(id) ON DELETE CASCADE,
    origin_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    destination_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    transport_mode TEXT NOT NULL CHECK (transport_mode IN ('Ambulance', 'Air Ambulance', 'Helicopter', 'Commercial Air')),
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'DISPATCHED', 'IN_TRANSIT', 'DELAYED', 'COMPLETED', 'CANCELLED')),
    estimated_distance_km NUMERIC(7, 2) NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    eta TIMESTAMP WITH TIME ZONE NOT NULL,
    delay_minutes INTEGER NOT NULL DEFAULT 0,
    route_risk TEXT NOT NULL DEFAULT 'LOW' CHECK (route_risk IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    started_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. HOSPITAL READINESS
CREATE TABLE IF NOT EXISTS public.hospital_readiness (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    organ_id UUID REFERENCES public.organs(id) ON DELETE CASCADE,
    or_ready BOOLEAN NOT NULL DEFAULT false,
    icu_ready BOOLEAN NOT NULL DEFAULT false,
    surgical_team_ready BOOLEAN NOT NULL DEFAULT false,
    blood_ready BOOLEAN NOT NULL DEFAULT false,
    recipient_ready BOOLEAN NOT NULL DEFAULT false,
    readiness_score INTEGER NOT NULL DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ALERTS
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organ_id UUID REFERENCES public.organs(id) ON DELETE CASCADE,
    transport_id UUID REFERENCES public.transports(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 10. TIMELINE EVENTS
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organ_id UUID REFERENCES public.organs(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    location TEXT,
    description TEXT NOT NULL,
    created_by UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. SIMULATIONS
CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organ_id UUID REFERENCES public.organs(id) ON DELETE CASCADE,
    scenario_type TEXT NOT NULL,
    scenario_parameters JSONB NOT NULL,
    result JSONB NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_organs_status ON public.organs(status);
CREATE INDEX IF NOT EXISTS idx_transports_status ON public.transports(status);
CREATE INDEX IF NOT EXISTS idx_alerts_status_severity ON public.alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_timeline_organ_id ON public.timeline_events(organ_id);
CREATE INDEX IF NOT EXISTS idx_matches_organ_score ON public.matches(organ_id, overall_score DESC);
