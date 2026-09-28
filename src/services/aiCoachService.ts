import { ModelOption, OrbitSession, CoachPersona, ProviderKeys } from '../types/orbit';

export const AVAILABLE_MODELS: ModelOption[] = [
  // Gemini Models
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'gemini', description: 'Google flagship speed & neuro-analysis (Recommended)' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', provider: 'gemini', description: 'Deep reasoning for complex chess endgame cognition' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', description: 'Fast multimodal low latency' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', provider: 'gemini', description: 'Ultra lightweight high throughput' },
  // OpenAI & Compatible
  { id: 'gpt-4o', name: 'GPT-4o (OpenAI)', provider: 'openai', description: 'Omni multi-modal cognitive tactician' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Lightweight OpenAI reasoning' },
  { id: 'o3-mini', name: 'o3-mini (OpenAI)', provider: 'openai', description: 'High STEM & algorithmic reasoning' },
  { id: 'custom-openai', name: 'Custom OpenAI-Compatible', provider: 'openai', description: 'Custom Base URL (Groq, OpenRouter, DeepSeek, Local)' },
  // Anthropic
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'anthropic', description: 'Hybrid fast/extended reasoning' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'Precise tactical & analytical prose' },
  // Local / Prototype Simulator
  { id: 'neuro-simulator', name: 'Neuro-Chess Simulator (No Key Required)', provider: 'simulator', description: 'Built-in domain engine calibrated on Orbit telemetry' }
];

export function buildCoachSystemPrompt(session: OrbitSession, persona: CoachPersona): string {
  const personaDescriptions: Record<CoachPersona, string> = {
    neuro_analyst: "You are an elite Sports Neuroscientist specializing in cognitive load (CCI), EEG criticality, and mental endurance for grandmaster chess athletes.",
    gm_tactician: "You are a Chess Grandmaster & Cognitive Pacing Coach who correlates board tactical complexity with heart rate, decision latency, and mental strain.",
    pacing_strategist: "You are a Match Pacing & Energy Strategist who trains athletes to avoid late-game time scrambles and cognitive fatigue drop-offs.",
    pre_game_readiness: "You are a High-Performance Readiness Coach who designs personalized 5-minute pre-match breathing and mental warmups."
  };

  const movesSummary = session.moves.map(m => 
    `M${m.move_no} (${m.side}): ${m.san} | think: ${m.think_sec}s | clk: ${m.clk_after_sec}s | CCI: ${m.cci ?? 'N/A'} (${m.zone ?? 'N/A'}) | endurance: ${m.endurance ?? 'N/A'}`
  ).join('\n');

  return `${personaDescriptions[persona]}

=== ATHLETE & MATCH TELEMETRY CONTEXT ===
Athlete: ${session.player_name} (ID: ${session.athlete})
Tournament: Battle of Brains 3 | Round: ${session.round} (${session.label})
Game: ${session.chess.opening}
Color: ${session.chess.color.toUpperCase()} vs Opponent ${session.chess.opponent} (Rating: ${session.chess.opponent_rating} vs Athlete: ${session.chess.rating})
Result: ${session.chess.result.toUpperCase()} via ${session.chess.end_type} (Time utilized: ${session.chess.time_utilized_pct}%)
Game Duration: ${Math.round(session.duration_sec)} seconds (${(session.duration_sec / 60).toFixed(1)} mins)

=== BIOMETRIC & COGNITIVE DATA (Orbit Wearable) ===
CCI Load Stats: Median ${session.cci_stats.median}, Mean ${session.cci_stats.mean}, Std ${session.cci_stats.std}, Min ${session.cci_stats.min}, Max ${session.cci_stats.max}
Dominant Cognitive Regime: ${session.dominant_regime}
EEG Criticality Beta: ${session.criticality_beta}
Mean Heart Rate: ${session.hr_bpm_mean} bpm (Cardiac Usability: ${(session.cardiac_usable_fraction * 100).toFixed(1)}%)
Average Cognitive Endurance: ${session.endurance_mean}
Zone Distribution:
${Object.entries(session.zone_distribution).map(([z, p]) => ` - ${z}: ${(p * 100).toFixed(1)}%`).join('\n')}
${session.flags && session.flags.length > 0 ? `Integrity / Pipeline Flags: ${session.flags.join('; ')}` : ''}

=== RECORDED CHESS MOVES & COGNITIVE LOAD ===
${movesSummary}

INSTRUCTIONS:
1. Ground your observations strictly in this real telemetry.
2. Highlight specific moves where think time was disproportionate to cognitive load, or where sudden drops in endurance preceded blunders or checkmate.
3. Be direct, respectful, constructive, and actionable. Use bullet points and clear takeaways.`;
}

