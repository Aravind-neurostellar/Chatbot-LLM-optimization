import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Copy, Check, RotateCcw, User, Cpu, ShieldAlert, FileText, X, Edit3, Settings, AlertCircle } from 'lucide-react';
import { OrbitSession, CoachPersona, ChatMessage, ProviderKeys, ChessMove } from '../types/orbit';
import { askCoach, AVAILABLE_MODELS, buildCoachSystemPrompt } from '../services/aiCoachService';

interface CoachBotPanelProps {
  session: OrbitSession;
  selectedMove: ChessMove | null;
  currentModel: string;
  keys: ProviderKeys;
  onOpenKeysModal: () => void;
  externalPrompt?: string;
}

export const CoachBotPanel: React.FC<CoachBotPanelProps> = ({
  session,
  selectedMove,
  currentModel,
  keys,
  onOpenKeysModal,
  externalPrompt
}) => {
  const [persona, setPersona] = useState<CoachPersona>('neuro_analyst');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Context management & customization
  const [showContextModal, setShowContextModal] = useState(false);
  const [customContext, setCustomContext] = useState<string>('');
  const [isCustomContextActive, setIsCustomContextActive] = useState<boolean>(false);
  const [draftContext, setDraftContext] = useState<string>('');
  const [copiedContext, setCopiedContext] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeModel = AVAILABLE_MODELS.find(m => m.id === currentModel) || AVAILABLE_MODELS[0];

  // Default auto-generated telemetry context
  const defaultContext = buildCoachSystemPrompt(session, persona);
  // Active context used for API calls
  const effectiveContext = isCustomContextActive && customContext.trim().length > 0 ? customContext : defaultContext;

  // When session or persona changes, reset custom draft if not locked
  useEffect(() => {
    if (!isCustomContextActive) {
      setDraftContext(defaultContext);
    }
  }, [session.athlete, session.round, persona, isCustomContextActive]);

  // If an external prompt is triggered, send it
  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(externalPrompt);
    }
  }, [externalPrompt]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial welcome message
  useEffect(() => {
    const welcomeText = `Hello ${session.player_name}! I am your **${persona.replace('_', ' ').toUpperCase()} Coach**.
I have loaded your **${session.label}** (${session.chess.opening}) telemetry:
- **Result**: ${session.chess.result.toUpperCase()} vs ${session.chess.opponent} (${session.chess.opponent_rating})
- **CCI Mean Load**: ${session.cci_stats.mean.toFixed(1)}/100 | **Dominant Regime**: \`${session.dominant_regime}\`
- **Criticality Beta**: ${session.criticality_beta} | **Heart Rate**: ${session.hr_bpm_mean} bpm
${isCustomContextActive ? '\n⚡ *Note: Custom LLM Input Context is currently active.*' : ''}

What would you like to analyze or optimize about your decision-making and cognitive pacing?`;

    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: welcomeText,
        timestamp: Date.now(),
        modelUsed: activeModel.name,
        providerUsed: activeModel.provider
      }
    ]);
  }, [session.athlete, session.round, persona, isCustomContextActive]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askCoach(
        query,
        session,
        persona,
        currentModel,
        keys,
        isCustomContextActive ? customContext : undefined
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        modelUsed: activeModel.name,
        providerUsed: activeModel.provider
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Failed to generate analysis: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const openContextEditor = () => {
    setDraftContext(effectiveContext);
    setShowContextModal(true);
  };

  const handleApplyCustomContext = () => {
    setCustomContext(draftContext);
    setIsCustomContextActive(true);
    setShowContextModal(false);
  };

  const handleResetToDefaultContext = () => {
    setIsCustomContextActive(false);
    setCustomContext('');
    setDraftContext(defaultContext);
  };

  const quickPrompts = [
    {
      label: `Why did I ${session.chess.result === 'Loss' ? 'lose' : 'win'} this game?`,
      query: `Analyze my cognitive load and time pacing during my ${session.chess.result} in ${session.label} playing ${session.chess.opening}.`
    },
    {
      label: selectedMove ? `Drill down Move ${selectedMove.move_no} (${selectedMove.san})` : 'Pacing under time trouble',
      query: selectedMove 
        ? `On move ${selectedMove.move_no} (${selectedMove.san}), I spent ${selectedMove.think_sec}s with a CCI load of ${selectedMove.cci ?? 'N/A'}. Was this a calculation bottleneck or fatigue point?`
        : `At what point in ${session.label} did my cognitive endurance drop, and did it correlate with time trouble?`
    },
    {
      label: '5-Minute Reset Protocol',
      query: `Design an immediate 5-minute pre-match neural reset protocol based on my heart rate (${session.hr_bpm_mean} bpm) and EEG criticality (${session.criticality_beta}).`
    },
    {
      label: 'Endurance vs Flow Breakdown',
      query: `Compare my Active Flow (${((session.zone_distribution['Active Flow'] || 0)*100).toFixed(0)}%) vs Deep Rest/Relaxation periods. Did I oscillate or maintain steady flow?`
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
      {/* Bot Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">Cognitive Performance Coach</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {activeModel.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Context: {session.player_name} • {session.label}</p>
          </div>
        </div>

        {/* Action Controls: Edit Context & Persona Selector */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Edit Context Button */}
          <button
            onClick={openContextEditor}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition shadow-sm ${
              isCustomContextActive
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
            }`}
            title="Inspect or customize the exact prompt & telemetry fed to the LLM"
          >
            <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isCustomContextActive ? 'Custom Context Active' : 'Edit LLM Context'}</span>
          </button>

          {/* Coach Persona Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <span className="text-[10px] text-slate-500 uppercase px-1.5 font-medium">Persona:</span>
            {(['neuro_analyst', 'gm_tactician', 'pacing_strategist', 'pre_game_readiness'] as CoachPersona[]).map((p) => {
              const labels: Record<CoachPersona, string> = {
                neuro_analyst: 'Neuro',
                gm_tactician: 'Tactician',
                pacing_strategist: 'Pacing',
                pre_game_readiness: 'Readiness'
              };
              return (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
                    persona === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Context Notification Banner */}
      {isCustomContextActive && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-300">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Customized prompt context is currently active ({customContext.length} chars).</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openContextEditor}
              className="underline hover:text-amber-100 font-semibold"
            >
              Edit
            </button>
            <span>•</span>
            <button
              onClick={handleResetToDefaultContext}
              className="text-slate-400 hover:text-white"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="h-7 w-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1 relative group ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-sm'
                }`}
              >
                {/* Assistant Metadata Header */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-4 pb-1 mb-1 border-b border-slate-800/80 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Cpu className="h-3 w-3 text-cyan-400" />
                      {msg.modelUsed || activeModel.name}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-white"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Content with whitespace formatting */}
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.content}
                </div>

                <div className={`text-[10px] text-right mt-1 ${isUser ? 'text-blue-200' : 'text-slate-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="h-7 w-7 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="h-7 w-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing EEG criticality and chess clock telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[10px] font-semibold uppercase text-slate-500 shrink-0">Quick Ask:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSendMessage(qp.query)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask your ${persona.replace('_', ' ')} coach about ${session.player_name}'s match...`}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white transition flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* Interactive LLM Context Customizer Modal */}
      {showContextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Edit LLM Input Context & System Prompt</h3>
                  <p className="text-xs text-slate-400">
                    Directly modify the background context, telemetry instructions, or persona constraints
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowContextModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Editor Area */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3 bg-slate-950/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                  Live System Context Buffer ({draftContext.length} chars • ~{Math.round(draftContext.length / 4)} tokens)
                </span>
                <button
                  type="button"
                  onClick={() => setDraftContext(defaultContext)}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restore Auto Telemetry Default</span>
                </button>
              </div>

              <textarea
                rows={16}
                value={draftContext}
                onChange={(e) => setDraftContext(e.target.value)}
                placeholder="Type or customize your system prompt and context here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500 shadow-inner"
              />

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> You can edit the persona guidelines, insert custom board notes, add constraints (e.g. <em>"Answer in concise bullet points with recovery drills only"</em>), or modify telemetry numbers for what-if scenarios.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70 text-xs">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(draftContext);
                  setCopiedContext(true);
                  setTimeout(() => setCopiedContext(false), 1500);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                {copiedContext ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedContext ? 'Copied' : 'Copy Text'}</span>
              </button>

              <div className="flex items-center gap-2">
                {isCustomContextActive && (
                  <button
                    type="button"
                    onClick={() => {
                      handleResetToDefaultContext();
                      setShowContextModal(false);
                    }}
                    className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-medium"
                  >
                    Clear Custom Context
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleApplyCustomContext}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20"
                >
                  Save & Apply Custom Context
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
