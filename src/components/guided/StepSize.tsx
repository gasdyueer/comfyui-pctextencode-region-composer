import React from 'react';
import { CanvasSettings } from '../../types';

interface StepSizeProps {
  canvas: CanvasSettings;
  onUpdate: (updates: Partial<CanvasSettings>) => void;
}

const PRESET_SIZES = [
  { w: 1024, h: 1024, label: '1024 × 1024', desc: '正方形' },
  { w: 768, h: 1024, label: '768 × 1024', desc: '竖版' },
  { w: 1024, h: 768, label: '1024 × 768', desc: '横版' },
  { w: 512, h: 512, label: '512 × 512', desc: '小正方' },
];

const StepSize: React.FC<StepSizeProps> = ({ canvas, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-1">设置画布尺寸</h3>
        <p className="text-sm text-slate-400">选择常用尺寸或自定义</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PRESET_SIZES.map(size => (
          <button
            key={size.label}
            onClick={() => onUpdate({ width: size.w, height: size.h })}
            className={`group p-4 rounded-xl border-2 text-left transition-all ${
              canvas.width === size.w && canvas.height === size.h
                ? 'border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                : 'border-slate-700/50 bg-slate-800/30 hover:border-indigo-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Aspect ratio preview */}
              <div className="relative flex items-center justify-center w-14 h-14 bg-slate-950 rounded-lg border border-slate-700/50">
                <div
                  className="rounded-sm bg-indigo-500/30 border border-indigo-500/50"
                  style={{
                    width: `${Math.min(1, size.w / size.h) * 40}px`,
                    height: `${Math.min(1, size.h / size.w) * 40}px`,
                  }}
                />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors font-mono">
                  {size.label}
                </span>
                <p className="text-xs text-slate-500">{size.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-800/50">
        <p className="text-xs text-slate-500 mb-3 font-medium">自定义尺寸</p>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 uppercase">宽度</label>
            <input
              type="number"
              value={canvas.width}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 512 })}
              className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-slate-600 mt-4">×</span>
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 uppercase">高度</label>
            <input
              type="number"
              value={canvas.height}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 512 })}
              className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepSize;
