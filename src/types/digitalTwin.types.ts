import { Alert, Hospital, HospitalReadiness, Organ, TimelineEvent, Transport } from './database.types';
import { ColdIschemiaCalculation, RiskAssessment } from './engine.types';

export interface OrganDigitalTwin {
  organ: Organ;
  transport?: Transport;
  originHospital?: Hospital;
  destinationHospital?: Hospital;
  hospitalReadiness?: HospitalReadiness;
  coldIschemia: ColdIschemiaCalculation;
  risk: RiskAssessment;
  recentEvents: TimelineEvent[];
  activeAlerts: Alert[];
  lastTelemetryPing: string;
}
