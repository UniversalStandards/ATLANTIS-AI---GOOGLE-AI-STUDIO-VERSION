import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  MessageSquare, 
  Copy, 
  Check, 
  Filter, 
  Calendar, 
  Layers, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Clock,
  Tag
} from 'lucide-react';
import { 
  getImportedConversations, 
  toggleConversationActive, 
  deleteImportedConversation 
} from '../../db';
import type { ImportedConversation } from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';

interface ConversationArchiveWidgetProps {
  settings?: {
    showSummary?: boolean;
    maxPreviewLength?: number;
    [key: string]: any;
  };
  currentUser?: FirebaseUser | null;
}

export const ConversationArchiveWidget: React.FC<ConversationArchiveWidgetProps> = ({
  settings,
  currentUser
}) => {
  const [conversations, setConversations] = useState<ImportedConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedConv, setSelectedConv] = useState<ImportedConversation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const list = await getImportedConversations(currentUser?.uid);
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleToggleActive = async (convId: string, currentStatus: boolean) => {
    try {
      await toggleConversationActive(convId, !currentStatus, currentUser?.uid);
      setConversations(prev => 
        prev.map(c => c.id === convId ? { ...c, activeForContext: !currentStatus } : c)
      );
      if (selectedConv && selectedConv.id === convId) {
        setSelectedConv(prev => prev ? { ...prev, activeForContext: !currentStatus } : null);
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleDelete = async (convId: string) => {
    if (!window.confirm('Delete this conversation from your archive?')) return;
    try {
      await deleteImportedConversation(convId, currentUser?.uid);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedConv?.id === convId) {
        setSelectedConv(null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleCopyTranscript = (conv: ImportedConversation) => {
    const text = conv.messages
      .map(m => `[${m.sender.toUpperCase()}]:\n${m.content}\n`)
      .join('\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopiedId(conv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = conversations.filter(c => {
    if (activeOnly && !c.activeForContext) return false;
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(q);
    const summaryMatch = c.summary?.toLowerCase().includes(q);
    const tagMatch = c.keyTopics?.some(t => t.toLowerCase().includes(q));
    const msgMatch = c.messages?.some(m => m.content.toLowerCase().includes(q));

    return titleMatch || summaryMatch || tagMatch || msgMatch;
  });

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'chatgpt':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-300">ChatGPT</span>;
      case 'claude':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 border border-amber-800 text-amber-300">Claude</span>;
      case 'gemini':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/60 border border-blue-800 text-blue-300">Gemini</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/60 border border-purple-800 text-purple-300">Custom</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-3 font-sans text-xs">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search transcripts, topics, titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 text-xs font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="custom">Custom</option>
          </select>

          <button
            onClick={() => setActiveOnly(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl font-mono text-xs border transition-all flex items-center gap-1 ${
              activeOnly 
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/60 font-semibold' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Show only conversations currently feeding into context"
          >
            <span>Active Only</span>
          </button>
        </div>
      </div>

      {/* Main Dual Pane: List on left / Details on right */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-zinc-500 font-mono text-xs">
              Loading conversation archive...
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-xl space-y-1 text-zinc-500">
              <MessageSquare size={20} className="stroke-[1.5]" />
              <p className="font-mono text-xs">No conversations match your filter.</p>
              <p className="text-[11px] text-zinc-600">Import files using the Ingest widget to populate your archive.</p>
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  selectedConv?.id === conv.id
                    ? 'bg-zinc-850/90 border-blue-500/60 shadow-md'
                    : 'bg-zinc-950/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPlatformBadge(conv.platform)}
                      <h4 className="text-xs font-bold text-zinc-200 truncate font-mono">
                        {conv.title}
                      </h4>
                    </div>
                    {conv.summary && settings?.showSummary !== false && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {conv.summary}
                      </p>
                    )}
                  </div>

                  {/* Active Context Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(conv.id, conv.activeForContext);
                    }}
                    className={`shrink-0 p-1 rounded-lg border transition-colors ${
                      conv.activeForContext
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500/60'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                    title={conv.activeForContext ? 'Context Grounding Active (Included in Debrief)' : 'Click to Enable for Context Grounding'}
                  >
                    {conv.activeForContext ? <ToggleRight size={18} className="text-blue-400" /> : <ToggleLeft size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-850/60">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(conv.importedAt).toLocaleDateString()}
                  </span>
                  <span>{conv.messages.length} Turns</span>
                  {conv.activeForContext ? (
                    <span className="text-blue-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      In Context
                    </span>
                  ) : (
                    <span className="text-zinc-600">Dormant</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Conversation Detail Inspector */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shrink-0">
          {selectedConv ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header */}
              <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-200 truncate font-mono">
                    {selectedConv.title}
                  </h4>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    {selectedConv.messages.length} messages • {selectedConv.platform}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopyTranscript(selectedConv)}
                    className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-750 transition-colors"
                    title="Copy full transcript"
                  >
                    {copiedId === selectedConv.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedConv.id)}
                    className="p-1.5 rounded-lg bg-zinc-850 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-750 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Transcript Dialogue Stream */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px]">
                {selectedConv.messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-2.5 rounded-xl border space-y-1 ${
                      m.sender === 'user'
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        : 'bg-blue-950/30 border-blue-900/50 text-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500">
                      <span>{m.sender}</span>
                      {m.timestamp && <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Context Action */}
              <div className="p-2.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">
                  Grounding State:
                </span>
                <button
                  onClick={() => handleToggleActive(selectedConv.id, selectedConv.activeForContext)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                    selectedConv.activeForContext
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {selectedConv.activeForContext ? 'Active in Context' : 'Activate for Context'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500 font-mono text-xs space-y-2">
              <Eye size={22} className="stroke-[1.5]" />
              <p>Select a conversation from the archive to inspect its message transcript.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
