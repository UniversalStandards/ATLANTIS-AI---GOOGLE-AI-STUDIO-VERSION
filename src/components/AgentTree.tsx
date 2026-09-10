import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Terminal, 
  Crown, 
  GitBranch, 
  Microscope, 
  Lightbulb, 
  Maximize2, 
  Cpu, 
  ShieldAlert, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp,
  Gauge,
  Search,
  X,
  Target
} from 'lucide-react';
import type { AgentNodeData, AgentRole, AccTier, CostComplexityTier } from '../types';

interface AgentTreeProps {
  nodes: Record<string, AgentNodeData>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  aggregateAccPercent: number;
  showSearchBar?: boolean;
  showAccPill?: boolean;
}

// Substring match highlighter
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  const trimmed = query.trim();
  if (!trimmed) return text;
  
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-amber-400/40 text-amber-100 px-0.5 rounded font-semibold shadow-sm">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const AgentTree: React.FC<AgentTreeProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  aggregateAccPercent,
  showSearchBar = true,
  showAccPill = true
}) => {
  const nodeIds = Object.keys(nodes);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' && 
        document.activeElement !== searchInputRef.current && 
        !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute matching nodes based on task, nodeId, role, output, and certaintyTag
  const matchingNodeIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return nodeIds.filter((id) => {
      const n = nodes[id];
      if (!n) return false;
      return (
        id.toLowerCase().includes(q) ||
        (n.task && n.task.toLowerCase().includes(q)) ||
        (n.output && n.output.toLowerCase().includes(q)) ||
        (n.streamingOutput && n.streamingOutput.toLowerCase().includes(q)) ||
        (n.role && n.role.toLowerCase().includes(q)) ||
        (n.certaintyTag && n.certaintyTag.toLowerCase().includes(q)) ||
        (n.costTier && n.costTier.toLowerCase().includes(q))
      );
    });
  }, [nodes, nodeIds, searchQuery]);

  // Auto-expand ancestors of matching nodes so they are always visible
  useEffect(() => {
    if (matchingNodeIds.length > 0) {
      setActiveMatchIndex(0);
      setCollapsedNodes((prev) => {
        const next = { ...prev };
        matchingNodeIds.forEach((id) => {
          let curr = nodes[id]?.parentId;
          while (curr) {
            next[curr] = false;
            curr = nodes[curr]?.parentId || null;
          }
        });
        return next;
      });
    } else {
      setActiveMatchIndex(0);
    }
  }, [searchQuery, matchingNodeIds]);

  const scrollToNode = (targetId: string) => {
    onSelectNode(targetId);
    // Ensure parent nodes are expanded
    setCollapsedNodes((prev) => {
      const next = { ...prev };
      let curr = nodes[targetId]?.parentId;
      while (curr) {
        next[curr] = false;
        curr = nodes[curr]?.parentId || null;
      }
      return next;
    });

    setTimeout(() => {
      const el = document.getElementById(`agent-node-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 50);
  };

  const handleNextMatch = () => {
    if (matchingNodeIds.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matchingNodeIds.length;
    setActiveMatchIndex(nextIdx);
    scrollToNode(matchingNodeIds[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (matchingNodeIds.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matchingNodeIds.length) % matchingNodeIds.length;
    setActiveMatchIndex(prevIdx);
    scrollToNode(matchingNodeIds[prevIdx]);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  };

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getRoleMeta = (role: AgentRole, depth: number) => {
    switch (role) {
      case 'supervisor':
        return {
          label: 'Root Supervisor',
          subLabel: 'Synthesizes & Decides',
          icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
          borderColor: 'border-blue-500/60 shadow-blue-500/10',
          badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
        };
      case 'mid_tier':
        return {
          label: `Sub-Supervisor [L${depth}]`,
          subLabel: 'Status & Recommendation',
          icon: <GitBranch className="w-3.5 h-3.5 text-indigo-400" />,
          borderColor: 'border-indigo-500/50 shadow-indigo-500/10',
          badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
        };
      case 'leaf':
      default:
        return {
          label: `Leaf Specialist [L${depth}]`,
          subLabel: 'Evidence-First Finding',
          icon: <Microscope className="w-3.5 h-3.5 text-emerald-400" />,
          borderColor: 'border-emerald-500/50 shadow-emerald-500/10',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
        };
    }
  };

  const getCostTierBadge = (tier?: CostComplexityTier) => {
    switch (tier) {
      case 'Deep-Reasoning':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/80';
      case 'Fast/Lightweight':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/80';
      case 'Balanced':
      default:
        return 'bg-blue-950/60 text-blue-300 border-blue-800/80';
    }
  };

  const getAccBadge = (tier?: AccTier, percent?: number) => {
    switch (tier) {
      case 'Emergency':
        return { style: 'bg-rose-950 text-rose-300 border-rose-700', label: `ACC: EMERGENCY (${percent || 96}%)` };
      case 'Aggressive':
        return { style: 'bg-orange-950 text-orange-300 border-orange-700', label: `ACC: AGGRESSIVE (${percent || 91}%)` };
      case 'Medium':
        return { style: 'bg-amber-950 text-amber-300 border-amber-700', label: `ACC: MEDIUM (${percent || 84}%)` };
      case 'Light':
        return { style: 'bg-cyan-950 text-cyan-300 border-cyan-700', label: `ACC: LIGHT (${percent || 74}%)` };
      case 'None':
      default:
        return { style: 'bg-zinc-800 text-zinc-400 border-zinc-700', label: `ACC: NONE (${percent || 32}%)` };
    }
  };

  const getCertaintyStyle = (confidence?: string) => {
    switch (confidence) {
      case 'Confirmed':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
      case 'Calculated Projection':
        return 'bg-blue-950/60 text-blue-400 border-blue-800/80';
      case 'Low Data Density':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/80';
      case 'Escalated':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/80';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const renderNode = (id: string) => {
    const node = nodes[id];
    if (!node) return null;

    const children = nodeIds.filter((cid) => nodes[cid].parentId === id);
    const isCollapsed = collapsedNodes[id];
    const roleMeta = getRoleMeta(node.role, node.depth);
    const isSelected = selectedNodeId === id;
    const accMeta = getAccBadge(node.accTier, node.accPercentage);

    // Search matching logic
    const isSearchActive = searchQuery.trim().length > 0;
    const isMatch = isSearchActive && matchingNodeIds.includes(id);
    const isFocusedMatch = isMatch && matchingNodeIds[activeMatchIndex] === id;

    // Children reporting status
    const childrenCount = node.childrenCount || children.length;
    const childrenReporting = node.childrenReporting || children.filter(c => nodes[c]?.status === 'complete').length;

    return (
      <div key={id} className="flex flex-col items-center animate-fade-in">
        {/* Node Card */}
        <div
          id={`agent-node-${id}`}
          onClick={() => onSelectNode(id)}
          className={`relative p-4 rounded-xl border transition-all cursor-pointer w-80 text-left select-none group shadow-lg ${
            isFocusedMatch
              ? 'ring-4 ring-amber-400 border-amber-300 bg-amber-950/30 shadow-2xl scale-[1.03] z-20'
              : isMatch
              ? 'ring-2 ring-amber-400/80 border-amber-400/80 bg-amber-950/20 shadow-lg scale-[1.01] z-10'
              : isSelected
              ? 'ring-2 ring-blue-400 border-blue-400 bg-zinc-900 shadow-2xl scale-[1.02]'
              : node.doomLoopState === 'escalated'
              ? 'border-rose-500 bg-rose-950/30 ring-1 ring-rose-500 shadow-rose-950/50'
              : node.doomLoopState === 'warned'
              ? 'border-amber-500 bg-amber-950/20'
              : node.status === 'running'
              ? 'border-blue-500/70 bg-blue-950/20 ring-1 ring-blue-500/50 animate-pulse'
              : node.status === 'complete'
              ? `${roleMeta.borderColor} bg-zinc-900/95 hover:border-zinc-500`
              : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
          } ${
            isSearchActive && !isMatch ? 'opacity-35 hover:opacity-100 transition-opacity grayscale-[25%]' : ''
          }`}
        >
          {/* Card Header */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {roleMeta.icon}
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border ${roleMeta.badgeBg}`}>
                {highlightMatch(roleMeta.label, searchQuery)}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                [{highlightMatch(node.nodeId, searchQuery)}]
              </span>

              {/* Match Highlights Badge */}
              {isFocusedMatch && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400 text-zinc-950 shadow-sm animate-pulse">
                  MATCH #{activeMatchIndex + 1}
                </span>
              )}
              {isMatch && !isFocusedMatch && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  MATCH
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {node.status === 'running' && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Streaming</span>
                </span>
              )}
              {node.status === 'complete' && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Done</span>
                </span>
              )}
              {node.status === 'queued' && (
                <span className="text-[10px] font-mono text-zinc-500">
                  Queued
                </span>
              )}
              {node.curiosityFactor && (
                <span title="Curiosity factor surfaced" className="p-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Lightbulb size={11} />
                </span>
              )}

              {/* Collapse/Expand button if children exist */}
              {children.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => toggleCollapse(id, e)}
                  className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 ml-1 transition-colors"
                  title={isCollapsed ? "Expand child agents" : "Collapse into parent synthesis"}
                >
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </button>
              )}

              <Maximize2 size={12} className="text-zinc-600 group-hover:text-zinc-300 transition-colors ml-0.5" />
            </div>
          </div>

          {/* Assigned Task Title with Search Highlight */}
          <div className="text-xs font-semibold text-zinc-200 line-clamp-1 mb-1 font-sans">
            {highlightMatch(node.task || 'Root Objective Analysis', searchQuery)}
          </div>

          {/* Fan-Out / Child Reporting Status Indicator */}
          {childrenCount > 0 && (
            <div className="text-[10px] font-mono text-zinc-400 mb-2 flex items-center justify-between bg-zinc-950/60 px-2 py-1 rounded border border-zinc-800">
              <span className="text-blue-300 font-semibold">
                Fan-out: {childrenReporting}/{childrenCount} children reporting
              </span>
              <span className="text-zinc-500">
                {childrenReporting === childrenCount ? 'All Reported' : 'Synthesizing'}
              </span>
            </div>
          )}

          {/* Live Streaming Token Preview with Search Highlight */}
          <div className="text-[11px] leading-relaxed text-zinc-300 line-clamp-2 mb-2.5 bg-zinc-950/70 p-2 rounded border border-zinc-800/80 font-mono">
            {node.streamingOutput || node.output ? (
              highlightMatch(
                (node.streamingOutput || node.output || '')
                  .replace(/\[Certainty:[^\]]+\]/i, '')
                  .replace(/Curiosity Factor:[^\n]+/i, '')
                  .trim(),
                searchQuery
              )
            ) : node.status === 'running' ? (
              'Streaming operational reasoning & child delegations...'
            ) : (
              'Standby for parent coordinator delegation.'
            )}
          </div>

          {/* Doom Loop Escalation Notice Banner */}
          {node.doomLoopState === 'escalated' && (
            <div className="mb-2 p-2 bg-rose-950/60 border border-rose-500 rounded text-[10px] font-mono text-rose-300 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <ShieldAlert size={12} className="text-rose-400" />
                <span>DOOM LOOP ESCALATION RAISED</span>
              </div>
              <p className="text-[9px] text-rose-200 leading-tight">
                Node repeated outputs twice. Branch paused for human review.
              </p>
            </div>
          )}

          {/* Tags & ACC Gauge Footer */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono">
              {/* Cost/Complexity Tier Badge */}
              <span className={`px-1.5 py-0.5 rounded border font-semibold ${getCostTierBadge(node.costTier)}`} title={node.routingRationale}>
                {node.costTier || 'Balanced'} ({node.complexityScore || 6}/10)
              </span>

              {/* ACC Meter Pill */}
              <span className={`px-1.5 py-0.5 rounded border font-semibold ${accMeta.style}`}>
                {accMeta.label}
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono">
              {node.certaintyTag ? (
                <span className={`px-1.5 py-0.5 rounded border line-clamp-1 max-w-[170px] truncate text-[9px] font-semibold ${getCertaintyStyle(node.confidence)}`}>
                  {highlightMatch(node.certaintyTag, searchQuery)}
                </span>
              ) : (
                <span className="text-zinc-500 text-[10px]">ROLE: {node.role.toUpperCase()}</span>
              )}

              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                {node.latencyMs ? <span>{node.latencyMs}ms</span> : null}
              </div>
            </div>
          </div>
        </div>

        {/* Child Connectors & Sub-Branches */}
        {children.length > 0 && !isCollapsed && (
          <div className="flex flex-col items-center mt-3 animate-fade-in">
            {/* Vertical stem down from parent */}
            <div className="w-px h-5 bg-zinc-700/80" />

            {/* Horizontal branch bar across all children */}
            <div className="flex relative items-start gap-8 pt-4">
              {children.length > 1 && (
                <div 
                  className="absolute top-0 h-px bg-zinc-700/80"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `calc(100% - 20rem)`
                  }}
                />
              )}

              {children.map((childId) => (
                <div key={childId} className="flex flex-col items-center relative">
                  <div className="absolute top-[-16px] w-px h-4 bg-zinc-700/80" />
                  {renderNode(childId)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8 bg-[#09090b] relative flex flex-col justify-start">
      {/* Background Dot Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Controls: Search Bar & Aggregate Mission ACC Meter */}
      {(showSearchBar || (showAccPill && nodes['root'])) && (
        <div className="max-w-4xl mx-auto w-full mb-6 relative z-20 space-y-2.5">
          {/* Interactive Search Bar */}
          {showSearchBar && (
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3 shadow-xl backdrop-blur-md">
              <div className="flex-1 flex items-center gap-2.5">
                <Search size={15} className={searchQuery ? 'text-amber-400' : 'text-zinc-500'} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search agent tree by task, keyword, role, or ID... (Press / to focus)"
                  className="flex-1 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-mono"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors"
                    title="Clear search query"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Search Result Count & Navigation Controls */}
              {searchQuery.trim().length > 0 ? (
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    matchingNodeIds.length > 0
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {matchingNodeIds.length > 0
                      ? `${activeMatchIndex + 1} of ${matchingNodeIds.length} matches`
                      : '0 matches'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMatch}
                      disabled={matchingNodeIds.length === 0}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-300 transition-colors"
                      title="Previous match (Shift + Enter)"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMatch}
                      disabled={matchingNodeIds.length === 0}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-300 transition-colors"
                      title="Next match (Enter)"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono">
                    /
                  </kbd>
                  <span>quick search</span>
                </div>
              )}
            </div>
          )}

          {/* Aggregate Mission ACC Meter Banner */}
          {showAccPill && nodes['root'] && (
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs font-mono backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-blue-400" />
              <span className="text-zinc-400 uppercase font-semibold text-[11px]">
                Aggregate Mission Context Compaction (ACC):
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAccBadge(aggregateAccPercent >= 95 ? 'Emergency' : aggregateAccPercent >= 90 ? 'Aggressive' : aggregateAccPercent >= 80 ? 'Medium' : aggregateAccPercent >= 70 ? 'Light' : 'None', aggregateAccPercent).style}`}>
                {aggregateAccPercent}% CAPACITY
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
              <span>ACTIVE NODES: <strong className="text-zinc-300">{nodeIds.length}</strong></span>
              <span className="hidden sm:inline">CAP FAN-OUT: <strong className="text-zinc-300">4 / NODE</strong></span>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Tree Canvas */}
      <div className="flex justify-center min-w-max relative z-10 my-auto py-4">
        {nodes['root'] ? (
          renderNode('root')
        ) : (
          <div className="text-zinc-600 flex flex-col items-center justify-center my-20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-500 shadow-inner">
              <Terminal size={32} className="opacity-40" />
            </div>
            <h3 className="font-mono text-sm uppercase tracking-widest text-zinc-400 font-semibold mb-1">
              Atlantis Coordination Standby
            </h3>
            <p className="text-xs text-zinc-600 max-w-sm text-center leading-relaxed">
              Define your mission objective above or choose a preset scenario to deploy the recursive intelligence tree.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
