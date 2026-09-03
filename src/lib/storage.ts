import { Alert, Hospital, HospitalReadiness, Match, Organ, Recipient, TimelineEvent, Transport } from '../types/database.types';
import {
  getInitialAlerts,
  getInitialHospitalReadiness,
  getInitialHospitals,
  getInitialMatches,
  getInitialOrgans,
  getInitialRecipients,
  getInitialTimelineEvents,
  getInitialTransports,
} from './mockData';

const STORAGE_KEYS = {
  HOSPITALS: 'tf_hospitals_v1',
  ORGANS: 'tf_organs_v1',
  RECIPIENTS: 'tf_recipients_v1',
  TRANSPORTS: 'tf_transports_v1',
  READINESS: 'tf_readiness_v1',
  ALERTS: 'tf_alerts_v1',
  TIMELINE: 'tf_timeline_v1',
  MATCHES: 'tf_matches_v1',
  ACTIVE_USER: 'tf_user_v1',
};

// Listeners for in-app reactive updates
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

// In-memory fallback for SSR and testing environments
const memStorage = new Map<string, string>();

function getStored<T>(key: string, fallback: () => T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(key);
      if (!raw) {
        const initial = fallback();
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw) as T;
    }
    const memRaw = memStorage.get(key);
    if (!memRaw) {
      const initial = fallback();
      memStorage.set(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(memRaw) as T;
  } catch {
    return fallback();
  }
}

function setStored<T>(key: string, data: T) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      memStorage.set(key, JSON.stringify(data));
    }
    notifyListeners();
  } catch (err) {
    console.error(`Failed to persist to ${key}:`, err);
  }
}

export const localStore = {
  resetToDefault: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEYS.HOSPITALS);
      localStorage.removeItem(STORAGE_KEYS.ORGANS);
      localStorage.removeItem(STORAGE_KEYS.RECIPIENTS);
      localStorage.removeItem(STORAGE_KEYS.TRANSPORTS);
      localStorage.removeItem(STORAGE_KEYS.READINESS);
      localStorage.removeItem(STORAGE_KEYS.ALERTS);
      localStorage.removeItem(STORAGE_KEYS.TIMELINE);
      localStorage.removeItem(STORAGE_KEYS.MATCHES);
    }
    memStorage.clear();
    notifyListeners();
  },

  getHospitals: (): Hospital[] => getStored(STORAGE_KEYS.HOSPITALS, getInitialHospitals),
  setHospitals: (hospitals: Hospital[]) => setStored(STORAGE_KEYS.HOSPITALS, hospitals),
  updateHospitalReadinessToggle: (hospitalId: string, updates: Partial<Hospital>) => {
    const list = localStore.getHospitals();
    const updated = list.map((h) => {
      if (h.id === hospitalId) {
        const merged = { ...h, ...updates, updated_at: new Date().toISOString() };
        // Recalculate readiness score (20 points each for 5 checks)
        let score = 0;
        if (merged.or_available) score += 20;
        if (merged.icu_available) score += 20;
        if (merged.surgical_team_available) score += 20;
        if (merged.blood_preparation_ready) score += 20;
        if (merged.recipient_ready) score += 20;
        merged.readiness_score = score;
        return merged;
      }
      return h;
    });
    setStored(STORAGE_KEYS.HOSPITALS, updated);
  },

  getOrgans: (): Organ[] => getStored(STORAGE_KEYS.ORGANS, getInitialOrgans),
  setOrgans: (organs: Organ[]) => setStored(STORAGE_KEYS.ORGANS, organs),
  saveOrgan: (organ: Organ) => {
    const list = localStore.getOrgans();
    const idx = list.findIndex((o) => o.id === organ.id);
    if (idx >= 0) {
      list[idx] = { ...organ, updated_at: new Date().toISOString() };
    } else {
      list.unshift(organ);
    }
    setStored(STORAGE_KEYS.ORGANS, list);
  },

  getRecipients: (): Recipient[] => getStored(STORAGE_KEYS.RECIPIENTS, getInitialRecipients),
  saveRecipient: (recipient: Recipient) => {
    const list = localStore.getRecipients();
    const idx = list.findIndex((r) => r.id === recipient.id);
    if (idx >= 0) {
      list[idx] = recipient;
    } else {
      list.unshift(recipient);
    }
    setStored(STORAGE_KEYS.RECIPIENTS, list);
  },

  getTransports: (): Transport[] => getStored(STORAGE_KEYS.TRANSPORTS, getInitialTransports),
  setTransports: (transports: Transport[]) => setStored(STORAGE_KEYS.TRANSPORTS, transports),
  updateTransportLocation: (transportId: string, lat: number, lon: number, delayMins?: number) => {
    const list = localStore.getTransports();
    const updated = list.map((t) => {
      if (t.id === transportId) {
        const d = delayMins !== undefined ? delayMins : t.delay_minutes;
        return {
          ...t,
          current_latitude: lat,
          current_longitude: lon,
          delay_minutes: d,
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });
    setStored(STORAGE_KEYS.TRANSPORTS, updated);
  },

  getReadinessRecords: (): HospitalReadiness[] => getStored(STORAGE_KEYS.READINESS, getInitialHospitalReadiness),
  updateReadinessRecord: (record: HospitalReadiness) => {
    const list = localStore.getReadinessRecords();
    const idx = list.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    setStored(STORAGE_KEYS.READINESS, list);
  },

  getAlerts: (): Alert[] => getStored(STORAGE_KEYS.ALERTS, getInitialAlerts),
  addAlert: (alert: Alert) => {
    const list = localStore.getAlerts();
    list.unshift(alert);
    setStored(STORAGE_KEYS.ALERTS, list);
  },
  updateAlertStatus: (alertId: string, status: 'ACKNOWLEDGED' | 'RESOLVED') => {
    const list = localStore.getAlerts();
    const updated = list.map((a) =>
      a.id === alertId ? { ...a, status, resolved_at: status === 'RESOLVED' ? new Date().toISOString() : a.resolved_at } : a
    );
    setStored(STORAGE_KEYS.ALERTS, updated);
  },

  getTimelineEvents: (): TimelineEvent[] => getStored(STORAGE_KEYS.TIMELINE, getInitialTimelineEvents),
  addTimelineEvent: (event: TimelineEvent) => {
    const list = localStore.getTimelineEvents();
    list.unshift(event);
    setStored(STORAGE_KEYS.TIMELINE, list);
  },

  getMatches: (): Match[] => getStored(STORAGE_KEYS.MATCHES, getInitialMatches),
  saveMatch: (match: Match) => {
    const list = localStore.getMatches();
    list.unshift(match);
    setStored(STORAGE_KEYS.MATCHES, list);
  },
};
