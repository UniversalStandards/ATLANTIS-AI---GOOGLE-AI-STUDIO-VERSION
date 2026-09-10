import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Check, 
  HelpCircle,
  Terminal,
  Crown,
  Activity,
  Gauge,
  History,
  GitBranch,
  Microscope,
  Layers,
  ShieldAlert,
  Clock,
  Database,
  Sparkles,
  ShieldCheck,
  Lock,
  Shield,
  MessageSquare,
  GripVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { WidgetInstance, WidgetDefinition, WidgetWidth, WidgetHeight } from '../../types';
import { WIDGET_REGISTRY } from './widgetRegistry';

interface WidgetContainerProps {
  instance: WidgetInstance;
  onUpdateWidth: (width: WidgetWidth) => void;
  onUpdateHeight: (height: WidgetHeight) => void;
  onUpdateSettings: (newSettings: Record<string, any>) => void;
  onRemove: () => void;
  // Snap-to-Grid Reorder props
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  children: React.ReactNode;
}

// Icon mapper for widget titles
const iconMap: Record<string, React.ReactNode> = {
  Terminal: <Terminal size={14} className="text-blue-400" />,
  Crown: <Crown size={14} className="text-amber-400" />,
  Activity: <Activity size={14} className="text-emerald-400" />,
  Gauge: <Gauge size={14} className="text-cyan-400" />,
  History: <History size={14} className="text-indigo-400" />,
  GitBranch: <GitBranch size={14} className="text-blue-400" />,
  Microscope: <Microscope size={14} className="text-purple-400" />,
  Layers: <Layers size={14} className="text-amber-400" />,
  ShieldAlert: <ShieldAlert size={14} className="text-rose-400" />,
  Clock: <Clock size={14} className="text-blue-400" />,
  Database: <Database size={14} className="text-emerald-400" />,
  Sparkles: <Sparkles size={14} className="text-purple-400" />,
  ShieldCheck: <ShieldCheck size={14} className="text-emerald-400" />,
  Lock: <Lock size={14} className="text-amber-400" />,
  Shield: <Shield size={14} className="text-blue-400" />,
  MessageSquare: <MessageSquare size={14} className="text-blue-400" />,
};

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  instance,
  onUpdateWidth,
  onUpdateHeight,
  onUpdateSettings,
  onRemove,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
  children
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const def: WidgetDefinition | undefined = WIDGET_REGISTRY[instance.widgetId];

  if (!def) {
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 font-mono text-xs">
        Unknown widget: {instance.widgetId}
      </div>
    );
  }

  // Grid width class mapping
  const widthClasses: Record<WidgetWidth, string> = {
    'col-4': 'col-span-12 md:col-span-6 lg:col-span-4',
    'col-6': 'col-span-12 lg:col-span-6',
    'col-8': 'col-span-12 lg:col-span-8',
    'col-12': 'col-span-12',
  };

  const colCountMap: Record<WidgetWidth, number> = {
    'col-4': 4,
    'col-6': 6,
    'col-8': 8,
    'col-12': 12,
  };

  const colCount = colCountMap[instance.width] || 6;

  // Height class mapping
  const heightClasses: Record<WidgetHeight, string> = {
    'compact': 'min-h-[160px] max-h-[340px]',
    'standard': 'min-h-[280px] max-h-[520px]',
    'tall': 'min-h-[460px] max-h-[760px]',
  };

  const handleSettingChange = (key: string, val: any) => {
    onUpdateSettings({
      ...instance.settings,
      [key]: val,
    });
  };

  return (
    <div 
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`${widthClasses[instance.width]} flex flex-col bg-zinc-900/90 border rounded-2xl overflow-hidden shadow-lg transition-all duration-200 group/widget relative ${
        isDragging ? 'opacity-40 scale-[0.98] border-blue-500 shadow-blue-500/20' : 
        isDragOver ? 'border-blue-400 ring-2 ring-blue-500/50 scale-[1.01]' : 
        'border-zinc-800/90 hover:border-zinc-700/80'
      }`}
    >
      {/* Snap Indicator Drop Target Guide */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 pointer-events-none border-2 border-dashed border-blue-400 bg-blue-500/10 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-950/90 border border-blue-500/60 text-blue-300 text-xs font-mono font-bold shadow-xl flex items-center gap-1.5">
            <span>Snap Widget to this 12-Col Slot</span>
          </div>
        </div>
      )}

      {/* Widget Header Bar */}
      <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2 min-w-0">
          {/* Drag Handle & Reorder Controls */}
          <div className="flex items-center gap-0.5 text-zinc-500 shrink-0">
            <div 
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:text-zinc-200 hover:bg-zinc-850 transition-colors"
              title="Drag to snap-align anywhere on the 12-column grid"
            >
              <GripVertical size={14} />
            </div>

            {/* Step Left / Right Reorder buttons */}
            {canMoveLeft && (
              <button
                onClick={onMoveLeft}
                className="p-0.5 rounded hover:text-blue-300 hover:bg-zinc-800 transition-colors"
                title="Move widget left (previous grid slot)"
              >
                <ChevronLeft size={13} />
              </button>
            )}
            {canMoveRight && (
              <button
                onClick={onMoveRight}
                className="p-0.5 rounded hover:text-blue-300 hover:bg-zinc-800 transition-colors"
                title="Move widget right (next grid slot)"
              >
                <ChevronRight size={13} />
              </button>
            )}
          </div>

          <div className="p-1 rounded bg-zinc-850 border border-zinc-800 flex items-center justify-center shrink-0">
            {iconMap[def.iconName] || <Sliders size={14} className="text-zinc-400" />}
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-zinc-200 font-mono tracking-tight truncate">
              {def.name}
            </h3>
          </div>
        </div>

        {/* Action Controls: 12-Col Snap Gauge, Resize Width, Resize Height, Settings, Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 12-Column Footprint Snap Gauge */}
          <div 
            className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400" 
            title={`Snap Footprint: Spans ${colCount} of 12 columns (${Math.round((colCount/12)*100)}% row width)`}
          >
            <div className="flex gap-[2px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 h-2 rounded-[1px] ${i < colCount ? 'bg-blue-400' : 'bg-zinc-800'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-300 font-bold">{colCount}/12</span>
          </div>

          {/* Width Selector Pill Group */}
          <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 text-[10px] font-mono">
            <button
              onClick={() => onUpdateWidth('col-4')}
              className={`px-1.5 py-0.5 rounded transition-colors ${instance.width === 'col-4' ? 'bg-zinc-750 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Snap to 4 Columns (1/3 Width)"
            >
              1/3
            </button>
            <button
              onClick={() => onUpdateWidth('col-6')}
              className={`px-1.5 py-0.5 rounded transition-colors ${instance.width === 'col-6' ? 'bg-zinc-750 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Snap to 6 Columns (1/2 Width)"
            >
              1/2
            </button>
            <button
              onClick={() => onUpdateWidth('col-8')}
              className={`px-1.5 py-0.5 rounded transition-colors ${instance.width === 'col-8' ? 'bg-zinc-750 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Snap to 8 Columns (2/3 Width)"
            >
              2/3
            </button>
            <button
              onClick={() => onUpdateWidth('col-12')}
              className={`px-1.5 py-0.5 rounded transition-colors ${instance.width === 'col-12' ? 'bg-zinc-750 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Snap to 12 Columns (Full Row Width)"
            >
              Full
            </button>
          </div>

          {/* Height Selector Pill Group */}
          <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 text-[10px] font-mono">
            <button
              onClick={() => onUpdateHeight('compact')}
              className={`px-1.5 py-0.5 rounded transition-colors ${instance.height === 'compact' ? 'bg-zinc-750 text-blue-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Height: Compact"
            >
              S
            </button>
            <button
              onClick={() => onUpdateHeight('standard')}
              className={`px-1.5 py-0.5 rounded transition-colors ${instance.height === 'standard' ? 'bg-zinc-750 text-blue-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Height: Standard"
            >
              M
            </button>
            <button
              onClick={() => onUpdateHeight('tall')}
              className={`px-1.5 py-0.5 rounded transition-colors ${instance.height === 'tall' ? 'bg-zinc-750 text-blue-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Height: Tall"
            >
              L
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`p-1.5 rounded-md border transition-all ${
              isSettingsOpen 
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/50' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
            title={`Customize ${def.name} Settings`}
          >
            <Settings size={13} className={isSettingsOpen ? 'animate-spin' : ''} />
          </button>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="p-1.5 rounded-md bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-700/60 transition-colors"
            title="Remove Widget from Dashboard"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Embedded Settings Configuration Panel */}
      {isSettingsOpen && (
        <div className="px-4 py-3 bg-zinc-950/95 border-b border-zinc-800 text-xs font-mono space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-850">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={12} />
              {def.name} Configuration
            </span>
            <span className="text-[10px] text-zinc-500 font-sans">
              Settings unique to this widget
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {def.settingOptions.map((opt) => {
              const currentVal = instance.settings[opt.key] !== undefined 
                ? instance.settings[opt.key] 
                : def.defaultSettings[opt.key];

              if (opt.type === 'boolean') {
                return (
                  <label 
                    key={opt.key} 
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
                  >
                    <div className="pr-2">
                      <div className="font-semibold text-zinc-200 text-xs">{opt.label}</div>
                      {opt.description && <div className="text-[10px] text-zinc-500 font-sans">{opt.description}</div>}
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(currentVal)}
                      onChange={(e) => handleSettingChange(opt.key, e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                  </label>
                );
              }

              if (opt.type === 'select' && opt.options) {
                return (
                  <div 
                    key={opt.key} 
                    className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1.5"
                  >
                    <span className="font-semibold text-zinc-200 text-xs">{opt.label}</span>
                    <select
                      value={currentVal}
                      onChange={(e) => handleSettingChange(opt.key, e.target.value)}
                      className="bg-zinc-950 border border-zinc-700/80 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                    >
                      {opt.options.map((o) => (
                        <option key={String(o.value)} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (opt.type === 'number') {
                return (
                  <div 
                    key={opt.key} 
                    className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
                  >
                    <span className="font-semibold text-zinc-200 text-xs">{opt.label}</span>
                    <input
                      type="number"
                      min={opt.min ?? 1}
                      max={opt.max ?? 100}
                      step={opt.step ?? 1}
                      value={Number(currentVal)}
                      onChange={(e) => handleSettingChange(opt.key, Number(e.target.value))}
                      className="w-16 bg-zinc-950 border border-zinc-700/80 rounded px-2 py-1 text-xs text-zinc-200 text-right focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] flex items-center gap-1 transition-colors"
            >
              <Check size={12} />
              Done
            </button>
          </div>
        </div>
      )}

      {/* Widget Dynamic Content Canvas */}
      <div className={`flex-1 flex flex-col overflow-auto ${heightClasses[instance.height]}`}>
        {children}
      </div>
    </div>
  );
};
