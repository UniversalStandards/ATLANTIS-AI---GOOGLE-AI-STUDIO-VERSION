import React, { useState } from 'react';
import { 
  Plus, 
  Sliders, 
  Layout, 
  RotateCcw, 
  Grid3X3, 
  Sparkles, 
  Move, 
  Maximize2,
  Minimize2,
  CheckCircle2
} from 'lucide-react';
import type { 
  WidgetInstance, 
  WidgetWidth, 
  WidgetHeight, 
  PageCategory,
  MissionData, 
  AgentNodeData, 
  LearnedPreferences,
  SemanticMemoryRecord,
  SafetyStripResult,
  SafetyAuditLog,
  RegisterMode
} from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';
import { WidgetRenderer } from './WidgetRenderer';

interface PageWidgetGridProps {
  category: PageCategory;
  widgets: WidgetInstance[];
  onUpdateWidth: (instanceId: string, width: WidgetWidth) => void;
  onUpdateHeight: (instanceId: string, height: WidgetHeight) => void;
  onUpdateSettings: (instanceId: string, settings: Record<string, any>) => void;
  onRemoveWidget: (instanceId: string) => void;
  onOpenAddWidget: () => void;
  onResetLayout: () => void;
  onReorderWidgets?: (widgets: WidgetInstance[]) => void;

  // Global Context Props
  activeMission: MissionData | null;
  nodes: Record<string, AgentNodeData>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  isProcessing: boolean;
  learnedPrefs: LearnedPreferences;
  onStartMission: (input: string, config: any) => void;
  aggregateAccPercent: number;
  onSelectPastMission: (id: number) => void;
  onOverrideDoomLoop?: (id: string) => void;
  onAbortBranch?: (id: string) => void;
  telemetryLogs: Array<{ id: string; timestamp: number; message: string; type: 'info' | 'warn' | 'error' | 'success' }>;
  semanticMemories: SemanticMemoryRecord[];
  safetyStrip: SafetyStripResult;
  safetyLogs: SafetyAuditLog[];
  registerMode: RegisterMode;
  onUpdateLearnedSignal: (signal: 'Sector' | 'Topology' | 'Depth', newValue: any) => void;
  onResetLearnedSignals: () => void;
  currentUser: FirebaseUser | null;
}

const pageTitles: Record<PageCategory, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Mission Hub & Executive Overview',
    subtitle: 'High-level mission objective launcher, supervisor synthesis dock, and operational vitals.'
  },
  tree: {
    title: 'Recursive Agent Tree & Canvas',
    subtitle: 'Multi-level branch canvas, certainty discipline, and granular agent node inspector.'
  },
  blackboard: {
    title: 'Project Swarm Blackboard & Coordination Hub',
    subtitle: 'Autonomous sub-agent hierarchy, dynamic tool forge, persistent memory files, and external integrations.'
  },
  telemetry: {
    title: 'Operations & Telemetry Sentinel',
    subtitle: 'Live chronological stream, doom-loop prevention sentinel, and node latency analytics.'
  },
  memory: {
    title: 'Dual Memory & Personalization Ledger',
    subtitle: 'Cross-mission semantic rules, episodic mission archive, and continuous adaptation bias.'
  },
  safety: {
    title: 'Governance & Procedural Safety',
    subtitle: '5-step sequential defense verification strip, civilian register guard, and audit trail.'
  },
  debrief: {
    title: 'Supervisor Interrogation & Debrief',
    subtitle: 'Multi-turn interactive dialogue with the Root Supervisor with multi-tier model selection.'
  },
  conversations: {
    title: 'AI Ingest & Context Grounding',
    subtitle: 'Import PDF, JSON, TXT, CSV exports or API sync to enrich Supervisor operational context.'
  },
};

