import React from 'react';
import { ChessMove } from '../types/orbit';
import { Clock, Eye, AlertTriangle, Flame } from 'lucide-react';

interface MoveAnalysisTableProps {
  moves: ChessMove[];
  selectedMove: ChessMove | null;
  onSelectMove: (move: ChessMove) => void;
}

export const MoveAnalysisTable: React.FC<MoveAnalysisTableProps> = ({
  moves,
  selectedMove,
  onSelectMove
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          <h3 className="font-semibold text-white text-sm">Move Pacing & Cognitive Correlation</h3>
          <span className="text-[11px] text-slate-500">({moves.length} moves recorded)</span>
        </div>
        <span className="text-[11px] text-slate-400">Click a move to inject into coach prompt</span>
      </div>

      <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-800/80 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 sticky top-0 z-10 text-[11px]">
              <th className="py-2.5 px-3">Move #</th>
              <th className="py-2.5 px-3">SAN</th>
              <th className="py-2.5 px-3">Think Time</th>
              <th className="py-2.5 px-3">Clock After</th>
              <th className="py-2.5 px-3">CCI Load</th>
              <th className="py-2.5 px-3">Zone</th>
              <th className="py-2.5 px-3">Endurance</th>
              <th className="py-2.5 px-3">Risk Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {moves.map((m) => {
              const isSelected = selectedMove?.move_no === m.move_no;
              const isHighThink = m.think_sec >= 30;
              const isTimeTrouble = m.clk_after_sec < 60;
              const isLowEndurance = m.endurance !== null && m.endurance < 0.15;

              return (
                <tr
                  key={m.move_no}
                  onClick={() => onSelectMove(m)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-500/15 text-white font-semibold'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <td className="py-2 px-3 text-slate-400 font-sans">#{m.move_no}</td>
                  <td className="py-2 px-3 font-bold text-slate-100">{m.san}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded ${isHighThink ? 'bg-rose-500/20 text-rose-300 font-bold' : ''}`}>
                      {m.think_sec}s
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    <span className={isTimeTrouble ? 'text-amber-400 font-bold' : ''}>
                      {m.clk_after_sec}s
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {m.cci !== null ? (
                      <span className={m.cci > 60 ? 'text-orange-400 font-bold' : 'text-slate-300'}>
                        {m.cci.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-slate-600">--</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {m.zone ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-sans font-medium ${
                        m.zone === 'Active Flow' ? 'bg-orange-500/15 text-orange-300' :
                        m.zone === 'Deep Rest' ? 'bg-blue-500/15 text-blue-300' :
                        m.zone === 'Relaxation' ? 'bg-cyan-500/15 text-cyan-300' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {m.zone}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-sans">--</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {m.endurance !== null ? (
                      <span className={isLowEndurance ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {(m.endurance * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-slate-600">--</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    {isHighThink && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded mr-1">
                        <Flame className="h-2.5 w-2.5" /> High Think
                      </span>
                    )}
                    {isTimeTrouble && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="h-2.5 w-2.5" /> Time Crunch
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
