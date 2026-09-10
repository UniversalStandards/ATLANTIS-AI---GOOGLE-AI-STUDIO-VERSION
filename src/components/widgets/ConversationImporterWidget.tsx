import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Key, 
  Sparkles,
  Eye,
  Trash2,
  Check,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { parseUploadedFile } from '../../utils/conversationParsers';
import { saveImportedConversation } from '../../db';
import type { ImportedConversation } from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';

interface ConversationImporterWidgetProps {
  settings?: {
    autoActivateForContext?: boolean;
    defaultPlatform?: string;
    [key: string]: any;
  };
  currentUser?: FirebaseUser | null;
  onImportSuccess?: (conversation: ImportedConversation) => void;
}

export const ConversationImporterWidget: React.FC<ConversationImporterWidgetProps> = ({
  settings,
  currentUser,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'api' | 'manual'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewConversations, setPreviewConversations] = useState<ImportedConversation[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);

  // Manual raw text paste state
  const [manualTitle, setManualTitle] = useState('');
  const [manualPlatform, setManualPlatform] = useState<'chatgpt' | 'claude' | 'gemini' | 'custom'>('custom');
  const [manualRawText, setManualRawText] = useState('');

  // API sync state
  const [apiPlatform, setApiPlatform] = useState<'openai' | 'anthropic' | 'gemini'>('gemini');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiPromptFilter, setApiPromptFilter] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const parsedList = await parseUploadedFile(file);
      if (!parsedList || parsedList.length === 0) {
        throw new Error('No valid dialogue or conversation turns found in the file.');
      }

      // Apply settings default (e.g. autoActivateForContext)
      const autoActive = settings?.autoActivateForContext !== false;
      const enriched = parsedList.map(c => ({
        ...c,
        activeForContext: autoActive
      }));

      setPreviewConversations(enriched);
      setSelectedPreviewIndex(0);
      setSuccessMsg(`Parsed ${enriched.length} conversation(s) from "${file.name}". Review and confirm save.`);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMsg(err?.message || 'Failed to parse conversation file. Please check file format.');
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

  const handleSaveToDatabase = async () => {
    if (previewConversations.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      for (const conv of previewConversations) {
        await saveImportedConversation(conv, currentUser?.uid);
        if (onImportSuccess) {
          onImportSuccess(conv);
        }
      }

      setSuccessMsg(`Successfully saved ${previewConversations.length} conversation(s) to system context ledger!`);
      setPreviewConversations([]);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setErrorMsg(`Failed to persist to database: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualIngest = async () => {
    if (!manualRawText.trim()) {
      setErrorMsg('Please paste conversation text or transcript.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Mock File from text
      const fakeFile = new File([manualRawText], `${manualTitle || 'conversation'}.txt`, { type: 'text/plain' });
      const parsed = await parseUploadedFile(fakeFile);
      
      const now = Date.now();
      const conv: ImportedConversation = parsed[0] || {
        id: `conv_${now}`,
        title: manualTitle.trim() || 'Manual AI Transcript',
        platform: manualPlatform,
        sourceFormat: 'txt',
        createdAt: now,
        importedAt: now,
        messageCount: 1,
        characterCount: manualRawText.length,
        activeForContext: settings?.autoActivateForContext !== false,
        summary: `Ingested ${manualPlatform.toUpperCase()} conversation transcript.`,
        keyTopics: ['manual-import', manualPlatform],
        messages: [
          {
            id: 'msg-1',
            sender: 'user',
            content: manualRawText.slice(0, 500),
            timestamp: now
          }
        ]
      };

      await saveImportedConversation(conv, currentUser?.uid);
      if (onImportSuccess) {
        onImportSuccess(conv);
      }

      setSuccessMsg(`Successfully ingested manual transcript "${conv.title}"!`);
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
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-1.5 p-0.5 bg-zinc-950 border border-zinc-850 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'upload' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UploadCloud size={13} />
            <span>File Drop (PDF/JSON/TXT/CSV)</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'manual' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText size={13} />
            <span>Raw Paste</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'api' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key size={13} />
            <span>API Key Connect</span>
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60">
          <ShieldCheck size={11} />
          <span>Local IndexedDB + Firestore Secure</span>
        </span>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2 text-rose-300">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
          <span className="text-xs">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-2 text-emerald-300">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
          <span className="text-xs">{successMsg}</span>
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
                ? 'border-blue-400 bg-blue-500/10' 
                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-950/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt,.csv,.pdf"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-blue-400">
              {isLoading ? (
                <Loader2 size={24} className="animate-spin text-blue-400" />
              ) : (
                <UploadCloud size={24} />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-200">
                Click to browse or drag & drop AI conversation export
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Supports <strong className="text-zinc-400 font-mono">.JSON</strong> (ChatGPT, Claude, Gemini), <strong className="text-zinc-400 font-mono">.PDF</strong>, <strong className="text-zinc-400 font-mono">.TXT</strong> transcripts, and <strong className="text-zinc-400 font-mono">.CSV</strong> tables
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] font-mono text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">ChatGPT conversations.json</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Claude chat.json</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Gemini exports</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Chat PDFs</span>
            </div>
          </div>

          {/* Parsed Preview Stage */}
          {previewConversations.length > 0 && (
            <div className="p-4 bg-zinc-950 border border-blue-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <h4 className="text-xs font-mono font-bold text-zinc-200">
                    Preview Ingest ({previewConversations.length} items parsed)
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewConversations([])}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-mono"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveToDatabase}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/40"
                  >
                    {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    <span>Confirm & Store to Context</span>
                  </button>
                </div>
              </div>

              {/* Multi-conversation selector pills */}
              {previewConversations.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {previewConversations.map((c, idx) => (
                    <button
                      key={c.id || idx}
                      onClick={() => setSelectedPreviewIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all ${
                        selectedPreviewIndex === idx
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/60 font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      #{idx + 1}: {c.title.slice(0, 20)}...
                    </button>
                  ))}
                </div>
              )}

              {/* Active preview inspection */}
              {activePreview && (
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 text-xs">{activePreview.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-blue-300 border border-zinc-700">
                      {activePreview.platform} ({activePreview.messages.length} msgs)
                    </span>
                  </div>
                  {activePreview.summary && (
                    <p className="text-[11px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                      {activePreview.summary}
                    </p>
                  )}
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
                    {activePreview.messages.slice(0, 6).map((m, idx) => (
                      <div 
                        key={m.id || idx} 
                        className={`p-2 rounded-lg border text-[11px] ${
                          m.sender === 'user' 
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-300' 
                            : 'bg-blue-950/20 border-blue-900/40 text-blue-200'
                        }`}
                      >
                        <div className="text-[9px] uppercase font-bold text-zinc-500 mb-0.5">
                          {m.sender}
                        </div>
                        <div className="line-clamp-3 whitespace-pre-wrap">{m.content}</div>
                      </div>
                    ))}
                    {activePreview.messages.length > 6 && (
                      <div className="text-center text-[10px] text-zinc-500 py-1">
                        + {activePreview.messages.length - 6} additional messages included in import
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Raw Text Transcript */}
      {activeTab === 'manual' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Conversation Title
              </label>
              <input
                type="text"
                placeholder="e.g. Subsea Telemetry Architecture Discussion"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                AI Platform Source
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

          <button
            onClick={handleManualIngest}
            disabled={isLoading || !manualRawText.trim()}
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/40"
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            <span>Ingest Transcript to Context Ledger</span>
          </button>
        </div>
      )}

      {/* TAB 3: API Key Sync */}
      {activeTab === 'api' && (
        <div className="space-y-3">
          <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-amber-400" />
              <span className="font-mono text-xs font-bold text-zinc-200">
                Direct Provider History Synchronization
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Connect external API endpoints to fetch conversation threads and populate your supervisor memory context.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase text-zinc-400">
              Provider Selection
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['gemini', 'openai', 'anthropic'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setApiPlatform(prov)}
                  className={`p-2 rounded-xl border font-mono text-[11px] capitalize transition-all ${
                    apiPlatform === prov
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/60 font-bold'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
              API Key or Access Token
            </label>
            <input
              type="password"
              placeholder={`Enter ${apiPlatform.toUpperCase()} API Key`}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 text-xs font-mono"
            />
          </div>

          <button
            onClick={() => {
              if (!apiKeyInput.trim()) {
                setErrorMsg('Please enter an API Key to synchronize.');
                return;
              }
              setSuccessMsg(`API Sync configured for ${apiPlatform.toUpperCase()}. Ready to query remote logs.`);
            }}
            className="w-full py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Verify & Ingest via API</span>
          </button>
        </div>
      )}
    </div>
  );
};
