export type SwarmRole = 
  | 'atlantis_core'  // Commander & Synthesizer
  | 'scout'          // web_search + web_fetch + exa (real-time intelligence)
  | 'forge'          // bash + write + edit + python (builds new tools & scripts)
  | 'validator'      // runs tests, verifies outputs, confidence scores
  | 'deployer'       // packages artifacts, pushes to GitHub/Vercel/Supabase
  | 'archivist'      // reads/writes CONTEXT_MEMORY.md and SWARM_LOG.md
  | 'critic';        // reviews every major output before delivery

export type AgentRole = 'supervisor' | 'mid_tier' | 'leaf' | SwarmRole;
export type AgentStatus = 'standby' | 'queued' | 'running' | 'complete' | 'escalated' | 'failed';
export type UniversalMode = 'everyday' | 'small_business' | 'enterprise' | 'local_gov' | 'federal';
export type RegisterMode = 'auto' | 'civilian' | 'government' | UniversalMode;
export type UserBrevity = 'terse' | 'balanced' | 'detailed';
export type AccTier = 'None' | 'Light' | 'Medium' | 'Aggressive' | 'Emergency';
export type CostComplexityTier = 'Fast/Lightweight' | 'Balanced' | 'Deep-Reasoning';

export interface AgentNodeData {
  id: string;
  nodeId: string;
  missionId?: number;
  parentId: string | null;
  depth: number;
  maxDepth?: number;
  role: AgentRole;
  swarmRole?: SwarmRole;
  task: string;
  status: AgentStatus;
  output?: string;
  streamingOutput?: string;
  certaintyTag?: string;
  confidence?: 'Confirmed' | 'Calculated Projection' | 'Low Data Density' | 'Escalated';
  curiosityFactor?: string;
  latencyMs?: number;
  contextUsagePercent?: number;
  timestamp?: number;
  // Feature 5: Adaptive Context Compaction per-node
  accTier?: AccTier;
  accPercentage?: number;
  // Feature 6: Doom Loop Guard
  outputFingerprints?: string[];
  doomLoopState?: 'nominal' | 'warned' | 'escalated';
  // Feature 9: Cost/Complexity Router
  complexityScore?: number;
  costTier?: CostComplexityTier;
  routingRationale?: string;
  // Children tracking
  childrenCount?: number;
  childrenReporting?: number;
  // Feature: Google Search Grounding metadata
  grounding?: {
    queries?: string[];
    sources?: Array<{ uri: string; title: string }>;
  };
}

export interface MissionData {
  id?: number;
  timestamp: number;
  title: string;
  sector: string;
  primarySector?: string;
  secondarySectors?: string[];
  status: 'active' | 'complete' | 'failed';
  topology: 'Centralized' | 'Decentralized' | 'Hybrid' | 'Independent';
  complexity: number;
  complexityScore?: number;
  routedTier?: CostComplexityTier;
  routingRationale?: string;
  isGovSector: boolean;
  registerMode: RegisterMode;
  operationalMode?: UniversalMode;
  userBrevity: UserBrevity;
  result?: string;
  curiosityFactor?: string;
  executionTimeMs?: number;
  nodesCount?: number;
  // ACC aggregate
  missionAccTier?: AccTier;
  missionAccPercent?: number;
  // Full agent tree snapshot for episodic memory & search
  treeSnapshot?: Record<string, AgentNodeData>;
}

// Project Swarm Blackboard & Tool Forge Types
export interface SwarmTask {
  id: string;
  title: string;
  assignedTo: SwarmRole;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'retrying';
  dependencies: string[];
  outputRef?: string;
  retryCount?: number;
  timestamp: number;
}

export interface SwarmTool {
  id: string;
  name: string;
  description: string;
  language: 'python' | 'bash' | 'javascript';
  code: string;
  sampleInput: string;
  sampleOutput: string;
  usage: string;
  createdSession: string;
  authorRole: SwarmRole;
  status: 'tested' | 'draft' | 'deployed';
  timestamp: number;
}

export interface SwarmKnowledgeItem {
  id: string;
  topic: string;
  facts: string[];
  endpointsDiscovered?: string[];
  heuristics: string[];
  sourceAgent: SwarmRole;
  timestamp: number;
}

export interface ExternalIntegrationConfig {
  id: 'github' | 'supabase' | 'vercel' | 'exa' | 'context7';
  name: string;
  status: 'connected' | 'configured' | 'standby';
  description: string;
  mcpAvailable: boolean;
  endpoint?: string;
  lastPing?: number;
}

export interface SemanticMemoryRecord {
  id?: number;
  trigger: string;
  context: string;
  action: string;
  outcome: string;
  confidence: string;
  timestamp: number;
  missionTitle?: string;
}

