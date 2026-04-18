




import React, { useState, useRef, useEffect } from 'react';
import { CanvasSettings, OutputMode, CoordFormat, WeightStyle } from '../types';
import { Settings, Maximize2, X, Zap } from 'lucide-react';
import { AVAILABLE_STYLES, AVAILABLE_NORMALIZATIONS, QUICK_INSERTS } from '../constants';
import Modal from './Modal';

interface SidebarProps {
  canvas: CanvasSettings;
  onUpdateCanvas: (updates: Partial<CanvasSettings>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  canvas,
  onUpdateCanvas,
}) => {
  const [suffixEditorOpen, setSuffixEditorOpen] = useState(false);
  const [suffixEditorText, setSuffixEditorText] = useState('');
  const suffixTextareaRef = useRef<HTMLTextAreaElement>(null);

  const openSuffixEditor = () => {
    setSuffixEditorText(canvas.suffixPrompt);
    setSuffixEditorOpen(true);
    requestAnimationFrame(() => {
      if (suffixTextareaRef.current) {
        suffixTextareaRef.current.focus();
      }
    });
  };

  const closeSuffixEditor = () => {
    onUpdateCanvas({ suffixPrompt: suffixEditorText });
    setSuffixEditorOpen(false);
  };

  const insertAtSuffixCursor = (text: string) => {
    const ta = suffixTextareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = suffixEditorText.substring(0, start) + text + suffixEditorText.substring(end);
    setSuffixEditorText(newValue);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    });
  };

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
            <label className="block text-xs text-slate-500 mb-1">
              基础提示词
            </label>
            <textarea
              value={canvas.basePrompt}
              onChange={(e) => onUpdateCanvas({ basePrompt: e.target.value })}
              placeholder="输入全局提示词..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Suffix Prompt */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-500">
                区域后缀提示词
              </label>
              <button
                onClick={openSuffixEditor}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
                展开编辑
              </button>
            </div>
            <div
              onClick={openSuffixEditor}
              className="w-full min-h-[48px] bg-slate-800 border border-slate-700 rounded px-2.5 py-2 text-sm text-slate-300 cursor-pointer hover:border-indigo-500/40 transition-colors overflow-hidden"
              title="点击展开编辑"
            >
              {canvas.suffixPrompt ? (
                <p className="line-clamp-2 break-all leading-relaxed">{canvas.suffixPrompt}</p>
              ) : (
                <p className="text-slate-600 italic text-xs">所有区域将共用此后缀...</p>
              )}
            </div>
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

      {/* Suffix Prompt Editor Modal */}
      <Modal
        open={suffixEditorOpen}
        onClose={closeSuffixEditor}
        icon={<Zap className="w-4 h-4 text-indigo-400" />}
        title="编辑区域后缀提示词"
        subtitle="追加到每个区域末尾"
        footer={
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">{suffixEditorText.length} 字符</span>
            <button
              onClick={closeSuffixEditor}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              完成
            </button>
          </div>
        }
      >
        <div className="p-5">
          <textarea
            ref={suffixTextareaRef}
            value={suffixEditorText}
            onChange={(e) => setSuffixEditorText(e.target.value)}
            placeholder="输入后缀提示词，将自动追加到所有区域的提示词末尾..."
            className="w-full min-h-[220px] bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60 resize-none font-mono leading-relaxed custom-scrollbar"
          />
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">快捷插入</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_INSERTS.map((qi) => (
              <button
                key={qi.label}
                onClick={() => insertAtSuffixCursor(qi.label)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all border border-transparent ${qi.cls}`}
                title={qi.tip}
              >
                {qi.label}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sidebar;