export async function askCoach(
  userQuery: string,
  session: OrbitSession,
  persona: CoachPersona,
  modelId: string,
  keys: ProviderKeys,
  customSystemPrompt?: string
): Promise<string> {
  const modelConfig = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];
  const systemPrompt = customSystemPrompt && customSystemPrompt.trim().length > 0
    ? customSystemPrompt
    : buildCoachSystemPrompt(session, persona);

  // If explicit Simulator selected, use local engine and log to backend
  if (modelConfig.provider === 'simulator') {
    const simResponse = generateSimulatorResponse(userQuery, session, persona, modelConfig.name);
    // Background log to server
    fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery,
        coachResponse: simResponse,
        systemPrompt,
        model: modelConfig.id,
        provider: 'simulator',
        athlete: session.player_name,
        round: session.round,
        persona
      })
    }).catch(() => {});
    return simResponse;
  }

  // Call server-side API proxy
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery,
        systemPrompt,
        modelId: modelConfig.id,
        provider: modelConfig.provider,
        clientKeys: keys,
        athlete: session.player_name,
        round: session.round,
        persona
      })
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const errorText = errorJson.error || `Server responded with HTTP ${res.status}`;
      console.warn('API error, falling back to simulator:', errorText);
      const fallback = `ℹ️ [Server Notice: ${errorText}]\n\n` + 
        generateSimulatorResponse(userQuery, session, persona, `${modelConfig.name} (Simulated Fallback)`);
      
      // Log fallback chat
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery,
          coachResponse: fallback,
          systemPrompt,
          model: modelConfig.id,
          provider: modelConfig.provider,
          athlete: session.player_name,
          round: session.round,
          persona
        })
      }).catch(() => {});

      return fallback;
    }

    const data = await res.json();
    return data.content || "No response received from coach.";
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('Network error calling /api/coach:', errMsg);
    return `⚠️ Network fallback: ${errMsg}\n\n` + 
      generateSimulatorResponse(userQuery, session, persona, `${modelConfig.name} (Offline Engine)`);
  }
}

function generateSimulatorResponse(
  query: string,
  session: OrbitSession,
  persona: CoachPersona,
  engineName: string
): string {
  const isLoss = session.chess.result === 'Loss';
  const cciMean = session.cci_stats.mean.toFixed(1);
  const flowPct = ((session.zone_distribution['Active Flow'] || 0) * 100).toFixed(0);
  const restPct = ((session.zone_distribution['Deep Rest'] || 0) * 100).toFixed(0);

  // Find move with highest think time
  const longMove = [...session.moves].sort((a, b) => b.think_sec - a.think_sec)[0];

  return `### 🧠 Performance Debrief: ${session.player_name} — ${session.label} (${session.chess.opening})
*Generated by ${engineName} • Persona: ${persona.replace('_', ' ').toUpperCase()}*

#### 1. Cognitive State Summary
- **Mean CCI Load**: **${cciMean} / 100** (Median: ${session.cci_stats.median.toFixed(1)})
- **Dominant Mental Regime**: \`${session.dominant_regime}\`
- **Zone Breakdown**: **${flowPct}% Active Flow**, **${restPct}% Deep Rest**, **${((session.zone_distribution['Relaxation'] || 0)*100).toFixed(0)}% Relaxation**.
- **Heart Rate**: **${session.hr_bpm_mean} bpm** with **${session.criticality_beta.toFixed(2)} EEG Criticality Beta**.

#### 2. Critical Move Anomaly Analysis
${longMove ? `- **Move ${longMove.move_no} (${longMove.san})**: Required **${longMove.think_sec}s** think time. At this juncture, your CCI was **${longMove.cci ?? 'provisional'}** in the **${longMove.zone ?? 'Neutral'}** zone.
  - Notice the endurance curve dip: prolonged static calculation in complex positions drained your subsequent reserve.` : '- Steady tactical pacing across early moves.'}
${session.flags && session.flags.length > 0 ? `- ⚠️ **Sensor Integrity Note**: ${session.flags[0]}` : ''}

#### 3. Strategic & Cognitive Recommendations for ${session.player_name}
1. **Pacing in Time Pressure**: In ${session.label}, ${session.chess.time_utilized_pct}% of the clock was burned. When dropping below 60s, maintain a 2-second diaphragmatic exhalation to prevent the CCI oscillation spikes observed in late moves.
2. **Cognitive Reset Protocol**: Between moves requiring >30s calculation, take 3 seconds to unfixate gaze from the board center to disengage peak neural strain.
3. **${isLoss ? 'Post-Loss Recovery' : 'Consolidating Win Momentum'}**: Before your next round, perform 2 minutes of box breathing (4s in, 4s hold, 4s out, 4s hold) to stabilize your EEG criticality beta towards optimal criticality (~1.0 - 1.2).

*Query analyzed: "${query}"*`;
}
