import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { ConversationImporterWidget } from './ConversationImporterWidget';
import type { ImportedConversation } from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';

interface ImportConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onImportSuccess?: (conv: ImportedConversation) => void;
  onOpenModelSettings?: () => void;
}

export const ImportConversationModal: React.FC<ImportConversationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onImportSuccess,
  onOpenModelSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-tight">
                Import External AI Conversations
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Import dialogue histories from ChatGPT exports (conversations.json), Claude, Gemini, PDF, or raw transcripts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <ConversationImporterWidget
            currentUser={currentUser}
            onImportSuccess={(conv) => {
              if (onImportSuccess) onImportSuccess(conv);
            }}
            onOpenModelSettings={() => {
              onClose();
              if (onOpenModelSettings) onOpenModelSettings();
            }}
          />
        </div>
      </div>
    </div>
  );
};
