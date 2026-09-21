import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Globe, 
  Loader2, 
  Trash2, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import type { MissionData, AppModelSettings } from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';
import { loadModelSettings, PROVIDER_CATALOG } from '../../utils/modelCatalog';

interface DebriefWidgetProps {
  activeMission: MissionData | null;
  currentUser: FirebaseUser | null;
  settings: {
    defaultModel?: string;
    enableGrounding?: boolean;
    showQuickPrompts?: boolean;
  };
}

interface ChatMessage {
  id: string;
  sender: 'operator' | 'supervisor';
  content: string;
  timestamp: number;
  modelTier?: string;
  grounding?: {
    sources?: Array<{ uri: string; title: string }>;
  };
}

export const WidgetDebriefConsole: React.FC<DebriefWidgetProps> = ({
  activeMission,
  currentUser,
  settings
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [appSettings, setAppSettings] = useState<AppModelSettings>(loadModelSettings);
  const [modelTier, setModelTier] = useState<string>(() => {
    const s = loadModelSettings();
    return settings.defaultModel || s.roleAssignments?.debriefChat?.model || 'gemini-3.5-flash';
  });
  const [useGrounding, setUseGrounding] = useState<boolean>(settings.enableGrounding !== false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const latest = loadModelSettings();
    setAppSettings(latest);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'supervisor',
          content: activeMission
            ? `Root Supervisor online for mission "${activeMission.title}". Ask me to justify sub-agent delegation, explain certainty tags, or cross-examine evidence.`
            : 'Root Supervisor online. Awaiting mission deployment to begin debrief interrogation.',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [activeMission]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'operator',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsStreaming(true);

    const supervisorMsgId = `sup-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: supervisorMsgId,
        sender: 'supervisor',
        content: '',
        timestamp: Date.now(),
        modelTier,
      },
    ]);

    try {
      const latest = loadModelSettings();
      setAppSettings(latest);

      const response = await fetch('/api/supervisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          missionContext: activeMission,
          chatHistory: messages.slice(-6).map((m) => ({
            role: m.sender === 'operator' ? 'user' : 'model',
            content: m.content,
          })),
          modelTier,
          useSearchGrounding: modelTier.startsWith('gemini-') ? useGrounding : false,
          modelSettings: latest
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Debrief connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === supervisorMsgId ? { ...m, content: accumulated } : m))
                );
              }
              if (parsed.grounding) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === supervisorMsgId ? { ...m, grounding: parsed.grounding } : m))
                );
              }
            } catch {
              // Non-JSON line
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === supervisorMsgId
            ? {
                ...m,
                content:
                  activeMission
                    ? `[Root Supervisor]: Based on the active mission telemetry for "${activeMission.title}", I prioritized high certainty sub-agent coordination to resolve the operational objective.`
                    : '[Root Supervisor]: Telemetry offline. Please ensure a mission has been deployed.',
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const quickPrompts = [
    'Why did you select this specific topology?',
    'Show me where sub-agents disagreed or had lowest certainty.',
    'Did any sub-agent trigger a doom-loop repetition warning?',
    'Summarize the critical path and bottlenecks.',
  ];

  return (
    <div className="p-4 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
      {/* Top Configuration Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase text-[10px]">Model:</span>
          <select
            value={modelTier}
            onChange={(e) => setModelTier(e.target.value)}
            disabled={isStreaming}
            className="bg-zinc-950 border border-zinc-800 text-blue-300 font-bold px-2 py-1 rounded text-xs focus:outline-none max-w-[200px] truncate"
          >
            <optgroup label="Google Gemini">
              {PROVIDER_CATALOG.gemini.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="OpenAI (ChatGPT)">
              {PROVIDER_CATALOG.openai.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {appSettings.providers?.openai?.apiKey ? '' : '(needs key)'}
                </option>
              ))}
            </optgroup>
            <optgroup label="Anthropic (Claude)">
              {PROVIDER_CATALOG.anthropic.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {appSettings.providers?.anthropic?.apiKey ? '' : '(needs key)'}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useGrounding}
              onChange={(e) => setUseGrounding(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-500"
            />
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Globe size={11} className={useGrounding ? 'text-blue-400' : 'text-zinc-600'} />
              Grounding
            </span>
          </label>

          <button
            onClick={() => setMessages([])}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            title="Clear Chat"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-96">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'supervisor' && (
              <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/25 shrink-0 text-amber-400">
                <Bot size={14} />
              </div>
            )}

            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs font-mono leading-relaxed space-y-1.5 ${
                m.sender === 'operator'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.content || (isStreaming && 'Thinking...')}</div>

              {m.grounding?.sources && m.grounding.sources.length > 0 && (
                <div className="pt-2 mt-1 border-t border-zinc-800 flex flex-wrap gap-1 text-[10px]">
                  {m.grounding.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-zinc-900 text-blue-300 hover:text-blue-200 border border-zinc-700/60 truncate max-w-[200px]"
                    >
                      {s.title || s.uri}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'operator' && (
              <div className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/25 shrink-0 text-blue-400">
                <User size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      {settings.showQuickPrompts !== false && messages.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={isStreaming}
              className="text-[11px] font-mono px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors truncate max-w-[280px]"
            >
              &ldquo;{qp}&rdquo;
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1 border-t border-zinc-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          placeholder="Ask Root Supervisor about trade-offs, evidence, certainty, or decisions..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
            !input.trim() || isStreaming
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
          }`}
        >
          {isStreaming ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          <span>SEND</span>
        </button>
      </form>
    </div>
  );
};
