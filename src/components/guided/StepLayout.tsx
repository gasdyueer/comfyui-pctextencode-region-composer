import React from 'react';
import { Region, CanvasSettings, CoordFormat } from '../../types';
import { PRESETS, COLORS, presetToRegions } from '../../constants';

interface StepLayoutProps {
  canvas: CanvasSettings;
  onSelect: (regions: Region[]) => void;
  onSkip: () => void;
}

const StepLayout: React.FC<StepLayoutProps> = ({ canvas, onSelect, onSkip }) => {
  const filtered = PRESETS.filter(p => p.mode === canvas.mode);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-1">选择区域布局</h3>
        <p className="text-sm text-slate-400">预设布局可快速开始，也可以跳过手动创建</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filtered.map(preset => (
          <button
            key={preset.id}
            onClick={() => {
              const regions = presetToRegions(preset, canvas.width, canvas.height);
              onSelect(regions);
            }}
            className="group p-3 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60 hover:border-indigo-500/40 transition-all text-left"
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-square bg-slate-950 rounded-lg mb-2.5 overflow-hidden border border-slate-800">
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
            <span className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
              {preset.name}
            </span>
            <p className="text-xs text-slate-500 truncate">{preset.desc}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-600">
          <p>当前模式下没有预设布局</p>
          <p className="text-xs mt-1">请跳过此步骤手动创建区域</p>
        </div>
      )}

      <div className="pt-2 border-t border-slate-800/50">
        <button
          onClick={onSkip}
          className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
        >
          跳过，手动创建区域 →
        </button>
      </div>
    </div>
  );
};

export default StepLayout;
