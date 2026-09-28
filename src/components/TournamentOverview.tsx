import React from 'react';
import { OrbitSession } from '../types/orbit';
import { ALL_SESSIONS } from '../data/rawOrbitData';
import { Trophy, Activity, Heart, Brain, TrendingUp, ArrowRight } from 'lucide-react';

interface TournamentOverviewProps {
  onSelectAthleteAndRound: (athleteId: string, round: number) => void;
}

export const TournamentOverview: React.FC<TournamentOverviewProps> = ({
  onSelectAthleteAndRound
}) => {
  const chandrasoodan = ALL_SESSIONS.filter(s => s.athlete === 'Ekalaivar');
  const sibi = ALL_SESSIONS.filter(s => s.athlete === '919360892401');

  const renderAthleteCard = (name: string, id: string, sessions: OrbitSession[], avatar: string) => {
    const wins = sessions.filter(s => s.chess.result === 'Win').length;
    const losses = sessions.filter(s => s.chess.result === 'Loss').length;
    const avgCci = (sessions.reduce((acc, s) => acc + s.cci_stats.mean, 0) / sessions.length).toFixed(1);
    const avgHr = (sessions.reduce((acc, s) => acc + s.hr_bpm_mean, 0) / sessions.length).toFixed(0);

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-slate-800/80">{avatar}</span>
            <div>
              <h3 className="font-bold text-white text-base">{name}</h3>
              <p className="text-xs text-slate-400">Athlete ID: {id} • Elo: 1500</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {wins}W - {losses}L
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Tournament CCI</span>
            <span className="font-bold text-amber-400 text-sm">{avgCci}</span>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Avg Heart Rate</span>
            <span className="font-bold text-rose-400 text-sm">{avgHr} bpm</span>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Rounds</span>
            <span className="font-bold text-cyan-400 text-sm">{sessions.length} / 5</span>
          </div>
        </div>

        {/* Round Matrix */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
            Round-by-Round Breakdown
          </span>
          <div className="space-y-1.5">
            {sessions.map((s) => (
              <button
                key={s.round}
                onClick={() => onSelectAthleteAndRound(id, s.round)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 transition text-left text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${s.chess.result === 'Win' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span className="font-bold text-slate-200">R{s.round}: {s.chess.opening}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span>CCI: {s.cci_stats.mean.toFixed(0)}</span>
                  <span>{Math.round(s.duration_sec / 60)}m</span>
                  <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-white transition" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5 text-amber-400" />
          <div>
            <h2 className="font-bold text-white text-base">Battle of Brains 3: Multi-Athlete Benchmark</h2>
            <p className="text-xs text-slate-400">Comparative cognitive load & pacing analysis across 10 tournament rounds</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderAthleteCard('Chandrasoodan', 'Ekalaivar', chandrasoodan, '♟️')}
        {renderAthleteCard('Sibi Visal R', '919360892401', sibi, '⚡')}
      </div>
    </div>
  );
};
