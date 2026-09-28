import React, { useState } from 'react';
import { X, Key, Check, ShieldCheck, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { ProviderKeys } from '../types/orbit';
import { AVAILABLE_MODELS } from '../services/aiCoachService';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: ProviderKeys;
  onSaveKeys: (keys: ProviderKeys) => void;
  currentModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({
  isOpen,
  onClose,
  keys,
  onSaveKeys,
  currentModel,
  onSelectModel
}) => {
  const [geminiKey, setGeminiKey] = useState(keys.geminiKey || '');
  const [openaiKey, setOpenaiKey] = useState(keys.openaiKey || '');
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState(keys.openaiBaseUrl || '');
  const [anthropicKey, setAnthropicKey] = useState(keys.anthropicKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKeys({
      geminiKey: geminiKey.trim(),
      openaiKey: openaiKey.trim(),
      openaiBaseUrl: openaiBaseUrl.trim(),
      anthropicKey: anthropicKey.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Models & API Key Configuration</h2>
              <p className="text-xs text-slate-400">Instantly switch models and supply keys for testing & prototyping</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-300">
          {/* Active Model Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Active Model for Coaching Bot
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onSelectModel(model.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    currentModel === model.id
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200">{model.name}</span>
                    {currentModel === model.id && (
                      <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{model.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              API Keys (Saved locally in your browser)
            </h3>

            {/* Google Gemini Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Get key <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500">
                Supports Gemini 3.8 Flash, Gemini 3.1 Pro, etc.
              </p>
            </div>

            {/* OpenAI / Custom Base URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  OpenAI API Key
                </label>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <div className="pt-1">
                <input
                  type="text"
                  value={openaiBaseUrl}
                  onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                  placeholder="Optional base URL (default: https://api.openai.com/v1)"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Works with Groq (https://api.groq.com/openai/v1), OpenRouter, DeepSeek, or local Ollama.
                </p>
              </div>
            </div>

            {/* Anthropic Claude */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Anthropic Claude API Key
                </label>
              </div>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Notice about Offline Simulator */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex gap-2.5 items-start">
              <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-200">
                <span className="font-semibold">Prototyping without keys?</span> Select the <span className="underline">Neuro-Chess Simulator</span>. It runs offline using real Orbit wearable formulas to analyze fatigue, EEG criticality, and blunders immediately!
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Client-side session memory</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save & Apply</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
