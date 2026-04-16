
import React from 'react';
import { CanvasSettings, OutputMode, CoordFormat, WeightStyle } from '../types';
import { Settings } from 'lucide-react';
import { AVAILABLE_STYLES, AVAILABLE_NORMALIZATIONS } from '../constants';
import SyntaxTooltip from './SyntaxTooltip';

interface SidebarProps {
  canvas: CanvasSettings;
  onUpdateCanvas: (updates: Partial<CanvasSettings>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  canvas,
  onUpdateCanvas,
}) => {
  const toggleNormalization = (norm: string) => {
    const current = canvas.normalization;
    if (norm === 'none') {
      onUpdateCanvas({ normalization: ['none'] });
    } else {
      const filtered = current.filter(n => n !== 'none');
      if (filtered.includes(norm)) {
        const next = filtered.filter(n => n !== norm);
        onUpdateCanvas({ normalization: next.length === 0 ? ['none'] : next });
      } else {
        onUpdateCanvas({ normalization: [...filtered, norm] });
      }
    }
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500";

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900 overflow-y-auto flex flex-col shrink-0 custom-scrollbar">
      {/* Canvas Settings */}
      <section className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <Settings className="w-4 h-4" />
          <span>画布设置</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">宽度</label>
            <input
              type="number"
              value={canvas.width}
              onChange={(e) => onUpdateCanvas({ width: parseInt(e.target.value) || 0 })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">高度</label>
            <input
              type="number"
              value={canvas.height}
              onChange={(e) => onUpdateCanvas({ height: parseInt(e.target.value) || 0 })}
              className={inputCls}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">语法模式</label>
            <select
              value={canvas.mode}
              onChange={(e) => onUpdateCanvas({ mode: e.target.value as OutputMode })}
              className={inputCls}
            >
              <option value={OutputMode.AND}>标准 (AND)</option>
              <option value={OutputMode.COUPLE}>注意力耦合</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">坐标格式</label>
            <select
              value={canvas.format}
              onChange={(e) => onUpdateCanvas({ format: e.target.value as CoordFormat })}
              className={inputCls}
            >
              <option value={CoordFormat.PERCENTAGE}>百分比 (0.0-1.0)</option>
              <option value={CoordFormat.PIXEL}>像素（绝对值）</option>
            </select>
          </div>
          {canvas.mode === OutputMode.COUPLE && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canvas.useFill}
                  onChange={(e) => onUpdateCanvas({ useFill: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                />
                <span className="text-sm text-slate-300">自动 FILL()</span>
              </label>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                COUPLE 模式下每个区域可独立选择 MASK（矩形遮罩）或 IMASK（自定义遮罩），在右侧选中属性中配置。
              </p>
            </div>
          )}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              基础提示词
              <SyntaxTooltip />
            </label>
            <textarea
              value={canvas.basePrompt}
              onChange={(e) => onUpdateCanvas({ basePrompt: e.target.value })}
              placeholder="输入全局提示词..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* MASK_SIZE */}
          {canvas.mode === OutputMode.AND && (
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs text-slate-500 mb-2">
                MASK_SIZE
                <span className="text-slate-600 ml-1 font-normal">（默认 512x512）</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={canvas.maskWidth}
                  onChange={(e) => onUpdateCanvas({ maskWidth: parseInt(e.target.value) || 512 })}
                  placeholder="宽度"
                  className={inputCls}
                />
                <input
                  type="number"
                  value={canvas.maskHeight}
                  onChange={(e) => onUpdateCanvas({ maskHeight: parseInt(e.target.value) || 512 })}
                  placeholder="高度"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {/* MASKW */}
          {canvas.mode === OutputMode.AND && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                MASKW
                <span className="text-slate-600 ml-1 font-normal">（全局权重，默认 1.0）</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={canvas.maskWeight}
                onChange={(e) => onUpdateCanvas({ maskWeight: parseFloat(e.target.value) || 1.0 })}
                className={inputCls}
              />
            </div>
          )}

          {/* STYLE */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs text-slate-500 mb-2">
              权重风格
              <span className="text-slate-600 ml-1 font-normal">STYLE()</span>
            </label>
            <select
              value={canvas.style}
              onChange={(e) => onUpdateCanvas({ style: e.target.value as WeightStyle })}
              className={inputCls}
            >
              {AVAILABLE_STYLES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <label className="block text-xs text-slate-500 mt-3 mb-2">归一化</label>
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
      </section>
    </div>
  );
};

export default Sidebar;
