import Dexie, { type Table } from 'dexie';
import type { 
  MissionData, 
  AgentNodeData, 
  SemanticMemoryRecord, 
  SafetyAuditLog, 
  PersonalizationData,
  LearnedPreferences,
  ImportedConversation
} from './types';

export class AtlantisDatabase extends Dexie {
  missions!: Table<MissionData, number>;
  agents!: Table<AgentNodeData, string>;
  semanticMemory!: Table<SemanticMemoryRecord, number>;
  safetyLogs!: Table<SafetyAuditLog, number>;
  personalization!: Table<PersonalizationData, string>;
  importedConversations!: Table<ImportedConversation, string>;

  constructor() {
    super('AtlantisDB');
    this.version(1).stores({
      missions: '++id, timestamp, title, sector, status, topology',
      agents: 'nodeId, missionId, parentId, depth, status, role',
      semanticMemory: '++id, trigger, context, confidence, timestamp',
      safetyLogs: '++id, missionId, timestamp, checkType, status',
      personalization: 'key, lastUpdated',
    });

    this.version(2).stores({
      missions: '++id, timestamp, title, sector, status, topology',
      agents: 'nodeId, missionId, parentId, depth, status, role',
      semanticMemory: '++id, trigger, context, confidence, timestamp',
      safetyLogs: '++id, missionId, timestamp, checkType, status',
      personalization: 'key, lastUpdated',
      importedConversations: 'id, createdAt, importedAt, title, platform, sourceFormat, activeForContext'
    });
  }
}

export const db = new AtlantisDatabase();