export const PageWidgetGrid: React.FC<PageWidgetGridProps> = ({
  category,
  widgets,
  onUpdateWidth,
  onUpdateHeight,
  onUpdateSettings,
  onRemoveWidget,
  onOpenAddWidget,
  onResetLayout,
  onReorderWidgets,
  activeMission,
  nodes,
  selectedNodeId,
  onSelectNode,
  isProcessing,
  learnedPrefs,
  onStartMission,
  aggregateAccPercent,
  onSelectPastMission,
  onOverrideDoomLoop,
  onAbortBranch,
  telemetryLogs,
  semanticMemories,
  safetyStrip,
  safetyLogs,
  registerMode,
  onUpdateLearnedSignal,
  onResetLearnedSignals,
  currentUser
}) => {
  const meta = pageTitles[category] || pageTitles.dashboard;
  const [showGridGuides, setShowGridGuides] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Drag & Drop Reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...widgets];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    if (onReorderWidgets) {
      onReorderWidgets(reordered);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Step Move Left / Right
  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const reordered = [...widgets];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    if (onReorderWidgets) {
      onReorderWidgets(reordered);
    }
  };

  const handleMoveRight = (index: number) => {
    if (index >= widgets.length - 1) return;
    const reordered = [...widgets];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    if (onReorderWidgets) {
      onReorderWidgets(reordered);
    }
  };

  // Auto-Pack 12-Column Grid Rows:
  // Snaps widgets to flush boundaries (e.g. adjusts orphaned widgets so rows equal 12 columns)
  const handleAutoPack = () => {
    if (!onReorderWidgets) return;
    const widthVals: Record<WidgetWidth, number> = {
      'col-4': 4,
      'col-6': 6,
      'col-8': 8,
      'col-12': 12,
    };

    let currentRowWidth = 0;
    const packed = widgets.map((w, idx) => {
      let span = widthVals[w.width] || 6;
      if (currentRowWidth + span > 12) {
        // Start new row
        currentRowWidth = span;
        return w;
      }
      currentRowWidth += span;
      return w;
    });

    onReorderWidgets(packed);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#08080a]">
      {/* Page Title & Snap-to-Grid Action Bar */}
      <div className="px-6 py-3 border-b border-zinc-850/80 bg-zinc-950/60 flex items-center justify-between gap-4 shrink-0 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white font-mono tracking-tight uppercase">
              {meta.title}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
              {widgets.length} {widgets.length === 1 ? 'Widget' : 'Widgets'}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-blue-400 bg-blue-950/40 border border-blue-900/60">
              <Move size={10} />
              <span>12-Col Snap Active</span>
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            {meta.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Snap Guides Toggle */}
          <button
            onClick={() => setShowGridGuides(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              showGridGuides
                ? 'bg-blue-600/25 text-blue-300 border-blue-500/60 font-semibold shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
            title="Toggle visual 12-column alignment guides"
          >
            <Grid3X3 size={13} />
            <span className="hidden sm:inline">Snap Guides</span>
          </button>

          {/* Add Widget Button */}
          <button
            onClick={onOpenAddWidget}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Widget</span>
          </button>

          {/* Reset Layout */}
          <button
            onClick={onResetLayout}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset this section page to default layout"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset Layout</span>
          </button>
        </div>
      </div>

      {/* Grid Canvas with Optional 12-Column Blueprint Guide Overlay */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
        {/* 12-Column Alignment Blueprint Guides */}
        {showGridGuides && (
          <div className="absolute inset-x-4 lg:inset-x-6 top-4 lg:top-6 bottom-6 pointer-events-none z-10 grid grid-cols-12 gap-4 max-w-7xl mx-auto opacity-30">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="h-full border-x border-dashed border-blue-400 bg-blue-500/5 rounded-lg flex flex-col items-center pt-2"
              >
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-zinc-950 px-1 py-0.5 rounded border border-blue-500/40">
                  C{i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {widgets.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-3xl space-y-3 font-mono">
            <Layout size={36} className="text-zinc-600 stroke-[1.5]" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-300">
                No Widgets on this Page
              </h3>
              <p className="text-xs text-zinc-500 font-sans max-w-sm">
                Add resizable, configurable widgets from the {category} catalog to customize this view.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onOpenAddWidget}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-blue-900/30"
              >
                <Plus size={14} />
                <span>Add First Widget</span>
              </button>
              <button
                onClick={onResetLayout}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-mono"
              >
                Restore Defaults
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4 auto-rows-min max-w-7xl mx-auto w-full pb-10 relative z-20">
            {widgets.map((w, index) => (
              <WidgetRenderer
                key={w.instanceId}
                instance={w}
                onUpdateWidth={(width) => onUpdateWidth(w.instanceId, width)}
                onUpdateHeight={(height) => onUpdateHeight(w.instanceId, height)}
                onUpdateSettings={(settings) => onUpdateSettings(w.instanceId, settings)}
                onRemove={() => onRemoveWidget(w.instanceId)}
                onMoveLeft={() => handleMoveLeft(index)}
                onMoveRight={() => handleMoveRight(index)}
                canMoveLeft={index > 0}
                canMoveRight={index < widgets.length - 1}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(index)}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index && draggedIndex !== index}
                activeMission={activeMission}
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                isProcessing={isProcessing}
                learnedPrefs={learnedPrefs}
                onStartMission={onStartMission}
                aggregateAccPercent={aggregateAccPercent}
                onSelectPastMission={onSelectPastMission}
                onOverrideDoomLoop={onOverrideDoomLoop}
                onAbortBranch={onAbortBranch}
                telemetryLogs={telemetryLogs}
                semanticMemories={semanticMemories}
                safetyStrip={safetyStrip}
                safetyLogs={safetyLogs}
                registerMode={registerMode}
                onUpdateLearnedSignal={onUpdateLearnedSignal}
                onResetLearnedSignals={onResetLearnedSignals}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

