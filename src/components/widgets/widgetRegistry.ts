import type { WidgetDefinition, PageCategory, WidgetInstance } from '../../types';

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // --- DASHBOARD CATEGORY ---
  widget_mission_launcher: {
    id: 'widget_mission_launcher',
    name: 'Mission Deployment Console',
    description: 'Launch missions with recursive coordination, register selection, and sector overrides.',
    category: 'dashboard',
    defaultWidth: 'col-12',
    defaultHeight: 'compact',
    defaultSettings: {
      showPresets: true,
      defaultDepth: 3,
      showTopologyOverride: true,
      compactMode: false,
    },
    settingOptions: [
      { key: 'showPresets', label: 'Show Quick Preset Scenarios', type: 'boolean', description: 'Display 1-click test prompts' },
      { 
        key: 'defaultDepth', 
        label: 'Default Tree Max Depth', 
        type: 'select', 
        options: [
          { label: 'Level 2 (Fast triage)', value: 2 },
          { label: 'Level 3 (Standard depth)', value: 3 },
          { label: 'Level 4 (Exhaustive breakdown)', value: 4 },
        ]
      },
      { key: 'showTopologyOverride', label: 'Show Topology Selector', type: 'boolean' },
      { key: 'compactMode', label: 'Compact Layout Mode', type: 'boolean' },
    ],
    iconName: 'Terminal',
  },
  widget_executive_synthesis: {
    id: 'widget_executive_synthesis',
    name: 'Executive Synthesis Dock',
    description: 'Root supervisor final synthesized verdict, decision rationale, and evidence summary.',
    category: 'dashboard',
    defaultWidth: 'col-8',
    defaultHeight: 'standard',
    defaultSettings: {
      displayMode: 'full',
      showCuriosity: true,
      showGrounding: true,
      showNodeCount: true,
    },
    settingOptions: [
      {
        key: 'displayMode',
        label: 'Synthesis Display Format',
        type: 'select',
        options: [
          { label: 'Full Synthesized Verdict', value: 'full' },
          { label: 'Executive Summary Only', value: 'verdict_only' },
          { label: 'Key Findings Highlight', value: 'key_takeaways' },
        ]
      },
      { key: 'showCuriosity', label: 'Highlight Curiosity Factor', type: 'boolean', description: 'Surface novel or unexpected operational questions' },
      { key: 'showGrounding', label: 'Show Grounding Sources Badge', type: 'boolean' },
      { key: 'showNodeCount', label: 'Show Branch Node Count', type: 'boolean' },
    ],
    iconName: 'Crown',
  },
  widget_live_status_matrix: {
    id: 'widget_live_status_matrix',
    name: 'Live Agent Status Matrix',
    description: 'Real-time overview of active, completed, queued, and escalated agent nodes.',
    category: 'dashboard',
    defaultWidth: 'col-6',
    defaultHeight: 'standard',
    defaultSettings: {
      showLatencies: true,
      showCertaintyBreakdown: true,
      showRoleDistribution: true,
    },
    settingOptions: [
      { key: 'showLatencies', label: 'Display Node Execution Times', type: 'boolean' },
      { key: 'showCertaintyBreakdown', label: 'Show Certainty Tags Distribution', type: 'boolean' },
      { key: 'showRoleDistribution', label: 'Show Role Distribution Breakdown', type: 'boolean' },
    ],
    iconName: 'Activity',
  },
  widget_topology_cost_gauge: {
    id: 'widget_topology_cost_gauge',
    name: 'Topology & Context Compaction',
    description: 'Mission topology classification, Cost/Complexity tier, and ACC capacity gauges.',
    category: 'dashboard',
    defaultWidth: 'col-6',
    defaultHeight: 'standard',
    defaultSettings: {
      showAccMeter: true,
      showComplexityScore: true,
      showRoutingRationale: true,
    },
    settingOptions: [
      { key: 'showAccMeter', label: 'Display Adaptive Context Compaction (ACC) Gauge', type: 'boolean' },
      { key: 'showComplexityScore', label: 'Show Complexity Score (1-10)', type: 'boolean' },
      { key: 'showRoutingRationale', label: 'Show Routing Rationale Rationale', type: 'boolean' },
    ],
    iconName: 'Gauge',
  },
  widget_recent_missions: {
    id: 'widget_recent_missions',
    name: 'Recent Missions Quick Access',
    description: 'Recent mission runs with one-click reload into the active workspace.',
    category: 'dashboard',
    defaultWidth: 'col-4',
    defaultHeight: 'standard',
    defaultSettings: {
      maxItems: 4,
      showSector: true,
      showStatus: true,
    },
    settingOptions: [
      { key: 'maxItems', label: 'Max Missions to Display', type: 'number', min: 2, max: 10, step: 1 },
      { key: 'showSector', label: 'Show Sector Badge', type: 'boolean' },
      { key: 'showStatus', label: 'Show Status Indicator', type: 'boolean' },
    ],
    iconName: 'History',
  },

  // --- AGENT TREE CATEGORY ---
  widget_agent_tree_canvas: {
    id: 'widget_agent_tree_canvas',
    name: 'Recursive Agent Tree Canvas',
    description: 'Interactive visual hierarchy showing parent-child delegation branches.',
    category: 'tree',
    defaultWidth: 'col-8',
    defaultHeight: 'tall',
    defaultSettings: {
      showSearchBar: true,
      showAccPill: true,
      density: 'comfortable',
      showLatencyBadge: true,
    },
    settingOptions: [
      { key: 'showSearchBar', label: 'Show Tree Search Bar', type: 'boolean' },
      { key: 'showAccPill', label: 'Show Node ACC Compaction Meter', type: 'boolean' },
      { 
        key: 'density', 
        label: 'Node Card Density', 
        type: 'select', 
        options: [
          { label: 'Comfortable', value: 'comfortable' },
          { label: 'Compact', value: 'compact' },
        ]
      },
      { key: 'showLatencyBadge', label: 'Show Node Latency Badges', type: 'boolean' },
    ],
    iconName: 'GitBranch',
  },
  widget_node_inspector: {
    id: 'widget_node_inspector',
    name: 'Agent Node Inspector',
    description: 'Detailed telemetry, assigned objective, live reasoning, and search grounding for selected node.',
    category: 'tree',
    defaultWidth: 'col-4',
    defaultHeight: 'tall',
    defaultSettings: {
      showGroundingSources: true,
      showFingerprints: false,
      autoSelectRoot: true,
    },
    settingOptions: [
      { key: 'showGroundingSources', label: 'Display Google Search Grounding Sources', type: 'boolean' },
      { key: 'showFingerprints', label: 'Display Token Fingerprints (Doom Loop Guard)', type: 'boolean' },
      { key: 'autoSelectRoot', label: 'Auto-select Root Node when Idle', type: 'boolean' },
    ],
    iconName: 'Microscope',
  },
  widget_branch_metrics: {
    id: 'widget_branch_metrics',
    name: 'Branch Depth & Fan-Out Metrics',
    description: 'Depth allocation, fan-out rates, and leaf vs sub-supervisor distribution metrics.',
    category: 'tree',
    defaultWidth: 'col-12',
    defaultHeight: 'compact',
    defaultSettings: {
      showDepthDistribution: true,
      showFanOutStats: true,
    },
    settingOptions: [
      { key: 'showDepthDistribution', label: 'Show Depth Distribution Counts', type: 'boolean' },
      { key: 'showFanOutStats', label: 'Show Average Fan-out Ratio', type: 'boolean' },
    ],
    iconName: 'Layers',
  },

  // --- TELEMETRY CATEGORY ---
  widget_telemetry_stream: {
    id: 'widget_telemetry_stream',
    name: 'Live Telemetry Event Log',
    description: 'Streaming chronological log of coordinator decisions, token streaming, and branch states.',
    category: 'telemetry',
    defaultWidth: 'col-8',
    defaultHeight: 'tall',
    defaultSettings: {
      filterLevel: 'all',
      fontSize: 'xs',
      autoScroll: true,
      maxLines: 80,
    },
    settingOptions: [
      { 
        key: 'filterLevel', 
        label: 'Telemetry Severity Filter', 
        type: 'select', 
        options: [
          { label: 'All Telemetry Levels', value: 'all' },
          { label: 'Information Only', value: 'info' },
          { label: 'Warnings & Escalations', value: 'warn' },
          { label: 'Errors Only', value: 'error' },
          { label: 'Successes Only', value: 'success' },
        ]
      },
      { 
        key: 'fontSize', 
        label: 'Console Font Size', 
        type: 'select', 
        options: [
          { label: 'Small (12px)', value: 'sm' },
          { label: 'Extra Small (11px)', value: 'xs' },
          { label: 'Compact Mono (10px)', value: 'tiny' },
        ]
      },
      { key: 'autoScroll', label: 'Auto-Scroll on New Events', type: 'boolean' },
      { key: 'maxLines', label: 'Buffer Size (Max Lines)', type: 'number', min: 20, max: 200, step: 10 },
    ],
    iconName: 'Terminal',
  },
  widget_doom_loop_monitor: {
    id: 'widget_doom_loop_monitor',
    name: 'Doom Loop Sentinel',
    description: 'Semantic repetition detection, fingerprint hashes, and escalation guard status.',
    category: 'telemetry',
    defaultWidth: 'col-4',
    defaultHeight: 'standard',
    defaultSettings: {
      strictThreshold: false,
      showFingerprints: true,
    },
    settingOptions: [
      { key: 'strictThreshold', label: 'Strict Repetition Threshold', type: 'boolean', description: 'Escalate on single repeat' },
      { key: 'showFingerprints', label: 'Show Output Fingerprint Hashes', type: 'boolean' },
    ],
    iconName: 'ShieldAlert',
  },
  widget_latency_analytics: {
    id: 'widget_latency_analytics',
    name: 'Node Latency & Execution Breakdown',
    description: 'Latency distributions across root supervisor, mid-tier, and leaf specialist agents.',
    category: 'telemetry',
    defaultWidth: 'col-4',
    defaultHeight: 'standard',
    defaultSettings: {
      displayUnit: 'ms',
      sortBy: 'latency',
    },
    settingOptions: [
      { 
        key: 'displayUnit', 
        label: 'Display Time Unit', 
        type: 'select', 
        options: [
          { label: 'Milliseconds (ms)', value: 'ms' },
          { label: 'Seconds (s)', value: 'seconds' },
        ]
      },
      { 
        key: 'sortBy', 
        label: 'Sort Agents By', 
        type: 'select', 
        options: [
          { label: 'Longest Execution First', value: 'latency' },
          { label: 'Node Depth Sequence', value: 'nodeId' },
        ]
      },
    ],
    iconName: 'Clock',
  },

  // --- MEMORY CATEGORY ---
  widget_semantic_memory: {
    id: 'widget_semantic_memory',
    name: 'Semantic Memory Ledger',
    description: 'Distilled cross-mission rules (Trigger -> Action -> Outcome) with confidence ratings.',
    category: 'memory',
    defaultWidth: 'col-6',
    defaultHeight: 'tall',
    defaultSettings: {
      confidenceFilter: 'all',
      maxItems: 8,
      searchBar: true,
    },
    settingOptions: [
      {
        key: 'confidenceFilter',
        label: 'Confidence Filter',
        type: 'select',
        options: [
          { label: 'All Confidences', value: 'all' },
          { label: 'High Confidence Only (≥80%)', value: 'high_only' },
        ]
      },
      { key: 'maxItems', label: 'Max Rules to Display', type: 'number', min: 3, max: 20, step: 1 },
      { key: 'searchBar', label: 'Enable Search Filter Bar', type: 'boolean' },
    ],
    iconName: 'Database',
  },
  widget_episodic_archive: {
    id: 'widget_episodic_archive',
    name: 'Episodic Mission Archive',
    description: 'Browse, inspect, and reload previous mission snapshots and synthesized decisions.',
    category: 'memory',
    defaultWidth: 'col-6',
    defaultHeight: 'tall',
    defaultSettings: {
      pageSize: 6,
      showSector: true,
      showTopology: true,
    },
    settingOptions: [
      { key: 'pageSize', label: 'Items per View', type: 'number', min: 3, max: 15, step: 1 },
      { key: 'showSector', label: 'Display Primary Sector', type: 'boolean' },
      { key: 'showTopology', label: 'Display Mission Topology', type: 'boolean' },
    ],
    iconName: 'History',
  },
  widget_adaptation_signals: {
    id: 'widget_adaptation_signals',
    name: 'Continuous Personalization Signals',
    description: 'Implicitly learned sector bias, topology preference, and average prompt word count.',
    category: 'memory',
    defaultWidth: 'col-12',
    defaultHeight: 'standard',
    defaultSettings: {
      allowEditing: true,
      showWeightMeters: true,
    },
    settingOptions: [
      { key: 'allowEditing', label: 'Allow Manual Bias Adjustments', type: 'boolean' },
      { key: 'showWeightMeters', label: 'Show Frequency Weight Bars', type: 'boolean' },
    ],
    iconName: 'Sparkles',
  },

  // --- SAFETY CATEGORY ---
  widget_safety_strip_audit: {
    id: 'widget_safety_strip_audit',
    name: '5-Step Safety Verification Strip',
    description: 'Sequential defense: Input Validation, Classification Guard, Sandboxing, Review, and Audit.',
    category: 'safety',
    defaultWidth: 'col-6',
    defaultHeight: 'standard',
    defaultSettings: {
      showScores: true,
      showDetails: true,
    },
    settingOptions: [
      { key: 'showScores', label: 'Show Security Confidence Scores (0-100)', type: 'boolean' },
      { key: 'showDetails', label: 'Show Procedural Inspection Details', type: 'boolean' },
    ],
    iconName: 'ShieldCheck',
  },
  widget_classification_guard: {
    id: 'widget_classification_guard',
    name: 'Register & Tone Compliance Guard',
    description: 'Enforces civilian-first default register, zero-hedging, and procedural compliance.',
    category: 'safety',
    defaultWidth: 'col-6',
    defaultHeight: 'standard',
    defaultSettings: {
      showRegisterBadge: true,
      showZeroHedgingStatus: true,
    },
    settingOptions: [
      { key: 'showRegisterBadge', label: 'Display Active Register Badge', type: 'boolean' },
      { key: 'showZeroHedgingStatus', label: 'Verify Zero-Hedging Enforcement', type: 'boolean' },
    ],
    iconName: 'Lock',
  },
  widget_safety_audit_logs: {
    id: 'widget_safety_audit_logs',
    name: 'Safety & Guardrail Audit Trail',
    description: 'Immutable ledger of all safety inspections, classification passes, and escalations.',
    category: 'safety',
    defaultWidth: 'col-12',
    defaultHeight: 'standard',
    defaultSettings: {
      statusFilter: 'all',
      maxLogs: 10,
    },
    settingOptions: [
      {
        key: 'statusFilter',
        label: 'Log Status Filter',
        type: 'select',
        options: [
          { label: 'All Audit Events', value: 'all' },
          { label: 'Escalations Only', value: 'escalated_only' },
          { label: 'Nominal Passes Only', value: 'nominal_only' },
        ]
      },
      { key: 'maxLogs', label: 'Max Log Entries', type: 'number', min: 5, max: 30, step: 5 },
    ],
    iconName: 'Shield',
  },

  // --- DEBRIEF CATEGORY ---
  widget_debrief_console: {
    id: 'widget_debrief_console',
    name: 'Supervisor Interrogation Terminal',
    description: 'Multi-turn interactive dialogue with the Root Supervisor with multi-tier model selection.',
    category: 'debrief',
    defaultWidth: 'col-12',
    defaultHeight: 'tall',
    defaultSettings: {
      defaultModel: 'gemini-3.5-flash',
      enableGrounding: true,
      showQuickPrompts: true,
    },
    settingOptions: [
      {
        key: 'defaultModel',
        label: 'Active Reasoning Engine',
        type: 'select',
        options: [
          { label: 'Gemini 3.5 Flash (Balanced & Grounded)', value: 'gemini-3.5-flash' },
          { label: 'Gemini 3.1 Pro (Deep Trade-Off Analysis)', value: 'gemini-3.1-pro-preview' },
          { label: 'Gemini 3.1 Flash-Lite (Fast Triage)', value: 'gemini-3.1-flash-lite' },
        ]
      },
      { key: 'enableGrounding', label: 'Enable Google Search Grounding', type: 'boolean' },
      { key: 'showQuickPrompts', label: 'Show Quick Interrogation Prompts', type: 'boolean' },
    ],
    iconName: 'MessageSquare',
  },

  // --- CONVERSATIONS CATEGORY ---
  widget_conversation_importer: {
    id: 'widget_conversation_importer',
    name: 'Conversation Ingest & File Drop',
    description: 'Ingest external AI conversations from PDF, JSON, TXT, CSV, or direct API keys.',
    category: 'conversations',
    defaultWidth: 'col-6',
    defaultHeight: 'standard',
    defaultSettings: {
      autoActivateForContext: true,
      defaultFormat: 'all',
    },
    settingOptions: [
      { key: 'autoActivateForContext', label: 'Automatically Enable Ingested Conversations for Context', type: 'boolean' },
      { 
        key: 'defaultFormat', 
        label: 'Preferred Ingest Format', 
        type: 'select', 
        options: [
          { label: 'All Supported (PDF, JSON, TXT, CSV)', value: 'all' },
          { label: 'JSON (ChatGPT / Claude / Gemini)', value: 'json' },
          { label: 'PDF Document Exports', value: 'pdf' },
          { label: 'Plain Text Transcripts', value: 'txt' },
        ]
      },
    ],
    iconName: 'Sparkles',
  },
  widget_conversation_archive: {
    id: 'widget_conversation_archive',
    name: 'Conversation History Explorer',
    description: 'Search, filter, inspect speaker transcripts, and toggle active grounding state.',
    category: 'conversations',
    defaultWidth: 'col-6',
    defaultHeight: 'tall',
    defaultSettings: {
      filterPlatform: 'all',
      showSummary: true,
    },
    settingOptions: [
      {
        key: 'filterPlatform',
        label: 'Platform Filter',
        type: 'select',
        options: [
          { label: 'All AI Platforms', value: 'all' },
          { label: 'ChatGPT Exports', value: 'chatgpt' },
          { label: 'Claude Exports', value: 'claude' },
          { label: 'Gemini Transcripts', value: 'gemini' },
          { label: 'Custom / Other', value: 'custom' },
        ]
      },
      { key: 'showSummary', label: 'Show AI Synthesized Summary', type: 'boolean' },
    ],
    iconName: 'History',
  },
  widget_active_context_matrix: {
    id: 'widget_active_context_matrix',
    name: 'Active Context & Grounding Monitor',
    description: 'Real-time overview of active conversation transcripts feeding into Atlantis supervisor debriefs.',
    category: 'conversations',
    defaultWidth: 'col-12',
    defaultHeight: 'compact',
    defaultSettings: {
      showTokenEstimator: true,
    },
    settingOptions: [
      { key: 'showTokenEstimator', label: 'Display Character & Token Count Gauges', type: 'boolean' },
    ],
    iconName: 'Database',
  },
};

