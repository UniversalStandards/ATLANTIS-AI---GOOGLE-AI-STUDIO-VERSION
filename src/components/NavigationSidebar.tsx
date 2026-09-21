import React from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Terminal, 
  Database, 
  ShieldCheck, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Cpu,
  Key,
  Sliders,
  Users
} from 'lucide-react';
import type { PageCategory, MissionData } from '../types';

interface NavigationSidebarProps {
  activeCategory: PageCategory;
  onSelectCategory: (category: PageCategory) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeMission: MissionData | null;
  nodeCount: number;
  isProcessing: boolean;
  onOpenModelSettings?: () => void;
}

interface NavItem {
  id: PageCategory;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  badge?: string;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeCategory,
  onSelectCategory,
  isCollapsed,
  onToggleCollapse,
  activeMission,
  nodeCount,
  isProcessing,
  onOpenModelSettings
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Mission Hub',
      sublabel: 'Executive Overview',
      icon: <LayoutDashboard size={18} />,
      badge: isProcessing ? 'ACTIVE' : undefined,
    },
    {
      id: 'tree',
      label: 'Agent Tree',
      sublabel: 'Recursive Hierarchy',
      icon: <GitBranch size={18} />,
      badge: nodeCount > 0 ? `${nodeCount}` : undefined,
    },
    {
      id: 'blackboard',
      label: 'Swarm Blackboard',
      sublabel: '7 Nodes, Tasks & Tools',
      icon: <Users size={18} />,
      badge: 'SWARM',
    },
    {
      id: 'telemetry',
      label: 'Operations',
      sublabel: 'Telemetry & Logs',
      icon: <Terminal size={18} />,
    },
    {
      id: 'memory',
      label: 'Memory Ledger',
      sublabel: 'Dual Memory & Signals',
      icon: <Database size={18} />,
    },
    {
      id: 'safety',
      label: 'Governance',
      sublabel: 'Safety Strips & Audits',
      icon: <ShieldCheck size={18} />,
    },
    {
      id: 'debrief',
      label: 'Supervisor Debrief',
      sublabel: 'Interrogation Console',
      icon: <MessageSquare size={18} />,
    },
    {
      id: 'conversations',
      label: 'AI Ingest & Context',
      sublabel: 'External History & Grounding',
      icon: <Sparkles size={18} />,
    },
  ];

  return (
    <aside 
      className={`h-full bg-zinc-950/95 border-r border-zinc-850 flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Section / Brand Pill */}
      <div className="flex flex-col">
        <div className="p-3.5 border-b border-zinc-850/80 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                NAVIGATION
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors mx-auto"
            title={isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-mono text-left group ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
                }`}
                title={isCollapsed ? `${item.label} (${item.sublabel})` : undefined}
              >
                <div className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate tracking-tight">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          item.badge === 'ACTIVE' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-sans truncate">
                      {item.sublabel}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Model Providers & API Settings Submenu Button */}
        {onOpenModelSettings && (
          <div className="px-2 pt-1">
            <button
              onClick={onOpenModelSettings}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-mono text-left group border ${
                isCollapsed
                  ? 'justify-center border-blue-900/40 bg-blue-950/20 text-blue-400 hover:bg-blue-900/40'
                  : 'border-blue-900/40 bg-blue-950/20 hover:bg-blue-900/30 text-blue-300 hover:text-white'
              }`}
              title={isCollapsed ? 'Model Providers & API Settings' : undefined}
            >
              <Key size={16} className="text-blue-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                      Model Settings
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                      API
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-sans truncate">
                    Gemini · ChatGPT · Claude
                  </div>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Mission Status Footprint */}
      {!isCollapsed ? (
        <div className="p-3 m-2 rounded-xl bg-zinc-900/90 border border-zinc-850 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Active Mission</span>
            <span className={`w-2 h-2 rounded-full ${
              isProcessing ? 'bg-amber-400 animate-ping' :
              activeMission ? 'bg-emerald-400' : 'bg-zinc-600'
            }`} />
          </div>
          <div className="text-[11px] text-zinc-200 font-semibold truncate">
            {activeMission?.title || 'System Standby'}
          </div>
          <div className="text-[10px] text-zinc-500 truncate">
            {activeMission ? `${activeMission.sector} · ${activeMission.topology}` : 'No mission deployed'}
          </div>
        </div>
      ) : (
        <div className="p-2 text-center pb-3">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
            isProcessing ? 'bg-amber-400 animate-ping' :
            activeMission ? 'bg-emerald-400' : 'bg-zinc-600'
          }`} title={activeMission ? `Active: ${activeMission.title}` : 'Standby'} />
        </div>
      )}
    </aside>
  );
};
