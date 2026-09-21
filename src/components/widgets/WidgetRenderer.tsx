import React from 'react';
import type { 
  WidgetInstance, 
  WidgetWidth, 
  WidgetHeight, 
  MissionData, 
  AgentNodeData, 
  LearnedPreferences,
  SemanticMemoryRecord,
  SafetyStripResult,
  SafetyAuditLog,
  RegisterMode
} from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';
import { WidgetContainer } from './WidgetContainer';
import {
  WidgetMissionLauncher,
  WidgetExecutiveSynthesis,
  WidgetLiveStatusMatrix,
  WidgetTopologyCostGauge,
  WidgetRecentMissions,
} from './DashboardWidgets';
import {
  WidgetAgentTreeCanvas,
  WidgetNodeInspector,
  WidgetBranchMetrics,
} from './TreeWidgets';
import {
  WidgetTelemetryStream,
  WidgetDoomLoopMonitor,
  WidgetLatencyAnalytics,
} from './TelemetryWidgets';
import {
  WidgetSemanticMemory,
  WidgetEpisodicArchive,
  WidgetAdaptationSignals,
} from './MemoryWidgets';
import {
  WidgetSafetyStripAudit,
  WidgetClassificationGuard,
  WidgetSafetyAuditLogs,
} from './SafetyWidgets';
import { WidgetDebriefConsole } from './DebriefWidgets';
import { ConversationImporterWidget } from './ConversationImporterWidget';
import { ConversationArchiveWidget } from './ConversationArchiveWidget';
import { ActiveContextMatrixWidget } from './ActiveContextMatrixWidget';
import {
  WidgetSwarmRoster,
  WidgetBlackboardTasks,
  WidgetToolForge,
  WidgetSwarmMemoryFiles,
  WidgetExternalIntegrations,
} from './SwarmBlackboardWidgets';

interface WidgetRendererProps {
  instance: WidgetInstance;
  onUpdateWidth: (width: WidgetWidth) => void;
  onUpdateHeight: (height: WidgetHeight) => void;
  onUpdateSettings: (settings: Record<string, any>) => void;
  onRemove: () => void;

  // Snap-to-Grid Reorder Props
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;

  // Global Context Props passed down
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

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  instance,
  onUpdateWidth,
  onUpdateHeight,
  onUpdateSettings,
  onRemove,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
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
  const selectedNode = selectedNodeId && nodes[selectedNodeId] 
    ? nodes[selectedNodeId] 
    : (nodes['root'] || null);

