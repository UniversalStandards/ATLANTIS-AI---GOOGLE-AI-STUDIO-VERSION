import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Loader2, 
  Sliders, 
  Sparkles, 
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  Layers,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { db } from '../db';
import type { RegisterMode, LearnedPreferences } from '../types';

export const SECTORS = [
  "Emergency Response", "Infrastructure", "Intelligence Analysis", "Public Health",
  "Cybersecurity", "Logistics & Supply", "Communications", "Legal & Compliance",
  "Finance & Budget", "Personnel", "Space & Advanced Tech", "Environmental",
  "Transportation", "Energy", "Education", "Healthcare", "International Affairs", "Science & Research"
];

interface MissionConsoleProps {
  onStart: (input: string, config: {
    maxDepth: number;
    registerMode: RegisterMode;
    sectorOverride?: string;
    topologyOverride?: 'Centralized' | 'Decentralized' | 'Hybrid' | 'Independent';
  }) => void;
  isProcessing: boolean;
  learnedPrefs: LearnedPreferences;
}

interface AutocompleteItem {
  title: string;
  sector: string;
  frequency: number;
  recency: number;
  relevanceScore: number;
}

export const MissionConsole: React.FC<MissionConsoleProps> = ({ 
  onStart, 
  isProcessing,
  learnedPrefs 
}) => {
  const [input, setInput] = useState('');
  const [depth, setDepth] = useState<number>(learnedPrefs.preferredDepth || 3);
  const [registerMode, setRegisterMode] = useState<RegisterMode>('auto');
  const [sectorOverride, setSectorOverride] = useState<string>('');
  const [topologyOverride, setTopologyOverride] = useState<'Centralized' | 'Decentralized' | 'Hybrid' | 'Independent'>(learnedPrefs.preferredTopology || 'Hybrid');
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Predicted Sector State
  const [suggestedPrimarySector, setSuggestedPrimarySector] = useState<string>('Infrastructure');
  const [suggestedSecondarySectors, setSuggestedSecondarySectors] = useState<string[]>([]);

  // Update defaults when learned preferences shift
  useEffect(() => {
    if (learnedPrefs.preferredDepth) {
      setDepth(learnedPrefs.preferredDepth);
    }
    if (learnedPrefs.preferredTopology) {
      setTopologyOverride(learnedPrefs.preferredTopology);
    }
  }, [learnedPrefs]);

  // Real-time sector suggestion as user types
  useEffect(() => {
    const text = input.toLowerCase();
    if (!text.trim()) {
      setSuggestedPrimarySector(learnedPrefs.preferredSector || 'Cybersecurity');
      setSuggestedSecondarySectors(['Infrastructure']);
      return;
    }

    let primary = 'Infrastructure';
    const secondary: string[] = [];

    if (text.includes('hack') || text.includes('breach') || text.includes('cyber') || text.includes('vuln') || text.includes('cve') || text.includes('firewall')) {
      primary = 'Cybersecurity';
      secondary.push('Communications', 'Intelligence Analysis');
    } else if (text.includes('storm') || text.includes('disaster') || text.includes('flood') || text.includes('evacuat') || text.includes('fema')) {
      primary = 'Emergency Response';
      secondary.push('Public Health', 'Logistics & Supply');
    } else if (text.includes('power') || text.includes('grid') || text.includes('substation') || text.includes('frequency') || text.includes('transformer')) {
      primary = 'Energy';
      secondary.push('Infrastructure', 'Emergency Response');
    } else if (text.includes('fda') || text.includes('compliance') || text.includes('audit') || text.includes('legal') || text.includes('cfr') || text.includes('statutory')) {
      primary = 'Legal & Compliance';
      secondary.push('Healthcare', 'Public Health');
    } else if (text.includes('port') || text.includes('supply') || text.includes('cargo') || text.includes('freight') || text.includes('route')) {
      primary = 'Logistics & Supply';
      secondary.push('Transportation', 'Infrastructure');
    } else if (text.includes('satellite') || text.includes('orbit') || text.includes('space') || text.includes('telemetry') || text.includes('debris')) {
      primary = 'Space & Advanced Tech';
      secondary.push('Communications', 'Science & Research');
    } else if (text.includes('patient') || text.includes('virus') || text.includes('outbreak') || text.includes('clinical') || text.includes('vaccine')) {
      primary = 'Public Health';
      secondary.push('Healthcare', 'Science & Research');
    } else {
      primary = learnedPrefs.preferredSector || 'Infrastructure';
      secondary.push('Communications');
    }

    setSuggestedPrimarySector(primary);
    setSuggestedSecondarySectors(secondary.slice(0, 2));
  }, [input, learnedPrefs.preferredSector]);

  // Autocomplete search across past missions
  useEffect(() => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      setIsAutocompleteOpen(false);
      return;
    }

    db.missions.toArray().then((missions) => {
      const query = input.toLowerCase();
      const scored: AutocompleteItem[] = missions
        .map((m) => {
          let score = 0;
          const lowerTitle = m.title.toLowerCase();
          if (lowerTitle.includes(query)) score += 10;
          if (m.sector === suggestedPrimarySector) score += 5;
          // Phrasing patterns weighting from personalization layer
          learnedPrefs.phrasingPatterns.forEach((phrase) => {
            if (lowerTitle.includes(phrase.toLowerCase())) score += 3;
          });
          // Recency score
          const daysAgo = (Date.now() - m.timestamp) / (1000 * 60 * 60 * 24);
          score += Math.max(0, 5 - daysAgo);

          return {
            title: m.title,
            sector: m.sector,
            frequency: 1,
            recency: m.timestamp,
            relevanceScore: score
          };
        })
        .filter((item) => item.relevanceScore > 3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 4);

      setSuggestions(scored);
      setIsAutocompleteOpen(scored.length > 0);
    });
  }, [input, suggestedPrimarySector, learnedPrefs.phrasingPatterns]);

  // Quick action presets prioritized by user's learned sector
  const presets = [
    {
      label: "Grid Substation Anomaly",
      sector: "Energy",
      prompt: "Resolve cascading frequency anomaly across Substation 4B in the regional power grid.",
      depth: 3
    },
    {
      label: "Regulatory Audit (21 CFR)",
      sector: "Legal & Compliance",
      prompt: "Audit FDA Phase III clinical trial regulatory filings for protocol variance and adverse event citations under 21 CFR Part 312.",
      depth: 3
    },
    {
      label: "Zero-Day Escalation",
      sector: "Cybersecurity",
      prompt: "Contain and isolate zero-day kernel privilege escalation vulnerability identified on ingress edge gateways.",
      depth: 3
    },
    {
      label: "Coastal Evacuation Logistics",
      sector: "Emergency Response",
      prompt: "Coordinate inter-agency evacuation route stabilization and medical triage supply routes ahead of storm surge.",
      depth: 3
    },
    {
      label: "Orbital Telemetry Drift",
      sector: "Space & Advanced Tech",
      prompt: "Synthesize multimodal radar telemetry to resolve non-keplerian orbital velocity variance on orbital relay 9.",
      depth: 2
    }
  ].sort((a, b) => {
    // Rank preferred sector first
    if (a.sector === learnedPrefs.preferredSector) return -1;
    if (b.sector === learnedPrefs.preferredSector) return 1;
    return 0;
  });

  const handleStart = () => {
    if (!input.trim() || isProcessing) return;
    setIsAutocompleteOpen(false);
    onStart(input.trim(), {
      maxDepth: depth,
      registerMode,
      sectorOverride: sectorOverride || suggestedPrimarySector,
      topologyOverride
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isAutocompleteOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && selectedIndex >= 0)) {
        e.preventDefault();
        const picked = suggestions[selectedIndex >= 0 ? selectedIndex : 0];
        setInput(picked.title);
        setIsAutocompleteOpen(false);
        return;
      }
      if (e.key === 'Escape') {
        setIsAutocompleteOpen(false);
        return;
      }
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleStart();
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-zinc-950/90 border-b border-zinc-800/80 relative z-30">
      <div className="max-w-5xl mx-auto space-y-3">
        {/* Quick Scenario Preset Chips (Ranked by Learned Sector) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles size={13} className="text-blue-400" />
            Suggested Missions:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isProcessing}
              onClick={() => {
                setInput(preset.prompt);
                setDepth(preset.depth);
                setSectorOverride(preset.sector);
              }}
              className={`shrink-0 px-2.5 py-1 rounded border text-xs font-mono transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                preset.sector === learnedPrefs.preferredSector
                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-300 hover:bg-blue-600/25'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {preset.sector === learnedPrefs.preferredSector && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Learned preference match" />
              )}
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Textarea Input Container */}
        <div className="relative rounded-xl bg-zinc-900/90 border border-zinc-800 focus-within:border-blue-500/70 transition-all shadow-inner">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder="Define Mission Objectives... (e.g. 'Stabilize regional electrical substation failure' or 'Perform statutory compliance audit for biomedical export license')"
            className="w-full bg-transparent p-4 pb-16 text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none resize-none min-h-[105px] leading-relaxed font-sans"
          />

          {/* Autocomplete Dropdown */}
          {isAutocompleteOpen && suggestions.length > 0 && (
            <div className="absolute left-3 right-3 top-20 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in font-mono text-xs">
              <div className="px-3 py-1.5 bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase flex justify-between">
                <span>Personalized Mission Autocomplete (Tab or Enter to select)</span>
                <span>Weighted by History & Patterns</span>
              </div>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setInput(item.title);
                    setIsAutocompleteOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between border-b border-zinc-800/50 last:border-b-0 ${
                    selectedIndex === idx ? 'bg-blue-600/20 text-white' : 'hover:bg-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 line-clamp-1">
                    <Search size={12} className="text-zinc-500 shrink-0" />
                    <span className="font-sans text-xs truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 shrink-0 ml-2">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{item.sector}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Control Strip */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between flex-wrap gap-2">
            {/* Sector Routing Badges */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/90 border border-zinc-700/60 text-[11px] font-mono">
                <Compass size={12} className="text-blue-400" />
                <span className="text-zinc-400">SECTOR:</span>
                <span className="text-zinc-200 font-semibold">
                  {sectorOverride || suggestedPrimarySector}
                </span>
                {suggestedSecondarySectors.length > 0 && !sectorOverride && (
                  <span className="text-[10px] text-zinc-500 hidden sm:inline">
                    (+{suggestedSecondarySectors.join(', ')})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                  showConfig 
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' 
                    : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
                }`}
              >
                <Sliders size={12} />
                <span>Config (Depth: {depth})</span>
                <ChevronDown size={11} className={showConfig ? 'rotate-180 transition-transform' : ''} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {input && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setInput('')}
                  className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
                  title="Clear input"
                >
                  <RotateCcw size={14} />
                </button>
              )}

              <button 
                type="button"
                disabled={isProcessing || !input.trim()}
                onClick={handleStart}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase transition-all shadow-md ${
                  isProcessing || !input.trim()
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 border border-blue-400/30 active:scale-[0.98]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 text-blue-300" />
                    <span>DELEGATING TREE</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-blue-200" />
                    <span>DISPATCH MISSION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature 11: Delegation Depth Control & Advanced Config */}
        {showConfig && (
          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono animate-fade-in">
            {/* Delegation Depth Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-zinc-300">
                <span className="font-semibold">DELEGATION DEPTH</span>
                <span className="text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                  LEVEL {depth} OF 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span>1 (Supervisor)</span>
                <span>3 (Default)</span>
                <span>5 (Deep Mesh)</span>
              </div>
            </div>

            {/* Register Mode */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-300 font-semibold block">REGISTER DISCIPLINE</label>
              <select
                value={registerMode}
                onChange={(e) => setRegisterMode(e.target.value as RegisterMode)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-1.5 text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="auto">Auto-Detect (Adaptive)</option>
                <option value="civilian">Civilian-First (Plain Language)</option>
                <option value="government">Government / Formal (Procedural)</option>
              </select>
              <span className="text-[10px] text-zinc-500 block">
                {registerMode === 'government' ? 'Citation-heavy statutory mode' : 'High density without filler'}
              </span>
            </div>

            {/* Sector Override */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-300 font-semibold block">SECTOR OVERRIDE</label>
              <select
                value={sectorOverride}
                onChange={(e) => setSectorOverride(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-1.5 text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">Auto-Detect ({suggestedPrimarySector})</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 block">18 specialized sectors supported</span>
            </div>

            {/* Topology Mode */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-300 font-semibold block">TOPOLOGY PATTERN</label>
              <select
                value={topologyOverride}
                onChange={(e) => setTopologyOverride(e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-1.5 text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Hybrid">Hybrid (Supervisor-Delegate)</option>
                <option value="Centralized">Centralized (Strict Root Command)</option>
                <option value="Decentralized">Decentralized (Swarm Mesh)</option>
                <option value="Independent">Independent (Isolated Pipelines)</option>
              </select>
              <span className="text-[10px] text-zinc-500 block">Learned default: {learnedPrefs.preferredTopology}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
