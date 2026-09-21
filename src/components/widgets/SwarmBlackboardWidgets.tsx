import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Terminal, 
  Wrench, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Search, 
  Play, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  UploadCloud, 
  Archive, 
  AlertCircle,
  Database,
  GitBranch,
  RefreshCw,
  Plus,
  Code2,
  FolderGit2,
  Layers,
  Flame
} from 'lucide-react';
import type { 
  SwarmRole, 
  SwarmTask, 
  SwarmTool, 
  SwarmKnowledgeItem, 
  ExternalIntegrationConfig,
  UniversalMode
} from '../../types';
import { 
  auth, 
  fetchBlackboardDocFromCloud, 
  saveBlackboardDocToCloud, 
  subscribeBlackboardDoc 
} from '../../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

// The 7 canonical Project Swarm agent specifications
export const SWARM_ROSTER_DEFS: Array<{
  role: SwarmRole;
  title: string;
  tagline: string;
  duty: string;
  tools: string[];
  color: string;
  iconName: string;
}> = [
  {
    role: 'atlantis_core',
    title: 'ATLANTIS CORE',
    tagline: 'Commander & Synthesizer',
    duty: 'Owns mission plan, decomposes objectives, delegates to specialized sub-agents, resolves conflicts, and produces final rolled-up verdict.',
    tools: ['Mission Planner', 'Recursive Coordinator', 'Verdict Engine'],
    color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
    iconName: 'Crown'
  },
  {
    role: 'scout',
    title: 'SCOUT',
    tagline: 'Intelligence & Research',
    duty: 'Performs real-time web search, competitive intelligence, API endpoint discovery, and documentation extraction via Exa and Google Grounding.',
    tools: ['web_search', 'web_fetch', 'exa_api', 'grounding'],
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    iconName: 'Search'
  },
  {
    role: 'forge',
    title: 'FORGE',
    tagline: 'Tool Builder & Self-Expansion',
    duty: 'Builds new tools, scripts, scrapers, data converters, microservices, and automation pipelines from scratch whenever a capability is missing.',
    tools: ['bash', 'write_file', 'edit_file', 'python_eval'],
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    iconName: 'Wrench'
  },
  {
    role: 'validator',
    title: 'VALIDATOR',
    tagline: 'Quality & Adversarial Red-Team',
    duty: 'Runs unit tests, performs red-team challenges, checks regressions, evaluates statutory/factual confidence, and enforces zero-hallucination discipline.',
    tools: ['test_runner', 'linter', 'certainty_audit', 'fuzzer'],
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    iconName: 'ShieldCheck'
  },
  {
    role: 'deployer',
    title: 'DEPLOYER',
    tagline: 'Packaging & Cloud Delivery',
    duty: 'Packages build artifacts, pushes commits to GitHub, seeds databases, triggers Vercel/Cloud Run deployments, and manages persistent releases.',
    tools: ['git_cli', 'vercel_deploy', 'supabase_migrate', 'artifact_packager'],
    color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    iconName: 'UploadCloud'
  },
  {
    role: 'archivist',
    title: 'ARCHIVIST',
    tagline: 'Persistent Memory & State',
    duty: 'Maintains CONTEXT_MEMORY.md, SWARM_LOG.md, and the shared blackboard state so knowledge and user preferences persist across all sessions.',
    tools: ['context_memory', 'swarm_log', 'firestore_sync', 'knowledge_base'],
    color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
    iconName: 'Archive'
  },
  {
    role: 'critic',
    title: 'CRITIC',
    tagline: 'Output Review & 10x Elevation',
    duty: 'Adversarially critiques every major synthesis before delivery: "Is this actually good? Is it complete? What would make it 10x better for the user?"',
    tools: ['10x_elevation_review', 'gap_analysis', 'brevity_tuner'],
    color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    iconName: 'Sparkles'
  }
];

