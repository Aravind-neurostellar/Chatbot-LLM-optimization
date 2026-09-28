import React, { useState } from 'react';
import { OrbitSession, ChessMove, ZoneConfig } from '../types/orbit';
import { Activity, Clock, ShieldAlert, Zap, BarChart2 } from 'lucide-react';

interface CciTimelineProps {
  session: OrbitSession;
  selectedMove: ChessMove | null;
  onSelectMove: (move: ChessMove) => void;
  zones: ZoneConfig[];
}

export const CciTimeline: React.FC<CciTimelineProps> = ({
  session,
  selectedMove,
  onSelectMove,
  zones
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cciData = session.cci;
  const stepSec = session.step_sec || 5;
  const totalDuration = session.duration_sec;

  // Chart dimensions
  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate points
  const points = cciData.map((val, idx) => {
    if (val === null) return null;
    const x = padding.left + (idx / Math.max(1, cciData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (val / 100) * graphHeight;
    return { x, y, val, sec: idx * stepSec };
  });

  // Filter valid points for SVG path
  const validPoints = points.filter((p): p is { x: number; y: number; val: number; sec: number } => p !== null);
  const pathD = validPoints.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Fill area under path
  const areaD = validPoints.length > 0
    ? `${pathD} L ${validPoints[validPoints.length - 1].x} ${padding.top + graphHeight} L ${validPoints[0].x} ${padding.top + graphHeight} Z`
    : '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-4">
      {/* Header and Zone Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h2 className="font-semibold text-white text-sm">Cognitive Capacity Index (CCI) & Move Timeline</h2>
          <span className="text-[11px] text-slate-400">({cciData.length} samples @ 5s steps)</span>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-2 text-[10px] font-medium">
          {zones.map((z) => (
            <div key={z.name} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: z.color }} />
              <span className="text-slate-300">{z.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-xl border border-slate-800/80 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          preserveAspectRatio="none"
        >
          {/* Background Zone Horizontal Shading */}
          {/* Peak Strain: 80 - 100 */}
          <rect
            x={padding.left}
            y={padding.top}
            width={graphWidth}
            height={graphHeight * 0.2}
            fill="#EF4444"
            fillOpacity="0.05"
          />
          {/* Active Flow: 60 - 80 */}
          <rect
            x={padding.left}
            y={padding.top + graphHeight * 0.2}
            width={graphWidth}
            height={graphHeight * 0.2}
            fill="#F97316"
            fillOpacity="0.05"
          />
          {/* Neutral: 40 - 60 */}
          <rect
            x={padding.left}
            y={padding.top + graphHeight * 0.4}
            width={graphWidth}
            height={graphHeight * 0.2}
            fill="#94A3B8"
            fillOpacity="0.04"
          />
          {/* Relaxation: 25 - 40 */}
          <rect
            x={padding.left}
            y={padding.top + graphHeight * 0.6}
            width={graphWidth}
            height={graphHeight * 0.15}
            fill="#38BDF8"
            fillOpacity="0.05"
          />
          {/* Deep Rest: 0 - 25 */}
          <rect
            x={padding.left}
            y={padding.top + graphHeight * 0.75}
            width={graphWidth}
            height={graphHeight * 0.25}
            fill="#3B82F6"
            fillOpacity="0.06"
          />

          {/* Grid lines and Y-axis Labels */}
          {[0, 25, 40, 60, 80, 100].map((val) => {
            const y = padding.top + graphHeight - (val / 100) * graphHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 font-mono text-[9px]"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="cciGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Filled Area */}
          <path d={areaD} fill="url(#cciGradient)" />

          {/* The CCI Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Chess Move Markers mapped onto timeline */}
          {session.moves.map((move) => {
            const moveTimeSec = move.t_recording_sec;
            if (moveTimeSec < 0 || moveTimeSec > totalDuration) return null;
            const x = padding.left + (moveTimeSec / totalDuration) * graphWidth;
            const moveCci = move.cci ?? 40;
            const y = padding.top + graphHeight - (moveCci / 100) * graphHeight;
            const isSelected = selectedMove?.move_no === move.move_no;

            return (
              <g
                key={move.move_no}
                className="cursor-pointer group"
                onClick={() => onSelectMove(move)}
              >
                {/* Vertical guideline */}
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + graphHeight}
                  stroke={isSelected ? '#F59E0B' : '#475569'}
                  strokeWidth={isSelected ? '1.5' : '0.8'}
                  strokeDasharray={isSelected ? 'none' : '2 2'}
                  opacity={isSelected ? 1 : 0.4}
                />
                {/* Marker Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#F59E0B' : '#E2E8F0'}
                  stroke="#0F172A"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />
                {/* SAN Label on top */}
                {isSelected && (
                  <text
                    x={x}
                    y={Math.max(padding.top - 6, 12)}
                    textAnchor="middle"
                    className="fill-amber-400 font-bold text-[10px]"
                  >
                    M{move.move_no}: {move.san}
                  </text>
                )}
              </g>
            );
          })}

          {/* X Axis Time Marks (Seconds / Minutes) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const sec = Math.round(pct * totalDuration);
            const x = padding.left + pct * graphWidth;
            const mins = Math.floor(sec / 60);
            const remSec = sec % 60;
            const formatted = `${mins}:${remSec < 10 ? '0' : ''}${remSec}`;
            return (
              <text
                key={pct}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-500 font-mono text-[9px]"
              >
                {formatted}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Selected Move Inspector Card */}
      {selectedMove && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold font-mono">
              Move {selectedMove.move_no} ({selectedMove.side}): {selectedMove.san}
            </span>
            <div className="flex items-center gap-3 text-slate-300">
              <span>Think Time: <strong className="text-white">{selectedMove.think_sec}s</strong></span>
              <span>Clock Left: <strong className="text-white">{selectedMove.clk_after_sec}s</strong></span>
              <span>CCI Load: <strong className="text-amber-300">{selectedMove.cci ?? 'N/A'}</strong></span>
              <span>Zone: <strong className="text-cyan-300">{selectedMove.zone ?? 'N/A'}</strong></span>
            </div>
          </div>
          <span className="text-[11px] text-amber-200/80">
            Click any move on the timeline or table below to analyze
          </span>
        </div>
      )}
    </div>
  );
};
