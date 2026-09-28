import { OrbitDataset, OrbitSession } from '../types/orbit';
import { CHANDRASOODAN_SESSIONS } from './chandrasoodanSessions';
import { SIBI_SESSIONS } from './sibiSessions';

export const ALL_SESSIONS: OrbitSession[] = [
  ...CHANDRASOODAN_SESSIONS,
  ...SIBI_SESSIONS
];

export const RAW_ORBIT_DATA: OrbitDataset = {
  generated_utc: "2026-09-27T07:45:28Z",
  tournament: "Battle of Brains 3",
  engine: {
    name: "Orbit_CCIApp python/realtime_wearable_engine.py",
    path: "RealtimeWearableStreamEngine, 1 s streaming steps",
    eeg_fs: 250,
    ppg_fs: 62.5,
    status: "PROVISIONAL",
    caveat: "Python reference engine provisional calibration. Fischer-increment move alignment verified within 0-5s."
  },
  zones: [
    { name: "Deep Rest", lo: 0.0, hi: 25.0, color: "#3B82F6" },
    { name: "Relaxation", lo: 25.0, hi: 40.0, color: "#38BDF8" },
    { name: "Neutral", lo: 40.0, hi: 60.0, color: "#94A3B8" },
    { name: "Active Flow", lo: 60.0, hi: 80.0, color: "#F97316" },
    { name: "Peak Strain", lo: 80.0, hi: 100.01, color: "#EF4444" }
  ],
  sessions: ALL_SESSIONS
};

export const ATHLETE_NAMES: Record<string, string> = {
  "Ekalaivar": "Chandrasoodan",
  "919360892401": "Sibi Visal R"
};

export function getAthleteSessions(athleteId: string): OrbitSession[] {
  return ALL_SESSIONS.filter(s => s.athlete === athleteId);
}
