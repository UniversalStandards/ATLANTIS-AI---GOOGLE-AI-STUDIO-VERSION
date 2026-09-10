import React, { useState } from 'react';
import { 
  Database, 
  History, 
  Shield, 
  Activity, 
  UserCheck, 
  ChevronRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  RotateCw,
  Clock,
  Sparkles,
  Search,
  Filter,
  Check,
  Edit2,
  Trash2,
  Lock,
  Compass,
  Cpu,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { db } from '../db';
import type { 
  MissionData, 
  SemanticMemoryRecord, 
  SafetyAuditLog, 
  SafetyStripResult,
  RegisterMode, 
  UserBrevity,
  LearnedPreferences,
  AccTier
} from '../types';

interface SidebarProps {
  activeMission: MissionData | null;
  semanticMemories: SemanticMemoryRecord[];
  safetyLogs: SafetyAuditLog[];
  safetyStrip: SafetyStripResult;
  learnedPrefs: LearnedPreferences;
  userProfile: {
    registerPreference: RegisterMode;
    detectedRegister: UserBrevity;
    averageWordCount: number;
    missionsCompleted: number;
  };
  aggregateAccPercent: number;
  onSelectPastMission: (missionId: number) => void;
  onUpdateLearnedSignal: (signal: 'Sector' | 'Topology' | 'Depth', newValue: any) => void;
  onResetLearnedSignals: () => void;
}

type TabType = 'memory' | 'history' | 'personalization' | 'safety';

export const Sidebar: React.FC<SidebarProps> = ({
  activeMission,
  semanticMemories,
  safetyLogs,
  safetyStrip,
  learnedPrefs,
  userProfile,
  aggregateAccPercent,
  onSelectPastMission,
  onUpdateLearnedSignal,
  onResetLearnedSignals
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('memory');
  const [pastMissions, setPastMissions] = useState<MissionData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingSignal, setEditingSignal] = useState<'Sector' | 'Topology' | 'Depth' | null>(null);

  // Reload past missions from Dexie
  React.useEffect(() => {
    db.missions.reverse().limit(30).toArray().then(setPastMissions);
  }, [activeMission, activeTab]);

  const filteredMissions = pastMissions.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.sector.toLowerCase().includes(q) ||
      m.topology.toLowerCase().includes(q)
    );
  });

  const getAccTierLabel = (percent: number): { tier: AccTier; color: string } => {
    if (percent >= 95) return { tier: 'Emergency', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (percent >= 90) return { tier: 'Aggressive', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    if (percent >= 80) return { tier: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (percent >= 70) return { tier: 'Light', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    return { tier: 'None', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  const accInfo = getAccTierLabel(aggregateAccPercent);

  return (
    <aside className="w-84 border-l border-zinc-800/90 bg-zinc-950 flex flex-col shrink-0 text-xs font-sans h-full">
      {/* Feature 5: ACC Meter Header Widget */}
      <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Activity size={13} className="text-blue-400" />
            ACC Live Gauge (5 Tiers)
          </h3>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${accInfo.color}`}>
            TIER: {accInfo.tier.toUpperCase()}
          </span>
        </div>

        <div className="space-y-1">
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                aggregateAccPercent >= 90 ? 'bg-rose-500' : aggregateAccPercent >= 80 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${aggregateAccPercent}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>FUNCTIONAL ENFORCEMENT</span>
            <span>{aggregateAccPercent}% CAPACITY</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-mono">
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 py-2.5 px-1 text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'memory'
              ? 'border-blue-500 text-blue-400 font-semibold bg-zinc-900/50'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          title="Semantic Lessons"
        >
          <Database size={12} />
          <span>Semantic</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 px-1 text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-400 font-semibold bg-zinc-900/50'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          title="Episodic History & Search"
        >
          <History size={12} />
          <span>Episodic</span>
        </button>

        <button
          onClick={() => setActiveTab('personalization')}
          className={`flex-1 py-2.5 px-1 text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'personalization'
              ? 'border-blue-500 text-blue-400 font-semibold bg-zinc-900/50'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          title="Adaptive Personalization Layer"
        >
          <UserCheck size={12} />
          <span>Adaptive</span>
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`flex-1 py-2.5 px-1 text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'safety'
              ? 'border-blue-500 text-blue-400 font-semibold bg-zinc-900/50'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          title="Independent Safety Strip"
        >
          <Shield size={12} />
          <span>Safety</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* 1. SEMANTIC MEMORY (Feature 7) */}
        {activeTab === 'memory' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-1 border-b border-zinc-800/60">
              <span className="uppercase tracking-wider">Semantic Memory ({semanticMemories.length})</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Sparkles size={11} /> Priming Active
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              Distilled lessons from completed missions are indexed here and automatically primed into Gemini prompts for future missions.
            </p>

            {semanticMemories.map((mem, idx) => (
              <div 
                key={mem.id || idx}
                className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all space-y-1.5"
              >
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-blue-400 font-bold uppercase">{mem.context}</span>
                  <span className="text-emerald-400 font-semibold">{mem.confidence}</span>
                </div>
                <div className="text-xs font-semibold text-zinc-200 line-clamp-1 font-sans">
                  {mem.trigger}
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug font-sans">
                  <span className="text-zinc-500 font-mono">Action: </span>
                  {mem.action}
                </p>
                <div className="pt-1.5 border-t border-zinc-800/60 text-[9px] font-mono text-emerald-400/90">
                  Outcome: {mem.outcome}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. EPISODIC MISSION HISTORY & SEARCH (Feature 10) */}
        {activeTab === 'history' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono text-zinc-400 pb-1 border-b border-zinc-800/60 flex justify-between">
              <span>EPISODIC MISSIONS ({filteredMissions.length})</span>
              <span className="text-zinc-500">IndexedDB</span>
            </div>

            {/* Full-text search input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past mission trees & sectors..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {filteredMissions.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-6 font-mono">
                No matching past missions found.
              </p>
            ) : (
              filteredMissions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => m.id && onSelectPastMission(m.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all space-y-1 group ${
                    activeMission?.id === m.id 
                      ? 'bg-blue-950/25 border-blue-500/50' 
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-blue-400 uppercase font-semibold">{m.sector}</span>
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-zinc-200 line-clamp-1 group-hover:text-blue-300 font-sans">
                    {m.title}
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                    <span>{m.topology} · {m.nodesCount || 1} nodes</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={10} /> {m.status.toUpperCase()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* 3. ADAPTIVE PERSONALIZATION LAYER (Feature 3) */}
        {activeTab === 'personalization' && (
          <div className="space-y-4 font-sans">
            <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 pb-1 border-b border-zinc-800/60 uppercase">
              <span>Learned Signals & Habits</span>
              <button
                onClick={onResetLearnedSignals}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[10px] underline"
                title="Reset all learned preferences"
              >
                Reset All
              </button>
            </div>

            {/* Signal Adjustments */}
            <div className="space-y-2 text-xs font-mono">
              {/* Sector Preference */}
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">LEARNED SECTOR:</span>
                  <span className="text-blue-400 font-bold uppercase">{learnedPrefs.preferredSector}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                  <span className="text-zinc-500">Correct:</span>
                  {['Cybersecurity', 'Energy', 'Emergency Response'].map(s => (
                    <button
                      key={s}
                      onClick={() => onUpdateLearnedSignal('Sector', s)}
                      className={`px-1.5 py-0.5 rounded border ${learnedPrefs.preferredSector === s ? 'border-blue-500 text-blue-300 bg-blue-900/30' : 'border-zinc-800 text-zinc-400'}`}
                    >
                      {s.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topology Preference */}
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">LEARNED TOPOLOGY:</span>
                  <span className="text-purple-400 font-bold uppercase">{learnedPrefs.preferredTopology}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                  <span className="text-zinc-500">Correct:</span>
                  {['Hybrid', 'Centralized', 'Decentralized'].map(t => (
                    <button
                      key={t}
                      onClick={() => onUpdateLearnedSignal('Topology', t)}
                      className={`px-1.5 py-0.5 rounded border ${learnedPrefs.preferredTopology === t ? 'border-purple-500 text-purple-300 bg-purple-900/30' : 'border-zinc-800 text-zinc-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Depth Preference */}
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">LEARNED DEPTH:</span>
                  <span className="text-emerald-400 font-bold">LEVEL {learnedPrefs.preferredDepth}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                  <span className="text-zinc-500">Correct:</span>
                  {[2, 3, 4].map(d => (
                    <button
                      key={d}
                      onClick={() => onUpdateLearnedSignal('Depth', d)}
                      className={`px-2 py-0.5 rounded border ${learnedPrefs.preferredDepth === d ? 'border-emerald-500 text-emerald-300 bg-emerald-900/30' : 'border-zinc-800 text-zinc-400'}`}
                    >
                      L{d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inspectable Adaptation Log */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                Inspectable Adaptation Log ({learnedPrefs.adaptationLog.length})
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {learnedPrefs.adaptationLog.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 font-mono italic">
                    Log begins as missions are dispatched and patterns emerge.
                  </p>
                ) : (
                  learnedPrefs.adaptationLog.map((item) => (
                    <div key={item.id} className="p-2 rounded bg-zinc-900 border border-zinc-800/80 text-[10px] font-mono space-y-0.5">
                      <div className="flex justify-between text-zinc-400">
                        <span className="font-bold text-blue-400">{item.signal}</span>
                        <span className="text-emerald-400 font-semibold">Weight: {item.weight}</span>
                      </div>
                      <p className="text-zinc-300 font-sans">{item.learned}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. INDEPENDENT SAFETY LAYER STRIP (Feature 8) */}
        {activeTab === 'safety' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-[11px] font-mono text-zinc-400 pb-1 border-b border-zinc-800/60 uppercase flex justify-between">
              <span>5-Check Independent Safety Strip</span>
              <span className="text-emerald-400 font-bold">ALL ACTIVE</span>
            </div>

            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
              5 separately-evaluated checks per mission, each capable of failing without disabling others.
            </p>

            {/* Check 1: Input Validation */}
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-zinc-200">1. Input Validation</span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${safetyStrip.inputValidation.passed ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400'}`}>
                  {safetyStrip.inputValidation.passed ? 'VERIFIED' : 'FAILED'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                {safetyStrip.inputValidation.detail}
              </p>
            </div>

            {/* Check 2: Classification Guard */}
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-zinc-200">2. Classification Guard</span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${safetyStrip.classificationGuard.passed ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400'}`}>
                  {safetyStrip.classificationGuard.passed ? 'VERIFIED' : 'FAILED'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                {safetyStrip.classificationGuard.detail}
              </p>
            </div>

            {/* Check 3: Tool Sandboxing */}
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-zinc-200">3. Tool Sandboxing</span>
                <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ISOLATED
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                {safetyStrip.toolExecutionSandboxing.detail}
              </p>
            </div>

            {/* Check 4: Output Review */}
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-zinc-200">4. LLM-As-Judge Output Review</span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${safetyStrip.outputReview.passed ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400'}`}>
                  {safetyStrip.outputReview.passed ? 'PASSED' : 'FLAGGED'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                {safetyStrip.outputReview.detail}
              </p>
            </div>

            {/* Check 5: Audit Logging */}
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-zinc-200">5. Cryptographic Audit Logging</span>
                <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  RECORDED
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                {safetyStrip.auditLogging.detail}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 text-[10px] font-mono text-zinc-500 flex justify-between items-center">
        <span>PERSISTENCE: INDEXEDDB</span>
        <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
      </div>
    </aside>
  );
};
