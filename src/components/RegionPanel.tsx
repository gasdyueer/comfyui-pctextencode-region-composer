
import React, { useState, useRef, useEffect } from 'react';
import { CanvasSettings, Region, RegionType, MaskOp, OutputMode, CoupleMaskType } from '../types';
import { Plus, Trash2, List, Box, Link2, Unlink, Zap, Maximize2, X } from 'lucide-react';
import { MASK_OPS, COUPLE_MASK_TYPES } from '../constants';
import SyntaxTooltip from './SyntaxTooltip';

interface RegionPanelProps {
  regions: Region[];
  selectedRegionId: string | null;
  canvas: CanvasSettings;
  onUpdateRegion: (id: string, updates: Partial<Region>) => void;
  onAddRegion: () => void;
  onDeleteRegion: (id: string) => void;
  onSelectRegion: (id: string | null) => void;
}

const QUICK_INSERTS = [
  { label: 'BREAK', tip: '分块编码', cls: 'text-amber-400/70 hover:bg-amber-500/20 hover:text-amber-300' },
  { label: 'CAT', tip: '拼接编码', cls: 'text-cyan-400/70 hover:bg-cyan-500/20 hover:text-cyan-300' },
  { label: 'AVG(0.5)', tip: '加权平均', cls: 'text-violet-400/70 hover:bg-violet-500/20 hover:text-violet-300' },
  { label: '( :1.3)', tip: '权重强调', cls: 'text-pink-400/70 hover:bg-pink-500/20 hover:text-pink-300' },
  { label: 'SHUFFLE()', tip: '随机排列', cls: 'text-emerald-400/70 hover:bg-emerald-500/20 hover:text-emerald-300' },
  { label: '<lora: :1>', tip: '加载 LoRA', cls: 'text-purple-400/70 hover:bg-purple-500/20 hover:text-purple-300' },
  { label: 'DEF(=)', tip: '宏定义', cls: 'text-yellow-400/70 hover:bg-yellow-500/20 hover:text-yellow-300' },
  { label: '[ : :0.5]', tip: '调度切换', cls: 'text-blue-400/70 hover:bg-blue-500/20 hover:text-blue-300' },
  { label: '[ | :0.1]', tip: '交替切换', cls: 'text-teal-400/70 hover:bg-teal-500/20 hover:text-teal-300' },
  { label: 'NOISE(0.1)', tip: '添加噪声', cls: 'text-rose-400/70 hover:bg-rose-500/20 hover:text-rose-300' },
];

const FeatherSlider = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-14 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-indigo-500"
      />
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
    />
  </div>
);

