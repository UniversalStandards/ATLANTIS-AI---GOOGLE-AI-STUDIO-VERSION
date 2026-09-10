import React from 'react';
import { 
  Layers, 
  Shield, 
  Cpu, 
  BookOpen, 
  Terminal as TerminalIcon, 
  Command, 
  MessageSquare, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  Cloud,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  GitBranch,
  Database,
  ShieldCheck,
  Plus,
  RotateCcw
} from 'lucide-react';
import type { RegisterMode, PageCategory } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  isProcessing: boolean;
  activeSector?: string;
  isGovSector?: boolean;
  registerMode: RegisterMode;
  currentUser: FirebaseUser | null;
  activeCategory: PageCategory;
  onSelectCategory: (category: PageCategory) => void;
  onOpenAddWidget: () => void;
  onResetLayout: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenVoiceGuide: () => void;
  onToggleTerminal: () => void;
  onOpenCommandPalette: () => void;
  onToggleDebriefChat: () => void;
  onOpenImportModal?: () => void;
  isTerminalOpen: boolean;
  isDebriefChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isProcessing,
  activeSector,
  isGovSector,
  registerMode,
  currentUser,
  activeCategory,
  onSelectCategory,
  onOpenAddWidget,
  onResetLayout,
  onSignIn,
  onSignOut,
  onOpenVoiceGuide,
  onToggleTerminal,
  onOpenCommandPalette,
  onToggleDebriefChat,
  onOpenImportModal,
  isTerminalOpen,
  isDebriefChatOpen
}) => {
  return (
    <header className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-850 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 border border-blue-400/40 rounded-lg flex items-center justify-center shadow-md shadow-blue-900/30 shrink-0">
            <Layers className="text-white w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase font-sans">
                Atlantis AI
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                WIDGET ENGINE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-tight leading-none mt-0.5">
              MODULAR RECURSIVE SUPERVISOR CONSOLE
            </p>
          </div>
        </div>

        {/* View Switcher Dropdown Menu */}
        <div className="relative flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-lg px-2 py-1 font-mono text-xs">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">PAGE:</span>
          <select
            value={activeCategory}
            onChange={(e) => onSelectCategory(e.target.value as PageCategory)}
            className="bg-transparent text-blue-300 font-bold focus:outline-none cursor-pointer pr-1"
          >
            <option value="dashboard" className="bg-zinc-900 text-white">Mission Hub</option>
            <option value="tree" className="bg-zinc-900 text-white">Agent Tree</option>
            <option value="telemetry" className="bg-zinc-900 text-white">Operations & Logs</option>
            <option value="memory" className="bg-zinc-900 text-white">Memory Ledger</option>
            <option value="safety" className="bg-zinc-900 text-white">Safety & Governance</option>
            <option value="debrief" className="bg-zinc-900 text-white">Supervisor Debrief</option>
            <option value="conversations" className="bg-zinc-900 text-white">AI Ingest & Context</option>
          </select>
        </div>

        {/* Quick Page Actions: Add Widget & Reset Layout & Import AI History */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={onOpenAddWidget}
            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
            title="Add Widget to Current Page"
          >
            <Plus size={13} />
            <span>Add Widget</span>
          </button>

          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
              title="Import External AI History (PDF, JSON, TXT, CSV, or API Keys)"
            >
              <span>Import AI History</span>
            </button>
          )}

          <button
            onClick={onResetLayout}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
            title="Reset Widgets Layout for this Page"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-xs font-mono shadow-sm"
          title="Open Command Palette (Cmd/Ctrl + K)"
        >
          <Command size={12} className="text-blue-400" />
          <span className="hidden md:inline">Palette</span>
          <kbd className="px-1 py-0.2 rounded bg-zinc-800 text-[9px] text-zinc-400 border border-zinc-700/60 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Supervisor Debrief Chat Trigger */}
        <button
          onClick={onToggleDebriefChat}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono transition-all ${
            isDebriefChatOpen
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
          }`}
          title="Open Supervisor Debrief & Interrogation Console"
        >
          <MessageSquare size={13} className="text-blue-400" />
          <span className="hidden sm:inline">Debrief</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        </button>


        {/* Register Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
          <span className="text-zinc-500">REGISTER:</span>
          {isGovSector ? (
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              GOV / COMPLIANCE
            </span>
          ) : (
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              CIVILIAN-FIRST
            </span>
          )}
        </div>

        {/* System Health */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25">
          <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-[11px] font-mono font-medium text-emerald-400 tracking-wider">
            {isProcessing ? 'DELEGATING' : 'ONLINE'}
          </span>
        </div>

        {/* Live Terminal Log Toggle */}
        <button
          onClick={onToggleTerminal}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-mono flex items-center gap-1.5 transition-all ${
            isTerminalOpen 
              ? 'bg-zinc-800 text-blue-400 border-blue-500/40' 
              : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Toggle Coordination Telemetry Stream"
        >
          <TerminalIcon size={14} />
          <span className="hidden sm:inline">Telemetry</span>
        </button>

        {/* Voice Specification Guide Modal Button */}
        <button
          onClick={onOpenVoiceGuide}
          className="px-2.5 py-1.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5"
          title="View Atlantis Tone, Register & Architecture Specification"
        >
          <BookOpen size={14} className="text-blue-400" />
          <span className="hidden sm:inline">Tone Spec</span>
        </button>

        {/* Firebase Authentication & Cloud Sync */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
            <div 
              className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-mono"
              title={`Authenticated Operator: ${currentUser.email}`}
            >
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="avatar" 
                  className="w-4 h-4 rounded-full border border-blue-400" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white">
                  {(currentUser.displayName || currentUser.email || 'O')[0].toUpperCase()}
                </div>
              )}
              <span className="text-zinc-300 max-w-[90px] truncate hidden md:inline">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <Cloud size={12} className="text-emerald-400 shrink-0" title="Firestore Cloud Persistence Active" />
            </div>
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div className="pl-2 border-l border-zinc-800">
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white transition-all text-xs font-mono shadow-sm"
              title="Sign in with Google to enable Firebase Cloud persistence"
            >
              <LogIn size={13} className="text-blue-400" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
