import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Save, 
  GitBranch, 
  Layers, 
  Search, 
  HelpCircle,
  Zap,
  RefreshCw,
  Plus
} from 'lucide-react';
import type { 
  AppModelSettings, 
  SupportedProvider, 
  ModelRoleAssignments 
} from '../types';
import { 
  PROVIDER_CATALOG, 
  DEFAULT_MODEL_SETTINGS, 
  loadModelSettings, 
  saveModelSettings,
  getProviderModels,
  fetchAndStoreDynamicModels,
  addCustomModelToCatalog,
  saveDynamicModels,
  loadDynamicModels,
  MODELS_UPDATED_EVENT
} from '../utils/modelCatalog';
import type { User as FirebaseUser } from 'firebase/auth';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onSettingsSaved?: (newSettings: AppModelSettings) => void;
}

type SettingsTab = 'providers' | 'roles' | 'parameters';

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSettingsSaved
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('providers');
  const [settings, setSettings] = useState<AppModelSettings>(loadModelSettings);
  const [, setCatalogVersion] = useState(0);
  const [syncingProvider, setSyncingProvider] = useState<SupportedProvider | null>(null);
  const [customModelInputs, setCustomModelInputs] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});
  const [showKeys, setShowKeys] = useState<Record<SupportedProvider, boolean>>({
    gemini: false,
    openai: false,
    anthropic: false
  });
  const [verifyingProvider, setVerifyingProvider] = useState<SupportedProvider | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, {
    status: 'success' | 'error';
    message: string;
    latencyMs?: number;
  }>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  // Sync settings on open and auto-populate dynamic models
  useEffect(() => {
    if (isOpen) {
      setSettings(loadModelSettings());
      setSaveStatus(null);

      // Auto-discover dynamic models in background if empty
      const dynamicMap = loadDynamicModels();
      (['openai', 'anthropic', 'gemini'] as SupportedProvider[]).forEach(prov => {
        if (!dynamicMap[prov] || dynamicMap[prov]!.length === 0) {
          fetchAndStoreDynamicModels(prov).catch(() => {});
        }
      });
    }

    const handleCatalogUpdate = () => {
      setCatalogVersion(v => v + 1);
    };
    window.addEventListener(MODELS_UPDATED_EVENT, handleCatalogUpdate);
    return () => {
      window.removeEventListener(MODELS_UPDATED_EVENT, handleCatalogUpdate);
    };
  }, [isOpen]);

  const handleSyncAllProviders = async () => {
    setSyncingAll(true);
    const providers: SupportedProvider[] = ['gemini', 'openai', 'anthropic'];
    let count = 0;
    for (const prov of providers) {
      try {
        const key = settings.providers[prov]?.apiKey?.trim() || '';
        const res = await fetchAndStoreDynamicModels(prov, key);
        count += res.length;
      } catch (err) {
        console.warn(`Sync failed for ${prov}:`, err);
      }
    }
    setSyncingAll(false);
    setSaveStatus(`Dynamic catalog updated: ${count} total models synchronized.`);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  if (!isOpen) return null;

  const toggleShowKey = (provider: SupportedProvider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleKeyChange = (provider: SupportedProvider, apiKey: string) => {
    setSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          apiKey,
          isVerified: false
        }
      }
    }));
  };

  const handleProviderToggle = (provider: SupportedProvider, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          enabled
        }
      }
    }));
  };

  const handleProviderModelSelect = (provider: SupportedProvider, selectedModel: string) => {
    setSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          selectedModel
        }
      }
    }));
  };

  const handleRoleAssignmentChange = (
    role: keyof ModelRoleAssignments, 
    provider: SupportedProvider, 
    model: string
  ) => {
    setSettings(prev => ({
      ...prev,
      roleAssignments: {
        ...prev.roleAssignments,
        [role]: { provider, model }
      }
    }));
  };

  const handleSyncDynamicModels = async (provider: SupportedProvider) => {
    const config = settings.providers[provider];
    const key = config?.apiKey?.trim() || '';

    setSyncingProvider(provider);
    try {
      const models = await fetchAndStoreDynamicModels(provider, key);
      setVerificationResults(prev => ({
        ...prev,
        [provider]: {
          status: 'success',
          message: `Live sync complete: ${models.length} models populated from ${PROVIDER_CATALOG[provider].name} API.`
        }
      }));
      // If current selectedModel is not in the new dynamic models, select the first one
      if (models.length > 0 && !models.some(m => m.id === config.selectedModel)) {
        handleProviderModelSelect(provider, models[0].id);
      }
    } catch (err: any) {
      setVerificationResults(prev => ({
        ...prev,
        [provider]: {
          status: 'error',
          message: `Live fetch failed: ${err?.message || 'Check your API key or network connection.'}`
        }
      }));
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleAddCustomModel = (provider: SupportedProvider) => {
    const rawInput = (customModelInputs[provider] || '').trim();
    if (!rawInput) return;

    const added = addCustomModelToCatalog(provider, rawInput);
    handleProviderModelSelect(provider, added.id);
    setCustomModelInputs(prev => ({ ...prev, [provider]: '' }));
    setShowCustomInput(prev => ({ ...prev, [provider]: false }));
    setSaveStatus(`Custom model ${added.id} registered!`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleVerifyProvider = async (provider: SupportedProvider) => {
    const config = settings.providers[provider];
    const key = config?.apiKey?.trim() || '';

    setVerifyingProvider(provider);
    setVerificationResults(prev => ({ ...prev, [provider]: undefined as any }));

    const startTime = Date.now();

    try {
      const res = await fetch('/api/models/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: key,
          model: config.selectedModel
        })
      });

      const latencyMs = Date.now() - startTime;
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Verification failed`);
      }

      // Automatically store and apply dynamic models returned from verification
      if (Array.isArray(data.models) && data.models.length > 0) {
        saveDynamicModels({ [provider]: data.models });
      }

      setVerificationResults(prev => ({
        ...prev,
        [provider]: {
          status: 'success',
          message: data.details || `Successfully verified connection to ${PROVIDER_CATALOG[provider].name}.`,
          latencyMs
        }
      }));

      setSettings(prev => ({
        ...prev,
        providers: {
          ...prev.providers,
          [provider]: {
            ...prev.providers[provider],
            isVerified: true,
            verifiedAt: Date.now(),
            verifiedDetails: data.details
          }
        }
      }));
    } catch (err: any) {
      setVerificationResults(prev => ({
        ...prev,
        [provider]: {
          status: 'error',
          message: err?.message || 'Failed to verify API key with provider endpoint.'
        }
      }));
    } finally {
      setVerifyingProvider(null);
    }
  };

  const handleApplyPreset = (presetType: 'gemini' | 'openai' | 'anthropic' | 'hybrid') => {
    if (presetType === 'gemini') {
      setSettings(prev => ({
        ...prev,
        activeProvider: 'gemini',
        roleAssignments: {
          supervisor: { provider: 'gemini', model: 'gemini-3.1-pro-preview' },
          midTier: { provider: 'gemini', model: 'gemini-3.8-flash' },
          leaf: { provider: 'gemini', model: 'gemini-3.5-flash' },
          debriefChat: { provider: 'gemini', model: 'gemini-3.5-flash' },
          classifier: { provider: 'gemini', model: 'gemini-3.5-flash' }
        }
      }));
    } else if (presetType === 'openai') {
      setSettings(prev => ({
        ...prev,
        activeProvider: 'openai',
        roleAssignments: {
          supervisor: { provider: 'openai', model: 'gpt-4o' },
          midTier: { provider: 'openai', model: 'gpt-4o' },
          leaf: { provider: 'openai', model: 'gpt-4o-mini' },
          debriefChat: { provider: 'openai', model: 'gpt-4o' },
          classifier: { provider: 'openai', model: 'gpt-4o-mini' }
        }
      }));
    } else if (presetType === 'anthropic') {
      setSettings(prev => ({
        ...prev,
        activeProvider: 'anthropic',
        roleAssignments: {
          supervisor: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
          midTier: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
          leaf: { provider: 'anthropic', model: 'claude-3-5-haiku' },
          debriefChat: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
          classifier: { provider: 'anthropic', model: 'claude-3-5-haiku' }
        }
      }));
    } else if (presetType === 'hybrid') {
      setSettings(prev => ({
        ...prev,
        activeProvider: 'gemini',
        roleAssignments: {
          supervisor: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
          midTier: { provider: 'openai', model: 'gpt-4o' },
          leaf: { provider: 'gemini', model: 'gemini-3.5-flash' },
          debriefChat: { provider: 'openai', model: 'gpt-4o' },
          classifier: { provider: 'gemini', model: 'gemini-3.8-flash' }
        }
      }));
    }
    setSaveStatus(`Applied preset: ${presetType.toUpperCase()}`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSave = () => {
    saveModelSettings(settings);
    if (onSettingsSaved) {
      onSettingsSaved(settings);
    }
    setSaveStatus('Settings successfully saved to local system & active workflows!');
    setTimeout(() => {
      setSaveStatus(null);
      onClose();
    }, 900);
  };

  const handleResetToDefaults = () => {
    setSettings(DEFAULT_MODEL_SETTINGS);
    saveModelSettings(DEFAULT_MODEL_SETTINGS);
    setSaveStatus('Reset to baseline default configurations.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-850 bg-zinc-900/70 flex items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-900/30">
              <Cpu size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-tight">
                  Model Providers & API Settings
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold">
                  MULTI-LLM ENGINE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Configure API keys, assign models to tasks, and tune execution parameters across Gemini, ChatGPT (OpenAI), and Claude (Anthropic).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Submenu Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-zinc-850 bg-zinc-950">
          <div className="flex items-center gap-2 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'providers'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Key size={13} />
              <span>1. API Keys & Providers</span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'roles'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GitBranch size={13} />
              <span>2. Role Assignments & Workflows</span>
            </button>

            <button
              onClick={() => setActiveTab('parameters')}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'parameters'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders size={13} />
              <span>3. Model Hyperparameters</span>
            </button>
          </div>

          {saveStatus && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded-lg animate-in fade-in">
              <CheckCircle2 size={13} />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: API KEYS & PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div className="p-3.5 bg-blue-950/20 border border-blue-800/40 rounded-2xl flex items-start gap-3">
                <HelpCircle size={18} className="text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-1 text-xs">
                  <p className="text-zinc-200 font-semibold">
                    Flexible Multi-Provider Intelligence
                  </p>
                  <p className="text-zinc-400 leading-relaxed">
                    Enter your developer API keys below. You can use any combination of models: Google Gemini (default), OpenAI ChatGPT (GPT-4o, o1, o3-mini), or Anthropic Claude (Claude 3.7 / 3.5 Sonnet). Once configured, you can assign them to any agent role in the next tab.
                  </p>
                </div>
              </div>

              {/* Dynamic Catalog Live Sync Toolbar */}
              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">Dynamic Model Discovery</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-semibold">
                        Auto-Discovered
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Models are populated dynamically via provider APIs (including o3-mini, o1, GPT-4.5, and Claude 3.7).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSyncAllProviders}
                  disabled={syncingAll}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  <RefreshCw size={12} className={syncingAll ? 'animate-spin' : ''} />
                  <span>{syncingAll ? 'Discovering Models...' : 'Auto-Discover All Models'}</span>
                </button>
              </div>

              {/* Provider Cards */}
              {(['gemini', 'openai', 'anthropic'] as SupportedProvider[]).map((provKey) => {
                const provInfo = PROVIDER_CATALOG[provKey];
                const config = settings.providers[provKey];
                const isVerifying = verifyingProvider === provKey;
                const isSyncing = syncingProvider === provKey;
                const result = verificationResults[provKey];
                const availableModels = getProviderModels(provKey);
                const dynamicCount = (loadDynamicModels()[provKey] || []).length;
                const isCustomOpen = showCustomInput[provKey] || false;

                return (
                  <div 
                    key={provKey}
                    className={`p-5 rounded-2xl border transition-all ${
                      config.enabled
                        ? 'bg-zinc-900/60 border-zinc-700/80 shadow-md'
                        : 'bg-zinc-950 border-zinc-850 opacity-85'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/60">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                          style={{ backgroundColor: provInfo.iconColor }}
                        >
                          {provKey === 'gemini' ? 'G' : provKey === 'openai' ? 'O' : 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white font-mono">{provInfo.name}</h4>
                            {config.isVerified && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-700 text-emerald-300 flex items-center gap-1 font-semibold">
                                <CheckCircle2 size={10} /> Verified
                              </span>
                            )}
                            {dynamicCount > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-800 text-cyan-300 flex items-center gap-1 font-semibold">
                                <Sparkles size={10} /> Live API ({dynamicCount})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 font-sans">{provInfo.tagline}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => handleProviderToggle(provKey, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
                          <span className="text-xs font-mono font-medium text-zinc-300">
                            {config.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* API Key Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span>API SECRET KEY</span>
                          <span className="text-zinc-500 font-sans text-[10px]">{provInfo.keyPrefix}</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showKeys[provKey] ? 'text' : 'password'}
                            value={config.apiKey}
                            onChange={(e) => handleKeyChange(provKey, e.target.value)}
                            placeholder={provKey === 'gemini' ? 'AIzaSy... (or leave blank to use server key)' : 'sk-...'}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-2 font-mono text-xs text-white placeholder-zinc-600 pr-20 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(provKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                            title={showKeys[provKey] ? 'Hide Key' : 'Show Key'}
                          >
                            {showKeys[provKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-sans">
                          {provInfo.keyHelp}
                        </p>
                      </div>

                      {/* Default Model Selector with Live Dynamic Sync */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span>DEFAULT MODEL</span>
                            <span className="text-zinc-500 text-[10px]">({availableModels.length})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSyncDynamicModels(provKey)}
                              disabled={isSyncing}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer font-mono hover:underline"
                              title="Fetch dynamic live models from API"
                            >
                              <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                              <span>{isSyncing ? 'Syncing...' : 'Sync Models'}</span>
                            </button>
                            <span className="text-zinc-700">|</span>
                            <button
                              type="button"
                              onClick={() => setShowCustomInput(prev => ({ ...prev, [provKey]: !prev[provKey] }))}
                              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-mono hover:underline"
                            >
                              <Plus size={11} />
                              <span>Custom</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Custom Model Input */}
                        {isCustomOpen && (
                          <div className="p-2 bg-zinc-950 border border-blue-900/60 rounded-xl space-y-1.5 mb-1.5">
                            <div className="text-[10px] font-mono text-blue-300 flex items-center justify-between">
                              <span>Custom {provInfo.name} Model ID:</span>
                              <button 
                                type="button" 
                                onClick={() => setShowCustomInput(prev => ({ ...prev, [provKey]: false }))}
                                className="text-zinc-500 hover:text-zinc-300"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={customModelInputs[provKey] || ''}
                                onChange={(e) => setCustomModelInputs(prev => ({ ...prev, [provKey]: e.target.value }))}
                                placeholder="e.g. o3-mini-2025-01-31, claude-3-7-sonnet"
                                className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-lg px-2.5 py-1 font-mono text-xs text-white placeholder-zinc-600"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddCustomModel(provKey)}
                                disabled={!customModelInputs[provKey]?.trim()}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg font-mono text-xs font-semibold"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        <select
                          value={config.selectedModel}
                          onChange={(e) => handleProviderModelSelect(provKey, e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-2 font-mono text-xs text-white transition-colors cursor-pointer"
                        >
                          {availableModels.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.contextWindow}) {m.isReasoning ? '— Reasoning' : ''} {m.isDynamic ? '✦' : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-zinc-500 font-sans">
                          {availableModels.find(m => m.id === config.selectedModel)?.description || ''}
                        </p>
                      </div>
                    </div>

                    {/* Verification Action and Feedback */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerifyProvider(provKey)}
                          disabled={isVerifying || (!config.apiKey && provKey !== 'gemini')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 hover:text-white font-mono text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
                        >
                          {isVerifying ? (
                            <Loader2 size={13} className="animate-spin text-blue-400" />
                          ) : (
                            <Zap size={13} className="text-amber-400" />
                          )}
                          <span>Test Handshake & Verify</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSyncDynamicModels(provKey)}
                          disabled={isSyncing || (!config.apiKey && provKey !== 'gemini')}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-cyan-300 font-mono text-xs flex items-center gap-1.5 border border-cyan-900/60 transition-all cursor-pointer"
                          title="Fetch dynamic models directly from provider API"
                        >
                          <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                          <span>Fetch Dynamic Models</span>
                        </button>

                        {config.isVerified && config.verifiedDetails && (
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Status: {config.verifiedDetails}
                          </span>
                        )}
                      </div>

                      {result && (
                        <div className={`text-xs font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                          result.status === 'success'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        }`}>
                          {result.status === 'success' ? (
                            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle size={13} className="text-rose-400 shrink-0" />
                          )}
                          <span>{result.message} {result.latencyMs ? `(${result.latencyMs}ms)` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ROLE ASSIGNMENTS & WORKFLOWS */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Quick Presets Bar */}
              <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Quick Architecture Presets:
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Instant single-click assignment</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('gemini')}
                    className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 font-bold transition-all text-left flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span>All Gemini Suite</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('openai')}
                    className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 font-bold transition-all text-left flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span>All OpenAI / ChatGPT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('anthropic')}
                    className="p-2.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800/60 text-orange-300 font-bold transition-all text-left flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                    <span>All Claude Suite</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('hybrid')}
                    className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 font-bold transition-all text-left flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                    <span>Hybrid Best-of-Breed</span>
                  </button>
                </div>
              </div>

              {/* Role Mapping Items */}
              <div className="space-y-3">
                {[
                  {
                    key: 'supervisor' as const,
                    title: 'Root Supervisor & Mission Synthesis',
                    desc: 'Synthesizes all child streams, enforces certainty declaration, and produces final authoritative answers.',
                    icon: <Layers size={16} className="text-blue-400" />
                  },
                  {
                    key: 'midTier' as const,
                    title: 'Mid-Tier Sub-Supervisors (Delegation)',
                    desc: 'Coordinates sub-branches, evaluates complexity, and aggregates leaf specialist outputs.',
                    icon: <GitBranch size={16} className="text-purple-400" />
                  },
                  {
                    key: 'leaf' as const,
                    title: 'Leaf Specialist Agents (Telemetry & Probes)',
                    desc: 'Direct, evidence-first execution of specific subtasks with optional search grounding.',
                    icon: <Zap size={16} className="text-emerald-400" />
                  },
                  {
                    key: 'debriefChat' as const,
                    title: 'Supervisor Debrief & Interrogation Console',
                    desc: 'Powers interactive multi-turn debrief dialogue and operator post-mission debriefing.',
                    icon: <Sparkles size={16} className="text-amber-400" />
                  },
                  {
                    key: 'classifier' as const,
                    title: 'Mission Classifier & Topological Router',
                    desc: 'Analyzes user prompts, assigns sectors, complexity tier, and root topology.',
                    icon: <Cpu size={16} className="text-cyan-400" />
                  }
                ].map((roleItem) => {
                  const assignment = settings.roleAssignments[roleItem.key];
                  const activeProvInfo = PROVIDER_CATALOG[assignment.provider];

                  return (
                    <div 
                      key={roleItem.key}
                      className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 max-w-md">
                        <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 shrink-0 mt-0.5">
                          {roleItem.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white font-mono">{roleItem.title}</h4>
                          <p className="text-xs text-zinc-400 font-sans mt-0.5">{roleItem.desc}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Provider Selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase block">Provider</label>
                          <select
                            value={assignment.provider}
                            onChange={(e) => {
                              const newProv = e.target.value as SupportedProvider;
                              const provModels = getProviderModels(newProv);
                              const defaultModel = provModels[0]?.id || 'gemini-3.5-flash';
                              handleRoleAssignmentChange(roleItem.key, newProv, defaultModel);
                            }}
                            className="bg-zinc-950 border border-zinc-700 text-white font-mono text-xs rounded-xl px-3 py-1.5 focus:border-blue-500 cursor-pointer"
                          >
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI ChatGPT</option>
                            <option value="anthropic">Anthropic Claude</option>
                          </select>
                        </div>

                        {/* Model Selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase block">Model</label>
                          <select
                            value={assignment.model}
                            onChange={(e) => {
                              handleRoleAssignmentChange(roleItem.key, assignment.provider, e.target.value);
                            }}
                            className="bg-zinc-950 border border-zinc-700 text-blue-300 font-mono text-xs font-bold rounded-xl px-3 py-1.5 focus:border-blue-500 cursor-pointer max-w-[220px]"
                          >
                            {getProviderModels(assignment.provider).map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} {m.isReasoning ? '✦' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MODEL HYPERPARAMETERS */}
          {activeTab === 'parameters' && (
            <div className="space-y-6">
              <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-6">
                <div className="border-b border-zinc-800 pb-3">
                  <h4 className="text-sm font-bold text-white font-mono">Execution Hyperparameters</h4>
                  <p className="text-xs text-zinc-400 font-sans">
                    Fine-tune runtime sampling, token limits, and live streaming across all assigned models.
                  </p>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-zinc-200">Sampling Temperature:</span>
                      <span className="ml-2 font-mono text-blue-400 font-bold text-xs">{settings.hyperparameters.temperature}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {settings.hyperparameters.temperature <= 0.2 ? 'Deterministic & Precise' :
                       settings.hyperparameters.temperature <= 0.5 ? 'Balanced Technical Execution' : 'Creative & Exploratory'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.hyperparameters.temperature}
                    onChange={(e) => {
                      const temperature = parseFloat(e.target.value);
                      setSettings(prev => ({
                        ...prev,
                        hyperparameters: { ...prev.hyperparameters, temperature }
                      }));
                    }}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>0.0 (Strict / Code)</span>
                    <span>0.3 (Atlantis Default)</span>
                    <span>0.7 (Exploratory)</span>
                    <span>1.0 (High Variance)</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-zinc-200">Max Output Tokens:</span>
                      <span className="ml-2 font-mono text-blue-400 font-bold text-xs">{settings.hyperparameters.maxTokens}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Upper output limit per agent node</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                    {[1024, 2048, 4096, 8192].map((tokens) => (
                      <button
                        key={tokens}
                        type="button"
                        onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            hyperparameters: { ...prev.hyperparameters, maxTokens: tokens }
                          }));
                        }}
                        className={`py-2 rounded-xl border text-center transition-all ${
                          settings.hyperparameters.maxTokens === tokens
                            ? 'bg-blue-600/25 border-blue-500 text-blue-300 font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {tokens} tokens
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Grounding Toggle */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Search size={14} className="text-blue-400" />
                      <span className="text-xs font-mono font-bold text-zinc-200">Google Search Live Grounding</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Permits leaf specialist agents to verify live web facts and citations via Google Search API.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.hyperparameters.enableGrounding}
                      onChange={(e) => {
                        const enableGrounding = e.target.checked;
                        setSettings(prev => ({
                          ...prev,
                          hyperparameters: { ...prev.hyperparameters, enableGrounding }
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
                  </label>
                </div>

                {/* Streaming Toggle */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-400" />
                      <span className="text-xs font-mono font-bold text-zinc-200">Server-Sent Events (SSE) Live Token Streaming</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Stream partial responses in real-time as words generate across agent nodes.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.hyperparameters.streamingEnabled}
                      onChange={(e) => {
                        const streamingEnabled = e.target.checked;
                        setSettings(prev => ({
                          ...prev,
                          hyperparameters: { ...prev.hyperparameters, streamingEnabled }
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-900/80 flex items-center justify-between gap-3 select-none">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-mono text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