  const renderContent = () => {
    switch (instance.widgetId) {
      // --- DASHBOARD ---
      case 'widget_mission_launcher':
        return (
          <WidgetMissionLauncher
            onStart={onStartMission}
            isProcessing={isProcessing}
            learnedPrefs={learnedPrefs}
            settings={instance.settings}
          />
        );
      case 'widget_executive_synthesis':
        return (
          <WidgetExecutiveSynthesis
            mission={activeMission}
            settings={instance.settings}
            onInspectNode={onSelectNode}
          />
        );
      case 'widget_live_status_matrix':
        return (
          <WidgetLiveStatusMatrix
            nodes={nodes}
            isProcessing={isProcessing}
            settings={instance.settings}
            onSelectNode={onSelectNode}
          />
        );
      case 'widget_topology_cost_gauge':
        return (
          <WidgetTopologyCostGauge
            activeMission={activeMission}
            aggregateAccPercent={aggregateAccPercent}
            settings={instance.settings}
          />
        );
      case 'widget_recent_missions':
        return (
          <WidgetRecentMissions
            onSelectPastMission={onSelectPastMission}
            settings={instance.settings}
          />
        );

      // --- AGENT TREE ---
      case 'widget_agent_tree_canvas':
        return (
          <WidgetAgentTreeCanvas
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            aggregateAccPercent={aggregateAccPercent}
            settings={instance.settings}
          />
        );
      case 'widget_node_inspector':
        return (
          <WidgetNodeInspector
            node={selectedNode}
            onOverrideDoomLoop={onOverrideDoomLoop}
            onAbortBranch={onAbortBranch}
            settings={instance.settings}
          />
        );
      case 'widget_branch_metrics':
        return (
          <WidgetBranchMetrics
            nodes={nodes}
            settings={instance.settings}
          />
        );

      // --- SWARM BLACKBOARD ---
      case 'widget_swarm_roster':
        return (
          <WidgetSwarmRoster
            settings={instance.settings}
          />
        );
      case 'widget_blackboard_tasks':
        return (
          <WidgetBlackboardTasks
            settings={instance.settings}
          />
        );
      case 'widget_tool_forge':
        return (
          <WidgetToolForge
            settings={instance.settings}
          />
        );
      case 'widget_swarm_memory_files':
        return (
          <WidgetSwarmMemoryFiles
            settings={instance.settings}
          />
        );
      case 'widget_external_integrations':
        return (
          <WidgetExternalIntegrations
            settings={instance.settings}
          />
        );

      // --- TELEMETRY ---
      case 'widget_telemetry_stream':
        return (
          <WidgetTelemetryStream
            logs={telemetryLogs}
            settings={instance.settings}
          />
        );
      case 'widget_doom_loop_monitor':
        return (
          <WidgetDoomLoopMonitor
            nodes={nodes}
            settings={instance.settings}
            onOverrideDoomLoop={onOverrideDoomLoop}
          />
        );
      case 'widget_latency_analytics':
        return (
          <WidgetLatencyAnalytics
            nodes={nodes}
            settings={instance.settings}
          />
        );

      // --- MEMORY ---
      case 'widget_semantic_memory':
        return (
          <WidgetSemanticMemory
            semanticMemories={semanticMemories}
            settings={instance.settings}
          />
        );
      case 'widget_episodic_archive':
        return (
          <WidgetEpisodicArchive
            onSelectPastMission={onSelectPastMission}
            settings={instance.settings}
          />
        );
      case 'widget_adaptation_signals':
        return (
          <WidgetAdaptationSignals
            learnedPrefs={learnedPrefs}
            onUpdateLearnedSignal={onUpdateLearnedSignal}
            onResetLearnedSignals={onResetLearnedSignals}
            settings={instance.settings}
          />
        );

      // --- SAFETY ---
      case 'widget_safety_strip_audit':
        return (
          <WidgetSafetyStripAudit
            safetyStrip={safetyStrip}
            settings={instance.settings}
          />
        );
      case 'widget_classification_guard':
        return (
          <WidgetClassificationGuard
            registerMode={registerMode}
            isGovSector={activeMission?.sector?.includes('Gov') || activeMission?.sector?.includes('Defense')}
            settings={instance.settings}
          />
        );
      case 'widget_safety_audit_logs':
        return (
          <WidgetSafetyAuditLogs
            safetyLogs={safetyLogs}
            settings={instance.settings}
          />
        );

      // --- DEBRIEF ---
      case 'widget_debrief_console':
        return (
          <WidgetDebriefConsole
            activeMission={activeMission}
            currentUser={currentUser}
            settings={instance.settings}
          />
        );

      // --- CONVERSATIONS ---
      case 'widget_conversation_importer':
        return (
          <ConversationImporterWidget
            currentUser={currentUser}
            settings={instance.settings}
          />
        );

      case 'widget_conversation_archive':
        return (
          <ConversationArchiveWidget
            currentUser={currentUser}
            settings={instance.settings}
          />
        );

      case 'widget_active_context_matrix':
        return (
          <ActiveContextMatrixWidget
            currentUser={currentUser}
            settings={instance.settings}
          />
        );

      default:
        return (
          <div className="p-4 text-zinc-500 font-mono text-xs">
            Unrecognized widget ID: {instance.widgetId}
          </div>
        );
    }
  };

  return (
    <WidgetContainer
      instance={instance}
      onUpdateWidth={onUpdateWidth}
      onUpdateHeight={onUpdateHeight}
      onUpdateSettings={onUpdateSettings}
      onRemove={onRemove}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      isDragging={isDragging}
      isDragOver={isDragOver}
    >
      {renderContent()}
    </WidgetContainer>
  );
};
