import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, Clock, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { AgentNodeData } from '../../types';

// 1. Live Telemetry Event Stream Widget
export const WidgetTelemetryStream: React.FC<{
  logs: Array<{ id: string; timestamp: number; message: string; type: 'info' | 'warn' | 'error' | 'success' }>;
  settings: {
    filterLevel?: 'all' | 'info' | 'warn' | 'error' | 'success';
    fontSize?: 'sm' | 'xs' | 'tiny';
    autoScroll?: boolean;
    maxLines?: number;
  };
}> = ({ logs, settings }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((l) => {
    if (!settings.filterLevel || settings.filterLevel === 'all') return true;
    return l.type === settings.filterLevel;
  }).slice(-(settings.maxLines || 80));

  useEffect(() => {
    if (settings.autoScroll !== false && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, settings.autoScroll]);

  const fontClasses = {
    sm: 'text-xs',
    xs: 'text-[11px]',
    tiny: 'text-[10px]',
  }[settings.fontSize || 'xs'];

  return (
    <div className="p-3 h-full flex flex-col justify-between space-y-2 font-mono">
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto space-y-1 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 ${fontClasses}`}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-zinc-600 text-center py-8">
            No telemetry events recorded under filter &ldquo;{settings.filterLevel || 'all'}&rdquo;.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            const colorClass = {
              info: 'text-zinc-300',
              warn: 'text-amber-400 font-bold',
              error: 'text-rose-400 font-bold',
              success: 'text-emerald-400',
            }[log.type];

            return (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-zinc-600 shrink-0 select-none">[{timeStr}]</span>
                <span className="text-zinc-500 uppercase text-[9px] px-1 rounded bg-zinc-900 shrink-0 select-none">
                  {log.type}
                </span>
                <span className={`break-words ${colorClass}`}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
      <div className="text-[10px] text-zinc-500 flex justify-between px-1">
        <span>SHOWING {filteredLogs.length} OF {logs.length} EVENTS</span>
        <span>FILTER: {settings.filterLevel?.toUpperCase() || 'ALL'}</span>
      </div>
    </div>
  );
};

// 2. Doom Loop Sentinel Widget
export const WidgetDoomLoopMonitor: React.FC<{
  nodes: Record<string, AgentNodeData>;
  settings: {
    strictThreshold?: boolean;
    showFingerprints?: boolean;
  };
  onOverrideDoomLoop?: (id: string) => void;
}> = ({ nodes, settings, onOverrideDoomLoop }) => {
  const nodeIds = Object.keys(nodes);
  const warnedNodes = nodeIds.filter((id) => nodes[id].doomLoopState === 'warned');
  const escalatedNodes = nodeIds.filter((id) => nodes[id].doomLoopState === 'escalated');

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="space-y-3 overflow-y-auto pr-1">
        {/* Overall Health Status */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase">Sentinel Status</span>
            <div className={`font-bold mt-0.5 ${
              escalatedNodes.length > 0 ? 'text-rose-400' :
              warnedNodes.length > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {escalatedNodes.length > 0 ? 'ESCALATION ACTIVE' :
               warnedNodes.length > 0 ? 'WARNING NOTED' : 'NOMINAL / MONITORED'}
            </div>
          </div>
          <ShieldAlert size={20} className={
            escalatedNodes.length > 0 ? 'text-rose-400 animate-pulse' :
            warnedNodes.length > 0 ? 'text-amber-400' : 'text-emerald-400'
          } />
        </div>

        {/* Escalated Nodes Alerts */}
        {escalatedNodes.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] text-rose-400 uppercase font-bold">Escalated Nodes:</span>
            {escalatedNodes.map((id) => (
              <div key={id} className="p-2.5 bg-rose-950/40 border border-rose-500 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-zinc-200">
                  <span className="font-bold">[{id}]</span>
                  <span className="text-[9px] px-1 rounded bg-rose-900 text-rose-200">PAUSED</span>
                </div>
                <p className="text-[10px] text-zinc-300 font-sans">
                  Repetitive reasoning loops detected. Branch requires human confirmation.
                </p>
                {onOverrideDoomLoop && (
                  <button
                    onClick={() => onOverrideDoomLoop(id)}
                    className="w-full py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                  >
                    Clear & Resume Branch
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fingerprint Tracker */}
        {settings.showFingerprints && (
          <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 text-[11px]">
            <span className="text-zinc-500 uppercase text-[10px]">Tracked Agent Fingerprints</span>
            <div className="text-zinc-400 text-[10px]">
              {nodeIds.length > 0 ? `${nodeIds.length} nodes hashed against 3-step semantic windows` : 'No active agent hashes'}
            </div>
          </div>
        )}
      </div>

      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 flex justify-between">
        <span>DOOM-LOOP PREVENTION</span>
        <span>ZERO PERPETUAL LOOPS</span>
      </div>
    </div>
  );
};

// 3. Latency Analytics Widget
export const WidgetLatencyAnalytics: React.FC<{
  nodes: Record<string, AgentNodeData>;
  settings: {
    displayUnit?: 'ms' | 'seconds';
    sortBy?: 'latency' | 'nodeId';
  };
}> = ({ nodes, settings }) => {
  const nodeIds = Object.keys(nodes);
  const items = nodeIds.map((id) => ({
    id,
    task: nodes[id].task,
    role: nodes[id].role,
    latency: nodes[id].latencyMs || 0,
  }));

  if (settings.sortBy === 'latency') {
    items.sort((a, b) => b.latency - a.latency);
  }

  const formatTime = (ms: number) => {
    if (settings.displayUnit === 'seconds') {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
  };

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-2 font-mono text-xs">
      <div className="overflow-y-auto space-y-1.5 max-h-56 pr-1">
        {items.length === 0 ? (
          <div className="text-center py-6 text-zinc-500">No agent telemetry yet</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-between"
            >
              <div className="truncate pr-2">
                <span className="text-zinc-200 font-bold">[{item.id}]</span>{' '}
                <span className="text-zinc-400 text-[11px] truncate">{item.task}</span>
              </div>
              <span className="text-blue-400 font-bold shrink-0">{formatTime(item.latency)}</span>
            </div>
          ))
        )}
      </div>
      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 flex justify-between">
        <span>TOTAL RECORDED: {items.length}</span>
        <span>UNIT: {settings.displayUnit || 'ms'}</span>
      </div>
    </div>
  );
};
