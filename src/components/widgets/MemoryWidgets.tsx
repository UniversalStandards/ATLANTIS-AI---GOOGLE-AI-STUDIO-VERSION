import React, { useState, useEffect } from 'react';
import { Database, History, Sparkles, Search, Check, RefreshCw } from 'lucide-react';
import type { SemanticMemoryRecord, MissionData, LearnedPreferences } from '../../types';
import { db } from '../../db';

// 1. Semantic Memory Ledger Widget
export const WidgetSemanticMemory: React.FC<{
  semanticMemories: SemanticMemoryRecord[];
  settings: {
    confidenceFilter?: 'all' | 'high_only';
    maxItems?: number;
    searchBar?: boolean;
  };
}> = ({ semanticMemories, settings }) => {
  const [query, setQuery] = useState('');

  const filtered = semanticMemories
    .filter((m) => {
      if (settings.confidenceFilter === 'high_only' && (m.confidence || 0) < 0.8) {
        return false;
      }
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        m.trigger.toLowerCase().includes(q) ||
        m.action.toLowerCase().includes(q) ||
        m.outcome.toLowerCase().includes(q) ||
        (m.context && m.context.toLowerCase().includes(q))
      );
    })
    .slice(0, settings.maxItems || 8);

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="space-y-2 overflow-y-auto pr-1">
        {settings.searchBar !== false && (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter learned semantic rules..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No semantic rules match current parameters.
          </div>
        ) : (
          filtered.map((m, idx) => (
            <div key={m.id || idx} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-bold uppercase text-[10px]">
                  RULE #{idx + 1} · {m.context || 'GENERAL'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  {Math.round((m.confidence || 0.85) * 100)}% CONF
                </span>
              </div>
              <div className="text-zinc-300 text-[11px] leading-relaxed">
                <strong className="text-zinc-400">Trigger:</strong> {m.trigger}
              </div>
              <div className="text-zinc-300 text-[11px] leading-relaxed">
                <strong className="text-zinc-400">Action:</strong> {m.action}
              </div>
              <div className="text-zinc-400 text-[10px] leading-relaxed">
                <strong className="text-zinc-500">Outcome:</strong> {m.outcome}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 flex justify-between">
        <span>STORED IN INDEXEDDB (OFFLINE-FIRST)</span>
        <span>COUNT: {filtered.length} RULES</span>
      </div>
    </div>
  );
};

// 2. Episodic Archive Widget
export const WidgetEpisodicArchive: React.FC<{
  onSelectPastMission: (id: number) => void;
  settings: {
    pageSize?: number;
    showSector?: boolean;
    showTopology?: boolean;
  };
}> = ({ onSelectPastMission, settings }) => {
  const [missions, setMissions] = useState<MissionData[]>([]);

  useEffect(() => {
    db.missions.reverse().limit(settings.pageSize || 8).toArray().then(setMissions);
  }, [settings.pageSize]);

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-2 font-mono text-xs">
      <div className="overflow-y-auto space-y-2 pr-1 flex-1">
        {missions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">Episodic memory ledger is empty.</div>
        ) : (
          missions.map((m) => (
            <div
              key={m.id}
              onClick={() => m.id && onSelectPastMission(m.id)}
              className="p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-colors space-y-1.5"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-zinc-200 font-bold text-xs truncate">
                  {m.title}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                  {new Date(m.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                {settings.showSector !== false && (
                  <span className="text-blue-400">{m.sector}</span>
                )}
                {settings.showTopology !== false && (
                  <span>· {m.topology}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 text-center">
        Select any mission to restore full hierarchical tree snapshot
      </div>
    </div>
  );
};

// 3. Adaptation Signals Widget
export const WidgetAdaptationSignals: React.FC<{
  learnedPrefs: LearnedPreferences;
  onUpdateLearnedSignal: (signal: 'Sector' | 'Topology' | 'Depth', newValue: any) => void;
  onResetLearnedSignals: () => void;
  settings: {
    allowEditing?: boolean;
    showWeightMeters?: boolean;
  };
}> = ({ learnedPrefs, onUpdateLearnedSignal, onResetLearnedSignals, settings }) => {
  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Preferred Sector */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase">Learned Sector Bias</span>
          <div className="text-blue-400 font-bold text-sm truncate">
            {learnedPrefs.preferredSector || 'None (Uniform)'}
          </div>
          {settings.allowEditing && (
            <button
              onClick={() => onUpdateLearnedSignal('Sector', 'Infrastructure')}
              className="text-[10px] text-zinc-500 hover:text-white underline mt-1"
            >
              Reset to Neutral
            </button>
          )}
        </div>

        {/* Preferred Topology */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase">Preferred Topology</span>
          <div className="text-emerald-400 font-bold text-sm">
            {learnedPrefs.preferredTopology || 'Hybrid'}
          </div>
          {settings.allowEditing && (
            <button
              onClick={() => onUpdateLearnedSignal('Topology', 'Hybrid')}
              className="text-[10px] text-zinc-500 hover:text-white underline mt-1"
            >
              Set Hybrid
            </button>
          )}
        </div>

        {/* Preferred Depth */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase">Learned Tree Depth</span>
          <div className="text-purple-400 font-bold text-sm">
            Level {learnedPrefs.preferredDepth || 3}
          </div>
          {settings.allowEditing && (
            <button
              onClick={() => onUpdateLearnedSignal('Depth', 3)}
              className="text-[10px] text-zinc-500 hover:text-white underline mt-1"
            >
              Standardize (L3)
            </button>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500">
        <span>IMPLICIT REINFORCEMENT WITHOUT EXPLICIT RATING DIALOGS</span>
        <button
          onClick={onResetLearnedSignals}
          className="text-amber-400 hover:text-amber-300 font-bold underline"
        >
          Reset All Learned Weights
        </button>
      </div>
    </div>
  );
};
