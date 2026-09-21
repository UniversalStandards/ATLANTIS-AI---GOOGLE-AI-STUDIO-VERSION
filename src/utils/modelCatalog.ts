import type { 
  SupportedProvider, 
  ProviderCatalogModel, 
  AppModelSettings 
} from '../types';

export const PROVIDER_CATALOG: Record<SupportedProvider, {
  name: string;
  tagline: string;
  description: string;
  iconColor: string;
  keyPrefix: string;
  keyHelp: string;
  models: ProviderCatalogModel[];
}> = {
  gemini: {
    name: 'Google Gemini',
    tagline: 'High-speed multimodal, web search grounding & long context',
    description: 'Direct integration with Google DeepMind Gemini models with live search grounding and low-latency token streaming.',
    iconColor: '#3b82f6',
    keyPrefix: 'AIza...',
    keyHelp: 'Enter your Google AI Studio API Key or use the pre-configured server environment key.',
    models: [
      {
        id: 'gemini-3.5-flash',
        name: 'Gemini 3.5 Flash',
        description: 'Flagship high-speed model with native Google Search grounding and low latency.',
        contextWindow: '1M tokens',
        recommendedRole: 'leaf'
      },
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        description: 'High-throughput multimodal reasoning optimized for rapid hierarchical multi-agent tasks.',
        contextWindow: '1M tokens',
        recommendedRole: 'mid_tier'
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro',
        description: 'Deep reasoning and complex synthesis tier for root supervisors and cross-domain architectures.',
        contextWindow: '2M tokens',
        recommendedRole: 'supervisor',
        isReasoning: true
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        description: 'Ultra-lightweight and fastest response times for rapid classification and leaf telemetry.',
        contextWindow: '1M tokens',
        recommendedRole: 'leaf'
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Reliable high-throughput workhorse for general analytical tasks.',
        contextWindow: '1M tokens',
        recommendedRole: 'all'
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Advanced reasoning and large code/audit context analysis.',
        contextWindow: '2M tokens',
        recommendedRole: 'supervisor'
      }
    ]
  },
  openai: {
    name: 'OpenAI ChatGPT',
    tagline: 'o3-mini, o1, GPT-4.5, and GPT-4o dynamic model catalog',
    description: 'Connect your OpenAI API key to access live models including o3-mini reasoning, o1 flagship, GPT-4.5 Preview, and GPT-4o.',
    iconColor: '#10b981',
    keyPrefix: 'sk-...',
    keyHelp: 'Generate from platform.openai.com/api-keys with model access permissions.',
    models: [
      {
        id: 'o3-mini',
        name: 'o3-mini (High-Speed Reasoning)',
        description: 'Latest high-performance reasoning model specialized in STEM, code generation, and complex technical validation.',
        contextWindow: '200k tokens',
        recommendedRole: 'supervisor',
        isReasoning: true
      },
      {
        id: 'o1',
        name: 'o1 (Deep Reasoning)',
        description: 'Flagship deliberate reasoning model designed to think through complex problems before answering.',
        contextWindow: '200k tokens',
        recommendedRole: 'supervisor',
        isReasoning: true
      },
      {
        id: 'gpt-4.5-preview',
        name: 'GPT-4.5 Preview (Nuanced Synthesis)',
        description: 'Largest OpenAI model with extensive world knowledge, high empathy, and multi-domain reasoning.',
        contextWindow: '128k tokens',
        recommendedRole: 'supervisor'
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o (Omni Flagship)',
        description: 'Flagship multimodal workhorse for state-of-the-art vision, text synthesis, and high-accuracy decisioning.',
        contextWindow: '128k tokens',
        recommendedRole: 'supervisor'
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini (Fast & Efficient)',
        description: 'Fast, lightweight model for sub-agent execution, classification, and leaf node probes.',
        contextWindow: '128k tokens',
        recommendedRole: 'leaf'
      },
      {
        id: 'chatgpt-4o-latest',
        name: 'ChatGPT-4o Latest (Continuously Updated)',
        description: 'Dynamic version of GPT-4o matching the latest ChatGPT production deployment.',
        contextWindow: '128k tokens',
        recommendedRole: 'chat'
      },
      {
        id: 'o1-mini',
        name: 'o1-mini (Fast Reasoning)',
        description: 'Faster, cost-efficient reasoning model optimized for coding and math.',
        contextWindow: '128k tokens',
        recommendedRole: 'mid_tier',
        isReasoning: true
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'High-capability model for comprehensive code and multi-turn conversational evaluation.',
        contextWindow: '128k tokens',
        recommendedRole: 'mid_tier'
      }
    ]
  },
  anthropic: {
    name: 'Anthropic Claude',
    tagline: 'Claude 3.7 Sonnet (Hybrid Reasoning), 3.5 Sonnet, and 3.5 Haiku',
    description: 'Execute workflows and supervisor debriefs with Anthropic Claude models renowned for thoughtful, steerable, and hybrid reasoning.',
    iconColor: '#f97316',
    keyPrefix: 'sk-ant-...',
    keyHelp: 'Generate from console.anthropic.com/settings/keys with API access.',
    models: [
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet (Hybrid Reasoning & Coding)',
        description: 'Anthropic flagship hybrid model with extended thinking capabilities and state-of-the-art code intelligence.',
        contextWindow: '200k tokens',
        recommendedRole: 'supervisor',
        isReasoning: true
      },
      {
        id: 'claude-3-7-sonnet',
        name: 'Claude 3.7 Sonnet (Latest Alias)',
        description: 'Convenience alias pointing to the newest release of Claude 3.7 Sonnet.',
        contextWindow: '200k tokens',
        recommendedRole: 'supervisor',
        isReasoning: true
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet v2 (Production Flagship)',
        description: 'Industry-leading balance of speed, nuanced prose, and computer use capability.',
        contextWindow: '200k tokens',
        recommendedRole: 'supervisor'
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet (Latest Alias)',
        description: 'Convenience alias for the Claude 3.5 Sonnet generation.',
        contextWindow: '200k tokens',
        recommendedRole: 'supervisor'
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku (Ultra-Low Latency)',
        description: 'Fastest Claude model with Sonnet-level speed and intelligence on lightweight tasks.',
        contextWindow: '200k tokens',
        recommendedRole: 'leaf'
      },
      {
        id: 'claude-3-5-haiku',
        name: 'Claude 3.5 Haiku (Latest Alias)',
        description: 'Convenience alias for Claude 3.5 Haiku.',
        contextWindow: '200k tokens',
        recommendedRole: 'leaf'
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus (Complex Synthesis)',
        description: 'Deep analytical intelligence for complex document and prompt synthesis.',
        contextWindow: '200k tokens',
        recommendedRole: 'supervisor'
      }
    ]
  }
};

