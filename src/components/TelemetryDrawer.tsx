import React from 'react';
import { X, Terminal as TerminalIcon, Shield, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: Array<{ id: string; time: string; text: string; level: 'info' | 'warn' | 'success' }>;
  onClearLogs?: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/95 font-mono text-xs z-30 transition-all">
      <div className="px-6 py-2.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-blue-400" />
          <span className="font-bold text-zinc-300 text-[11px] uppercase tracking-wider">
            Live Coordination Telemetry Stream ({logs.length} events)
          </span>
        </div>

        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 max-h-48 overflow-y-auto space-y-1.5 bg-black/40">
        {logs.length === 0 ? (
          <p className="text-zinc-600 text-[11px] italic">
            Telemetry stream standby. No delegation events logged yet.
          </p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-[11px] leading-snug">
              <span className="text-zinc-600 shrink-0">[{log.time}]</span>
              {log.level === 'success' ? (
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : log.level === 'warn' ? (
                <AlertCircle size={12} className="text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
              )}
              <span className={
                log.level === 'success' 
                  ? 'text-emerald-300' 
                  : log.level === 'warn' 
                  ? 'text-amber-300' 
                  : 'text-zinc-300'
              }>
                {log.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
