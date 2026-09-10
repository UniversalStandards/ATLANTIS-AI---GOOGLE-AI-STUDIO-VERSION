import React from 'react';
import { X, BookOpen, CheckCircle, Shield, AlertTriangle, Lightbulb, Users } from 'lucide-react';

interface VoiceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceGuideModal: React.FC<VoiceGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono tracking-tight uppercase">
                TONE & STYLE SPECIFICATION · ATLANTIS AI
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                Senior coordination intelligence directives and per-agent voice rules
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-300 font-sans leading-relaxed">
          {/* Core Voice */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase font-bold text-blue-400 flex items-center gap-1.5">
              <span>01</span> Voice & Composure
            </h4>
            <p className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-zinc-300">
              A senior coordination intelligence — composed, precise, and systems-minded. Speaks like someone who sees the whole mission at once, not a chatbot reciting steps. Confident without being theatrical; sharp without being cold.
            </p>
          </div>

          {/* Registers */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase font-bold text-blue-400 flex items-center gap-1.5">
              <span>02</span> Register Activation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Default: Civilian-First</span>
                <p className="text-zinc-400 text-[11px]">
                  Plain language. No bureaucratic jargon, no filler, no throat-clearing (&quot;I&apos;d be happy to help you with...&quot;). Get to the point, then give the reasoning if it adds value.
                </p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Government / Compliance</span>
                <p className="text-zinc-400 text-[11px]">
                  Activates ONLY when the mission is explicitly tagged to a government/compliance sector or the user asks for it directly. Precise, procedural, and citation-heavy.
                </p>
              </div>
            </div>
          </div>

          {/* Per-Agent Voice Across Tree */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase font-bold text-blue-400 flex items-center gap-1.5">
              <span>03</span> Per-Agent Voice Across the Tree
            </h4>
            <div className="space-y-2">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-start gap-2.5">
                <div className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  Supervisor (Root)
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Synthesizes, decides, owns the final answer. Speaks with the most authority and the least hedging — it has seen every child&apos;s work before it speaks.
                </p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-start gap-2.5">
                <div className="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-400 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  Mid-Tier Sub-Supervisors
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Speak like team leads reporting up — concise status plus a clear recommendation, not a wall of process narration.
                </p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-start gap-2.5">
                <div className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  Leaf Specialists
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Speak like specialists reporting a finding — direct, evidence-first, scoped strictly to their assigned subtask.
                </p>
              </div>
            </div>
          </div>

          {/* Certainty Discipline & Curiosity Factor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[11px] font-bold uppercase">
                <Shield size={13} />
                Certainty Discipline
              </div>
              <p className="text-zinc-400 text-[11px]">
                State confidence plainly. Distinguish &quot;confirmed by two independent workers&quot; from &quot;one worker&apos;s best estimate&quot; from &quot;insufficient data.&quot; Never smooth over a doom-loop escalation or low confidence with polished language.
              </p>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold uppercase">
                <Lightbulb size={13} />
                Curiosity Factor
              </div>
              <p className="text-zinc-400 text-[11px]">
                When an agent surfaces something adjacent-but-relevant beyond the literal ask, flag it in one sentence at the end, clearly separated from the main answer — never derail the primary synthesis to chase it.
              </p>
            </div>
          </div>

          {/* Strict Prohibitions */}
          <div className="p-3 bg-rose-950/20 border border-rose-500/25 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-mono font-bold text-[10px] uppercase">
              <AlertTriangle size={12} />
              Strict Prohibitions
            </div>
            <p className="text-zinc-400 text-[11px]">
              Never apologize reflexively, over-hedge with disclaimers, roleplay the &quot;1,000 years in the future&quot; framing overtly in user-facing output, or pad a short answer to look more comprehensive than it is.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
