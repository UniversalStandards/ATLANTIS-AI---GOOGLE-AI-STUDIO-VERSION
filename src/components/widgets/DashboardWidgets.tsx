import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Crown, 
  Activity, 
  Gauge, 
  History, 
  Lightbulb, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  Layers,
  ChevronRight,
  Globe
} from 'lucide-react';
import type { 
  MissionData, 
  AgentNodeData, 
  LearnedPreferences, 
  RegisterMode, 
  UniversalMode,
  AccTier, 
  CostComplexityTier 
} from '../../types';
import { UNIVERSAL_MODES, detectModeFromPrompt } from '../../config/universalModes';

// 1. Mission Launcher Widget
export const WidgetMissionLauncher: React.FC<{
  onStart: (input: string, config: any) => void;
  isProcessing: boolean;
  learnedPrefs: LearnedPreferences;
  settings: {
    showPresets?: boolean;
    defaultDepth?: number;
    showTopologyOverride?: boolean;
    compactMode?: boolean;
  };
}> = ({ onStart, isProcessing, learnedPrefs, settings }) => {
  const [prompt, setPrompt] = useState('');
  const [sectorOverride, setSectorOverride] = useState('');
  const [topologyOverride, setTopologyOverride] = useState<'Centralized' | 'Decentralized' | 'Hybrid' | 'Independent' | ''>('');
  const [depthOverride, setDepthOverride] = useState<number>(settings.defaultDepth || 3);
  const [registerOverride, setRegisterOverride] = useState<RegisterMode>('auto');
  const [activePresetCategory, setActivePresetCategory] = useState<UniversalMode>('everyday');

  // Dynamically detected mode when in auto
  const detectedMode = prompt.trim() ? detectModeFromPrompt(prompt) : activePresetCategory;
  const currentModeDef = UNIVERSAL_MODES[detectedMode] || UNIVERSAL_MODES.everyday;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;

    onStart(prompt.trim(), {
      maxDepth: depthOverride,
      registerMode: registerOverride,
      operationalMode: registerOverride === 'auto' ? detectedMode : registerOverride,
      sectorOverride: sectorOverride.trim() || undefined,
      topologyOverride: topologyOverride || undefined,
    });
  };

  const handleSelectPreset = (p: { label: string; sector: string; topology: any; text: string }) => {
    setPrompt(p.text);
    setSectorOverride(p.sector);
    setTopologyOverride(p.topology);
  };

  return (
    <div className={`p-4 h-full flex flex-col justify-between ${settings.compactMode ? 'space-y-2' : 'space-y-3'}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
            placeholder="Define any objective or ask any question (everyday tasks, small business growth, enterprise scale, municipal services, or federal statutory missions)..."
            rows={settings.compactMode ? 2 : 3}
            className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/80 font-mono resize-none leading-relaxed"
          />
          {prompt.trim() && registerOverride === 'auto' && (
            <div className="absolute right-3 bottom-3 text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700 text-zinc-400 flex items-center gap-1.5 shadow-sm">
              <span className="text-zinc-500">DETECTED:</span>
              <span className={`font-bold ${currentModeDef.theme.badgeText}`}>
                {currentModeDef.name}
              </span>
            </div>
          )}
        </div>

        {/* Configuration Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            {/* Depth Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 text-[11px]">
              <span className="text-zinc-500">DEPTH:</span>
              <select
                value={depthOverride}
                onChange={(e) => setDepthOverride(Number(e.target.value))}
                className="bg-transparent text-blue-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value={2} className="bg-zinc-900">2 Levels (Fast)</option>
                <option value={3} className="bg-zinc-900">3 Levels (Balanced)</option>
                <option value={4} className="bg-zinc-900">4 Levels (Deep)</option>
              </select>
            </div>

            {/* Topology Override */}
            {settings.showTopologyOverride !== false && (
              <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 text-[11px]">
                <span className="text-zinc-500">TOPOLOGY:</span>
                <select
                  value={topologyOverride}
                  onChange={(e) => setTopologyOverride(e.target.value as any)}
                  className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-zinc-900">Auto-Classify</option>
                  <option value="Centralized" className="bg-zinc-900">Centralized</option>
                  <option value="Decentralized" className="bg-zinc-900">Decentralized</option>
                  <option value="Hybrid" className="bg-zinc-900">Hybrid</option>
                  <option value="Independent" className="bg-zinc-900">Independent</option>
                </select>
              </div>
            )}

            {/* Universal Mode / Register Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 text-[11px]">
              <span className="text-zinc-500">MODE:</span>
              <select
                value={registerOverride}
                onChange={(e) => {
                  const val = e.target.value as RegisterMode;
                  setRegisterOverride(val);
                  if (val !== 'auto' && val !== 'civilian' && val !== 'government') {
                    setActivePresetCategory(val as UniversalMode);
                  }
                }}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="auto" className="bg-zinc-900">⚡ Auto-Detect</option>
                <option value="everyday" className="bg-zinc-900">👤 Everyday User</option>
                <option value="small_business" className="bg-zinc-900">🏪 Small Business</option>
                <option value="enterprise" className="bg-zinc-900">🏢 Major Corporation</option>
                <option value="local_gov" className="bg-zinc-900">🏛️ Local Government</option>
                <option value="federal" className="bg-zinc-900">🛡️ Federal Agency</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isProcessing}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all ${
              isProcessing
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed'
                : !prompt.trim()
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 cursor-pointer'
            }`}
          >
            <Play size={13} className={isProcessing ? 'animate-spin' : 'fill-white'} />
            <span>{isProcessing ? 'COORDINATING...' : 'DISPATCH MISSION'}</span>
          </button>
        </div>
      </form>

      {/* Preset Scenarios with Universal Continuum Tabs */}
      {settings.showPresets !== false && (
        <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Universal Presets ({UNIVERSAL_MODES[activePresetCategory].name}):
            </span>
            <div className="flex items-center gap-1">
              {(['everyday', 'small_business', 'enterprise', 'local_gov', 'federal'] as UniversalMode[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActivePresetCategory(cat)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                    activePresetCategory === cat
                      ? `${UNIVERSAL_MODES[cat].theme.badgeBg} ${UNIVERSAL_MODES[cat].theme.badgeText} font-bold border ${UNIVERSAL_MODES[cat].theme.accentBorder}`
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {UNIVERSAL_MODES[cat].shortLabel}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {UNIVERSAL_MODES[activePresetCategory].presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors truncate max-w-[240px]"
                title={`${p.label}: ${p.text}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Executive Synthesis Widget
export const WidgetExecutiveSynthesis: React.FC<{
  mission: MissionData | null;
  settings: {
    displayMode?: 'full' | 'verdict_only' | 'key_takeaways';
    showCuriosity?: boolean;
    showGrounding?: boolean;
    showNodeCount?: boolean;
  };
  onInspectNode?: (nodeId: string) => void;
}> = ({ mission, settings, onInspectNode }) => {
  if (!mission || !mission.result) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center text-zinc-500 font-mono text-xs space-y-2">
        <Crown size={24} className="opacity-30 text-zinc-400" />
        <p>No mission synthesized yet.</p>
        <span className="text-[11px] text-zinc-600">
          Deploy a mission above to review root supervisor decisions and trade-offs.
        </span>
      </div>
    );
  }

  // Parse findings if present
  const resultText = mission.result;
  const cleanResult = resultText
    .replace(/\[Certainty:[^\]]+\]/i, '')
    .replace(/Curiosity Factor:[^\n]+/i, '')
    .trim();

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3">
      <div className="space-y-2.5 overflow-y-auto pr-1">
        {/* Header Metadata Pill */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 font-bold">
              ROOT VERDICT
            </span>
            <span className="text-zinc-400 truncate max-w-[240px]">
              &ldquo;{mission.title}&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-500">
            {settings.showNodeCount !== false && (
              <span>NODES: {mission.nodesCount || '4'}</span>
            )}
            {mission.executionTimeMs && (
              <span>{mission.executionTimeMs}ms</span>
            )}
          </div>
        </div>

        {/* Synthesis Body */}
        <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs text-zinc-200 font-mono leading-relaxed whitespace-pre-line">
          {cleanResult}
        </div>

        {/* Curiosity Factor */}
        {settings.showCuriosity !== false && mission.curiosityFactor && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
              <Lightbulb size={13} />
              <span>CURIOSITY FACTOR SURFACED</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {mission.curiosityFactor}
            </p>
          </div>
        )}
      </div>

      {/* Footer link to inspect root */}
      {onInspectNode && (
        <div className="pt-2 border-t border-zinc-800 flex justify-end">
          <button
            onClick={() => onInspectNode('root')}
            className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>Inspect Root Node Hierarchy</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

// 3. Live Status Matrix Widget
export const WidgetLiveStatusMatrix: React.FC<{
  nodes: Record<string, AgentNodeData>;
  isProcessing: boolean;
  settings: {
    showLatencies?: boolean;
    showCertaintyBreakdown?: boolean;
    showRoleDistribution?: boolean;
  };
  onSelectNode: (nodeId: string) => void;
}> = ({ nodes, isProcessing, settings, onSelectNode }) => {
  const nodeIds = Object.keys(nodes);
  const total = nodeIds.length;
  const running = nodeIds.filter((id) => nodes[id].status === 'running').length;
  const complete = nodeIds.filter((id) => nodes[id].status === 'complete').length;
  const escalated = nodeIds.filter((id) => nodes[id].doomLoopState === 'escalated').length;

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3">
      {/* Metric Counters */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-0.5">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Nodes</span>
          <div className="text-base font-bold font-mono text-zinc-200">{total}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-0.5">
          <span className="text-[10px] font-mono text-blue-400 uppercase">Streaming</span>
          <div className="text-base font-bold font-mono text-blue-400">{running}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-0.5">
          <span className="text-[10px] font-mono text-emerald-400 uppercase">Complete</span>
          <div className="text-base font-bold font-mono text-emerald-400">{complete}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-0.5">
          <span className="text-[10px] font-mono text-rose-400 uppercase">Escalated</span>
          <div className="text-base font-bold font-mono text-rose-400">{escalated}</div>
        </div>
      </div>

      {/* Node Mini Matrix List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-48 pr-1">
        {nodeIds.length === 0 ? (
          <div className="text-center py-6 text-zinc-600 font-mono text-xs">
            No agents active on workspace
          </div>
        ) : (
          nodeIds.map((id) => {
            const node = nodes[id];
            return (
              <div
                key={id}
                onClick={() => onSelectNode(id)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 flex items-center justify-between text-xs font-mono cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    node.status === 'running' ? 'bg-blue-400 animate-ping' :
                    node.doomLoopState === 'escalated' ? 'bg-rose-400' :
                    node.status === 'complete' ? 'bg-emerald-400' : 'bg-zinc-600'
                  }`} />
                  <span className="text-zinc-300 font-bold truncate">[{node.nodeId}]</span>
                  <span className="text-zinc-400 text-[11px] truncate">{node.task}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {settings.showLatencies && node.latencyMs && (
                    <span className="text-zinc-500 text-[10px]">{node.latencyMs}ms</span>
                  )}
                  <span className="text-[10px] text-zinc-400 uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    {node.role}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800 flex justify-between">
        <span>CERTAINTY DISCIPLINE</span>
        <span>RECURSIVE SUPERVISION</span>
      </div>
    </div>
  );
};

// 4. Topology & Cost Gauge Widget
export const WidgetTopologyCostGauge: React.FC<{
  activeMission: MissionData | null;
  aggregateAccPercent: number;
  settings: {
    showAccMeter?: boolean;
    showComplexityScore?: boolean;
    showRoutingRationale?: boolean;
  };
}> = ({ activeMission, aggregateAccPercent, settings }) => {
  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3">
      {/* Topology Badge */}
      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Classified Topology</span>
          <div className="text-sm font-bold font-mono text-blue-400 mt-0.5">
            {activeMission?.topology || 'HYBRID (RECURSIVE)'}
          </div>
        </div>
        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/25 text-[10px] font-mono font-bold">
          {activeMission?.sector || 'OPERATIONAL STANDBY'}
        </span>
      </div>

      {/* ACC Capacity Gauge */}
      {settings.showAccMeter !== false && (
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5">
              <Gauge size={13} className="text-cyan-400" />
              ACC Compaction Capacity
            </span>
            <span className="text-cyan-300 font-bold">{aggregateAccPercent}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${aggregateAccPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Cost Complexity Router */}
      {settings.showComplexityScore !== false && (
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 text-xs font-mono">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-400">COST/COMPLEXITY TIER</span>
            <span className="text-purple-300 font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/25">
              {activeMission?.routedTier || 'Balanced'} (Score: {activeMission?.complexityScore || 6}/10)
            </span>
          </div>
          {settings.showRoutingRationale && activeMission?.routingRationale && (
            <p className="text-[10px] text-zinc-400 font-sans mt-1 leading-relaxed">
              {activeMission.routingRationale}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// 5. Recent Missions Widget
export const WidgetRecentMissions: React.FC<{
  onSelectPastMission: (id: number) => void;
  settings: {
    maxItems?: number;
    showSector?: boolean;
    showStatus?: boolean;
  };
}> = ({ onSelectPastMission, settings }) => {
  const [missions, setMissions] = useState<MissionData[]>([]);

  React.useEffect(() => {
    import('../../db').then(({ db }) => {
      db.missions.reverse().limit(settings.maxItems || 5).toArray().then(setMissions);
    });
  }, [settings.maxItems]);

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-2">
      <div className="overflow-y-auto space-y-2 pr-1 max-h-56">
        {missions.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 font-mono text-xs">
            No past missions in storage
          </div>
        ) : (
          missions.map((m) => (
            <div
              key={m.id}
              onClick={() => m.id && onSelectPastMission(m.id)}
              className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200 font-bold truncate max-w-[180px]">
                  {m.title}
                </span>
                {settings.showStatus && (
                  <span className={`text-[9px] px-1 rounded ${
                    m.status === 'complete' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {m.status}
                  </span>
                )}
              </div>
              {settings.showSector && (
                <div className="text-[10px] font-mono text-zinc-500 truncate">
                  {m.sector} · {m.topology}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="text-[10px] text-zinc-500 font-mono text-center pt-1 border-t border-zinc-800">
        Click any mission to reload its tree & synthesis
      </div>
    </div>
  );
};
