import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Key, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  Database,
  Layers,
  Tag,
  Check,
  HelpCircle,
  Cpu,
  Clock,
  RefreshCw,
  Cloud,
  X
} from 'lucide-react';
import { parseUploadedFile } from '../../utils/conversationParsers';
import { 
  saveImportedConversation,
  saveUnconfirmedConversationsBatchLocal,
  getUnconfirmedConversationsLocal,
  deleteUnconfirmedConversationLocal,
  clearAllUnconfirmedConversationsLocal
} from '../../db';
import { 
  syncImportedConversationToCloud,
  saveUnconfirmedConversationsBatchToCloud,
  fetchUnconfirmedConversationsFromCloud,
  deleteUnconfirmedConversationFromCloud,
  clearAllUnconfirmedConversationsFromCloud,
  subscribeUnconfirmedConversations
} from '../../firebase';
import type { ImportedConversation, UnconfirmedConversation } from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';

interface ConversationImporterWidgetProps {
  settings?: {
    autoActivateForContext?: boolean;
    defaultPlatform?: string;
    [key: string]: any;
  };
  currentUser?: FirebaseUser | null;
  onImportSuccess?: (conversation: ImportedConversation) => void;
  onOpenModelSettings?: () => void;
}

export const ConversationImporterWidget: React.FC<ConversationImporterWidgetProps> = ({
  settings,
  currentUser,
  onImportSuccess,
  onOpenModelSettings
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingStaged, setIsSyncingStaged] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewConversations, setPreviewConversations] = useState<UnconfirmedConversation[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);

  // Manual raw text paste state
  const [manualTitle, setManualTitle] = useState('');
  const [manualPlatform, setManualPlatform] = useState<'chatgpt' | 'claude' | 'gemini' | 'custom'>('custom');
  const [manualRawText, setManualRawText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // INITIALIZE / RESTORE UNCONFIRMED CONVERSATIONS FROM FIRESTORE & DEXIE
  // -------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function loadStoredUnconfirmed() {
      try {
        setIsSyncingStaged(true);
        // First get from local Dexie store
        const localUnconfirmed = await getUnconfirmedConversationsLocal();
        
        // If user is authenticated, fetch latest from Firestore
        let cloudUnconfirmed: UnconfirmedConversation[] = [];
        if (currentUser) {
          try {
            cloudUnconfirmed = await fetchUnconfirmedConversationsFromCloud(currentUser);
          } catch (cErr) {
            console.warn('Could not fetch cloud unconfirmed conversations:', cErr);
          }
        }

        if (!isMounted) return;

        // Merge local and cloud by id (cloud prioritized if newer)
        const itemMap = new Map<string, UnconfirmedConversation>();
        localUnconfirmed.forEach(item => itemMap.set(item.id, item));
        cloudUnconfirmed.forEach(item => itemMap.set(item.id, item));

        const merged = Array.from(itemMap.values());
        merged.sort((a, b) => (b.stagedAt || 0) - (a.stagedAt || 0));

        if (merged.length > 0) {
          setPreviewConversations(merged);
          setSuccessMsg(`Restored ${merged.length} unconfirmed conversation(s) from persistent storage. You can continue reviewing or commit them.`);
        }
      } catch (err: any) {
        console.error('Error loading unconfirmed conversations:', err);
      } finally {
        if (isMounted) setIsSyncingStaged(false);
      }
    }

    loadStoredUnconfirmed();

    // Setup live subscription if authenticated
    let unsubscribe: (() => void) | undefined;
    if (currentUser) {
      unsubscribe = subscribeUnconfirmedConversations(currentUser, (cloudItems) => {
        if (!isMounted) return;
        if (cloudItems.length > 0) {
          setPreviewConversations(prev => {
            const map = new Map<string, UnconfirmedConversation>();
            prev.forEach(p => map.set(p.id, p));
            cloudItems.forEach(c => map.set(c.id, c));
            return Array.from(map.values()).sort((a, b) => (b.stagedAt || 0) - (a.stagedAt || 0));
          });
        }
      });
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // -------------------------------------------------------------------------
  // INGESTION: PARSE FILES AND PERSIST AS UNCONFIRMED
  // -------------------------------------------------------------------------
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const parsedList: ImportedConversation[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await parseUploadedFile(file);
        parsedList.push(...res);
      }

      if (parsedList.length === 0) {
        throw new Error('No valid conversations could be extracted. Check format or export file.');
      }

      const now = Date.now();
      const newStaged: UnconfirmedConversation[] = parsedList.map((c, idx) => ({
        ...c,
        id: c.id || `staged-conv-${now}-${idx}`,
        userId: currentUser?.uid,
        stagedAt: now,
        status: 'pending_review'
      }));

      // Persist immediately to Dexie & Firestore so user can leave anytime
      await saveUnconfirmedConversationsBatchLocal(newStaged);
      if (currentUser) {
        try {
          await saveUnconfirmedConversationsBatchToCloud(newStaged, currentUser);
        } catch (cloudErr) {
          console.warn('Failed cloud batch save for unconfirmed:', cloudErr);
        }
      }

      setPreviewConversations(prev => {
        const map = new Map<string, UnconfirmedConversation>();
        newStaged.forEach(s => map.set(s.id, s));
        prev.forEach(p => map.set(p.id, p));
        return Array.from(map.values()).sort((a, b) => (b.stagedAt || 0) - (a.stagedAt || 0));
      });
      setSelectedPreviewIndex(0);
      setSuccessMsg(`Parsed & safely saved ${newStaged.length} conversation thread(s) to persistent cloud storage! You can exit anytime and resume later.`);
    } catch (err: any) {
      console.error('File parse error:', err);
      setErrorMsg(err?.message || 'Failed to parse the selected file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // -------------------------------------------------------------------------
  // COMMIT ACTIONS (MOVE FROM UNCONFIRMED STAGING TO COMMITTED CONTEXT)
  // -------------------------------------------------------------------------
  const handleCommitSingle = async (conv: UnconfirmedConversation) => {
    try {
      // 1. Save to committed store
      await saveImportedConversation(conv, currentUser?.uid);
      if (currentUser) {
        await syncImportedConversationToCloud(conv, currentUser);
      }

      // 2. Remove from unconfirmed staging in Dexie & Firestore
      await deleteUnconfirmedConversationLocal(conv.id);
      if (currentUser) {
        await deleteUnconfirmedConversationFromCloud(conv.id, currentUser);
      }

      // 3. Update local state
      setPreviewConversations(prev => prev.filter(c => c.id !== conv.id));
      if (onImportSuccess) {
        onImportSuccess(conv);
      }
      setSuccessMsg(`Committed "${conv.title}" to local context ledger and removed from staging.`);
    } catch (err: any) {
      setErrorMsg(`Failed to commit: ${err?.message}`);
    }
  };

  const handleCommitAll = async () => {
    if (previewConversations.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      for (const conv of previewConversations) {
        await saveImportedConversation(conv, currentUser?.uid);
        if (currentUser) {
          await syncImportedConversationToCloud(conv, currentUser);
        }
        if (onImportSuccess) {
          onImportSuccess(conv);
        }
      }

      // Clear all unconfirmed in local and cloud
      await clearAllUnconfirmedConversationsLocal();
      if (currentUser) {
        await clearAllUnconfirmedConversationsFromCloud(currentUser);
      }

      setSuccessMsg(`Successfully committed all ${previewConversations.length} conversations to system context!`);
      setPreviewConversations([]);
    } catch (err: any) {
      setErrorMsg(`Failed to save all: ${err?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardSingle = async (convId: string, title: string) => {
    try {
      await deleteUnconfirmedConversationLocal(convId);
      if (currentUser) {
        await deleteUnconfirmedConversationFromCloud(convId, currentUser);
      }
      setPreviewConversations(prev => prev.filter(c => c.id !== convId));
      setSuccessMsg(`Discarded "${title}".`);
    } catch (err: any) {
      setErrorMsg(`Failed to discard: ${err?.message}`);
    }
  };

  const handleClearAllUnconfirmed = async () => {
    if (!window.confirm('Are you sure you want to discard all pending unconfirmed conversations?')) return;
    setIsLoading(true);
    try {
      await clearAllUnconfirmedConversationsLocal();
      if (currentUser) {
        await clearAllUnconfirmedConversationsFromCloud(currentUser);
      }
      setPreviewConversations([]);
      setSuccessMsg('Cleared all unconfirmed staged conversations.');
    } catch (err: any) {
      setErrorMsg(`Failed to clear: ${err?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // MANUAL RAW TEXT INGESTION
  // -------------------------------------------------------------------------
  const handleManualIngest = async (stageOnly: boolean = false) => {
    if (!manualRawText.trim()) {
      setErrorMsg('Please enter transcript text.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const now = Date.now();
      const lines = manualRawText.trim().split('\n').filter(l => l.trim().length > 0);
      const messages = lines.map((line, idx) => {
        const lower = line.toLowerCase();
        let sender: 'user' | 'assistant' | 'system' = idx % 2 === 0 ? 'user' : 'assistant';
        let text = line;

        if (lower.startsWith('user:') || lower.startsWith('human:') || lower.startsWith('me:')) {
          sender = 'user';
          text = line.replace(/^(user|human|me):/i, '').trim();
        } else if (lower.startsWith('assistant:') || lower.startsWith('ai:') || lower.startsWith('claude:') || lower.startsWith('chatgpt:')) {
          sender = 'assistant';
          text = line.replace(/^(assistant|ai|claude|chatgpt):/i, '').trim();
        }

        return {
          id: `man-msg-${idx}-${now}`,
          sender,
          text,
          timestamp: now + idx * 1000
        };
      });

      const title = manualTitle.trim() || `Manual Transcript (${new Date(now).toLocaleDateString()})`;
      const conv: UnconfirmedConversation = {
        id: `man-conv-${now}`,
        title,
        platform: manualPlatform,
        sourceFormat: 'txt',
        createdAt: now,
        importedAt: now,
        stagedAt: now,
        status: 'pending_review',
        messageCount: messages.length,
        characterCount: manualRawText.length,
        messages,
        summary: `Manually provided ${manualPlatform.toUpperCase()} transcript with ${messages.length} messages.`,
        keyTopics: ['manual-transcript', manualPlatform],
        activeForContext: !stageOnly,
        userId: currentUser?.uid
      };

      if (stageOnly) {
        // Save as unconfirmed for later review
        await saveUnconfirmedConversationsBatchLocal([conv]);
        if (currentUser) {
          await saveUnconfirmedConversationsBatchToCloud([conv], currentUser);
        }
        setPreviewConversations(prev => [conv, ...prev]);
        setSuccessMsg(`Transcript staged as unconfirmed item. Saved to persistent storage.`);
      } else {
        // Direct commit
        await saveImportedConversation(conv, currentUser?.uid);
        if (currentUser) {
          await syncImportedConversationToCloud(conv, currentUser);
        }
        if (onImportSuccess) {
          onImportSuccess(conv);
        }
        setSuccessMsg(`Successfully committed manual transcript "${conv.title}" to memory ledger!`);
      }

      setManualRawText('');
      setManualTitle('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to ingest manual transcript.');
    } finally {
      setIsLoading(false);
    }
  };

  const activePreview = previewConversations[selectedPreviewIndex];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 font-sans text-xs">
      {/* Notice Banner: API Keys moved to Settings */}
      <div className="p-3.5 bg-blue-950/20 border border-blue-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 mt-0.5 shrink-0">
            <Cpu size={14} />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-zinc-100 block">
              Model Providers & API Configuration
            </span>
            <span className="text-[11px] text-zinc-400 leading-relaxed block mt-0.5">
              Looking to enter your OpenAI (ChatGPT), Anthropic (Claude), or Google Gemini API keys? Configure them in the new <strong>Model Providers & API Settings</strong> to assign models to tasks and debriefs.
            </span>
          </div>
        </div>

        {onOpenModelSettings && (
          <button
            type="button"
            onClick={onOpenModelSettings}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-900/40 cursor-pointer self-start sm:self-center"
          >
            <Key size={12} />
            <span>Open Model Settings</span>
          </button>
        )}
      </div>

      {/* Persistence Banner: Staged Unconfirmed Resumption */}
      {previewConversations.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-amber-950/40 to-zinc-900/60 border border-amber-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5 shrink-0">
              <Clock size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-200">
                  {previewConversations.length} Unconfirmed Conversation(s) Staged
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/60 border border-emerald-700 text-emerald-300 flex items-center gap-1 font-semibold">
                  <Cloud size={10} /> Saved to Firestore
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 leading-relaxed block mt-0.5">
                Your unconfirmed imports are safely preserved in Firestore. You can exit this window anytime and return later to review remaining items.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={handleCommitAll}
              disabled={isLoading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              <span>Commit All ({previewConversations.length})</span>
            </button>
            <button
              type="button"
              onClick={handleClearAllUnconfirmed}
              disabled={isLoading}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-300 font-mono text-xs rounded-xl flex items-center gap-1 border border-zinc-800 transition-colors cursor-pointer"
              title="Discard all pending unconfirmed items"
            >
              <Trash2 size={12} />
              <span>Discard All</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-1.5 p-0.5 bg-zinc-950 border border-zinc-850 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'upload' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UploadCloud size={13} />
            <span>File Import (JSON / ZIP / TXT / PDF)</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'manual' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText size={13} />
            <span>Raw Transcript Paste</span>
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60">
          <ShieldCheck size={11} />
          <span>Local IndexedDB + Firestore Persistent Staging</span>
        </span>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2 text-rose-300">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
          <span className="text-xs flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-2 text-emerald-300">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
          <span className="text-xs flex-1">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
        </div>
      )}

      {/* TAB 1: File Drop */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging 
                ? 'border-blue-500 bg-blue-950/20' 
                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 shadow-inner">
              <UploadCloud size={24} />
            </div>
            <div>
              <p className="font-mono text-xs font-bold text-zinc-200">
                Drop your AI Conversation Export here
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Supports ChatGPT (<code className="text-zinc-300">conversations.json</code> or export zip), Claude JSON, Gemini transcripts, PDF, TXT, or CSV
              </p>
            </div>
            <span className="px-3 py-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-[10px] font-mono border border-zinc-800">
              Browse Local Files
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              accept=".json,.zip,.pdf,.txt,.csv,.md"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-zinc-400">
            <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <span className="text-emerald-400 font-bold block mb-0.5">ChatGPT Export</span>
              <span>Settings &gt; Data Controls &gt; Export Data &gt; upload <code className="text-zinc-200">conversations.json</code></span>
            </div>
            <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <span className="text-amber-400 font-bold block mb-0.5">Claude Export</span>
              <span>Settings &gt; Account &gt; Export Data &gt; upload <code className="text-zinc-200">conversations.json</code></span>
            </div>
            <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <span className="text-blue-400 font-bold block mb-0.5">Google Gemini</span>
              <span>Google Takeout &gt; Gemini activity export or copied transcript text</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manual Raw Paste */}
      {activeTab === 'manual' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Conversation Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed Consensus Architecture Discussion"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Platform Source
              </label>
              <select
                value={manualPlatform}
                onChange={(e) => setManualPlatform(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 text-xs font-mono"
              >
                <option value="chatgpt">OpenAI ChatGPT</option>
                <option value="claude">Anthropic Claude</option>
                <option value="gemini">Google Gemini</option>
                <option value="custom">Custom / Other LLM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Paste Transcript or Dialogue
            </label>
            <textarea
              rows={6}
              placeholder="Paste dialogue here (e.g. 'User: How do we coordinate... \nAssistant: Here is the framework...')"
              value={manualRawText}
              onChange={(e) => setManualRawText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 text-xs font-mono placeholder:text-zinc-600 resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleManualIngest(false)}
              disabled={isLoading || !manualRawText.trim()}
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/40 cursor-pointer"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              <span>Commit Directly to Ledger</span>
            </button>
            <button
              onClick={() => handleManualIngest(true)}
              disabled={isLoading || !manualRawText.trim()}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-900/50 cursor-pointer"
              title="Stage into unconfirmed list so you can review before committing"
            >
              <Clock size={13} />
              <span>Stage for Review</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview & Review Ledger of Unconfirmed Conversations */}
      {previewConversations.length > 0 && (
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-200 uppercase">
                Staged Conversations ({previewConversations.length})
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Click any thread to inspect messages
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCommitAll}
                disabled={isLoading}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                <span>Commit All to Memory Ledger</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {previewConversations.map((conv, idx) => (
              <div
                key={conv.id}
                onClick={() => setSelectedPreviewIndex(idx)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPreviewIndex === idx
                    ? 'bg-blue-950/30 border-blue-600 shadow-md'
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-zinc-200 truncate max-w-[200px]" title={conv.title}>
                    {conv.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-zinc-850 text-zinc-400">
                      {conv.platform}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDiscardSingle(conv.id, conv.title);
                      }}
                      className="text-zinc-600 hover:text-rose-400 p-0.5"
                      title="Discard from unconfirmed staging"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-2">{conv.summary}</p>
                <div className="mt-2 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <span>{conv.messageCount} msgs</span>
                    <span>&bull;</span>
                    <span className="text-amber-400/80">Pending review</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCommitSingle(conv);
                    }}
                    className="px-2 py-0.5 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors"
                  >
                    Commit &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activePreview && (
            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-blue-400 font-bold">
                    Active Preview: {activePreview.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300">
                    {activePreview.platform}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {activePreview.messages?.length || 0} messages &bull; {((activePreview.characterCount || 0) / 1000).toFixed(1)}k chars
                  </span>
                  <button
                    onClick={() => handleCommitSingle(activePreview)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold flex items-center gap-1"
                  >
                    <Check size={11} />
                    <span>Commit This Thread</span>
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {(activePreview.messages || []).slice(0, 10).map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 text-xs">
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                      {m.sender}
                    </span>
                    <p className="text-zinc-300 font-sans text-[11px] whitespace-pre-wrap line-clamp-4">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
