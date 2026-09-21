import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationSidebar } from './components/NavigationSidebar';
import { PageWidgetGrid } from './components/widgets/PageWidgetGrid';
import { AddWidgetModal } from './components/widgets/AddWidgetModal';
import { DEFAULT_PAGE_LAYOUTS, WIDGET_REGISTRY } from './components/widgets/widgetRegistry';
import { NodeInspectorModal } from './components/NodeInspectorModal';
import { VoiceGuideModal } from './components/VoiceGuideModal';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { CommandPalette } from './components/CommandPalette';
import { SupervisorDebriefChat } from './components/SupervisorDebriefChat';
import { ImportConversationModal } from './components/widgets/ImportConversationModal';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { useAtlantisEngine } from './hooks/useAtlantisEngine';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  testFirestoreConnection 
} from './firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import type { 
  PageCategory, 
  WidgetInstance, 
  WidgetDefinition, 
  WidgetWidth, 
  WidgetHeight 
} from './types';

const STORAGE_KEY_LAYOUTS = 'atlantis_modular_page_layouts_v2';

export default function App() {
  const {
    startMission,
    activeMission,
    nodes,
    isProcessing,
    selectedNodeId,
    setSelectedNodeId,
    logs,
    semanticMemories,
    safetyLogs,
    safetyStrip,
    learnedPrefs,
    userProfile,
    aggregateAccPercent,
    loadPastMission,
    updateLearnedSignal,
    resetLearnedSignals
  } = useAtlantisEngine();

  // Active section page
  const [activeCategory, setActiveCategory] = useState<PageCategory>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Widget Layouts state across all section pages
  const [pageLayouts, setPageLayouts] = useState<Record<PageCategory, WidgetInstance[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAYOUTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_PAGE_LAYOUTS;
  });

  // Modal & Drawer states
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
  const [isVoiceGuideOpen, setIsVoiceGuideOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDebriefChatOpen, setIsDebriefChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Sync layouts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAYOUTS, JSON.stringify(pageLayouts));
    } catch {
      // storage quota or error
    }
  }, [pageLayouts]);

  // Firebase Auth listener
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Hotkeys: Cmd/Ctrl+K for palette, 1-6 for quick page jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Widget mutation handlers
  const handleUpdateWidgetWidth = (instanceId: string, width: WidgetWidth) => {
    setPageLayouts((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((w) =>
        w.instanceId === instanceId ? { ...w, width } : w
      ),
    }));
  };

  const handleUpdateWidgetHeight = (instanceId: string, height: WidgetHeight) => {
    setPageLayouts((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((w) =>
        w.instanceId === instanceId ? { ...w, height } : w
      ),
    }));
  };

  const handleUpdateWidgetSettings = (instanceId: string, newSettings: Record<string, any>) => {
    setPageLayouts((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((w) =>
        w.instanceId === instanceId ? { ...w, settings: newSettings } : w
      ),
    }));
  };

  const handleRemoveWidget = (instanceId: string) => {
    setPageLayouts((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter((w) => w.instanceId !== instanceId),
    }));
  };

  const handleAddWidget = (def: WidgetDefinition) => {
    const newInstance: WidgetInstance = {
      instanceId: `${def.id}_${Date.now()}`,
      widgetId: def.id,
      width: def.defaultWidth,
      height: def.defaultHeight,
      settings: { ...def.defaultSettings },
    };

    setPageLayouts((prev) => ({
      ...prev,
      [activeCategory]: [...prev[activeCategory], newInstance],
    }));
  };

  const handleResetLayout = () => {
    setPageLayouts((prev) => ({
      ...prev,
      [activeCategory]: [...DEFAULT_PAGE_LAYOUTS[activeCategory]],
    }));
  };

  const handleReorderWidgets = (reordered: WidgetInstance[]) => {
    setPageLayouts((prev) => ({
      ...prev,
      [activeCategory]: reordered,
    }));
  };

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await logOut();
  };

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] || null : null;
  const currentCategoryWidgets = pageLayouts[activeCategory] || [];
  const currentWidgetIds = currentCategoryWidgets.map((w) => w.widgetId);

  return (
    <div className="h-screen w-full bg-[#08080a] text-zinc-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Sleek Top Navigation Bar */}
      <Header
        isProcessing={isProcessing}
        activeSector={activeMission?.sector}
        isGovSector={activeMission?.isGovSector}
        registerMode={userProfile.registerPreference}
        currentUser={currentUser}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenAddWidget={() => setIsAddWidgetModalOpen(true)}
        onResetLayout={handleResetLayout}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenVoiceGuide={() => setIsVoiceGuideOpen(true)}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleDebriefChat={() => setIsDebriefChatOpen((prev) => !prev)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenModelSettings={() => setIsModelSettingsOpen(true)}
        isTerminalOpen={isTerminalOpen}
        isDebriefChatOpen={isDebriefChatOpen}
      />

      {/* Main Multi-Agent Hub Area with Navigation Sidebar & Modular Widget Page */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Left Navigation Sidebar */}
        <NavigationSidebar
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          activeMission={activeMission}
          nodeCount={Object.keys(nodes).length}
          isProcessing={isProcessing}
          onOpenModelSettings={() => setIsModelSettingsOpen(true)}
        />

        {/* Dynamic Page Resizable Widget Canvas */}
        <PageWidgetGrid
          category={activeCategory}
          widgets={currentCategoryWidgets}
          onUpdateWidth={handleUpdateWidgetWidth}
          onUpdateHeight={handleUpdateWidgetHeight}
          onUpdateSettings={handleUpdateWidgetSettings}
          onRemoveWidget={handleRemoveWidget}
          onOpenAddWidget={() => setIsAddWidgetModalOpen(true)}
          onResetLayout={handleResetLayout}
          onReorderWidgets={handleReorderWidgets}
          activeMission={activeMission}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
          isProcessing={isProcessing}
          learnedPrefs={learnedPrefs}
          onStartMission={startMission}
          aggregateAccPercent={aggregateAccPercent}
          onSelectPastMission={loadPastMission}
          onOverrideDoomLoop={(nodeId) => {
            if (nodes[nodeId]) {
              nodes[nodeId].doomLoopState = 'nominal';
              setSelectedNodeId(null);
            }
          }}
          onAbortBranch={(nodeId) => {
            if (nodes[nodeId]) {
              nodes[nodeId].status = 'complete';
              nodes[nodeId].output = '[Certainty: Human Abort] Branch aborted by human operator.';
              setSelectedNodeId(null);
            }
          }}
          telemetryLogs={logs}
          semanticMemories={semanticMemories}
          safetyStrip={safetyStrip}
          safetyLogs={safetyLogs}
          registerMode={userProfile.registerPreference}
          onUpdateLearnedSignal={updateLearnedSignal}
          onResetLearnedSignals={resetLearnedSignals}
          currentUser={currentUser}
        />
      </div>

      {/* Page-Restricted Add Widget Modal */}
      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        category={activeCategory}
        activeWidgetIds={currentWidgetIds}
        onClose={() => setIsAddWidgetModalOpen(false)}
        onAddWidget={handleAddWidget}
      />

      {/* Supervisor Debrief & Interrogation Chat Drawer */}
      <SupervisorDebriefChat
        activeMission={activeMission}
        currentUser={currentUser}
        isOpen={isDebriefChatOpen}
        onClose={() => setIsDebriefChatOpen(false)}
      />

      {/* Node Inspector Modal / Drawer */}
      <NodeInspectorModal
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
        onOverrideDoomLoop={(nodeId) => {
          if (nodes[nodeId]) {
            nodes[nodeId].doomLoopState = 'nominal';
            setSelectedNodeId(null);
          }
        }}
        onAbortBranch={(nodeId) => {
          if (nodes[nodeId]) {
            nodes[nodeId].status = 'complete';
            nodes[nodeId].output = '[Certainty: Human Abort] Branch aborted by human operator.';
            setSelectedNodeId(null);
          }
        }}
      />

      {/* Voice & Tone Specification Guide Modal */}
      <VoiceGuideModal
        isOpen={isVoiceGuideOpen}
        onClose={() => setIsVoiceGuideOpen(false)}
      />

      {/* Import External AI Conversations Modal */}
      <ImportConversationModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentUser={currentUser}
        onImportSuccess={() => {
          setActiveCategory('conversations');
          setIsImportModalOpen(false);
        }}
        onOpenModelSettings={() => setIsModelSettingsOpen(true)}
      />

      {/* Centralized Model Providers & API Keys Settings Modal */}
      <ModelSettingsModal
        isOpen={isModelSettingsOpen}
        onClose={() => setIsModelSettingsOpen(false)}
      />

      {/* Collapsible Telemetry Logs Drawer (Top-level hotkey or trigger) */}
      <TelemetryDrawer
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        logs={logs}
      />

      {/* Command Palette (Cmd+K) with navigation jumps */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigatePage={setActiveCategory}
        onOpenModelSettings={() => setIsModelSettingsOpen(true)}
        onSelectMissionPrompt={(prompt, sector) => {
          setActiveCategory('dashboard');
          startMission(prompt, {
            maxDepth: learnedPrefs.preferredDepth || 3,
            sectorOverride: sector,
          });
        }}
        onOpenVoiceGuide={() => setIsVoiceGuideOpen(true)}
        onToggleTerminal={() => setIsTerminalOpen((prev) => !prev)}
        onResetPreferences={resetLearnedSignals}
        activeMission={activeMission}
      />

      {/* Minimalist Status Bar Footer */}
      <footer className="h-7 border-t border-zinc-850 bg-zinc-950 flex items-center px-5 justify-between text-[10px] font-mono text-zinc-500 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            VIEW: <span className="text-zinc-200 font-bold uppercase">{activeCategory}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            TOPOLOGY: <span className="text-zinc-300 font-semibold">{activeMission?.topology || 'HYBRID'}</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            NODES: <span className="text-zinc-300 font-semibold">{Object.keys(nodes).length || 0}</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            ACC: <span className="text-zinc-300 font-semibold">{aggregateAccPercent}%</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-zinc-500">
          <span className="hidden md:inline">
            CERTAINTY DISCIPLINE ENFORCED · RESIZABLE WIDGETS
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-mono">
            {currentUser ? `OPERATOR: ${currentUser.displayName || currentUser.email?.split('@')[0]} (CLOUD)` : 'LOCAL CONSOLE'}
          </span>
        </div>
      </footer>
    </div>
  );
}