export const DEFAULT_MODEL_SETTINGS: AppModelSettings = {
  activeProvider: 'gemini',
  providers: {
    gemini: {
      apiKey: '',
      enabled: true,
      selectedModel: 'gemini-3.5-flash',
      isVerified: true,
      verifiedDetails: 'Built-in Server Environment Key'
    },
    openai: {
      apiKey: '',
      enabled: false,
      selectedModel: 'gpt-4o',
      isVerified: false
    },
    anthropic: {
      apiKey: '',
      enabled: false,
      selectedModel: 'claude-3-5-sonnet',
      isVerified: false
    }
  },
  roleAssignments: {
    supervisor: { provider: 'gemini', model: 'gemini-3.1-pro-preview' },
    midTier: { provider: 'gemini', model: 'gemini-3.8-flash' },
    leaf: { provider: 'gemini', model: 'gemini-3.5-flash' },
    debriefChat: { provider: 'gemini', model: 'gemini-3.5-flash' },
    classifier: { provider: 'gemini', model: 'gemini-3.5-flash' }
  },
  hyperparameters: {
    temperature: 0.3,
    topP: 0.95,
    maxTokens: 4096,
    enableGrounding: true,
    streamingEnabled: true
  }
};

const STORAGE_KEY = 'atlantis_model_provider_settings_v1';
const DYNAMIC_STORAGE_KEY = 'atlantis_dynamic_models_catalog_v1';
export const MODELS_UPDATED_EVENT = 'atlantis_models_catalog_updated';

