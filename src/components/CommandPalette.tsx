import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  Layers, 
  BookOpen, 
  RotateCcw, 
  Download, 
  FileText, 
  FileCode, 
  Sliders, 
  Sparkles,
  Command,
  LayoutDashboard,
  GitBranch,
  Database,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { db } from '../db';
import type { MissionData, PageCategory } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMissionPrompt: (prompt: string, sector?: string) => void;
  onOpenVoiceGuide: () => void;
  onToggleTerminal: () => void;
  onResetPreferences: () => void;
  onNavigatePage?: (category: PageCategory) => void;
  activeMission: MissionData | null;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectMissionPrompt,
  onOpenVoiceGuide,
  onToggleTerminal,
  onResetPreferences,
  onNavigatePage,
  activeMission
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pastMissions, setPastMissions] = useState<MissionData[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      db.missions.reverse().limit(10).toArray().then(setPastMissions);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    // Page Navigation
    ...(onNavigatePage ? [
      {
        id: 'nav-dash',
        title: 'Navigate: Mission Hub / Executive Dashboard',
        category: 'Navigation',
        icon: <LayoutDashboard size={14} className="text-blue-400" />,
        run: () => { onNavigatePage('dashboard'); onClose(); }
      },
      {
        id: 'nav-tree',
        title: 'Navigate: Agent Tree & Recursive Hierarchy Canvas',
        category: 'Navigation',
        icon: <GitBranch size={14} className="text-blue-400" />,
        run: () => { onNavigatePage('tree'); onClose(); }
      },
      {
        id: 'nav-telemetry',
        title: 'Navigate: Operations, Telemetry Stream & Sentinel',
        category: 'Navigation',
        icon: <Terminal size={14} className="text-blue-400" />,
        run: () => { onNavigatePage('telemetry'); onClose(); }
      },
      {
        id: 'nav-memory',
        title: 'Navigate: Memory Ledger (Semantic & Episodic)',
        category: 'Navigation',
        icon: <Database size={14} className="text-blue-400" />,
        run: () => { onNavigatePage('memory'); onClose(); }
      },
      {
        id: 'nav-safety',
        title: 'Navigate: Governance & 5-Step Safety Verification',
        category: 'Navigation',
        icon: <ShieldCheck size={14} className="text-blue-400" />,
        run: () => { onNavigatePage('safety'); onClose(); }
      },
      {
        id: 'nav-debrief',
        title: 'Navigate: Supervisor Interrogation & Debrief Chat',
        category: 'Navigation',
        icon: <MessageSquare size={14} className="text-blue-400" />,
        run: () => { onNavigatePage('debrief'); onClose(); }
      },
    ] : []),
    {
      id: 'quick-grid',
      title: 'Dispatch: Regional Power Grid Stabilization',
      category: 'Preset Scenario',
      icon: <Sparkles size={14} className="text-amber-400" />,
      run: () => onSelectMissionPrompt("Resolve cascading frequency anomaly across Substation 4B in the regional power grid.", "Energy")
    },
    {
      id: 'quick-cyber',
      title: 'Dispatch: Zero-Day Privilege Escalation Containment',
      category: 'Preset Scenario',
      icon: <Sparkles size={14} className="text-blue-400" />,
      run: () => onSelectMissionPrompt("Contain and isolate zero-day kernel privilege escalation vulnerability identified on ingress edge gateways.", "Cybersecurity")
    },
    {
      id: 'quick-fda',
      title: 'Dispatch: FDA Compliance Audit (21 CFR Part 312)',
      category: 'Preset Scenario',
      icon: <Sparkles size={14} className="text-emerald-400" />,
      run: () => onSelectMissionPrompt("Audit FDA Phase III clinical trial regulatory filings for protocol variance and adverse event citations under 21 CFR Part 312.", "Legal & Compliance")
    },
    {
      id: 'spec-voice',
      title: 'View Tone & Style Specification',
      category: 'System Documentation',
      icon: <BookOpen size={14} className="text-purple-400" />,
      run: () => onOpenVoiceGuide()
    },
    {
      id: 'toggle-telemetry',
      title: 'Toggle Live Telemetry Terminal',
      category: 'Diagnostics',
      icon: <Terminal size={14} className="text-blue-400" />,
      run: () => onToggleTerminal()
    },
    {
      id: 'reset-prefs',
      title: 'Reset Learned Personalization Signals to Default',
      category: 'Adaptive Settings',
      icon: <RotateCcw size={14} className="text-rose-400" />,
      run: () => onResetPreferences()
    },
    ...(activeMission ? [
      {
        id: 'export-md',
        title: `Export Current Mission as Markdown (#${activeMission.id || ''})`,
        category: 'Export',
        icon: <FileText size={14} className="text-emerald-400" />,
        run: () => {
          const md = `# ATLANTIS AI MISSION: ${activeMission.title}\n${activeMission.result || ''}`;
          const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
          const a = document.createElement('a');
          a.setAttribute("href", dataStr);
          a.setAttribute("download", `atlantis-mission-${activeMission.id || 'export'}.md`);
          a.click();
        }
      },
      {
        id: 'export-json',
        title: `Export Current Mission Tree as JSON`,
        category: 'Export',
        icon: <FileCode size={14} className="text-blue-400" />,
        run: () => {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeMission, null, 2));
          const a = document.createElement('a');
          a.setAttribute("href", dataStr);
          a.setAttribute("download", `atlantis-mission-${activeMission.id || 'export'}.json`);
          a.click();
        }
      }
    ] : [])
  ];

  // Add past missions to search
  pastMissions.forEach((m) => {
    actions.push({
      id: `past-${m.id}`,
      title: `Rerun Past Mission: "${m.title.slice(0, 55)}..."`,
      category: 'Past Mission',
      icon: <Layers size={14} className="text-zinc-400" />,
      run: () => onSelectMissionPrompt(m.title, m.sector)
    });
  });

  const filtered = actions.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].run();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/80">
          <Command size={16} className="text-blue-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search past missions..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Action list */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs">
              No matching commands or missions found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  item.run();
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                  selectedIndex === idx
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-zinc-800/80 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon}
                  <span className="truncate font-sans">{item.title}</span>
                </div>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ml-2 shrink-0 ${
                  selectedIndex === idx ? 'bg-blue-700 text-blue-100' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {item.category}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-blue-400">ATLANTIS COMMAND PALETTE</span>
        </div>
      </div>
    </div>
  );
};