export interface SafetyAuditLog {
  id?: number;
  missionId?: number;
  timestamp: number;
  checkType: 'Input Validation' | 'Classification Guard' | 'Tool Sandboxing' | 'Output Review' | 'Audit Logging' | 'Doom-Loop Escalation';
  status: 'nominal' | 'escalated' | 'verified';
  details: string;
}

export interface SafetyStripResult {
  inputValidation: { passed: boolean; score: number; detail: string };
  classificationGuard: { passed: boolean; score: number; detail: string };
  toolExecutionSandboxing: { passed: boolean; score: number; detail: string };
  outputReview: { passed: boolean; score: number; detail: string };
  auditLogging: { passed: boolean; score: number; detail: string };
}

export interface AdaptationLogItem {
  id: string;
  timestamp: number;
  signal: 'Sector' | 'Topology' | 'Depth' | 'Phrasing';
  previous: string;
  learned: string;
  weight: number;
}

export interface LearnedPreferences {
  preferredSector: string;
  preferredTopology: 'Centralized' | 'Decentralized' | 'Hybrid' | 'Independent';
  preferredDepth: number;
  phrasingPatterns: string[];
  sectorFrequencies: Record<string, number>;
  topologyFrequencies: Record<string, number>;
  adaptationLog: AdaptationLogItem[];
}

export interface PersonalizationData {
  key: string;
  value: {
    registerPreference: RegisterMode;
    detectedRegister: UserBrevity;
    averageWordCount: number;
    missionsCompleted: number;
    learned?: LearnedPreferences;
  };
  lastUpdated: number;
}

// Resizable Widget Architecture Types
export type PageCategory = 'dashboard' | 'tree' | 'blackboard' | 'telemetry' | 'memory' | 'safety' | 'debrief' | 'conversations';

export type WidgetWidth = 'col-4' | 'col-6' | 'col-8' | 'col-12';
export type WidgetHeight = 'compact' | 'standard' | 'tall';

// Snap to Grid Architecture
export type GridColumnSpan = 4 | 6 | 8 | 12;

export interface WidgetInstance<TSettings = Record<string, any>> {
  instanceId: string;
  widgetId: string;
  width: WidgetWidth;
  height: WidgetHeight;
  settings: TSettings;
}

export interface WidgetSettingOption {
  key: string;
  label: string;
  description?: string;
  type: 'boolean' | 'select' | 'number';
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  category: PageCategory;
  defaultWidth: WidgetWidth;
  defaultHeight: WidgetHeight;
  defaultSettings: Record<string, any>;
  settingOptions: WidgetSettingOption[];
  iconName: string;
}

// Imported AI Conversation types
export type ConversationPlatform = 'chatgpt' | 'claude' | 'gemini' | 'custom' | 'openai' | 'anthropic';
export type ConversationFormat = 'json' | 'pdf' | 'txt' | 'csv' | 'api';

export interface ImportedMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ImportedConversation {
  id: string;
  title: string;
  platform: ConversationPlatform;
  sourceFormat: ConversationFormat;
  createdAt: number;
  importedAt: number;
  messageCount: number;
  characterCount: number;
  messages: ImportedMessage[];
  summary?: string;
  keyTopics?: string[];
  activeForContext: boolean;
  apiKeySource?: string;
  userId?: string;
}

export interface UnconfirmedConversation extends ImportedConversation {
  stagedAt: number;
  status?: 'pending_review' | 'confirmed' | 'discarded';
}

// Multi-Model Provider & Settings Architecture
export type SupportedProvider = 'gemini' | 'openai' | 'anthropic';

export interface ProviderCatalogModel {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  recommendedRole: AgentRole | 'all' | 'chat';
  isReasoning?: boolean;
  isDynamic?: boolean;
  isCustom?: boolean;
  fetchedAt?: number;
}

export interface ProviderConfig {
  apiKey: string;
  enabled: boolean;
  selectedModel: string;
  customEndpoint?: string;
  isVerified?: boolean;
  verifiedAt?: number;
  verifiedDetails?: string;
}

export interface ModelRoleAssignments {
  supervisor: { provider: SupportedProvider; model: string };
  midTier: { provider: SupportedProvider; model: string };
  leaf: { provider: SupportedProvider; model: string };
  debriefChat: { provider: SupportedProvider; model: string };
  classifier: { provider: SupportedProvider; model: string };
}

export interface ModelHyperparameters {
  temperature: number; // 0.0 - 1.0
  topP: number; // 0.0 - 1.0
  maxTokens: number;
  enableGrounding: boolean;
  streamingEnabled: boolean;
}

export interface AppModelSettings {
  activeProvider: SupportedProvider;
  providers: Record<SupportedProvider, ProviderConfig>;
  roleAssignments: ModelRoleAssignments;
  hyperparameters: ModelHyperparameters;
  customModels?: Partial<Record<SupportedProvider, ProviderCatalogModel[]>>;
  dynamicModels?: Partial<Record<SupportedProvider, ProviderCatalogModel[]>>;
}