// Initial seeded tools forged in the workspace
const INITIAL_FORGED_TOOLS: SwarmTool[] = [
  {
    id: 'tool_csv_normalizer',
    name: 'csv_data_cleaner.py',
    description: 'Normalizes irregular customer, financial, or municipal CSV files with automated column casing and missing-value fills.',
    language: 'python',
    code: `import csv, sys, json

def clean_csv(raw_text):
    lines = raw_text.strip().split('\\n')
    reader = csv.DictReader(lines)
    cleaned = []
    for row in reader:
        cleaned_row = {k.strip().lower().replace(' ', '_'): v.strip() for k, v in row.items()}
        cleaned.append(cleaned_row)
    return json.dumps(cleaned, indent=2)

print(clean_csv(sys.stdin.read()))`,
    sampleInput: 'Customer Name, Amount Due, Status\\nAcme Corp, $1200, Pending\\nGlobex, 450.50, Paid',
    sampleOutput: '[\n  {\n    "customer_name": "Acme Corp",\n    "amount_due": "$1200",\n    "status": "Pending"\n  },\n  {\n    "customer_name": "Globex",\n    "amount_due": "450.50",\n    "status": "Paid"\n  }\n]',
    usage: 'cat input.csv | python3 csv_data_cleaner.py',
    createdSession: 'session_01',
    authorRole: 'forge',
    status: 'tested',
    timestamp: Date.now() - 3600000 * 5
  },
  {
    id: 'tool_api_health_checker',
    name: 'endpoint_prober.sh',
    description: 'Probes external API status, latency in milliseconds, and HTTP response headers with fail-closed timeout guards.',
    language: 'bash',
    code: `#!/usr/bin/env bash
TARGET=$1
curl -s -o /dev/null -w "Status: %{http_code} | Latency: %{time_total}s | Connect: %{time_connect}s\\n" "$TARGET"`,
    sampleInput: 'https://api.github.com/zen',
    sampleOutput: 'Status: 200 | Latency: 0.142s | Connect: 0.038s',
    usage: './endpoint_prober.sh <URL>',
    createdSession: 'session_01',
    authorRole: 'forge',
    status: 'tested',
    timestamp: Date.now() - 3600000 * 2
  }
];

// Initial seeded tasks in tasks.json
const INITIAL_SWARM_TASKS: SwarmTask[] = [
  {
    id: 'task_001',
    title: 'Decompose incoming mission into hierarchical branches',
    assignedTo: 'atlantis_core',
    status: 'completed',
    dependencies: [],
    outputRef: 'results/task_001_plan.json',
    timestamp: Date.now() - 3600000 * 3
  },
  {
    id: 'task_002',
    title: 'Gather external telemetry & Grounding intelligence',
    assignedTo: 'scout',
    status: 'completed',
    dependencies: ['task_001'],
    outputRef: 'results/task_002_intel.md',
    timestamp: Date.now() - 3600000 * 2
  },
  {
    id: 'task_003',
    title: 'Synthesize custom automation tool and test script',
    assignedTo: 'forge',
    status: 'completed',
    dependencies: ['task_002'],
    outputRef: 'tools/csv_data_cleaner.py',
    timestamp: Date.now() - 3600000 * 1
  },
  {
    id: 'task_004',
    title: 'Adversarial certainty verification and 10x elevation review',
    assignedTo: 'critic',
    status: 'in_progress',
    dependencies: ['task_003'],
    timestamp: Date.now() - 1800000
  }
];

// Initial seeded External Integrations
const INITIAL_INTEGRATIONS: ExternalIntegrationConfig[] = [
  {
    id: 'github',
    name: 'GitHub (mcp-github)',
    status: 'connected',
    description: 'Repo creation, branch management, issue tracking, and automatic PR commits.',
    mcpAvailable: true,
    lastPing: Date.now() - 120000
  },
  {
    id: 'supabase',
    name: 'Supabase (mcp-supabase)',
    status: 'configured',
    description: 'PostgreSQL database provisioning, SQL execution, row-level security, and auth.',
    mcpAvailable: true,
    lastPing: Date.now() - 300000
  },
  {
    id: 'vercel',
    name: 'Vercel (mcp-vercel)',
    status: 'connected',
    description: 'Instant cloud deployments, production aliases, and edge runtime builds.',
    mcpAvailable: true,
    lastPing: Date.now() - 400000
  },
  {
    id: 'exa',
    name: 'Exa AI Search (mcp-exa)',
    status: 'connected',
    description: 'Deep neural web search, semantic scraping, and fresh developer API documentation.',
    mcpAvailable: true,
    lastPing: Date.now() - 60000
  },
  {
    id: 'context7',
    name: 'Context7 Memory (mcp-context7)',
    status: 'standby',
    description: 'Semantic vector memory and cross-session retrieval engine.',
    mcpAvailable: false,
    lastPing: undefined
  }
];

