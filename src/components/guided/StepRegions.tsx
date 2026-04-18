import React from 'react';
import { Region, CanvasSettings, RegionType, MaskOp, OutputMode, CoupleMaskType } from '../../types';
import { QUICK_INSERTS } from '../../constants';

interface StepRegionsProps {
  canvas: CanvasSettings;
  regions: Region[];
  currentRegionIndex: number;
  onUpdateRegion: (index: number, updates: Partial<Region>) => void;
  onSetCurrentIndex: (index: number) => void;
}

const StepRegions: React.FC<StepRegionsProps> = ({
  canvas,
  regions,
  currentRegionIndex,
  onUpdateRegion,
  onSetCurrentIndex,
}) => {
  const currentRegion = regions[currentRegionIndex];

  if (regions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg mb-2">没有区域可编辑</p>
        <p className="text-slate-600 text-sm">请在"布局"步骤选择预设，或跳过此步</p>
      </div>
    );
  }

  if (!currentRegion) return null;

  const insertAtCursor = (text: string, textareaId: string) => {
    const ta = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const currentValue = ta.value;
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    onUpdateRegion(currentRegionIndex, { prompt: newValue });
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-1">填写区域内容</h3>
        <p className="text-sm text-slate-400">为每个区域输入提示词和参数</p>
      </div>

      {/* Region Navigation */}
      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-xl">
        {regions.map((region, idx) => (
          <button
            key={region.id}
            onClick={() => onSetCurrentIndex(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              idx === currentRegionIndex
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:text-slate-200'
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: region.color }}
            />
            <span>#{idx + 1}</span>
          </button>
        ))}
      </div>

      {/* Current Region Editor */}
      <div className="grid grid-cols-5 gap-4">
        {/* Left: Mini Preview */}
        <div className="col-span-2 bg-slate-950 rounded-xl p-3 border border-slate-800">
          <p className="text-[10px] text-slate-600 uppercase font-bold mb-2">区域预览</p>
          <div className="relative aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
            {regions.map((region, idx) => (
              <div
                key={region.id}
                className={`absolute transition-all ${idx === currentRegionIndex ? 'opacity-60' : 'opacity-20'}`}
                style={{
                  left: `${(region.x / canvas.width) * 100}%`,
                  top: `${(region.y / canvas.height) * 100}%`,
                  width: `${(region.width / canvas.width) * 100}%`,
                  height: `${(region.height / canvas.height) * 100}%`,
                  backgroundColor: region.color,
                  border: idx === currentRegionIndex ? `2px solid ${region.color}` : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {idx === currentRegionIndex && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                    #{idx + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Region Form */}
        <div className="col-span-3 space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">区域提示词</label>
            <textarea
              id={`region-prompt-${currentRegionIndex}`}
              value={currentRegion.prompt}
              onChange={(e) => onUpdateRegion(currentRegionIndex, { prompt: e.target.value })}
              placeholder="输入该区域的提示词..."
              className="w-full h-28 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60 resize-none font-mono leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Quick Insert */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">快捷插入</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {QUICK_INSERTS.map((qi) => (
                <button
                  key={qi.label}
                  onClick={() => insertAtCursor(qi.label, `region-prompt-${currentRegionIndex}`)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all border border-transparent ${qi.cls}`}
                  title={qi.tip}
                >
                  {qi.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode-specific params */}
          <div className="pt-2 border-t border-slate-800/50">
            {canvas.mode === OutputMode.AND ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1">类型</label>
                  <select
                    value={currentRegion.type}
                    onChange={(e) => onUpdateRegion(currentRegionIndex, { type: e.target.value as RegionType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value={RegionType.MASK}>MASK</option>
                    <option value={RegionType.AREA}>AREA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1">权重</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={currentRegion.weight}
                    onChange={(e) => onUpdateRegion(currentRegionIndex, { weight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1">运算</label>
                  <select
                    value={currentRegion.op}
                    onChange={(e) => onUpdateRegion(currentRegionIndex, { op: e.target.value as MaskOp })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value={MaskOp.MULTIPLY}>multiply</option>
                    <option value={MaskOp.ADD}>add</option>
                    <option value={MaskOp.SUBTRACT}>subtract</option>
                    <option value={MaskOp.INTERSECT}>intersect</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1">遮罩类型</label>
                  <select
                    value={currentRegion.coupleMaskType}
                    onChange={(e) => onUpdateRegion(currentRegionIndex, { coupleMaskType: e.target.value as CoupleMaskType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value={CoupleMaskType.MASK}>MASK（矩形）</option>
                    <option value={CoupleMaskType.IMASK}>IMASK（自定义）</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepRegions;
