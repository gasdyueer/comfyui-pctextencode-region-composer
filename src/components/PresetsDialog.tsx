import React, { useState, useEffect } from 'react';
import { RegionPreset, PRESETS, COLORS, presetToRegions } from '../constants';
import { OutputMode, CoordFormat, Region, CanvasSettings } from '../types';
import { Layers } from 'lucide-react';
import Modal from './Modal';

interface PresetsDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (canvas: Partial<CanvasSettings>, regions: Region[]) => void;
  canvas: CanvasSettings;
  hasExistingRegions?: boolean;
}

const PresetsDialog: React.FC<PresetsDialogProps> = ({ open, onClose, onApply, canvas, hasExistingRegions }) => {
  const [filter, setFilter] = useState<OutputMode | null>(null);

  useEffect(() => {
    if (open) setFilter(null);
  }, [open]);

  const filtered = filter ? PRESETS.filter(p => p.mode === filter) : PRESETS;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[680px]"
      icon={<Layers className="w-4 h-4 text-indigo-400" />}
      title="蒙版预设"
      subtitle="选择常用区域布局快速开始"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">
            共 {PRESETS.length} 个预设，当前显示 {filtered.length} 个
          </span>
          <span className="text-xs text-slate-600">
            按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">Esc</kbd> 关闭
          </span>
        </div>
      }
    >
      {/* Category tabs */}
      <div className="px-5 pt-3 flex gap-2">
        {[
          { label: `全部 (${PRESETS.length})`, value: null },
          { label: 'COUPLE', value: OutputMode.COUPLE },
          { label: 'AND', value: OutputMode.AND },
        ].map(tab => (
          <button
            key={String(tab.value)}
            onClick={() => setFilter(tab.value as OutputMode | null)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filter === tab.value
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preset cards grid */}
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3">
          {filtered.map(preset => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onClick={() => {
                if (hasExistingRegions && !confirm('应用预设将覆盖当前所有区域，是否继续？')) return;
                const regions = presetToRegions(preset, canvas.width, canvas.height);
                onApply({ mode: preset.mode, format: CoordFormat.PERCENTAGE, useFill: preset.useFill }, regions);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

const PresetCard: React.FC<{
  preset: RegionPreset;
  onClick: () => void;
}> = ({ preset, onClick }) => (
  <button
    onClick={onClick}
    className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 hover:border-indigo-500/40 transition-all cursor-pointer text-left group"
  >
    {/* Thumbnail */}
    <div className="relative w-full aspect-square bg-slate-950 rounded-md mb-2.5 overflow-hidden border border-slate-800">
      <div className="absolute inset-1">
        {preset.slots.map((slot, idx) => (
          <div
            key={idx}
            className="absolute rounded-sm border border-white/10 transition-opacity group-hover:opacity-90"
            style={{
              left: `${slot.x1 * 100}%`,
              top: `${slot.y1 * 100}%`,
              width: `${(slot.x2 - slot.x1) * 100}%`,
              height: `${(slot.y2 - slot.y1) * 100}%`,
              backgroundColor: COLORS[idx % COLORS.length],
              opacity: 0.4,
            }}
          />
        ))}
      </div>
    </div>

    {/* Info */}
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
        {preset.name}
      </span>
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
        preset.mode === OutputMode.COUPLE
          ? 'bg-cyan-500/15 text-cyan-400'
          : 'bg-amber-500/15 text-amber-400'
      }`}>
        {preset.mode}
      </span>
    </div>
    <p className="text-xs text-slate-500 truncate">{preset.desc}</p>
  </button>
);

export default PresetsDialog;
