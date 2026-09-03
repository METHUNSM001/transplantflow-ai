-- ==============================================================================
-- TRANSPLANTFLOW AI — SYNTHETIC SEED DATA
-- Description: High-fidelity clinical demonstration data for hospitals, donors,
--              organs, recipients, matches, transports, readiness, and alerts.
-- ==============================================================================

-- 1. HOSPITALS
INSERT INTO public.hospitals (id, name, city, state, country, latitude, longitude, contact_phone, or_available, icu_available, surgical_team_available, blood_preparation_ready, recipient_ready, readiness_score)
VALUES
('a1000000-0000-0000-0000-000000000001', 'Massachusetts General Hospital', 'Boston', 'MA', 'USA', 42.3631, -71.0686, '+1-617-726-2000', true, true, true, true, true, 100),
('a1000000-0000-0000-0000-000000000002', 'Brigham and Women''s Hospital', 'Boston', 'MA', 'USA', 42.3355, -71.1070, '+1-617-732-5500', true, true, true, false, true, 80),
('a1000000-0000-0000-0000-000000000003', 'NewYork-Presbyterian Columbia', 'New York', 'NY', 'USA', 40.8404, -73.9427, '+1-212-305-2500', true, false, true, true, true, 80),
('a1000000-0000-0000-0000-000000000004', 'Mount Sinai Hospital', 'New York', 'NY', 'USA', 40.7900, -73.9526, '+1-212-241-6500', true, true, true, true, false, 80),
('a1000000-0000-0000-0000-000000000005', 'Hospital of the University of Pennsylvania', 'Philadelphia', 'PA', 'USA', 39.9500, -75.1936, '+1-215-662-4000', false, true, true, false, true, 60),
('a1000000-0000-0000-0000-000000000006', 'Johns Hopkins Hospital', 'Baltimore', 'MD', 'USA', 39.2965, -76.5927, '+1-410-955-5000', true, true, true, true, true, 100)
ON CONFLICT (id) DO NOTHING;

-- 2. DONORS
INSERT INTO public.donors (id, donor_reference, blood_group, age, gender, donor_hospital_id, retrieval_time)
VALUES
('b1000000-0000-0000-0000-000000000001', 'DNR-2026-8812', 'O+', 34, 'Male', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hour 45 minutes'),
('b1000000-0000-0000-0000-000000000002', 'DNR-2026-8819', 'A+', 42, 'Female', 'a1000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 hours 10 minutes'),
('b1000000-0000-0000-0000-000000000003', 'DNR-2026-8825', 'B+', 28, 'Male', 'a1000000-0000-0000-0000-000000000005', NOW() - INTERVAL '4 hours 30 minutes'),
('b1000000-0000-0000-0000-000000000004', 'DNR-2026-8830', 'O-', 51, 'Female', 'a1000000-0000-0000-0000-000000000006', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- 3. ORGANS
-- Heart: max 240 mins (4 hrs)
-- Lung: max 360 mins (6 hrs)
-- Liver: max 720 mins (12 hrs)
-- Kidney: max 1440 mins (24 hrs)
INSERT INTO public.organs (id, donor_id, organ_type, blood_group, retrieval_time, preservation_start_time, maximum_preservation_minutes, current_latitude, current_longitude, status, priority)
VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Heart', 'O+', NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 25 minutes', 240, 41.5000, -72.5000, 'IN_TRANSIT', 'CRITICAL_RESCUE'),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Lung', 'O+', NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 20 minutes', 360, 41.6500, -72.3000, 'IN_TRANSIT', 'URGENT'),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Liver', 'A+', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes', 720, 40.5000, -74.3000, 'IN_TRANSIT', 'STANDARD'),
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'Kidney', 'B+', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 50 minutes', 1440, 39.9500, -75.1936, 'MATCHED', 'STANDARD'),
('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000004', 'Heart', 'O-', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '20 minutes', 240, 39.2965, -76.5927, 'AVAILABLE', 'URGENT'),
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'Kidney', 'O-', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '15 minutes', 1440, 39.2965, -76.5927, 'AVAILABLE', 'STANDARD'),
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000002', 'Kidney', 'A+', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 40 minutes', 1440, 40.8404, -73.9427, 'MATCHED', 'STANDARD'),
('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'Pancreas', 'B+', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 45 minutes', 720, 39.9500, -75.1936, 'AVAILABLE', 'STANDARD')
ON CONFLICT (id) DO NOTHING;

