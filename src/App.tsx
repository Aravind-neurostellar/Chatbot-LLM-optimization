import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProviderModal } from './components/ProviderModal';
import { AthleteSelector } from './components/AthleteSelector';
import { CciTimeline } from './components/CciTimeline';
import { MoveAnalysisTable } from './components/MoveAnalysisTable';
import { CoachBotPanel } from './components/CoachBotPanel';
import { ChessboardView } from './components/ChessboardView';
import { CustomerTestingGuide, TestingScenario } from './components/CustomerTestingGuide';
import { ChatHistoryView } from './components/ChatHistoryView';
import { TournamentOverview } from './components/TournamentOverview';
import { ALL_SESSIONS, RAW_ORBIT_DATA, getAthleteSessions } from './data/rawOrbitData';
import { ProviderKeys, ChessMove } from './types/orbit';
import { Activity, Brain, Heart, Zap, Layers, Trophy, MessageSquare, Target } from 'lucide-react';

const STORAGE_KEYS_KEY = 'orbit_coach_provider_keys';
const STORAGE_MODEL_KEY = 'orbit_coach_active_model';

type AppTab = 'session' | 'board' | 'scenarios' | 'history' | 'overview';

export default function App() {
  const [currentAthlete, setCurrentAthlete] = useState<string>('Ekalaivar');
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [currentModel, setCurrentModel] = useState<string>('gemini-3.8-flash');
  const [activeTab, setActiveTab] = useState<AppTab>('session');
  const [selectedMove, setSelectedMove] = useState<ChessMove | null>(null);
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);
  const [keys, setKeys] = useState<ProviderKeys>({});
  const [externalPrompt, setExternalPrompt] = useState<string>('');

  // Load saved keys & model from localStorage on mount
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem(STORAGE_KEYS_KEY);
      if (savedKeys) {
        setKeys(JSON.parse(savedKeys));
      }
      const savedModel = localStorage.getItem(STORAGE_MODEL_KEY);
      if (savedModel) {
        setCurrentModel(savedModel);
      }
    } catch {
      // Fallback gracefully
    }
  }, []);

  const handleSaveKeys = (newKeys: ProviderKeys) => {
    setKeys(newKeys);
    try {
      localStorage.setItem(STORAGE_KEYS_KEY, JSON.stringify(newKeys));
    } catch {
      // ignore
    }
  };

  const handleSelectModel = (modelId: string) => {
    setCurrentModel(modelId);
    try {
      localStorage.setItem(STORAGE_MODEL_KEY, modelId);
    } catch {
      // ignore
    }
  };

  const athleteSessions = getAthleteSessions(currentAthlete);
  const activeSession = athleteSessions.find(s => s.round === selectedRound) || athleteSessions[0] || ALL_SESSIONS[0];

  const handleSelectAthlete = (athleteId: string) => {
    setCurrentAthlete(athleteId);
    setSelectedRound(1);
    setSelectedMove(null);
  };

  const handleSelectRound = (round: number) => {
    setSelectedRound(round);
    setSelectedMove(null);
  };

  const handleAskAboutMove = (move: ChessMove) => {
    setActiveTab('session');
    setExternalPrompt(
      `On Move ${move.move_no} (${move.san}) playing as ${move.side}, I took ${move.think_sec}s with a CCI of ${move.cci ?? 'provisional'} in the ${move.zone || 'Neutral'} zone. Please analyze the cognitive strain and tactical quality of this move.`
    );
  };

  const handleRunScenario = (scenario: TestingScenario) => {
    setCurrentAthlete(scenario.athleteId);
    setSelectedRound(scenario.round);
    setActiveTab('session');
    setExternalPrompt(scenario.query);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentModel={currentModel}
        onSelectModel={handleSelectModel}
        onOpenKeysModal={() => setIsKeysModalOpen(true)}
        keys={keys}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-5">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('session')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'session'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Session & Coach</span>
            </button>

            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'board'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>♟️</span>
              <span>Chessboard Replay</span>
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'scenarios'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="h-3.5 w-3.5 text-purple-400" />
              <span>Customer Testing Scenarios</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span>Chat History & Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Tournament Benchmark</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">
            Tournament: {RAW_ORBIT_DATA.tournament} ({RAW_ORBIT_DATA.engine.status})
          </span>
        </div>

        {/* Tab 1: Round Session & Coach */}
        {activeTab === 'session' && (
          <div className="space-y-5">
            {/* Athlete & Round Selector Banner */}
            <AthleteSelector
              athleteSessions={athleteSessions}
              allSessions={ALL_SESSIONS}
              currentAthlete={currentAthlete}
              onSelectAthlete={handleSelectAthlete}
              selectedRound={selectedRound}
              onSelectRound={handleSelectRound}
              activeSession={activeSession}
            />

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">CCI Mean Load</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{activeSession.cci_stats.mean.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mean Heart Rate</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{activeSession.hr_bpm_mean}</span>
                    <span className="text-xs text-slate-500">bpm</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Criticality Beta</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{activeSession.criticality_beta.toFixed(3)}</span>
                    <span className="text-[10px] text-slate-500">EEG</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dominant Regime</span>
                  <span className="text-xs font-bold text-emerald-400 truncate block mt-0.5">
                    {activeSession.dominant_regime}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Layout: Telemetry Timeline & Move Analysis vs Coach Bot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column (7 cols): Timeline + Move Table */}
              <div className="lg:col-span-7 space-y-5">
                <CciTimeline
                  session={activeSession}
                  selectedMove={selectedMove}
                  onSelectMove={setSelectedMove}
                  zones={RAW_ORBIT_DATA.zones}
                />
                <MoveAnalysisTable
                  moves={activeSession.moves}
                  selectedMove={selectedMove}
                  onSelectMove={setSelectedMove}
                />
              </div>

              {/* Right Column (5 cols): Interactive AI Coach Bot */}
              <div className="lg:col-span-5 sticky top-20">
                <CoachBotPanel
                  session={activeSession}
                  selectedMove={selectedMove}
                  currentModel={currentModel}
                  keys={keys}
                  onOpenKeysModal={() => setIsKeysModalOpen(true)}
                  externalPrompt={externalPrompt}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Chessboard Replay */}
        {activeTab === 'board' && (
          <div className="space-y-5">
            <AthleteSelector
              athleteSessions={athleteSessions}
              allSessions={ALL_SESSIONS}
              currentAthlete={currentAthlete}
              onSelectAthlete={handleSelectAthlete}
              selectedRound={selectedRound}
              onSelectRound={handleSelectRound}
              activeSession={activeSession}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 space-y-4">
                <ChessboardView
                  session={activeSession}
                  selectedMove={selectedMove}
                  onSelectMove={setSelectedMove}
                  onAskAboutMove={handleAskAboutMove}
                />
                <CciTimeline
                  session={activeSession}
                  selectedMove={selectedMove}
                  onSelectMove={setSelectedMove}
                  zones={RAW_ORBIT_DATA.zones}
                />
              </div>
              <div className="lg:col-span-5 sticky top-20">
                <CoachBotPanel
                  session={activeSession}
                  selectedMove={selectedMove}
                  currentModel={currentModel}
                  keys={keys}
                  onOpenKeysModal={() => setIsKeysModalOpen(true)}
                  externalPrompt={externalPrompt}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Evaluation Scenarios */}
        {activeTab === 'scenarios' && (
          <CustomerTestingGuide onRunScenario={handleRunScenario} />
        )}

        {/* Tab 4: Centralized Chat History & Server Logs */}
        {activeTab === 'history' && (
          <ChatHistoryView />
        )}

        {/* Tab 5: Tournament Overview */}
        {activeTab === 'overview' && (
          <TournamentOverview
            onSelectAthleteAndRound={(athId, rnd) => {
              setCurrentAthlete(athId);
              setSelectedRound(rnd);
              setActiveTab('session');
            }}
          />
        )}
      </main>

      {/* Provider Keys & Model Switcher Modal */}
      <ProviderModal
        isOpen={isKeysModalOpen}
        onClose={() => setIsKeysModalOpen(false)}
        keys={keys}
        onSaveKeys={handleSaveKeys}
        currentModel={currentModel}
        onSelectModel={handleSelectModel}
      />
    </div>
  );
}