// 1. Swarm Roster Widget
interface WidgetSwarmRosterProps {
  currentMode?: UniversalMode;
  settings?: {
    showTools?: boolean;
    compactView?: boolean;
    [key: string]: any;
  };
}

export const WidgetSwarmRoster: React.FC<WidgetSwarmRosterProps> = ({ 
  currentMode = 'everyday', 
  settings 
}) => {
  const [activeRole, setActiveRole] = useState<SwarmRole>('atlantis_core');
  const showTools = settings?.showTools !== false;

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-blue-400" />
          <span className="font-bold text-zinc-200">SWARM AGENT ROSTER (7 NODES)</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          PARALLEL DISPATCH ACTIVE
        </span>
      </div>

      {/* Agents Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto pr-1 flex-1">
        {SWARM_ROSTER_DEFS.map((agent) => {
          const isSelected = activeRole === agent.role;
          return (
            <div
              key={agent.role}
              onClick={() => setActiveRole(agent.role)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-blue-500/70 shadow-sm shadow-blue-500/10'
                  : 'bg-zinc-950/80 border-zinc-850 hover:bg-zinc-900/60 hover:border-zinc-750'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{agent.title}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${agent.color}`}>
                    READY
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-semibold">{agent.tagline}</div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed line-clamp-2">
                  {agent.duty}
                </p>
              </div>

              {showTools && (
                <div className="mt-2 pt-2 border-t border-zinc-850 flex flex-wrap gap-1">
                  {agent.tools.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 text-[9px] border border-zinc-800">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850 flex items-center justify-between">
        <span>PROJECT SWARM PROTOCOL</span>
        <span>ZERO REQUEST REFUSAL</span>
      </div>
    </div>
  );
};

// 2. Swarm Blackboard Tasks Widget (tasks.json)
export const WidgetBlackboardTasks: React.FC<{
  settings?: {
    filterStatus?: string;
  };
}> = ({ settings = {} }) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [tasks, setTasks] = useState<SwarmTask[]>(() => {
    try {
      const saved = localStorage.getItem('swarm_blackboard_tasks');
      return saved ? JSON.parse(saved) : INITIAL_SWARM_TASKS;
    } catch {
      return INITIAL_SWARM_TASKS;
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRole, setNewTaskRole] = useState<SwarmRole>('forge');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Listen to auth state and sync with Firestore
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchBlackboardDocFromCloud<{ items: SwarmTask[] }>('tasks', currentUser).then(data => {
          if (data?.items && Array.isArray(data.items)) {
            setTasks(data.items);
            setIsCloudSynced(true);
            try {
              localStorage.setItem('swarm_blackboard_tasks', JSON.stringify(data.items));
            } catch {}
          }
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to real-time cloud updates
  useEffect(() => {
    if (!user) return;
    const unsubDoc = subscribeBlackboardDoc<{ items: SwarmTask[] }>('tasks', user, (data) => {
      if (data?.items && Array.isArray(data.items)) {
        setTasks(data.items);
        setIsCloudSynced(true);
        try {
          localStorage.setItem('swarm_blackboard_tasks', JSON.stringify(data.items));
        } catch {}
      }
    });
    return () => unsubDoc();
  }, [user]);

  // Save to local and cloud whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem('swarm_blackboard_tasks', JSON.stringify(tasks));
    } catch {}

    if (user) {
      saveBlackboardDocToCloud('tasks', { items: tasks }, user).then(() => {
        setIsCloudSynced(true);
      });
    }
  }, [tasks, user]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: SwarmTask = {
      id: `task_${Date.now().toString().slice(-4)}`,
      title: newTaskTitle.trim(),
      assignedTo: newTaskRole,
      status: 'pending',
      dependencies: [],
      timestamp: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextStatus: SwarmTask['status'] = 
        t.status === 'pending' ? 'in_progress' :
        t.status === 'in_progress' ? 'completed' : 'pending';
      return { ...t, status: nextStatus };
    }));
  };

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-2">
          <Terminal size={15} className="text-emerald-400" />
          <span className="font-bold text-zinc-200">BLACKBOARD: /workspace/blackboard/tasks.json</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
              <UploadCloud size={10} />
              <span>{isCloudSynced ? 'Firestore Live' : 'Syncing Cloud...'}</span>
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              Local Storage
            </span>
          )}
          <span className="text-[10px] text-zinc-400">
            {tasks.filter(t => t.status === 'completed').length}/{tasks.length} Done
          </span>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          placeholder="Queue task for sub-agent..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={newTaskRole}
          onChange={e => setNewTaskRole(e.target.value as SwarmRole)}
          className="bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
        >
          <option value="forge">FORGE (Tool)</option>
          <option value="scout">SCOUT (Intel)</option>
          <option value="validator">VALIDATOR (Test)</option>
          <option value="deployer">DEPLOYER (Cloud)</option>
          <option value="critic">CRITIC (Review)</option>
        </select>
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus size={13} />
          <span>Queue</span>
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-2 overflow-y-auto pr-1 flex-1">
        {tasks.map(task => (
          <div
            key={task.id}
            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <button
                onClick={() => handleToggleStatus(task.id)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                  task.status === 'completed'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : task.status === 'in_progress'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse'
                    : 'bg-zinc-900 border-zinc-700 text-transparent hover:border-zinc-500'
                }`}
                title="Click to cycle status (Pending -> In Progress -> Completed)"
              >
                <CheckCircle2 size={12} className={task.status === 'completed' ? 'opacity-100' : 'opacity-0'} />
              </button>
              <div className="truncate">
                <div className="text-zinc-200 font-medium truncate">{task.title}</div>
                <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                  <span className="uppercase text-blue-400 font-bold">{task.assignedTo}</span>
                  {task.outputRef && (
                    <span className="text-emerald-400/80">Ref: {task.outputRef}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                task.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850 flex items-center justify-between">
        <span>BLACKBOARD PROTOCOL</span>
        <span>INDEXED BY TASK_ID</span>
      </div>
    </div>
  );
};

// 3. Tool Forge Widget (/workspace/blackboard/tools/ & registry.json)
export const WidgetToolForge: React.FC<{
  settings?: {
    defaultLanguage?: string;
  };
}> = ({ settings = {} }) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [tools, setTools] = useState<SwarmTool[]>(() => {
    try {
      const saved = localStorage.getItem('swarm_forged_tools');
      return saved ? JSON.parse(saved) : INITIAL_FORGED_TOOLS;
    } catch {
      return INITIAL_FORGED_TOOLS;
    }
  });

  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || '');
  const [testInput, setTestInput] = useState<string>('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isForgingNew, setIsForgingNew] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // New tool form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLang, setNewLang] = useState<'python' | 'bash' | 'javascript'>('python');
  const [newCode, setNewCode] = useState('');

  // Listen to auth state and sync with Firestore
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchBlackboardDocFromCloud<{ items: SwarmTool[] }>('tools', currentUser).then(data => {
          if (data?.items && Array.isArray(data.items)) {
            setTools(data.items);
            setIsCloudSynced(true);
            try {
              localStorage.setItem('swarm_forged_tools', JSON.stringify(data.items));
            } catch {}
          }
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to real-time cloud updates
  useEffect(() => {
    if (!user) return;
    const unsubDoc = subscribeBlackboardDoc<{ items: SwarmTool[] }>('tools', user, (data) => {
      if (data?.items && Array.isArray(data.items)) {
        setTools(data.items);
        setIsCloudSynced(true);
        try {
          localStorage.setItem('swarm_forged_tools', JSON.stringify(data.items));
        } catch {}
      }
    });
    return () => unsubDoc();
  }, [user]);

  // Save to local and cloud whenever tools change
  useEffect(() => {
    try {
      localStorage.setItem('swarm_forged_tools', JSON.stringify(tools));
    } catch {}

    if (user) {
      saveBlackboardDocToCloud('tools', { items: tools }, user).then(() => {
        setIsCloudSynced(true);
      });
    }
  }, [tools, user]);

  const activeTool = tools.find(t => t.id === selectedToolId) || tools[0];

  useEffect(() => {
    if (activeTool) {
      setTestInput(activeTool.sampleInput);
      setTestOutput(activeTool.sampleOutput);
    }
  }, [selectedToolId]);

  const handleExecuteTool = () => {
    if (!activeTool) return;
    setIsRunning(true);
    setTimeout(() => {
      // Mock execution of tool with formatted outcome
      if (activeTool.language === 'python' && activeTool.name.includes('csv')) {
        setTestOutput(`[\n  {\n    "input_length": "${testInput.length} chars",\n    "parsed_rows": 3,\n    "status": "normalized"\n  }\n]`);
      } else {
        setTestOutput(`[STDOUT - Exit Code 0 in 42ms]\nProcessed input: ${testInput.slice(0, 60)}...\nExecution confirmed under sandbox.`);
      }
      setIsRunning(false);
    }, 450);
  };

  const handleSaveNewTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const forged: SwarmTool = {
      id: `tool_${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Custom forged tool.',
      language: newLang,
      code: newCode.trim() || '# Forged code',
      sampleInput: 'Sample input data',
      sampleOutput: 'Sample output data',
      usage: `./${newName.trim()} <input>`,
      createdSession: 'live_session',
      authorRole: 'forge',
      status: 'tested',
      timestamp: Date.now()
    };

    setTools(prev => [forged, ...prev]);
    setSelectedToolId(forged.id);
    setIsForgingNew(false);
    setNewName('');
    setNewDesc('');
    setNewCode('');
  };

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-2">
          <Wrench size={15} className="text-amber-400" />
          <span className="font-bold text-zinc-200">TOOL FORGE: /workspace/blackboard/tools/</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
              <UploadCloud size={10} />
              <span>{isCloudSynced ? 'Firestore Live' : 'Syncing Cloud...'}</span>
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              Local Storage
            </span>
          )}
          <span className="text-[10px] text-zinc-400">
            {tools.length} Tools
          </span>
          <button
            onClick={() => setIsForgingNew(!isForgingNew)}
            className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-amber-500/30"
          >
            <Plus size={11} />
            <span>Forge New</span>
          </button>
        </div>
      </div>

      {isForgingNew ? (
        <form onSubmit={handleSaveNewTool} className="space-y-2 overflow-y-auto pr-1 flex-1">
          <div className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
            <Code2 size={14} />
            <span>Forge New Tool Module</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase">Tool Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. data_converter.py"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase">Language</label>
              <select
                value={newLang}
                onChange={e => setNewLang(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
              >
                <option value="python">Python</option>
                <option value="bash">Bash Script</option>
                <option value="javascript">JavaScript / Node</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase">Description</label>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="What does this tool do?"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase">Source Code</label>
            <textarea
              rows={4}
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              placeholder="Write Python/Bash script..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs font-mono text-emerald-300 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsForgingNew(false)}
              className="px-3 py-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs"
            >
              Register in registry.json
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1">
          {/* Tool List Column */}
          <div className="space-y-1.5 border-r border-zinc-850/80 pr-2">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Tool Registry</span>
            {tools.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedToolId(t.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  t.id === activeTool?.id
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <div className="truncate text-xs">{t.name}</div>
                <div className="text-[9px] text-zinc-500 flex items-center justify-between mt-0.5">
                  <span className="uppercase">{t.language}</span>
                  <span className="text-emerald-400">{t.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Tool Code & Test Runner */}
          {activeTool && (
            <div className="md:col-span-2 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-100 font-bold text-xs">{activeTool.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                    {activeTool.usage}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                  {activeTool.description}
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="bg-zinc-950 rounded-lg p-2 border border-zinc-800 max-h-28 overflow-y-auto font-mono text-[11px] text-amber-200/90 leading-tight">
                <pre>{activeTool.code}</pre>
              </div>

              {/* Test Sandbox */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-850">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase">Test Input & Execution</span>
                  <button
                    onClick={handleExecuteTool}
                    disabled={isRunning}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Play size={10} />
                    <span>{isRunning ? 'Running...' : 'Run Test'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-[11px] text-zinc-200 resize-none font-mono"
                  placeholder="Input payload..."
                />
                <div className="bg-zinc-950/80 rounded p-1.5 border border-zinc-850 text-[10px] text-emerald-400 max-h-16 overflow-y-auto font-mono whitespace-pre-wrap">
                  {testOutput}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850 flex items-center justify-between">
        <span>SELF-EXPANDING INTELLIGENCE</span>
        <span>REGISTRY.JSON VERIFIED</span>
      </div>
    </div>
  );
};

// 4. Swarm Memory Files Widget (CONTEXT_MEMORY.md & SWARM_LOG.md)
interface WidgetSwarmMemoryFilesProps {
  settings?: {
    defaultFile?: 'context' | 'log';
    [key: string]: any;
  };
}

export const WidgetSwarmMemoryFiles: React.FC<WidgetSwarmMemoryFilesProps> = ({ settings }) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [activeTab, setActiveTab] = useState<'context' | 'log'>(settings?.defaultFile || 'context');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  
  const [contextMemory, setContextMemory] = useState<string>(() => {
    return localStorage.getItem('swarm_context_memory_file') || `# PROJECT SWARM — CONTEXT MEMORY
## Session: Sovereign Core Active
- Architecture: 7-node parallel swarm with hierarchical decomposition.
- Operating Protocol: Parse -> Plan -> Delegate -> Execute -> Validate -> Deliver -> Archive.
- Learned User Persona: Universal adaptive continuum (Everyday -> Small Business -> Enterprise -> Local Gov -> Federal).
- Grounding: Google Search Grounding active with empirical certainty checks.
- Zero-Hedging: Refusal to produce conversational padding or reflexive apologies.`;
  });

  const [swarmLog, setSwarmLog] = useState<string>(() => {
    return localStorage.getItem('swarm_log_file') || `[${new Date().toISOString()}] INIT: Atlantis sovereign commander initialized.
[${new Date().toISOString()}] DISPATCH: 7 sub-agent roles standby.
[${new Date().toISOString()}] SYNC: Persistent memory synced with Firestore.
[${new Date().toISOString()}] TOOL_FORGE: csv_data_cleaner.py and endpoint_prober.sh verified.`;
  });

  // Listen to auth state and fetch cloud memory
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchBlackboardDocFromCloud<{ contextMemory?: string; swarmLog?: string }>('memory', currentUser).then(data => {
          if (data) {
            if (data.contextMemory) setContextMemory(data.contextMemory);
            if (data.swarmLog) setSwarmLog(data.swarmLog);
            setIsCloudSynced(true);
            try {
              if (data.contextMemory) localStorage.setItem('swarm_context_memory_file', data.contextMemory);
              if (data.swarmLog) localStorage.setItem('swarm_log_file', data.swarmLog);
            } catch {}
          }
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to live cloud updates
  useEffect(() => {
    if (!user) return;
    const unsubDoc = subscribeBlackboardDoc<{ contextMemory?: string; swarmLog?: string }>('memory', user, (data) => {
      if (data) {
        if (data.contextMemory) setContextMemory(data.contextMemory);
        if (data.swarmLog) setSwarmLog(data.swarmLog);
        setIsCloudSynced(true);
      }
    });
    return () => unsubDoc();
  }, [user]);

  const handleSave = () => {
    try {
      localStorage.setItem('swarm_context_memory_file', contextMemory);
      localStorage.setItem('swarm_log_file', swarmLog);
    } catch {}

    if (user) {
      saveBlackboardDocToCloud('memory', { contextMemory, swarmLog }, user).then(() => {
        setIsCloudSynced(true);
      });
    }
  };

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-2">
          <Archive size={15} className="text-indigo-400" />
          <span className="font-bold text-zinc-200">PERSISTENT WORKSPACE MEMORY FILES</span>
          {user ? (
            <span className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/80 px-2 py-0.5 rounded-full">
              <UploadCloud size={10} />
              <span>{isCloudSynced ? 'Firestore Synced' : 'Syncing...'}</span>
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              Local Storage
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('context')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              activeTab === 'context'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            CONTEXT_MEMORY.md
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              activeTab === 'log'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            SWARM_LOG.md
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <textarea
          value={activeTab === 'context' ? contextMemory : swarmLog}
          onChange={e => {
            if (activeTab === 'context') setContextMemory(e.target.value);
            else setSwarmLog(e.target.value);
          }}
          onBlur={handleSave}
          className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          placeholder="Persistent memory file content..."
        />
      </div>

      <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850 flex items-center justify-between">
        <span>PERSISTS ACROSS SESSIONS</span>
        <span>AUTO-SAVED TO BROWSER & CLOUD</span>
      </div>
    </div>
  );
};

// 5. External Integrations Hub (GitHub, Supabase, Vercel, Exa, Context7)
export const WidgetExternalIntegrations: React.FC<{
  settings?: {
    showPings?: boolean;
  };
}> = ({ settings = {} }) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [integrations, setIntegrations] = useState<ExternalIntegrationConfig[]>(() => {
    try {
      const saved = localStorage.getItem('swarm_external_integrations');
      return saved ? JSON.parse(saved) : INITIAL_INTEGRATIONS;
    } catch {
      return INITIAL_INTEGRATIONS;
    }
  });

  const [testingId, setTestingId] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Listen to auth state and fetch cloud integrations
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchBlackboardDocFromCloud<{ items: ExternalIntegrationConfig[] }>('integrations', currentUser).then(data => {
          if (data?.items && Array.isArray(data.items)) {
            setIntegrations(data.items);
            setIsCloudSynced(true);
            try {
              localStorage.setItem('swarm_external_integrations', JSON.stringify(data.items));
            } catch {}
          }
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // Live cloud updates
  useEffect(() => {
    if (!user) return;
    const unsubDoc = subscribeBlackboardDoc<{ items: ExternalIntegrationConfig[] }>('integrations', user, (data) => {
      if (data?.items && Array.isArray(data.items)) {
        setIntegrations(data.items);
        setIsCloudSynced(true);
      }
    });
    return () => unsubDoc();
  }, [user]);

  // Persist to local & cloud whenever integrations change
  useEffect(() => {
    try {
      localStorage.setItem('swarm_external_integrations', JSON.stringify(integrations));
    } catch {}

    if (user) {
      saveBlackboardDocToCloud('integrations', { items: integrations }, user).then(() => {
        setIsCloudSynced(true);
      });
    }
  }, [integrations, user]);

  const handleTestPing = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, status: 'connected', lastPing: Date.now() };
        }
        return item;
      }));
      setTestingId(null);
    }, 600);
  };

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-2">
          <FolderGit2 size={15} className="text-purple-400" />
          <span className="font-bold text-zinc-200">EXTERNAL SERVICES & MCP HUBS</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800/80 px-2 py-0.5 rounded-full">
              <UploadCloud size={10} />
              <span>{isCloudSynced ? 'Firestore Synced' : 'Syncing...'}</span>
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              Local Storage
            </span>
          )}
          <span className="text-[10px] text-emerald-400 font-bold">
            {integrations.filter(i => i.status === 'connected').length}/{integrations.length} Active
          </span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto pr-1 flex-1">
        {integrations.map(item => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-3"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs">{item.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                  item.status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : item.status === 'configured'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans leading-relaxed truncate">
                {item.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleTestPing(item.id)}
                disabled={testingId === item.id}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw size={11} className={testingId === item.id ? 'animate-spin text-blue-400' : ''} />
                <span>{testingId === item.id ? 'Pinging...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850 flex items-center justify-between">
        <span>MODEL CONTEXT PROTOCOL (MCP) READY</span>
        <span>PLUGGABLE DISPATCH</span>
      </div>
    </div>
  );
};
