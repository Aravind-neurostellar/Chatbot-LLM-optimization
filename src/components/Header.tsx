import React from 'react';
import { Bot, Key, Activity, Sparkles, ChevronDown, Cpu } from 'lucide-react';
import { ModelOption, AIProvider, ProviderKeys } from '../types/orbit';
import { AVAILABLE_MODELS } from '../services/aiCoachService';

interface HeaderProps {
  currentModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenKeysModal: () => void;
  keys: ProviderKeys;
}

export const Header: React.FC<HeaderProps> = ({
  currentModel,
  onSelectModel,
  onOpenKeysModal,
  keys
}) => {
  const activeModel = AVAILABLE_MODELS.find(m => m.id === currentModel) || AVAILABLE_MODELS[0];

  const getProviderBadge = (provider: AIProvider) => {
    switch (provider) {
      case 'gemini':
        return { label: 'Gemini', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'openai':
        return { label: 'OpenAI', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'anthropic':
        return { label: 'Claude', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'Simulator', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    }
  };

  const badge = getProviderBadge(activeModel.provider);

  const hasKeyForActive = 
    activeModel.provider === 'simulator' ||
    (activeModel.provider === 'gemini' && !!keys.geminiKey) ||
    (activeModel.provider === 'openai' && !!keys.openaiKey) ||
    (activeModel.provider === 'anthropic' && !!keys.anthropicKey);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-base lg:text-lg tracking-tight">
                Orbit Cognitive Coach
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PROTOTYPE WORKBENCH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Battle of Brains 3 • Chess + Orbit Wearable EEG Telemetry
            </p>
          </div>
        </div>

        {/* Model Switcher & Key Settings */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Instant Model Quick-Switcher */}
          <div className="relative inline-flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${badge.bg}`}>
              {badge.label}
            </span>
            <select
              value={currentModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-medium pl-2 pr-6 py-1 focus:outline-none cursor-pointer appearance-none"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id} className="bg-slate-900 text-slate-200">
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none absolute right-2" />
          </div>

          {/* Key Management Button */}
          <button
            onClick={onOpenKeysModal}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              hasKeyForActive
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>API Keys</span>
            <span className={`h-2 w-2 rounded-full ${hasKeyForActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
