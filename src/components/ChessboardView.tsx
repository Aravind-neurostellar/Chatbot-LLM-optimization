import React, { useMemo } from 'react';
import { Chess } from 'chess.js';
import { ChessMove, OrbitSession } from '../types/orbit';
import { Play, SkipBack, SkipForward, RotateCcw, Brain, Clock } from 'lucide-react';

interface ChessboardViewProps {
  session: OrbitSession;
  selectedMove: ChessMove | null;
  onSelectMove: (move: ChessMove) => void;
  onAskAboutMove: (move: ChessMove) => void;
}

export const ChessboardView: React.FC<ChessboardViewProps> = ({
  session,
  selectedMove,
  onSelectMove,
  onAskAboutMove
}) => {
  // Compute board position using chess.js
  const { board, turn, moveIndex, totalMoves, lastMoveSquares } = useMemo(() => {
    const chess = new Chess();
    const fullMoves = session.full_moves || [];
    let targetIndex = -1;

    if (selectedMove) {
      targetIndex = fullMoves.findIndex(
        m => m.move_no === selectedMove.move_no && m.side === selectedMove.side
      );
    } else if (session.moves.length > 0) {
      const firstRecorded = session.moves[0];
      targetIndex = fullMoves.findIndex(
        m => m.move_no === firstRecorded.move_no && m.side === firstRecorded.side
      );
    }

    let lastFrom = '';
    let lastTo = '';

    const limit = targetIndex >= 0 ? targetIndex : fullMoves.length - 1;
    for (let i = 0; i <= limit; i++) {
      if (fullMoves[i]) {
        try {
          const res = chess.move(fullMoves[i].san);
          if (res) {
            lastFrom = res.from;
            lastTo = res.to;
          }
        } catch {
          // ignore move errors on custom notations
        }
      }
    }

    return {
      board: chess.board(),
      turn: chess.turn(),
      moveIndex: limit,
      totalMoves: fullMoves.length,
      lastMoveSquares: { from: lastFrom, to: lastTo }
    };
  }, [session, selectedMove]);

  // Unicode Chess Pieces
  const pieceSymbols: Record<string, string> = {
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
  };

  const currentMoveObj = selectedMove || (session.moves.length > 0 ? session.moves[0] : null);

  // Stepping forward / backward through recorded moves
  const recordedMoves = session.moves;
  const currentRecordedIndex = recordedMoves.findIndex(m => m.move_no === currentMoveObj?.move_no);

  const handlePrev = () => {
    if (currentRecordedIndex > 0) {
      onSelectMove(recordedMoves[currentRecordedIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentRecordedIndex < recordedMoves.length - 1) {
      onSelectMove(recordedMoves[currentRecordedIndex + 1]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">♟️</span>
          <h3 className="font-semibold text-white text-sm">Interactive Match Board Replay</h3>
          <span className="text-[11px] text-slate-400">
            (Ply {moveIndex + 1} of {totalMoves})
          </span>
        </div>

        {/* Step controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentRecordedIndex <= 0}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Previous recorded move"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-mono px-2 text-slate-400">
            {currentMoveObj ? `Move ${currentMoveObj.move_no} (${currentMoveObj.san})` : 'Start'}
          </span>
          <button
            onClick={handleNext}
            disabled={currentRecordedIndex >= recordedMoves.length - 1}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Next recorded move"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* 8x8 Board */}
        <div className="md:col-span-7 flex justify-center">
          <div className="w-full max-w-[340px] aspect-square bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner select-none">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded border border-slate-800 overflow-hidden">
              {board.map((row, rIdx) =>
                row.map((piece, cIdx) => {
                  const isDark = (rIdx + cIdx) % 2 === 1;
                  const squareName = `${String.fromCharCode(97 + cIdx)}${8 - rIdx}`;
                  const isHighlighted =
                    squareName === lastMoveSquares.from || squareName === lastMoveSquares.to;

                  const pieceChar = piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : '';
                  const symbol = pieceChar ? pieceSymbols[pieceChar] : '';

                  return (
                    <div
                      key={squareName}
                      className={`relative flex items-center justify-center text-2xl font-bold transition-colors ${
                        isHighlighted
                          ? isDark ? 'bg-amber-600/50' : 'bg-amber-400/40'
                          : isDark ? 'bg-slate-800/90' : 'bg-slate-700/50'
                      }`}
                    >
                      {/* Rank & File labels on border squares */}
                      {cIdx === 0 && (
                        <span className="absolute top-0.5 left-0.5 text-[8px] font-mono text-slate-400 select-none">
                          {8 - rIdx}
                        </span>
                      )}
                      {rIdx === 7 && (
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono text-slate-400 select-none">
                          {String.fromCharCode(97 + cIdx)}
                        </span>
                      )}

                      {/* Piece Icon */}
                      <span className={`transform transition hover:scale-110 drop-shadow ${
                        piece?.color === 'w' ? 'text-amber-100' : 'text-slate-950 font-black'
                      }`}>
                        {symbol}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Move & Cognitive Correlation Sidebar */}
        <div className="md:col-span-5 space-y-3 text-xs">
          {currentMoveObj ? (
            <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold font-mono">
                  Move #{currentMoveObj.move_no} ({currentMoveObj.side})
                </span>
                <span className="font-bold text-base text-white font-mono">{currentMoveObj.san}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block uppercase text-[9px]">Think Time</span>
                  <span className="font-bold text-white text-xs">{currentMoveObj.think_sec}s</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block uppercase text-[9px]">Clock Left</span>
                  <span className="font-bold text-white text-xs">{currentMoveObj.clk_after_sec}s</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block uppercase text-[9px]">CCI Load</span>
                  <span className="font-bold text-amber-400 text-xs">
                    {currentMoveObj.cci ? currentMoveObj.cci.toFixed(1) : 'Provisional'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block uppercase text-[9px]">Zone State</span>
                  <span className="font-bold text-cyan-400 text-xs">{currentMoveObj.zone || 'Neutral'}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Endurance reserve at this ply: <strong className="text-slate-200">
                  {currentMoveObj.endurance !== null ? `${(currentMoveObj.endurance * 100).toFixed(0)}%` : 'N/A'}
                </strong>
              </div>

              <button
                onClick={() => onAskAboutMove(currentMoveObj)}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 transition text-xs shadow-md shadow-indigo-500/20"
              >
                <Brain className="h-3.5 w-3.5" />
                <span>Ask Coach About Move {currentMoveObj.san}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-xs">
              Select a move on the timeline or table to see the board state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
