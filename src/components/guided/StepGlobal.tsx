import React from 'react';
import { CanvasSettings, OutputMode, WeightStyle } from '../../types';
import { AVAILABLE_STYLES, AVAILABLE_NORMALIZATIONS, QUICK_INSERTS } from '../../constants';

interface StepGlobalProps {
  canvas: CanvasSettings;
  onUpdate: (updates: Partial<CanvasSettings>) => void;
}

const StepGlobal: React.FC<StepGlobalProps> = ({ canvas, onUpdate }) => {
  const toggleNormalization = (norm: string) => {
    const current = canvas.normalization;
    if (norm === 'none') {
      onUpdate({ normalization: ['none'] });
    } else {
      const filtered = current.filter(n => n !== 'none');
      if (filtered.includes(norm)) {
        const next = filtered.filter(n => n !== norm);
        onUpdate({ normalization: next.length === 0 ? ['none'] : next });
      } else {
        onUpdate({ normalization: [...filtered, norm] });
      }
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-1">全局选项</h3>
        <p className="text-sm text-slate-400">配置影响所有区域的公共参数</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">基础提示词</label>
          <textarea
            value={canvas.basePrompt}
            onChange={(e) => onUpdate({ basePrompt: e.target.value })}
            placeholder="输入全局基础提示词..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60 resize-none font-mono leading-relaxed custom-scrollbar"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">区域后缀提示词</label>
          <textarea
            value={canvas.suffixPrompt}
            onChange={(e) => onUpdate({ suffixPrompt: e.target.value })}
            placeholder="追加到每个区域末尾..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60 resize-none font-mono leading-relaxed custom-scrollbar"
          />
        </div>
      </div>

      {/* Mode-specific canvas options */}
      {canvas.mode === OutputMode.AND && (
        <div className="pt-3 border-t border-slate-800/50 space-y-3">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">AND 模式参数</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-slate-600 mb-1">MASK_SIZE 宽</label>
              <input
                type="number"
                value={canvas.maskWidth}
                onChange={(e) => onUpdate({ maskWidth: parseInt(e.target.value) || 512 })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 mb-1">MASK_SIZE 高</label>
              <input
                type="number"
                value={canvas.maskHeight}
                onChange={(e) => onUpdate({ maskHeight: parseInt(e.target.value) || 512 })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 mb-1">MASKW 权重</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={canvas.maskWeight}
                onChange={(e) => onUpdate({ maskWeight: parseFloat(e.target.value) || 1.0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {canvas.mode === OutputMode.COUPLE && (
        <div className="pt-3 border-t border-slate-800/50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={canvas.useFill}
              onChange={(e) => onUpdate({ useFill: e.target.checked })}
              className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
            />
            <span className="text-sm text-slate-300">自动 FILL()</span>
          </label>
        </div>
      )}

      {/* Style & Normalization */}
      <div className="pt-3 border-t border-slate-800/50 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-600 mb-1">权重风格 STYLE()</label>
            <select
              value={canvas.style}
              onChange={(e) => onUpdate({ style: e.target.value as WeightStyle })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500"
            >
              {AVAILABLE_STYLES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-600 mb-1.5">归一化</label>
            <div className="flex gap-1.5">
              {AVAILABLE_NORMALIZATIONS.map(norm => (
                <button
                  key={norm}
                  onClick={() => toggleNormalization(norm)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    canvas.normalization.includes(norm)
                      ? 'bg-indigo-500/80 text-white shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {norm}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepGlobal;
