export type UserRole = 'ADMIN' | 'TRANSPLANT_COORDINATOR' | 'HOSPITAL_STAFF' | 'TRANSPORT_COORDINATOR' | 'VIEWER';

export type OrganType = 'Heart' | 'Lung' | 'Liver' | 'Kidney' | 'Pancreas' | 'Intestine';
export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';
export type OrganStatus = 'AVAILABLE' | 'MATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'TRANSPLANTED' | 'EXPIRED' | 'CANCELLED';
export type PriorityLevel = 'STANDARD' | 'URGENT' | 'CRITICAL_RESCUE';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TransportMode = 'Ambulance' | 'Air Ambulance' | 'Helicopter' | 'Commercial Air';
export type TransportStatus = 'SCHEDULED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELAYED' | 'COMPLETED' | 'CANCELLED';
export type RouteRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  contact_phone?: string;
  or_available: boolean;
  icu_available: boolean;
  surgical_team_available: boolean;
  blood_preparation_ready: boolean;
  recipient_ready: boolean;
  readiness_score: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  hospital_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: string;
  donor_reference: string;
  blood_group: BloodGroup;
  age: number;
  gender: string;
  donor_hospital_id: string;
  retrieval_time: string;
  created_at: string;
}

export interface Organ {
  id: string;
  donor_id?: string;
  organ_type: OrganType;
  blood_group: BloodGroup;
  retrieval_time: string;
  preservation_start_time: string;
  maximum_preservation_minutes: number;
  current_latitude?: number;
  current_longitude?: number;
  status: OrganStatus;
  priority: PriorityLevel;
  created_at: string;
  updated_at: string;
  donor?: Donor;
}

export interface Recipient {
  id: string;
  recipient_reference: string;
  organ_type: OrganType;
  blood_group: BloodGroup;
  urgency_level: UrgencyLevel;
  waiting_since: string;
  recipient_hospital_id: string;
  compatibility_data: Record<string, any>;
  status: 'WAITING' | 'MATCHED' | 'TRANSPLANTED' | 'INACTIVE';
  created_at: string;
  hospital?: Hospital;
}

export interface Match {
  id: string;
  organ_id: string;
  recipient_id: string;
  compatibility_score: number;
  urgency_score: number;
  distance_score: number;
  time_feasibility_score: number;
  waiting_score: number;
  overall_score: number;
  status: 'PROPOSED' | 'ACCEPTED' | 'DECLINED' | 'BYPASSED';
  explanation: Record<string, any>;
  created_at: string;
  recipient?: Recipient;
  organ?: Organ;
}

export interface Transport {
  id: string;
  organ_id: string;
  origin_hospital_id: string;
  destination_hospital_id: string;
  transport_mode: TransportMode;
  status: TransportStatus;
  estimated_distance_km: number;
  estimated_duration_minutes: number;
  current_latitude?: number;
  current_longitude?: number;
  eta: string;
  delay_minutes: number;
  route_risk: RouteRiskLevel;
  started_at?: string;
  updated_at: string;
  origin_hospital?: Hospital;
  destination_hospital?: Hospital;
}

export interface HospitalReadiness {
  id: string;
  hospital_id: string;
  organ_id: string;
  or_ready: boolean;
  icu_ready: boolean;
  surgical_team_ready: boolean;
  blood_ready: boolean;
  recipient_ready: boolean;
  readiness_score: number;
  notes?: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  organ_id?: string;
  transport_id?: string;
  hospital_id?: string;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: AlertStatus;
  created_at: string;
  resolved_at?: string;
}

export interface TimelineEvent {
  id: string;
  organ_id: string;
  event_type: string;
  event_time: string;
  location?: string;
  description: string;
  created_by?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SimulationRecord {
  id: string;
  organ_id: string;
  scenario_type: string;
  scenario_parameters: Record<string, any>;
  result: Record<string, any>;
  created_by?: string;
  created_at: string;
}
