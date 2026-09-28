export type ZoneName = 'Deep Rest' | 'Relaxation' | 'Neutral' | 'Active Flow' | 'Peak Strain';

export interface ZoneConfig {
  name: ZoneName;
  lo: number;
  hi: number;
  color: string;
}

export interface ChessMove {
  move_no: number;
  san: string;
  side: 'white' | 'black';
  think_sec: number;
  clk_after_sec: number;
  t_recording_sec: number;
  in_recording: boolean;
  cci: number | null;
  zone: ZoneName | null;
  endurance: number | null;
}

export interface ChessGameMeta {
  opponent: string;
  color: 'white' | 'black';
  result: 'Win' | 'Loss' | 'Draw';
  opening: string;
  rating: number;
  opponent_rating: number;
  time_control: string;
  end_type: string;
  time_utilized_pct: number;
}

export interface OrbitSession {
  athlete: string;
  player_name: string;
  round: number;
  label: string;
  date_utc: string;
  chess: ChessGameMeta;
  duration_sec: number;
  step_sec: number;
  cci: (number | null)[];
  endurance: number[];
  confidence: number[];
  zones: (ZoneName | null)[];
  regimes: string[];
  cci_stats: {
    median: number;
    mean: number;
    std: number;
    min: number;
    max: number;
  };
  zone_distribution: Record<string, number>;
  regime_distribution: Record<string, number>;
  dominant_regime: string;
  endurance_mean: number;
  mean_confidence: number;
  sample_coverage: number;
  criticality_beta: number;
  hr_bpm_mean: number;
  cardiac_usable_fraction: number;
  moves: ChessMove[];
  full_moves?: { san: string; side: string; move_no: number }[];
  flags?: string[];
}

export interface OrbitDataset {
  generated_utc: string;
  tournament: string;
  engine: {
    name: string;
    path: string;
    eeg_fs: number;
    ppg_fs: number;
    status: string;
    caveat: string;
  };
  zones: ZoneConfig[];
  sessions: OrbitSession[];
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'simulator';

export interface ModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow?: string;
  description: string;
}

export interface ProviderKeys {
  geminiKey?: string;
  openaiKey?: string;
  openaiBaseUrl?: string;
  anthropicKey?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: string;
  providerUsed?: AIProvider;
  referencedMoves?: number[];
}

export type CoachPersona = 'neuro_analyst' | 'gm_tactician' | 'pacing_strategist' | 'pre_game_readiness';