-- 4. RECIPIENTS
INSERT INTO public.recipients (id, recipient_reference, organ_type, blood_group, urgency_level, waiting_since, recipient_hospital_id, compatibility_data, status)
VALUES
('d1000000-0000-0000-0000-000000000001', 'REC-NYP-9021', 'Heart', 'O+', 'CRITICAL', NOW() - INTERVAL '240 days', 'a1000000-0000-0000-0000-000000000003', '{"hla_match": 5, "pra": 8, "weight_kg": 72}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000002', 'REC-MSH-4412', 'Heart', 'O+', 'HIGH', NOW() - INTERVAL '180 days', 'a1000000-0000-0000-0000-000000000004', '{"hla_match": 4, "pra": 12, "weight_kg": 68}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000003', 'REC-BWH-1049', 'Lung', 'O+', 'HIGH', NOW() - INTERVAL '95 days', 'a1000000-0000-0000-0000-000000000002', '{"hla_match": 6, "pra": 4, "weight_kg": 64}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000004', 'REC-HUP-5521', 'Liver', 'A+', 'MEDIUM', NOW() - INTERVAL '310 days', 'a1000000-0000-0000-0000-000000000005', '{"hla_match": 4, "meld_score": 28}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000005', 'REC-JHH-7782', 'Kidney', 'B+', 'MEDIUM', NOW() - INTERVAL '620 days', 'a1000000-0000-0000-0000-000000000006', '{"hla_match": 5, "kdpi": 35}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000006', 'REC-MGH-3391', 'Kidney', 'O-', 'CRITICAL', NOW() - INTERVAL '410 days', 'a1000000-0000-0000-0000-000000000001', '{"hla_match": 6, "pra": 2}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000007', 'REC-BWH-8833', 'Heart', 'O-', 'CRITICAL', NOW() - INTERVAL '150 days', 'a1000000-0000-0000-0000-000000000002', '{"hla_match": 5, "pra": 5}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000008', 'REC-NYP-6610', 'Kidney', 'A+', 'LOW', NOW() - INTERVAL '700 days', 'a1000000-0000-0000-0000-000000000003', '{"hla_match": 4}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000009', 'REC-MSH-9920', 'Pancreas', 'B+', 'MEDIUM', NOW() - INTERVAL '190 days', 'a1000000-0000-0000-0000-000000000004', '{"hla_match": 5}'::jsonb, 'WAITING'),
('d1000000-0000-0000-0000-000000000010', 'REC-HUP-1200', 'Lung', 'O+', 'MEDIUM', NOW() - INTERVAL '80 days', 'a1000000-0000-0000-0000-000000000005', '{"hla_match": 3}'::jsonb, 'WAITING')
ON CONFLICT (id) DO NOTHING;

