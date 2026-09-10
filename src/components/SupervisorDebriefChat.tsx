import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Globe, 
  Loader2, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  MessageSquare, 
  RotateCcw,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import type { MissionData } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';

export type ChatModelTier = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';

export interface ChatMessage {
  id: string;
  sender: 'operator' | 'supervisor';
  content: string;
  timestamp: number;
  modelTier?: string;
  grounding?: {
    queries?: string[];
    sources?: Array<{ uri: string; title: string }>;
  };
}

interface SupervisorDebriefChatProps {
  activeMission: MissionData | null;
  currentUser: FirebaseUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SupervisorDebriefChat: React.FC<SupervisorDebriefChatProps> = ({
  activeMission,
  currentUser,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [modelTier, setModelTier] = useState<ChatModelTier>('gemini-3.5-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: 'init-msg',
        sender: 'supervisor',
        content: activeMission
          ? `[Supervisor Telemetry Online]: Debrief channel active for mission "${activeMission.title}". Sector: ${activeMission.sector} (${activeMission.topology} topology). Standing by to defend decisions, interrogate node findings, or verify live external data.`
          : `[Supervisor Telemetry Online]: Standby mode active. Dispatch a mission or ask any operational coordination question.`,
        timestamp: Date.now(),
        modelTier: 'gemini-3.5-flash'
      };
      setMessages([initialGreeting]);
    }
  }, [activeMission]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'operator',
      content: userText,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsStreaming(true);

    const supervisorMsgId = Math.random().toString(36).substring(7);
    const initialSupervisorMsg: ChatMessage = {
      id: supervisorMsgId,
      sender: 'supervisor',
      content: '',
      timestamp: Date.now(),
      modelTier: useSearchGrounding ? 'gemini-3.5-flash (Google Search)' : modelTier
    };

    setMessages((prev) => [...prev, initialSupervisorMsg]);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ sender: m.sender, content: m.content })),
          modelTier,
          useSearch: useSearchGrounding,
          missionContext: activeMission ? {
            title: activeMission.title,
            sector: activeMission.sector,
            topology: activeMission.topology,
            result: activeMission.result
          } : undefined,
          sector: activeMission?.sector || 'Infrastructure'
        })
      });

      if (!response.body) throw new Error("No response stream available");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let groundingData: ChatMessage['grounding'] = undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.chunk) {
                accumulated += data.chunk;
                setMessages((prev) => 
                  prev.map((msg) => 
                    msg.id === supervisorMsgId 
                      ? { ...msg, content: accumulated } 
                      : msg
                  )
                );
              }
              if (data.grounding) {
                groundingData = data.grounding;
              }
              if (data.done && data.fullText) {
                accumulated = data.fullText;
                setMessages((prev) => 
                  prev.map((msg) => 
                    msg.id === supervisorMsgId 
                      ? { ...msg, content: accumulated, grounding: groundingData } 
                      : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === supervisorMsgId 
            ? { ...msg, content: `[Supervisor Alert]: Debrief response interrupted: ${err.message}. Ready for re-query.` } 
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([{
      id: 'init-reset',
      sender: 'supervisor',
      content: '[Supervisor Channel Cleared]: New debrief context initialized. Standing by for queries.',
      timestamp: Date.now(),
      modelTier
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <MessageSquare size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-tight">
                Supervisor Debrief
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              MULTI-TURN INTERROGATION & GROUNDING
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearHistory}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800 transition-colors"
            title="Clear Chat Thread"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-white rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Model & Search Grounding Controls Strip */}
      <div className="p-2.5 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between gap-2 text-xs font-mono">
        {/* Model Tier Selector */}
        <div className="flex items-center gap-1.5">
          <Cpu size={13} className="text-blue-400 shrink-0" />
          <select
            value={modelTier}
            onChange={(e) => setModelTier(e.target.value as ChatModelTier)}
            disabled={isStreaming}
            className="bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-blue-500"
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
          </select>
        </div>

        {/* Google Search Grounding Toggle */}
        <button
          type="button"
          onClick={() => setUseSearchGrounding(!useSearchGrounding)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] border transition-all ${
            useSearchGrounding
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-300'
          }`}
          title="Enable live Google Search Grounding via gemini-3.5-flash"
        >
          <Globe size={12} className={useSearchGrounding ? 'text-blue-400' : 'text-zinc-500'} />
          <span>Google Search</span>
          {useSearchGrounding && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
        </button>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'operator';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-zinc-500">
                {isUser ? (
                  <>
                    <span>OPERATOR {currentUser?.email ? `(${currentUser.email.split('@')[0]})` : ''}</span>
                    <User size={11} className="text-zinc-400" />
                  </>
                ) : (
                  <>
                    <Bot size={12} className="text-blue-400" />
                    <span className="font-bold text-blue-400">ROOT SUPERVISOR</span>
                    {msg.modelTier && (
                      <span className="text-zinc-600">· {msg.modelTier}</span>
                    )}
                  </>
                )}
              </div>

              <div
                className={`max-w-[90%] p-3.5 rounded-xl text-xs leading-relaxed font-sans ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none font-mono'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounding Sources Preview */}
                {msg.grounding && msg.grounding.sources && msg.grounding.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-blue-400 font-mono font-bold uppercase">
                      <Globe size={11} />
                      <span>Verified Google Search Citations ({msg.grounding.sources.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.grounding.sources.slice(0, 3).map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-blue-300 text-[10px] font-mono transition-colors border border-zinc-700/60"
                        >
                          <span className="truncate max-w-[160px]">{src.title || src.uri}</span>
                          <ExternalLink size={9} className="shrink-0 text-zinc-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs p-2">
            <Loader2 size={13} className="animate-spin text-blue-400" />
            <span>Supervisor synthesizing response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up Prompts */}
      <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px] font-mono">
        <span className="text-zinc-600 uppercase shrink-0">Prompts:</span>
        <button
          onClick={() => setInput("Why was the primary containment route selected over secondary alternatives?")}
          className="shrink-0 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
        >
          Explain Route Choice
        </button>
        <button
          onClick={() => setInput("Search live CVE and NVD databases for recent disclosures on this vector.")}
          className="shrink-0 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
        >
          Search Live CVEs
        </button>
        <button
          onClick={() => setInput("Draft a one-paragraph executive incident debrief with zero bureaucratic jargon.")}
          className="shrink-0 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
        >
          Executive Summary
        </button>
      </div>

      {/* Input Area */}
      <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/80 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Interrogate supervisor decisions, query live web telemetry, or ask follow-ups... (Enter to send)"
          rows={2}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 font-sans resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className={`p-3 rounded-xl transition-all shadow-md ${
            !input.trim() || isStreaming
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
          }`}
          title="Send query"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
