import React from 'react';
import { Target, Play, Brain, Heart, Zap, ShieldAlert, Sparkles, Clock, CheckCircle } from 'lucide-react';

export interface TestingScenario {
  id: string;
  title: string;
  tagline: string;
  athleteId: string;
  athleteName: string;
  round: number;
  persona: 'neuro_analyst' | 'gm_tactician' | 'pacing_strategist' | 'pre_game_readiness';
  query: string;
  focusMetrics: string[];
  description: string;
}

export const TESTING_SCENARIOS: TestingScenario[] = [
  {
    id: 'deep-rest-blunder',
    title: 'Extreme Calculation Bottleneck & Fatigue Crash',
    tagline: 'Move 19 (175s think) & Move 37 (69s think) in R1',
    athleteId: 'Ekalaivar',
    athleteName: 'Chandrasoodan',
    round: 1,
    persona: 'neuro_analyst',
    query: 'Analyze Move 19 (Nc6, 175s think) and Move 37 (c4, 69s think) in Round 1. Why did my cognitive endurance crash to 5% right after these moves, leading to checkmate?',
    focusMetrics: ['Think Time (175s)', 'Endurance Dip (5%)', 'EEG Beta 1.595', 'HR 107.3 bpm'],
    description: 'Evaluate how accurately the coach detects that prolonged static calculation drained mental reserves, causing time trouble checkmate.'
  },
  {
    id: 'flow-vs-fatigue-bird',
    title: 'High Active Flow & Pacing in Bird\'s Opening',
    tagline: '52.7% Active Flow with rapid tactical play in R5',
    athleteId: 'Ekalaivar',
    athleteName: 'Chandrasoodan',
    round: 5,
    persona: 'gm_tactician',
    query: 'In Round 5 playing White (Bird\'s Opening), I maintained 52.7% Active Flow and higher CCI (53.98), but still lost on move 28. Was this a board blunder or energy depletion?',
    focusMetrics: ['Active Flow 52.7%', 'Mean CCI 53.98', 'Time Utilized 52.7%'],
    description: 'Tests tactical chess awareness combined with mental flow telemetry: did the player rush tactical simplifications while in high flow?'
  },
  {
    id: 'cardiac-scramble-sibi',
    title: 'Elevated Heart Rate & Time Crunch Scramble',
    tagline: '104.4 bpm mean heart rate during Caro-Kann defense in R4',
    athleteId: '919360892401',
    athleteName: 'Sibi Visal R',
    round: 4,
    persona: 'pacing_strategist',
    query: 'My heart rate averaged 104.4 bpm during Round 4 with 87.8% clock utilization. How should I pace my breathing when the clock dips below 60s to prevent cardiac spikes?',
    focusMetrics: ['Mean HR 104.4 bpm', 'Time Utilized 87.8%', 'Resign Win'],
    description: 'Tests physiological stress coaching for intense blitz/rapid time control scrambles.'
  },
  {
    id: 'pregame-readiness',
    title: 'Pre-Match 5-Minute Neural Calibration Protocol',
    tagline: 'Customized neuro-respiratory protocol based on baseline metrics',
    athleteId: '919360892401',
    athleteName: 'Sibi Visal R',
    round: 5,
    persona: 'pre_game_readiness',
    query: 'Based on my tournament EEG criticality (beta ~0.455 to 1.075) and heart rate, give me a step-by-step 5-minute pre-match neural warmup protocol to achieve optimal flow.',
    focusMetrics: ['Criticality Beta 0.455', 'Active Flow 74%', 'Box Breathing'],
    description: 'Tests personalized actionable pre-competition prescriptions for athletes.'
  }
];

interface CustomerTestingGuideProps {
  onRunScenario: (scenario: TestingScenario) => void;
}

export const CustomerTestingGuide: React.FC<CustomerTestingGuideProps> = ({ onRunScenario }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Customer & Athlete Evaluation Scenarios</h3>
            <p className="text-xs text-slate-400">
              One-click testing scenarios designed to showcase cognitive telemetry insights to testers & coaches
            </p>
          </div>
        </div>
        <span className="text-[11px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full font-medium">
          4 Benchmark Tasks
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {TESTING_SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-white text-xs leading-snug">{scenario.title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 shrink-0 capitalize">
                  {scenario.persona.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{scenario.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {scenario.focusMetrics.map((m, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800/80 font-mono"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onRunScenario(scenario)}
                className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm group"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Test Scenario: {scenario.athleteName} (R{scenario.round})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
