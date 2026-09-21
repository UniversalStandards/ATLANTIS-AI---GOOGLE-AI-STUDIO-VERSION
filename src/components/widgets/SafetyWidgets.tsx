import React from 'react';
import { ShieldCheck, Lock, Shield, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { SafetyStripResult, SafetyAuditLog, RegisterMode, UniversalMode } from '../../types';
import { UNIVERSAL_MODES } from '../../config/universalModes';

// 1. Safety Strip 5-Step Audit Widget
export const WidgetSafetyStripAudit: React.FC<{
  safetyStrip: SafetyStripResult;
  settings: {
    showScores?: boolean;
    showDetails?: boolean;
  };
}> = ({ safetyStrip, settings }) => {
  const steps = [
    { name: 'Input Validation', data: safetyStrip.inputValidation },
    { name: 'Classification Guard', data: safetyStrip.classificationGuard },
    { name: 'Tool Execution Sandboxing', data: safetyStrip.toolExecutionSandboxing },
    { name: 'Output Review & Hedging Check', data: safetyStrip.outputReview },
    { name: 'Immutable Audit Logging', data: safetyStrip.auditLogging },
  ];

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="space-y-2 overflow-y-auto pr-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-bold">0{idx + 1}.</span>
                <span className="text-zinc-200 font-semibold">{step.name}</span>
              </div>
              {settings.showDetails !== false && (
                <p className="text-[10px] text-zinc-400 font-sans pl-6">
                  {step.data?.detail || 'Nominal verification completed under standard protocol.'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {settings.showScores !== false && step.data && (
                <span className="text-emerald-400 font-bold text-[11px]">
                  {step.data.score}/100
                </span>
              )}
              {step.data?.passed !== false ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-rose-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 flex justify-between">
        <span>FAIL-CLOSED ARCHITECTURE</span>
        <span>5-STEP SEQUENTIAL DEFENSE</span>
      </div>
    </div>
  );
};

// 2. Classification Guard Widget
export const WidgetClassificationGuard: React.FC<{
  registerMode: RegisterMode;
  isGovSector?: boolean;
  settings: {
    showRegisterBadge?: boolean;
    showZeroHedgingStatus?: boolean;
  };
}> = ({ registerMode, isGovSector, settings }) => {
  const isSpecificUniversal = ['everyday', 'small_business', 'enterprise', 'local_gov', 'federal'].includes(registerMode as string);
  const activeUniversal = isSpecificUniversal ? UNIVERSAL_MODES[registerMode as UniversalMode] : null;

  const modeDisplayLabel = activeUniversal
    ? activeUniversal.badge
    : isGovSector || registerMode === 'government'
    ? 'GOVERNMENT / PROCEDURAL'
    : 'UNIVERSAL / CIV-FIRST';

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="space-y-3 overflow-y-auto pr-1">
        {/* Active Register */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase">Operational Register</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-white">
              {modeDisplayLabel}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              activeUniversal
                ? `${activeUniversal.theme.badgeBg} ${activeUniversal.theme.badgeText} border ${activeUniversal.theme.accentBorder}`
                : isGovSector
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
            }`}>
              {registerMode.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Zero-Hedging Discipline */}
        {settings.showZeroHedgingStatus !== false && (
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">Certainty Discipline</span>
            <div className="text-emerald-400 font-bold text-xs">
              Direct Synthesis Protocol Active
            </div>
            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed mt-1">
              Reflexive conversational filler (&ldquo;I&rsquo;d be happy to help&rdquo;, polite hedges) strictly prohibited across all autonomous nodes.
            </p>
          </div>
        )}
      </div>

      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 flex justify-between">
        <span>STRICT TONE BOUNDARY</span>
        <span>{activeUniversal ? `VERIFIED ${activeUniversal.shortLabel.toUpperCase()}` : 'VERIFIED UNIVERSAL'}</span>
      </div>
    </div>
  );
};

// 3. Safety Audit Logs Widget
export const WidgetSafetyAuditLogs: React.FC<{
  safetyLogs: SafetyAuditLog[];
  settings: {
    statusFilter?: 'all' | 'escalated_only' | 'nominal_only';
    maxLogs?: number;
  };
}> = ({ safetyLogs, settings }) => {
  const filtered = safetyLogs.filter((log) => {
    if (settings.statusFilter === 'escalated_only') return log.status === 'escalated';
    if (settings.statusFilter === 'nominal_only') return log.status === 'nominal';
    return true;
  }).slice(0, settings.maxLogs || 10);

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-2 font-mono text-xs">
      <div className="overflow-y-auto space-y-2 pr-1 flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No safety audit logs recorded.
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200 font-bold">[{log.checkType}]</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                    log.status === 'escalated' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">{log.details}</p>
              </div>
              <span className="text-[9px] text-zinc-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800 flex justify-between">
        <span>IMMUTABLE SAFETY LEDGER</span>
        <span>TOTAL: {filtered.length} EVENTS</span>
      </div>
    </div>
  );
};
