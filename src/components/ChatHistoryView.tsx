import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Download, Trash2, Search, Bot, User, Cpu, Clock, ChevronDown, ChevronUp, FileText, Check, AlertCircle } from 'lucide-react';

export interface StoredChatRecord {
  id: string;
  timestamp: number;
  dateIso: string;
  clientSessionId?: string;
  athlete: string;
  round: number;
  persona: string;
  model: string;
  provider: string;
  userQuery: string;
  coachResponse: string;
  systemPrompt: string;
}

export const ChatHistoryView: React.FC = () => {
  const [chats, setChats] = useState<StoredChatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('all');
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);
  const [expandedContextId, setExpandedContextId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (err) {
      console.error('Failed to fetch chat logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChats(prev => prev.filter(c => c.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all stored chat logs from the server?')) return;
    try {
      const res = await fetch('/api/chats', { method: 'DELETE' });
      if (res.ok) {
        setChats([]);
      }
    } catch (err) {
      console.error('Failed to clear chats:', err);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `orbit_coach_chat_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    if (chats.length === 0) return;
    const headers = ['ID', 'Date', 'Athlete', 'Round', 'Persona', 'Model', 'Provider', 'User_Query', 'Coach_Response'];
    const rows = chats.map(c => [
      c.id,
      c.dateIso || new Date(c.timestamp).toISOString(),
      `"${c.athlete}"`,
      c.round,
      `"${c.persona}"`,
      `"${c.model}"`,
      `"${c.provider}"`,
      `"${(c.userQuery || '').replace(/"/g, '""')}"`,
      `"${(c.coachResponse || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orbit_coach_chat_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredChats = chats.filter(c => {
    const matchesAthlete = selectedAthlete === 'all' || c.athlete.toLowerCase().includes(selectedAthlete.toLowerCase());
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      c.userQuery.toLowerCase().includes(query) || 
      c.coachResponse.toLowerCase().includes(query) || 
      c.model.toLowerCase().includes(query) ||
      c.persona.toLowerCase().includes(query);
    return matchesAthlete && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner & Control Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base lg:text-lg">Centralized Chat History & Logs</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {chats.length} conversations stored
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Every interaction between users and the coach bot is logged to the server so you can review user questions and AI coaching outputs.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={fetchChats}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Refresh logs from server"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={chats.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={chats.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          {chats.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition text-xs"
              title="Clear all logs"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries, bot answers, models, or keywords..."
            className="bg-transparent text-xs text-white placeholder-slate-500 w-full focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] font-medium">Filter Athlete:</span>
          <select
            value={selectedAthlete}
            onChange={(e) => setSelectedAthlete(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Athletes</option>
            <option value="Chandrasoodan">Chandrasoodan (Ekalaivar)</option>
            <option value="Sibi Visal R">Sibi Visal R (919360892401)</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-3">
        {filteredChats.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto text-slate-600 stroke-1" />
            <p className="text-sm text-slate-400 font-medium">No conversation logs found.</p>
            <p className="text-xs text-slate-500">
              When users interact with the coach bot in the Session tab, questions and answers will automatically populate here in real-time.
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isExpanded = expandedChatId === chat.id;
            const isContextExpanded = expandedContextId === chat.id;

            return (
              <div
                key={chat.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-3.5 transition"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-white text-sm">{chat.athlete}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-medium text-[11px]">
                      Round {chat.round}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-medium text-[11px] capitalize">
                      {chat.persona.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <Cpu className="h-3 w-3 text-cyan-400" />
                      {chat.model} ({chat.provider})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(chat.timestamp).toLocaleString()}
                    </span>

                    {deleteConfirmId === chat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(chat.id)}
                          className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1 text-slate-400 hover:text-white text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(chat.id)}
                        className="text-slate-600 hover:text-rose-400 transition"
                        title="Delete log entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* User Query */}
                <div className="flex gap-2.5 items-start">
                  <div className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-100">
                    <span className="font-semibold text-blue-400 block text-[10px] uppercase mb-0.5">User Prompt:</span>
                    <p className="whitespace-pre-wrap">{chat.userQuery}</p>
                  </div>
                </div>

                {/* Coach Response */}
                <div className="flex gap-2.5 items-start">
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200">
                    <span className="font-semibold text-indigo-400 block text-[10px] uppercase mb-0.5">Coach Output:</span>
                    <div className={`whitespace-pre-wrap leading-relaxed ${!isExpanded ? 'line-clamp-4' : ''}`}>
                      {chat.coachResponse}
                    </div>
                    {chat.coachResponse.length > 280 && (
                      <button
                        onClick={() => setExpandedChatId(isExpanded ? null : chat.id)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold mt-2 flex items-center gap-1 transition"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" /> Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" /> Read Full Coach Response
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inspect Used Input Context Drawer */}
                {chat.systemPrompt && (
                  <div className="pt-1">
                    <button
                      onClick={() => setExpandedContextId(isContextExpanded ? null : chat.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <FileText className="h-3 w-3 text-cyan-400" />
                      <span>{isContextExpanded ? 'Hide' : 'Inspect'} Exact LLM Input Context Used For This Turn</span>
                    </button>

                    {isContextExpanded && (
                      <div className="mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {chat.systemPrompt}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
