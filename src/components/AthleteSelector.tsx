import React from 'react';
import { User, Award, Clock, Activity, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { OrbitSession } from '../types/orbit';
import { ATHLETE_NAMES } from '../data/rawOrbitData';

interface AthleteSelectorProps {
  athleteSessions: OrbitSession[];
  allSessions: OrbitSession[];
  currentAthlete: string;
  onSelectAthlete: (athleteId: string) => void;
  selectedRound: number;
  onSelectRound: (round: number) => void;
  activeSession: OrbitSession;
}

export const AthleteSelector: React.FC<AthleteSelectorProps> = ({
  athleteSessions,
  currentAthlete,
  onSelectAthlete,
  selectedRound,
  onSelectRound,
  activeSession
}) => {
  const athletes = [
    { id: 'Ekalaivar', name: 'Chandrasoodan', avatar: '♟️', rounds: 5, elo: 1500 },
    { id: '919360892401', name: 'Sibi Visal R', avatar: '⚡', rounds: 5, elo: 1500 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-4">
      {/* Athlete Selection Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {athletes.map((ath) => {
            const isSelected = currentAthlete === ath.id;
            return (
              <button
                key={ath.id}
                onClick={() => onSelectAthlete(ath.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{ath.avatar}</span>
                <span>{ath.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-800 text-slate-400'}`}>
                  Elo {ath.elo}
                </span>
              </button>
            );
          })}
        </div>

        {/* Round Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium mr-1 uppercase tracking-wider text-[11px]">Round:</span>
          {athleteSessions.map((s) => {
            const isSelected = selectedRound === s.round;
            const isWin = s.chess.result === 'Win';
            return (
              <button
                key={s.round}
                onClick={() => onSelectRound(s.round)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>R{s.round}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${isWin ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Match Badge Banner */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm">
            {activeSession.chess.color === 'white' ? '♔' : '♚'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">{activeSession.chess.opening}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activeSession.chess.result === 'Win' 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {activeSession.chess.result} via {activeSession.chess.end_type}
              </span>
            </div>
            <div className="text-slate-400 flex items-center gap-3 mt-0.5 text-[11px]">
              <span>Playing as <strong className="text-slate-200 capitalize">{activeSession.chess.color}</strong></span>
              <span>vs Opponent: <strong className="text-slate-200">{activeSession.chess.opponent}</strong> ({activeSession.chess.opponent_rating})</span>
              <span>Time: {activeSession.chess.time_control} ({activeSession.chess.time_utilized_pct}% used)</span>
            </div>
          </div>
        </div>

        {/* Quick Neuro Stats Pill */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Mean CCI</span>
            <span className="font-semibold text-slate-200 text-sm">{activeSession.cci_stats.mean.toFixed(1)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Heart Rate</span>
            <span className="font-semibold text-slate-200 text-sm">{activeSession.hr_bpm_mean} bpm</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Regime</span>
            <span className="font-semibold text-indigo-400 text-xs px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              {activeSession.dominant_regime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