const RegionPanel: React.FC<RegionPanelProps> = ({
  regions,
  selectedRegionId,
  canvas,
  onUpdateRegion,
  onAddRegion,
  onDeleteRegion,
  onSelectRegion,
}) => {
  const selectedRegion = regions.find(r => r.id === selectedRegionId);
  const [featherLinked, setFeatherLinked] = useState(true);
  const [promptEditorOpen, setPromptEditorOpen] = useState(false);
  const [editorText, setEditorText] = useState('');
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  const openEditor = () => {
    if (!selectedRegion) return;
    setEditorText(selectedRegion.prompt);
    setPromptEditorOpen(true);
    requestAnimationFrame(() => {
      if (editorTextareaRef.current) {
        editorTextareaRef.current.focus();
      }
    });
  };

  const closeEditor = () => {
    if (selectedRegion) {
      onUpdateRegion(selectedRegion.id, { prompt: editorText });
    }
    setPromptEditorOpen(false);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && promptEditorOpen) {
        closeEditor();
      }
    };
    if (promptEditorOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [promptEditorOpen, editorText, selectedRegion]);

  const insertAtEditorCursor = (text: string) => {
    const ta = editorTextareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = editorText.substring(0, start) + text + editorText.substring(end);
    setEditorText(newValue);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    });
  };

  const setAllFeather = (id: string, val: number) => {
    onUpdateRegion(id, { feather: { left: val, top: val, right: val, bottom: val } });
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500";

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900 overflow-y-auto flex flex-col shrink-0 custom-scrollbar">
      {/* Region List */}
      <section className="p-4 border-b border-slate-800 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span>区域 ({regions.length})</span>
          </div>
          <button
            onClick={onAddRegion}
            className="p-1 hover:bg-slate-800 rounded transition-colors text-indigo-400"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {regions.map((region, idx) => (
            <div
              key={region.id}
              onClick={() => onSelectRegion(region.id)}
              className={`p-2 rounded border cursor-pointer transition-all flex items-center gap-2 ${
                selectedRegionId === region.id
                  ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: region.color }}
              />
              <span className="text-sm truncate flex-1 text-slate-300">
                {region.prompt || `区域 ${idx + 1}`}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRegion(region.id);
                }}
                className="p-1 hover:text-red-400 text-slate-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {regions.length === 0 && (
            <div className="text-center py-8 text-slate-600 italic text-sm">
              尚未添加任何区域。
            </div>
          )}
        </div>
      </section>

      {/* Selected Properties */}
      {selectedRegion && (
        <section className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
            <Box className="w-4 h-4" />
            <span>选中属性</span>
          </div>
          <div className="space-y-4">
            {/* Prompt preview + edit button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs text-slate-500">
                  区域提示词
                  <SyntaxTooltip />
                </label>
                <button
                  onClick={openEditor}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  展开编辑
                </button>
              </div>
              <div
                onClick={openEditor}
                className="w-full min-h-[56px] bg-slate-800 border border-slate-700 rounded px-2.5 py-2 text-sm text-slate-300 cursor-pointer hover:border-indigo-500/40 transition-colors overflow-hidden"
                title="点击展开编辑"
              >
                {selectedRegion.prompt ? (
                  <p className="line-clamp-2 break-all leading-relaxed">{selectedRegion.prompt}</p>
                ) : (
                  <p className="text-slate-600 italic text-xs">点击输入区域提示词...</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">类型</label>
                <select
                  value={selectedRegion.type}
                  onChange={(e) => onUpdateRegion(selectedRegion.id, { type: e.target.value as RegionType })}
                  className={inputCls}
                >
                  <option value={RegionType.MASK}>MASK</option>
                  <option value={RegionType.AREA}>AREA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">权重</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={selectedRegion.weight}
                  onChange={(e) => onUpdateRegion(selectedRegion.id, { weight: parseFloat(e.target.value) || 0 })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">运算</label>
                <select
                  value={selectedRegion.op}
                  onChange={(e) => onUpdateRegion(selectedRegion.id, { op: e.target.value as MaskOp })}
                  className={inputCls}
                >
                  {MASK_OPS.map(op => (
                    <option key={op.value} value={op.value}>{op.value}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* COUPLE Mode: Mask Type Selector */}
            {canvas.mode === OutputMode.COUPLE && (
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs text-slate-500 mb-1">
                  耦合遮罩类型
                  <span className="text-slate-600 ml-1 font-normal">COUPLE</span>
                </label>
                <select
                  value={selectedRegion.coupleMaskType}
                  onChange={(e) => onUpdateRegion(selectedRegion.id, { coupleMaskType: e.target.value as CoupleMaskType })}
                  className={inputCls}
                >
                  {COUPLE_MASK_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {selectedRegion.coupleMaskType === CoupleMaskType.IMASK && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">索引</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={selectedRegion.imaskIndex}
                        onChange={(e) => onUpdateRegion(selectedRegion.id, { imaskIndex: parseInt(e.target.value) || 0 })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">权重</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={selectedRegion.imaskWeight}
                        onChange={(e) => onUpdateRegion(selectedRegion.id, { imaskWeight: parseFloat(e.target.value) || 0 })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">合成</label>
                      <select
                        value={selectedRegion.imaskOp}
                        onChange={(e) => onUpdateRegion(selectedRegion.id, { imaskOp: e.target.value as MaskOp })}
                        className={inputCls}
                      >
                        {MASK_OPS.map(op => (
                          <option key={op.value} value={op.value}>{op.value}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Feather */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">羽化 (px)</label>
                <button
                  onClick={() => setFeatherLinked(!featherLinked)}
                  className={`p-1 rounded transition-colors ${featherLinked ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-600 hover:text-slate-400'}`}
                  title={featherLinked ? '解除羽化联动' : '联动羽化值'}
                >
                  {featherLinked ? <Link2 className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
                </button>
              </div>
              {featherLinked ? (
                <FeatherSlider
                  label="全部方向"
                  value={selectedRegion.feather.left}
                  onChange={(v) => setAllFeather(selectedRegion.id, v)}
                />
              ) : (
                <div className="space-y-3">
                  <FeatherSlider
                    label="左"
                    value={selectedRegion.feather.left}
                    onChange={(v) => onUpdateRegion(selectedRegion.id, { feather: { ...selectedRegion.feather, left: v } })}
                  />
                  <FeatherSlider
                    label="上"
                    value={selectedRegion.feather.top}
                    onChange={(v) => onUpdateRegion(selectedRegion.id, { feather: { ...selectedRegion.feather, top: v } })}
                  />
                  <FeatherSlider
                    label="右"
                    value={selectedRegion.feather.right}
                    onChange={(v) => onUpdateRegion(selectedRegion.id, { feather: { ...selectedRegion.feather, right: v } })}
                  />
                  <FeatherSlider
                    label="下"
                    value={selectedRegion.feather.bottom}
                    onChange={(v) => onUpdateRegion(selectedRegion.id, { feather: { ...selectedRegion.feather, bottom: v } })}
                  />
                </div>
              )}
            </div>

            {/* Coordinate Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">X 坐标</label>
                  <input
                    type="number"
                    value={Math.round(selectedRegion.x)}
                    onChange={(e) => onUpdateRegion(selectedRegion.id, { x: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={canvas.width}
                  value={selectedRegion.x}
                  onChange={(e) => onUpdateRegion(selectedRegion.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Y 坐标</label>
                  <input
                    type="number"
                    value={Math.round(selectedRegion.y)}
                    onChange={(e) => onUpdateRegion(selectedRegion.id, { y: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={canvas.height}
                  value={selectedRegion.y}
                  onChange={(e) => onUpdateRegion(selectedRegion.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">宽度</label>
                  <input
                    type="number"
                    value={Math.round(selectedRegion.width)}
                    onChange={(e) => onUpdateRegion(selectedRegion.id, { width: parseInt(e.target.value) || 5 })}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <input
                  type="range"
                  min="5"
                  max={canvas.width}
                  value={selectedRegion.width}
                  onChange={(e) => onUpdateRegion(selectedRegion.id, { width: parseInt(e.target.value) || 5 })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">高度</label>
                  <input
                    type="number"
                    value={Math.round(selectedRegion.height)}
                    onChange={(e) => onUpdateRegion(selectedRegion.id, { height: parseInt(e.target.value) || 5 })}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <input
                  type="range"
                  min="5"
                  max={canvas.height}
                  value={selectedRegion.height}
                  onChange={(e) => onUpdateRegion(selectedRegion.id, { height: parseInt(e.target.value) || 5 })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Prompt Editor Modal */}
      {promptEditorOpen && selectedRegion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditor} />
          <div className="relative w-[620px] max-h-[75vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedRegion.color }}
                />
                <h3 className="text-sm font-bold text-slate-200">编辑区域提示词</h3>
                <span className="text-xs text-slate-600 font-mono">
                  {selectedRegion.type}({selectedRegion.weight.toFixed(1)})
                </span>
              </div>
              <button
                onClick={closeEditor}
                className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Textarea */}
            <div className="flex-1 p-5">
              <textarea
                ref={editorTextareaRef}
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                placeholder="输入该区域的提示词，支持 MASK/AREA 等语法..."
                className="w-full h-full min-h-[220px] bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60 resize-none font-mono leading-relaxed custom-scrollbar"
              />
            </div>

            {/* Quick Insert Bar */}
            <div className="px-5 pb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">快捷插入</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_INSERTS.map((qi) => (
                  <button
                    key={qi.label}
                    onClick={() => insertAtEditorCursor(qi.label)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all border border-transparent ${qi.cls}`}
                    title={qi.tip}
                  >
                    {qi.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
              <span className="text-xs text-slate-600">
                {editorText.length} 字符
              </span>
              <button
                onClick={closeEditor}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionPanel;
