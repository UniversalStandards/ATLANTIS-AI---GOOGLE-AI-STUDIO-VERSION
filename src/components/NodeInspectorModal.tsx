import React from 'react';
import { 
  X, 
  Crown, 
  GitBranch, 
  Microscope, 
  ShieldCheck, 
  Lightbulb, 
  Clock, 
  Cpu, 
  Copy, 
  Check, 
  Layers,
  Gauge,
  ShieldAlert,
  AlertTriangle,
  Play,
  XCircle
} from 'lucide-react';
import type { AgentNodeData } from '../types';

interface NodeInspectorModalProps {
  node: AgentNodeData | null;
  onClose: () => void;
  onOverrideDoomLoop?: (nodeId: string) => void;
  onAbortBranch?: (nodeId: string) => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({ 
  node, 
  onClose,
  onOverrideDoomLoop,
  onAbortBranch
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!node) return null;

  const handleCopy = () => {
    if (!node.output) return;
    navigator.clipboard.writeText(node.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadge = () => {
    switch (node.role) {
      case 'supervisor':
        return {
          title: 'Root Supervisor',
          desc: 'Synthesizes, decides, and owns the final answer with zero hedging.',
          icon: <Crown className="text-amber-400 w-4 h-4" />,
          color: 'border-blue-500/40 bg-blue-500/10 text-blue-300'
        };
      case 'mid_tier':
        return {
          title: 'Mid-Tier Sub-Supervisor',
          desc: 'Team lead reporting up: concise status plus clear recommendation.',
          icon: <GitBranch className="text-indigo-400 w-4 h-4" />,
          color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
        };
      case 'leaf':
      default:
        return {
          title: 'Leaf Specialist Agent',
          desc: 'Direct, evidence-first finding scoped strictly to assigned subtask.',
          icon: <Microscope className="text-emerald-400 w-4 h-4" />,
          color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
        };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border flex items-center justify-center ${roleBadge.color}`}>
              {roleBadge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono tracking-tight">
                  AGENT NODE [{node.nodeId}]
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  DEPTH {node.depth} / {node.maxDepth || 3}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                {roleBadge.title} · {roleBadge.desc}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-sans">
          {/* Doom Loop Escalation Intervention Card if active */}
          {node.doomLoopState === 'escalated' && (
            <div className="p-4 bg-rose-950/40 border border-rose-500 rounded-xl space-y-3 font-mono">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <ShieldAlert size={16} className="text-rose-400" />
                <span>HUMAN-REVIEW REQUIRED: DOOM LOOP ESCALATION</span>
              </div>
              <p className="text-[11px] text-rose-200 leading-relaxed font-sans">
                This agent produced identical semantic output fingerprints across consecutive reasoning passes. The coordination engine paused this branch to prevent loop runaway.
              </p>
              <div className="flex items-center gap-3 pt-1">
                {onOverrideDoomLoop && (
                  <button
                    onClick={() => onOverrideDoomLoop(node.nodeId)}
                    className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Play size={12} />
                    <span>Override & Resume Branch</span>
                  </button>
                )}
                {onAbortBranch && (
                  <button
                    onClick={() => onAbortBranch(node.nodeId)}
                    className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle size={12} />
                    <span>Abort Sub-Branch</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Assigned Subtask */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
              Assigned Objective
            </span>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-200 text-sm font-medium leading-relaxed">
              {node.task || 'Root mission directive'}
            </div>
          </div>

          {/* Cost/Complexity Router Assignment */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1.5 font-mono">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                <Cpu size={12} className="text-purple-400" />
                Cost/Complexity Router
              </span>
              <span className="text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/25">
                {node.costTier || 'Balanced Tier'} (Score: {node.complexityScore || 6}/10)
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 font-sans">
              {node.routingRationale || 'Standard balanced tier allocated based on task operational scope.'}
            </p>
          </div>

          {/* Metric Grid: ACC Meter, Confidence, Latency, Parent Link */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono">ACC COMPACTION</span>
              <div className="flex items-center gap-1.5 text-blue-400 font-mono font-bold text-xs">
                <Gauge size={13} />
                <span>{node.accTier || 'None'} ({node.accPercentage || 28}%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono">CONFIDENCE</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs">
                <ShieldCheck size={13} />
                <span>{node.confidence || 'Confirmed'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono">LATENCY</span>
              <div className="flex items-center gap-1 text-zinc-300 font-mono font-bold text-xs">
                <Clock size={13} className="text-blue-400" />
                <span>{node.latencyMs || 240}ms</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono">PARENT LINK</span>
              <div className="flex items-center gap-1 text-zinc-300 font-mono font-bold text-xs">
                <Layers size={13} className="text-amber-400" />
                <span>{node.parentId || 'Root'}</span>
              </div>
            </div>
          </div>

          {/* Certainty Tag */}
          {node.certaintyTag && (
            <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center gap-2">
              <span className="text-zinc-500 uppercase">Certainty Discipline:</span>
              <span className="text-emerald-400 font-bold">{node.certaintyTag}</span>
            </div>
          )}

          {/* Full Agent Output / Reasoning */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                Agent Output & Synthesis
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 font-mono text-xs leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
              {node.output || node.streamingOutput || 'Awaiting reasoning execution...'}
            </div>
          </div>

          {/* Google Search Grounding Citations */}
          {node.grounding && node.grounding.sources && node.grounding.sources.length > 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-tight flex items-center gap-1.5">
                  Verified Google Search Grounding Sources ({node.grounding.sources.length})
                </span>
                {node.grounding.queries && node.grounding.queries.length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    Query: &ldquo;{node.grounding.queries[0]}&rdquo;
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {node.grounding.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-blue-300 text-[11px] font-mono border border-zinc-700/60 transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{source.title || source.uri}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Curiosity Factor */}
          {node.curiosityFactor && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold uppercase">
                <Lightbulb size={13} />
                <span>Curiosity Factor Surfaced</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {node.curiosityFactor}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