export async function seedDefaultDatabase() {
  const memoryCount = await db.semanticMemory.count();
  if (memoryCount === 0) {
    await db.semanticMemory.bulkAdd([
      {
        trigger: "Critical infrastructure load shedding anomaly",
        context: "Sector: Energy",
        action: "Delegated dual leaf specialists to verify SCADA breaker telemetry before routing failover",
        outcome: "Avoided cascade trip; verified load within 1.2% safety margins",
        confidence: "Confirmed",
        timestamp: Date.now() - 3600000 * 24 * 3,
        missionTitle: "Regional Grid Phase Imbalance Stabilization"
      },
      {
        trigger: "Zero-day kernel privilege escalation vulnerability",
        context: "Sector: Cybersecurity",
        action: "Hierarchical containment protocol: isolated ingress gateways prior to payload decompilation",
        outcome: "Zero packet exfiltration; generated verified firewall rule set",
        confidence: "Confirmed",
        timestamp: Date.now() - 3600000 * 24 * 2,
        missionTitle: "Border Gateway Telemetry Audit"
      },
      {
        trigger: "Port congestion and cold chain thermal drift",
        context: "Sector: Logistics & Supply",
        action: "Decentralized sensor triage across cold storage containers",
        outcome: "Rerouted pharmaceutical cargo to secondary cryogenic bay with zero spoilage",
        confidence: "Confirmed",
        timestamp: Date.now() - 3600000 * 24,
        missionTitle: "Maritime Pharmaceutical Cold Chain Monitoring"
      }
    ]);
  }

  const missionsCount = await db.missions.count();
  if (missionsCount === 0) {
    const sampleTree: Record<string, AgentNodeData> = {
      root: {
        id: 'sample-root',
        nodeId: 'root',
        parentId: null,
        depth: 1,
        maxDepth: 3,
        role: 'supervisor',
        task: 'Resolve cascading frequency anomaly across Substation 4B in the regional power grid.',
        status: 'complete',
        output: `[Certainty: Confirmed across subordinate verification streams]

Primary mission synthesis for Regional Grid Phase Imbalance Stabilization:
Operational vectors have converged. Telemetry from Substation 4B reveals phase deviation originated in the cooling manifold telemetry loop [§root-1]. As confirmed by leaf diagnostics [§root-1-1], the primary bypass regulator has absorbed harmonic drift. 

Key actionable conclusions:
1. Frequency oscillation dampened to 59.98 Hz, well within NERC standards [§root-1-1].
2. Redundant carrier bus 02 isolated and ready for staged reintegration [§root-2].
3. SCADA safety interlocks verified and restored to nominal operating state.

Curiosity Factor: Secondary harmonic fluctuations in adjacent grid relays indicate potential unmapped load shifting during peak transition windows.`,
        certaintyTag: 'Confirmed across subordinate verification streams',
        confidence: 'Confirmed',
        curiosityFactor: 'Secondary harmonic fluctuations in adjacent grid relays indicate potential unmapped load shifting during peak transition windows.',
        latencyMs: 312,
        contextUsagePercent: 32,
        accTier: 'None',
        accPercentage: 35,
        costTier: 'Deep-Reasoning',
        complexityScore: 8,
        routingRationale: 'High-stakes infrastructure resilience requiring multi-tier child verification.',
        childrenCount: 2,
        childrenReporting: 2
      },
      'root-1': {
        id: 'sample-1',
        nodeId: 'root-1',
        parentId: 'root',
        depth: 2,
        maxDepth: 3,
        role: 'mid_tier',
        task: 'Diagnose Substation 4B transformer telemetry and cooling loop status',
        status: 'complete',
        output: `[Certainty: High-probability calculated projection]
Substation telemetry analyzed. Specialist [§root-1-1] confirmed phase drift was restricted to cooling manifold sensors. Recommendation: Maintain bypass load and initiate secondary relay calibration.`,
        certaintyTag: 'High-probability calculated projection',
        confidence: 'Confirmed',
        latencyMs: 240,
        contextUsagePercent: 28,
        accTier: 'None',
        accPercentage: 25,
        costTier: 'Balanced',
        complexityScore: 6,
        routingRationale: 'Diagnostic decomposition across hardware sensors.',
        childrenCount: 1,
        childrenReporting: 1
      },
      'root-1-1': {
        id: 'sample-1-1',
        nodeId: 'root-1-1',
        parentId: 'root-1',
        depth: 3,
        maxDepth: 3,
        role: 'leaf',
        task: 'Probe coolant pressure transducers and thermal sensor array',
        status: 'complete',
        output: `[Certainty: Confirmed by empirical telemetry]
Empirical sensor reading: Transducer manifold pressure nominal at 42.1 PSI. Thermal fluctuation of 1.4°C detected on phase C busbar. Bypass flow calibrated.`,
        certaintyTag: 'Confirmed by empirical telemetry',
        confidence: 'Confirmed',
        latencyMs: 180,
        contextUsagePercent: 18,
        accTier: 'None',
        accPercentage: 15,
        costTier: 'Fast/Lightweight',
        complexityScore: 4,
        routingRationale: 'Atomic telemetry sensor validation.'
      },
      'root-2': {
        id: 'sample-2',
        nodeId: 'root-2',
        parentId: 'root',
        depth: 2,
        maxDepth: 3,
        role: 'leaf',
        task: 'Verify secondary carrier bus isolation and interlock stability',
        status: 'complete',
        output: `[Certainty: Confirmed by dual SCADA telemetry]
Interlock status: Tripped open within 12ms of phase deviation trigger. Isolation verified with zero leakage voltage across bus 02. Ready for sequenced reset.`,
        certaintyTag: 'Confirmed by dual SCADA telemetry',
        confidence: 'Confirmed',
        latencyMs: 195,
        contextUsagePercent: 22,
        accTier: 'None',
        accPercentage: 20,
        costTier: 'Fast/Lightweight',
        complexityScore: 4,
        routingRationale: 'Deterministic switchgear verification.'
      }
    };

    await db.missions.add({
      timestamp: Date.now() - 3600000 * 24,
      title: 'Resolve cascading frequency anomaly across Substation 4B in the regional power grid.',
      sector: 'Energy',
      primarySector: 'Energy',
      secondarySectors: ['Infrastructure', 'Emergency Response'],
      status: 'complete',
      topology: 'Hybrid',
      complexity: 8,
      complexityScore: 8,
      routedTier: 'Deep-Reasoning',
      routingRationale: 'Critical grid infrastructure requiring recursive verification.',
      isGovSector: false,
      registerMode: 'civilian',
      userBrevity: 'balanced',
      result: sampleTree.root.output,
      curiosityFactor: sampleTree.root.curiosityFactor,
      executionTimeMs: 927,
      nodesCount: 4,
      missionAccTier: 'None',
      missionAccPercent: 26,
      treeSnapshot: sampleTree
    });
  }

  const pRecord = await db.personalization.get('profile');
  if (!pRecord) {
    const defaultLearned: LearnedPreferences = {
      preferredSector: 'Cybersecurity',
      preferredTopology: 'Hybrid',
      preferredDepth: 3,
      phrasingPatterns: ['stabilize', 'containment', 'audit telemetry', 'isolate'],
      sectorFrequencies: {
        Cybersecurity: 5,
        Energy: 4,
        'Emergency Response': 3,
        'Legal & Compliance': 2
      },
      topologyFrequencies: {
        Hybrid: 8,
        Centralized: 3,
        Decentralized: 2
      },
      adaptationLog: [
        {
          id: 'ad-1',
          timestamp: Date.now() - 3600000 * 12,
          signal: 'Sector',
          previous: 'General',
          learned: 'High frequency in Cybersecurity & Infrastructure',
          weight: 0.85
        },
        {
          id: 'ad-2',
          timestamp: Date.now() - 3600000 * 6,
          signal: 'Depth',
          previous: '2',
          learned: 'Operator favors 3-level recursive hierarchy',
          weight: 0.9
        },
        {
          id: 'ad-3',
          timestamp: Date.now() - 3600000 * 2,
          signal: 'Phrasing',
          previous: 'Generic',
          learned: 'Learned priority phrasing: "audit telemetry", "containment protocol"',
          weight: 0.78
        }
      ]
    };

    await db.personalization.put({
      key: 'profile',
      value: {
        registerPreference: 'auto',
        averageWordCount: 16,
        detectedRegister: 'balanced',
        missionsCompleted: 4,
        learned: defaultLearned
      },
      lastUpdated: Date.now()
    });
  }

  // Seed default imported external AI conversations
  const convCount = await db.importedConversations.count();
  if (convCount === 0) {
    const seedConversations: ImportedConversation[] = [
      {
        id: 'conv-chatgpt-grid-failover',
        title: 'SCADA Interlock Failover & NERC CIP-007 Isolation Analysis',
        platform: 'chatgpt',
        sourceFormat: 'json',
        createdAt: Date.now() - 3600000 * 48,
        importedAt: Date.now() - 3600000 * 12,
        messageCount: 4,
        characterCount: 3120,
        summary: 'Technical dialogue discussing isolation triggers for 500kV transformer relays and empirical bypass verification.',
        keyTopics: ['SCADA', 'NERC CIP', 'Transformer Trip', 'Harmonic Drift'],
        activeForContext: true,
        messages: [
          {
            id: 'm1',
            sender: 'user',
            content: 'How should an automated coordination system isolate Substation 4B if harmonic drift exceeds 1.5% without causing cascade shedding?',
            timestamp: Date.now() - 3600000 * 48
          },
          {
            id: 'm2',
            sender: 'assistant',
            content: 'To prevent cascade load shedding, execute a staged decoupled isolation: First, decouple redundant bus 02 via high-speed vacuum breaker within 12ms. Second, verify cooling manifold thermal pressure transducers prior to tripping the main feed. Maintain secondary bypass voltage at 59.98 Hz.',
            timestamp: Date.now() - 3600000 * 47
          },
          {
            id: 'm3',
            sender: 'user',
            content: 'What telemetry should leaf agents continuously probe during this sequence?',
            timestamp: Date.now() - 3600000 * 46
          },
          {
            id: 'm4',
            sender: 'assistant',
            content: 'Specialist probes must sample: 1. Manifold pressure (nominal 40-45 PSI); 2. Phase C busbar thermal gradient (<2.0°C deviation); 3. SCADA safety interlock parity bit across both carrier paths.',
            timestamp: Date.now() - 3600000 * 45
          }
        ]
      },
      {
        id: 'conv-claude-zero-day-containment',
        title: 'Zero-Day Kernel Privilege Escalation Defense Protocol',
        platform: 'claude',
        sourceFormat: 'txt',
        createdAt: Date.now() - 3600000 * 72,
        importedAt: Date.now() - 3600000 * 20,
        messageCount: 2,
        characterCount: 1850,
        summary: 'Architectural mitigation strategy for zero-day privilege escalation on edge ingress gateways.',
        keyTopics: ['Kernel Hardening', 'eBPF Probes', 'Zero-Day', 'Air-Gapping'],
        activeForContext: true,
        messages: [
          {
            id: 'c1',
            sender: 'user',
            content: 'In a multi-agent cyber defense grid, how do we contain an unknown kernel exploit without tearing down operational telemetry pipelines?',
            timestamp: Date.now() - 3600000 * 72
          },
          {
            id: 'c2',
            sender: 'assistant',
            content: 'Establish an immutable eBPF sandbox ring around tainted worker namespaces. Rather than a hard gateway disconnect which blindingly interrupts telemetry, sever outward egress sockets while leaving internal loopback logging active. Once isolated, spawn a specialized decompilation agent to generate byte-level firewall rules.',
            timestamp: Date.now() - 3600000 * 71
          }
        ]
      }
    ];

    await db.importedConversations.bulkAdd(seedConversations);
  }
}

// Helper methods for Imported Conversations
export async function saveImportedConversation(conv: ImportedConversation, _uid?: string): Promise<void> {
  await db.importedConversations.put(conv);
}

export async function getImportedConversations(_uid?: string): Promise<ImportedConversation[]> {
  return await db.importedConversations.toArray();
}

export async function deleteImportedConversation(id: string, _uid?: string): Promise<void> {
  await db.importedConversations.delete(id);
}

export async function toggleConversationContextActive(id: string, active: boolean, _uid?: string): Promise<void> {
  await db.importedConversations.update(id, { activeForContext: active });
}

export async function getActiveContextConversations(_uid?: string): Promise<ImportedConversation[]> {
  return await db.importedConversations.filter(c => c.activeForContext).toArray();
}

// Convenient aliases
export const getActiveImportedConversations = getActiveContextConversations;
export const toggleConversationActive = toggleConversationContextActive;