// Default layout configuration for each page
export const DEFAULT_PAGE_LAYOUTS: Record<PageCategory, WidgetInstance[]> = {
  dashboard: [
    {
      instanceId: 'dash_launcher_1',
      widgetId: 'widget_mission_launcher',
      width: 'col-12',
      height: 'compact',
      settings: { ...WIDGET_REGISTRY.widget_mission_launcher.defaultSettings },
    },
    {
      instanceId: 'dash_status_1',
      widgetId: 'widget_live_status_matrix',
      width: 'col-6',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_live_status_matrix.defaultSettings },
    },
    {
      instanceId: 'dash_topology_1',
      widgetId: 'widget_topology_cost_gauge',
      width: 'col-6',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_topology_cost_gauge.defaultSettings },
    },
    {
      instanceId: 'dash_synthesis_1',
      widgetId: 'widget_executive_synthesis',
      width: 'col-8',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_executive_synthesis.defaultSettings },
    },
    {
      instanceId: 'dash_recent_1',
      widgetId: 'widget_recent_missions',
      width: 'col-4',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_recent_missions.defaultSettings },
    },
  ],
  tree: [
    {
      instanceId: 'tree_canvas_1',
      widgetId: 'widget_agent_tree_canvas',
      width: 'col-8',
      height: 'tall',
      settings: { ...WIDGET_REGISTRY.widget_agent_tree_canvas.defaultSettings },
    },
    {
      instanceId: 'tree_inspector_1',
      widgetId: 'widget_node_inspector',
      width: 'col-4',
      height: 'tall',
      settings: { ...WIDGET_REGISTRY.widget_node_inspector.defaultSettings },
    },
    {
      instanceId: 'tree_metrics_1',
      widgetId: 'widget_branch_metrics',
      width: 'col-12',
      height: 'compact',
      settings: { ...WIDGET_REGISTRY.widget_branch_metrics.defaultSettings },
    },
  ],
  telemetry: [
    {
      instanceId: 'telemetry_stream_1',
      widgetId: 'widget_telemetry_stream',
      width: 'col-8',
      height: 'tall',
      settings: { ...WIDGET_REGISTRY.widget_telemetry_stream.defaultSettings },
    },
    {
      instanceId: 'telemetry_doom_1',
      widgetId: 'widget_doom_loop_monitor',
      width: 'col-4',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_doom_loop_monitor.defaultSettings },
    },
    {
      instanceId: 'telemetry_latency_1',
      widgetId: 'widget_latency_analytics',
      width: 'col-4',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_latency_analytics.defaultSettings },
    },
  ],
  memory: [
    {
      instanceId: 'mem_semantic_1',
      widgetId: 'widget_semantic_memory',
      width: 'col-6',
      height: 'tall',
      settings: { ...WIDGET_REGISTRY.widget_semantic_memory.defaultSettings },
    },
    {
      instanceId: 'mem_episodic_1',
      widgetId: 'widget_episodic_archive',
      width: 'col-6',
      height: 'tall',
      settings: { ...WIDGET_REGISTRY.widget_episodic_archive.defaultSettings },
    },
    {
      instanceId: 'mem_signals_1',
      widgetId: 'widget_adaptation_signals',
      width: 'col-12',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_adaptation_signals.defaultSettings },
    },
  ],
  safety: [
    {
      instanceId: 'safe_strip_1',
      widgetId: 'widget_safety_strip_audit',
      width: 'col-6',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_safety_strip_audit.defaultSettings },
    },
    {
      instanceId: 'safe_guard_1',
      widgetId: 'widget_classification_guard',
      width: 'col-6',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_classification_guard.defaultSettings },
    },
    {
      instanceId: 'safe_logs_1',
      widgetId: 'widget_safety_audit_logs',
      width: 'col-12',
      height: 'standard',
      settings: { ...WIDGET_REGISTRY.widget_safety_audit_logs.defaultSettings },
    },
  ],
  debrief: [
    {
      instanceId: 'debrief_main_1',
      widgetId: 'widget_debrief_console',
      width: 'col-12',
      height: 'tall',
      settings: { ...WIDGET_REGISTRY.widget_debrief_console.defaultSettings },
    },
  ],
  conversations: [
    {
      instanceId: 'conv_context_matrix_1',
      widgetId: 'widget_active_context_matrix',
      width: 'col-12',
      height: 'compact',
      settings: { ...WIDGET_REGISTRY.widget_active_context_matrix.defaultSettings },
    },
    {
      instanceId: 'conv_importer_1',
      widgetId: 'widget_conversation_importer',
      width: 'col-6',
      height: 'tall',
      settings: { ...WIDGET_REGISTRY.widget_conversation_importer.defaultSettings },
    },
    {
      instanceId: 'conv_archive_1',
      widgetId: 'widget_conversation_archive',
      width: 'col-6',
      height: 'tall',
      settings: { ...WIDGET_REGISTRY.widget_conversation_archive.defaultSettings },
    },
  ],
};

// Helper: Get available widgets for a specific category
export function getWidgetsForCategory(category: PageCategory): WidgetDefinition[] {
  return Object.values(WIDGET_REGISTRY).filter((w) => w.category === category);
}
