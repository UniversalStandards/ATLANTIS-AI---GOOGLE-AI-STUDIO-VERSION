import React from 'react';
import { X, Plus, Check, Info } from 'lucide-react';
import type { PageCategory, WidgetDefinition } from '../../types';
import { getWidgetsForCategory } from './widgetRegistry';

interface AddWidgetModalProps {
  isOpen: boolean;
  category: PageCategory;
  activeWidgetIds: string[];
  onClose: () => void;
  onAddWidget: (def: WidgetDefinition) => void;
}

const categoryLabels: Record<PageCategory, string> = {
  dashboard: 'Executive Dashboard & Mission Hub',
  tree: 'Agent Tree & Hierarchy Canvas',
  telemetry: 'Operations, Logs & Sentinel',
  memory: 'Dual Memory & Personalization',
  safety: 'Governance & Safety Audits',
  debrief: 'Supervisor Debrief & Interrogation',
  conversations: 'AI Ingest & Grounding Ledger',
  blackboard: 'Project Swarm Blackboard & Tool Forge',
};

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  category,
  activeWidgetIds,
  onClose,
  onAddWidget
}) => {
  if (!isOpen) return null;

  const availableWidgets = getWidgetsForCategory(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono tracking-tight uppercase">
                Add Widget to {category.toUpperCase()}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PAGE-SCOPED
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Widget choices restricted to {categoryLabels[category]} components.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Available Widgets List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {availableWidgets.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-mono text-xs">
              No widgets registered for this page.
            </div>
          ) : (
            availableWidgets.map((widget) => {
              const isAlreadyAdded = activeWidgetIds.includes(widget.id);

              return (
                <div
                  key={widget.id}
                  className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-200 font-mono">
                        {widget.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-400 border border-zinc-750">
                        Default: {widget.defaultWidth.replace('col-', '')}/12 Col
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      {widget.description}
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                      <span>Unique Settings: {widget.settingOptions.length} parameters</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddWidget(widget);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                      isAlreadyAdded
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                    }`}
                  >
                    <Plus size={13} />
                    <span>{isAlreadyAdded ? 'Add Another' : 'Add Widget'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>{availableWidgets.length} total widgets eligible for this section</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
