import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Zap, 
  AlertTriangle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { getActiveImportedConversations, toggleConversationActive } from '../../db';
import type { ImportedConversation } from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';

interface ActiveContextMatrixWidgetProps {
  settings?: {
    showTokenEstimator?: boolean;
    [key: string]: any;
  };
  currentUser?: FirebaseUser | null;
}

export const ActiveContextMatrixWidget: React.FC<ActiveContextMatrixWidgetProps> = ({
  settings,
  currentUser
}) => {
  const [activeConversations, setActiveConversations] = useState<ImportedConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActive = async () => {
    try {
      const active = await getActiveImportedConversations(currentUser?.uid);
      setActiveConversations(active);
    } catch (err) {
      console.error('Failed to load active context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActive();
    // Re-check periodically or on storage event
    const interval = setInterval(loadActive, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleDeactivate = async (convId: string) => {
    try {
      await toggleConversationActive(convId, false, currentUser?.uid);
      setActiveConversations(prev => prev.filter(c => c.id !== convId));
    } catch (err) {
      console.error('Deactivate failed:', err);
    }
  };

  const handleDeactivateAll = async () => {
    try {
      for (const c of activeConversations) {
        await toggleConversationActive(c.id, false, currentUser?.uid);
      }
      setActiveConversations([]);
    } catch (err) {
      console.error('Deactivate all failed:', err);
    }
  };

  // Compute character & token estimates
  const totalCharacters = activeConversations.reduce((sum, c) => {
    const textLen = c.messages.reduce((mSum, m) => mSum + m.content.length, 0);
    return sum + textLen;
  }, 0);

  // Rough estimate: ~4 characters per token
  const estimatedTokens = Math.round(totalCharacters / 4);
  const maxTokenContextBudget = 128000; // Gemini 128k context window budget
  const contextUsedPercent = Math.min(100, Math.round((estimatedTokens / maxTokenContextBudget) * 100));

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-950/60 border border-blue-800 text-blue-400">
            <Zap size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-200 font-mono">
              Live Supervisor Grounding Context
            </h4>
            <p className="text-[11px] text-zinc-500 font-sans">
              External dialogues active in current memory prompt & root synthesis.
            </p>
          </div>
        </div>

        {activeConversations.length > 0 && (
          <button
            onClick={handleDeactivateAll}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[11px] font-mono flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Deactivate All</span>
          </button>
        )}
      </div>

      {/* Context Footprint Gauges */}
      {settings?.showTokenEstimator !== false && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Active Threads</span>
            <span className="text-base font-bold font-mono text-blue-400">
              {activeConversations.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Est. Token Load</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold font-mono text-emerald-400">
                ~{estimatedTokens.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">/ 128k</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Context Gauge</span>
            <div className="space-y-1">
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(4, contextUsedPercent)}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-zinc-400">{contextUsedPercent}% Capacity</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Conversation Pill List */}
      <div className="flex-1 min-h-[60px] overflow-y-auto">
        {loading ? (
          <div className="text-zinc-500 font-mono text-xs py-2">Loading active context...</div>
        ) : activeConversations.length === 0 ? (
          <div className="p-4 rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 text-center text-zinc-500 space-y-1">
            <BookOpen size={18} className="mx-auto text-zinc-600 stroke-[1.5]" />
            <p className="font-mono text-xs text-zinc-400">No active external conversations loaded.</p>
            <p className="text-[11px] text-zinc-600">
              Toggle conversations in the Archive or drop new exports to inject into supervisor debriefs.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {activeConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-blue-500/40 text-zinc-200 text-xs shadow-sm font-mono"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="font-semibold truncate max-w-[200px]">{conv.title}</span>
                <span className="text-[10px] text-zinc-400 uppercase bg-zinc-800 px-1.5 py-0.5 rounded">
                  {conv.platform}
                </span>
                <button
                  onClick={() => handleDeactivate(conv.id)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors ml-1"
                  title="Remove from active context"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
