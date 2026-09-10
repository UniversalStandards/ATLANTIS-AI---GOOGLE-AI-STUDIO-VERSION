import React from 'react';
import { 
  GitBranch, 
  Microscope, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Lightbulb, 
  Cpu, 
  Clock 
} from 'lucide-react';
import type { AgentNodeData } from '../../types';
import { AgentTree } from '../AgentTree';

// 1. Agent Tree Canvas Widget
export const WidgetAgentTreeCanvas: React.FC<{
  nodes: Record<string, AgentNodeData>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  aggregateAccPercent: number;
  settings: {
    showSearchBar?: boolean;
    showAccPill?: boolean;
    density?: 'comfortable' | 'compact';
    showLatencyBadge?: boolean;
  };
}> = ({ nodes, selectedNodeId, onSelectNode, aggregateAccPercent, settings }) => {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative">
      <AgentTree
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
        aggregateAccPercent={aggregateAccPercent}
        showSearchBar={settings?.showSearchBar !== false}
        showAccPill={settings?.showAccPill !== false}
      />
    </div>
  );
};

// 2. Node Inspector Widget
export const WidgetNodeInspector: React.FC<{
  node: AgentNodeData | null;
  onOverrideDoomLoop?: (id: string) => void;
  onAbortBranch?: (id: string) => void;
  settings: {
    showGroundingSources?: boolean;
    showFingerprints?: boolean;
    autoSelectRoot?: boolean;
  };
}> = ({ node, onOverrideDoomLoop, onAbortBranch, settings }) => {
  const [copied, setCopied] = React.useState(false);

  if (!node) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center text-zinc-500 font-mono text-xs space-y-2">
        <Microscope size={28} className="opacity-30 text-zinc-400" />
        <p>No agent node selected.</p>
        <span className="text-[11px] text-zinc-600">
          Click any node on the tree canvas to inspect reasoning, metrics, and evidence.
        </span>
      </div>
    );
  }

  const handleCopy = () => {
    if (!node.output) return;
    navigator.clipboard.writeText(node.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 overflow-y-auto">
      <div className="space-y-3">
        {/* Node Title & Depth Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-200 font-bold">[{node.nodeId}]</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
              DEPTH {node.depth} / {node.maxDepth || 3}
            </span>
          </div>
          <span className="text-blue-400 uppercase font-bold text-[10px]">
            {node.role.toUpperCase()}
          </span>
        </div>

        {/* Assigned Objective */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
            Assigned Objective
          </span>
          <p className="text-xs text-zinc-200 font-sans leading-relaxed">
            {node.task || 'Root mission directive'}
          </p>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">Certainty</span>
            <span className="text-emerald-400 font-bold">{node.confidence || 'Confirmed'}</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">Latency</span>
            <span className="text-blue-400 font-bold">{node.latencyMs || 240}ms</span>
          </div>
        </div>

        {/* Live Reasoning Output */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span className="uppercase font-bold">Agent Synthesis</span>
            <button
              onClick={handleCopy}
              className="text-zinc-400 hover:text-white flex items-center gap-1"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 font-mono text-[11px] leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
            {node.output || node.streamingOutput || 'Reasoning in progress...'}
          </div>
        </div>

        {/* Search Grounding Citations */}
        {settings.showGroundingSources !== false && node.grounding?.sources && node.grounding.sources.length > 0 && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-blue-400 font-bold">
              <span>Google Search Grounding ({node.grounding.sources.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {node.grounding.sources.map((s, idx) => (
                <a
                  key={idx}
                  href={s.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-blue-300 text-[10px] border border-zinc-700/60 truncate max-w-[180px]"
                >
                  {s.title || s.uri}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Doom loop fingerprints */}
        {settings.showFingerprints && node.outputFingerprints && (
          <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-400 space-y-1">
            <span className="text-zinc-500 font-bold block">Token Fingerprints:</span>
            <div className="flex flex-wrap gap-1">
              {node.outputFingerprints.map((fp, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                  {fp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions if escalated */}
      {node.doomLoopState === 'escalated' && onOverrideDoomLoop && (
        <div className="pt-2 border-t border-zinc-800">
          <button
            onClick={() => onOverrideDoomLoop(node.nodeId)}
            className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold"
          >
            Override Doom Loop Escalation
          </button>
        </div>
      )}
    </div>
  );
};

// 3. Branch Metrics Widget
export const WidgetBranchMetrics: React.FC<{
  nodes: Record<string, AgentNodeData>;
  settings: {
    showDepthDistribution?: boolean;
    showFanOutStats?: boolean;
  };
}> = ({ nodes, settings }) => {
  const nodeIds = Object.keys(nodes);
  const byDepth: Record<number, number> = {};
  nodeIds.forEach((id) => {
    const d = nodes[id].depth || 1;
    byDepth[d] = (byDepth[d] || 0) + 1;
  });

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-2 text-xs font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-500 block uppercase">Level 1 (Supervisor)</span>
          <div className="text-lg font-bold text-amber-400 mt-0.5">{byDepth[1] || 0}</div>
        </div>
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-500 block uppercase">Level 2 (Sub-Supervisors)</span>
          <div className="text-lg font-bold text-indigo-400 mt-0.5">{byDepth[2] || 0}</div>
        </div>
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-500 block uppercase">Level 3 (Specialists)</span>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{byDepth[3] || 0}</div>
        </div>
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-500 block uppercase">Level 4 (Micro-Leaves)</span>
          <div className="text-lg font-bold text-cyan-400 mt-0.5">{byDepth[4] || 0}</div>
        </div>
      </div>
      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 flex justify-between">
        <span>MAX FAN-OUT: 4 CHILDREN / PARENT</span>
        <span>SUPERVISOR OWNS FINAL VERDICT</span>
      </div>
    </div>
  );
};