-- 5. TRANSPORTS
INSERT INTO public.transports (id, organ_id, origin_hospital_id, destination_hospital_id, transport_mode, status, estimated_distance_km, estimated_duration_minutes, current_latitude, current_longitude, eta, delay_minutes, route_risk, started_at)
VALUES
('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Helicopter', 'IN_TRANSIT', 315.0, 75, 41.5000, -72.5000, NOW() + INTERVAL '42 minutes', 15, 'HIGH', NOW() - INTERVAL '35 minutes'),
('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Ambulance', 'IN_TRANSIT', 8.5, 25, 42.3450, -71.0900, NOW() + INTERVAL '12 minutes', 0, 'LOW', NOW() - INTERVAL '15 minutes'),
('e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'Air Ambulance', 'IN_TRANSIT', 160.0, 50, 40.5000, -74.3000, NOW() + INTERVAL '28 minutes', 5, 'MEDIUM', NOW() - INTERVAL '25 minutes'),
('e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', 'Ambulance', 'SCHEDULED', 155.0, 110, 39.9500, -75.1936, NOW() + INTERVAL '135 minutes', 0, 'LOW', NULL),
('e1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Ambulance', 'SCHEDULED', 12.0, 30, 40.8404, -73.9427, NOW() + INTERVAL '45 minutes', 0, 'LOW', NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. HOSPITAL READINESS
INSERT INTO public.hospital_readiness (id, hospital_id, organ_id, or_ready, icu_ready, surgical_team_ready, blood_ready, recipient_ready, readiness_score, notes)
VALUES
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', true, false, true, true, true, 80, 'ICU bed 4 being cleared; OR team in scrub'),
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', true, true, true, false, true, 80, 'Cross-matched PRBC units arriving from blood bank'),
('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', false, true, true, false, true, 60, 'OR 3 turnover delayed by 20 minutes'),
('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000004', true, true, true, true, true, 100, 'Primary surgical staff on-site and patient prepped')
ON CONFLICT (id) DO NOTHING;

-- 7. MATCHES
INSERT INTO public.matches (id, organ_id, recipient_id, compatibility_score, urgency_score, distance_score, time_feasibility_score, waiting_score, overall_score, status, explanation)
VALUES
('91000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 95.0, 98.0, 82.0, 80.0, 88.0, 90.5, 'ACCEPTED', '{"summary": "Top ABO identical match with Tier 1 clinical urgency", "hla_compatibility": "5/6 antigen match"}'::jsonb),
('91000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 88.0, 85.0, 80.0, 82.0, 75.0, 83.1, 'PROPOSED', '{"summary": "Backup candidate with high urgency and favorable antibody screen"}'::jsonb),
('91000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 98.0, 90.0, 99.0, 95.0, 70.0, 92.4, 'ACCEPTED', '{"summary": "Local recipient within 10km, full antigen match, excellent feasibility"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8. ALERTS
INSERT INTO public.alerts (id, organ_id, transport_id, hospital_id, alert_type, severity, title, message, status, created_at)
VALUES
('71000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'SAFETY_MARGIN_LOW', 'CRITICAL', 'Heart Safety Margin Compressed', 'Helicopter en-route to NYP Columbia delayed by 15 mins. Remaining safety margin is 23 minutes.', 'ACTIVE', NOW() - INTERVAL '8 minutes'),
('71000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', NULL, 'a1000000-0000-0000-0000-000000000003', 'HOSPITAL_UNREADY', 'HIGH', 'Receiving ICU Unavailable', 'NewYork-Presbyterian reports post-op ICU bed not yet sanitized. Readiness stands at 80%.', 'ACTIVE', NOW() - INTERVAL '14 minutes'),
('71000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'READINESS_DELAY', 'MEDIUM', 'OR Turnover Delay at HUP', 'Operating Room 3 turnover running 20 minutes behind. Surgical team on standby.', 'ACTIVE', NOW() - INTERVAL '22 minutes'),
('71000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'TRANSIT_PROGRESS', 'INFO', 'Lung Transport On Schedule', 'Ambulance nearing BWH destination. Estimated arrival in 12 minutes.', 'ACTIVE', NOW() - INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- 9. TIMELINE EVENTS
INSERT INTO public.timeline_events (id, organ_id, event_type, event_time, location, description)
VALUES
('81000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'RETRIEVAL', NOW() - INTERVAL '1 hour 45 minutes', 'MGH OR 4, Boston', 'Cardiac retrieval complete. Cross-clamp time documented.'),
('81000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'PRESERVATION_START', NOW() - INTERVAL '1 hour 30 minutes', 'MGH Perfusion Lab', 'Hypothermic machine perfusion initiated. Cold-ischemia clock active.'),
('81000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'MATCH_CONFIRMED', NOW() - INTERVAL '1 hour 15 minutes', 'Transplant Coordination Center', 'Candidate REC-NYP-9021 confirmed with 90.5% feasibility match score.'),
('81000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'TRANSPORT_DEPARTED', NOW() - INTERVAL '35 minutes', 'Boston Logan Helipad', 'MedFlight Helicopter dispatched en route to NYC helipad.'),
('81000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'WEATHER_DELAY', NOW() - INTERVAL '15 minutes', 'Hartford Airspace', 'Air traffic reroute due to localized headwind adds 15 minutes to ETA.')
ON CONFLICT (id) DO NOTHING;
