import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Store, 
  Building2, 
  Landmark, 
  ShieldAlert, 
  Sparkles, 
  ChevronDown, 
  Check,
  Info
} from 'lucide-react';
import type { UniversalMode, RegisterMode } from '../types';
import { UNIVERSAL_MODES } from '../config/universalModes';

interface UniversalModeSelectorProps {
  currentMode: UniversalMode;
  registerMode: RegisterMode;
  onSelectMode: (mode: RegisterMode) => void;
}

export const UniversalModeSelector: React.FC<UniversalModeSelectorProps> = ({
  currentMode,
  registerMode,
  onSelectMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeDef = UNIVERSAL_MODES[currentMode] || UNIVERSAL_MODES.everyday;
  const isAuto = registerMode === 'auto';

  const getIcon = (id: UniversalMode | 'auto') => {
    switch (id) {
      case 'everyday': return <User size={14} className="text-blue-400" />;
      case 'small_business': return <Store size={14} className="text-emerald-400" />;
      case 'enterprise': return <Building2 size={14} className="text-blue-400" />;
      case 'local_gov': return <Landmark size={14} className="text-sky-400" />;
      case 'federal': return <ShieldAlert size={14} className="text-amber-400" />;
      default: return <Sparkles size={14} className="text-purple-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer shadow-sm ${
          activeDef.theme.accentBorder
        } ${activeDef.theme.badgeBg} hover:brightness-110`}
        title="Universal Persona & Operational Mode Switcher"
      >
        <div className="flex items-center gap-1.5">
          {isAuto ? <Sparkles size={13} className="text-purple-400 animate-pulse" /> : getIcon(currentMode)}
          <span className="text-zinc-400 uppercase text-[10px] font-bold">MODE:</span>
          <span className={`font-bold ${activeDef.theme.badgeText}`}>
            {isAuto ? `AUTO (${activeDef.shortLabel})` : activeDef.name}
          </span>
        </div>
        <ChevronDown size={13} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 font-mono text-xs space-y-1">
          <div className="p-2 border-b border-zinc-850/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                UNIVERSAL CONTINUUM
              </span>
              <span className="text-[9px] text-zinc-500 font-sans">
                Adaptive layout, tone & behavior
              </span>
            </div>
          </div>

          {/* Auto Mode Option */}
          <button
            onClick={() => {
              onSelectMode('auto');
              setIsOpen(false);
            }}
            className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
              isAuto
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                : 'bg-zinc-900/50 border-zinc-850 hover:bg-zinc-900 text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                  <span>Auto-Detect Mode</span>
                  <span className="text-[9px] font-normal px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                    SMART
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                  Dynamically shifts mode based on input prompt context
                </p>
              </div>
            </div>
            {isAuto && <Check size={14} className="text-purple-400 shrink-0" />}
          </button>

          {/* 5 Specific Universal Modes */}
          {(Object.keys(UNIVERSAL_MODES) as UniversalMode[]).map((modeId) => {
            const def = UNIVERSAL_MODES[modeId];
            const isSelected = !isAuto && registerMode === modeId;

            return (
              <button
                key={modeId}
                onClick={() => {
                  onSelectMode(modeId);
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${def.theme.badgeBg} ${def.theme.accentBorder} text-white`
                    : 'bg-zinc-900/50 border-zinc-850 hover:bg-zinc-900 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${def.theme.badgeBg} border ${def.theme.accentBorder} flex items-center justify-center shrink-0`}>
                    {getIcon(modeId)}
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                      <span>{def.name}</span>
                      <span className={`text-[9px] font-normal px-1.5 py-0.2 rounded border ${def.theme.accentBorder} ${def.theme.badgeText}`}>
                        {def.shortLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-sans mt-0.5 line-clamp-1">
                      {def.categoryTitle}
                    </p>
                  </div>
                </div>
                {isSelected && <Check size={14} className={`${def.theme.badgeText} shrink-0`} />}
              </button>
            );
          })}

          <div className="p-2 pt-2 border-t border-zinc-850 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>PROJECT SWARM PROTOCOL</span>
            <span>NOT GOVERNMENT CENTRIC</span>
          </div>
        </div>
      )}
    </div>
  );
};