export function notifyModelsUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MODELS_UPDATED_EVENT));
  }
}

export function loadDynamicModels(): Partial<Record<SupportedProvider, ProviderCatalogModel[]>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DYNAMIC_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse dynamic models from localStorage:', err);
  }
  return {};
}

export function saveDynamicModels(dynamicMap: Partial<Record<SupportedProvider, ProviderCatalogModel[]>>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadDynamicModels();
    const merged = { ...current, ...dynamicMap };
    localStorage.setItem(DYNAMIC_STORAGE_KEY, JSON.stringify(merged));
    notifyModelsUpdated();
  } catch (err) {
    console.warn('Failed to save dynamic models to localStorage:', err);
  }
}

// Get full dynamic + base model catalog for a provider
export function getProviderModels(provider: SupportedProvider): ProviderCatalogModel[] {
  const baseModels = PROVIDER_CATALOG[provider]?.models || [];
  const dynamicMap = loadDynamicModels();
  const dynamicModels = dynamicMap[provider] || [];

  const map = new Map<string, ProviderCatalogModel>();

  // If we have dynamic models, prioritize them!
  if (dynamicModels.length > 0) {
    for (const m of dynamicModels) {
      map.set(m.id, m);
    }
  }

  // Ensure all known base models exist as options if not already fetched
  for (const m of baseModels) {
    if (!map.has(m.id)) {
      map.set(m.id, m);
    }
  }

  return Array.from(map.values());
}

// Fetch live models from backend server route and persist locally
export async function fetchAndStoreDynamicModels(
  provider: SupportedProvider,
  apiKey?: string,
  customEndpoint?: string
): Promise<ProviderCatalogModel[]> {
  try {
    const res = await fetch('/api/models/fetch-dynamic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey, customEndpoint })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Failed to fetch dynamic models`);
    }

    const data = await res.json();
    if (Array.isArray(data?.models) && data.models.length > 0) {
      saveDynamicModels({ [provider]: data.models });
      return getProviderModels(provider);
    }
  } catch (err) {
    console.error(`Error fetching dynamic models for ${provider}:`, err);
    throw err;
  }
  return getProviderModels(provider);
}

// Add custom model ID dynamically
export function addCustomModelToCatalog(
  provider: SupportedProvider,
  modelId: string,
  displayName?: string
): ProviderCatalogModel {
  const cleanId = modelId.trim();
  const dynamicMap = loadDynamicModels();
  const list = dynamicMap[provider] || [...(PROVIDER_CATALOG[provider]?.models || [])];

  const existing = list.find(m => m.id === cleanId);
  if (existing) return existing;

  const newModel: ProviderCatalogModel = {
    id: cleanId,
    name: displayName?.trim() || cleanId,
    description: `Custom registered ${provider.toUpperCase()} model`,
    contextWindow: '128k',
    recommendedRole: 'supervisor',
    isDynamic: true,
    isCustom: true,
    fetchedAt: Date.now()
  };

  const updatedList = [newModel, ...list];
  saveDynamicModels({ [provider]: updatedList });
  return newModel;
}

export function loadModelSettings(): AppModelSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_MODEL_SETTINGS,
        ...parsed,
        providers: {
          ...DEFAULT_MODEL_SETTINGS.providers,
          ...(parsed.providers || {})
        },
        roleAssignments: {
          ...DEFAULT_MODEL_SETTINGS.roleAssignments,
          ...(parsed.roleAssignments || {})
        },
        hyperparameters: {
          ...DEFAULT_MODEL_SETTINGS.hyperparameters,
          ...(parsed.hyperparameters || {})
        }
      };
    }
  } catch (err) {
    console.warn('Failed to load model settings from localStorage:', err);
  }
  return DEFAULT_MODEL_SETTINGS;
}

export function saveModelSettings(settings: AppModelSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save model settings to localStorage:', err);
  }
}
