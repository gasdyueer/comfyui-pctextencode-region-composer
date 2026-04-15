import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SyntaxItem,
  searchSyntax,
  SYNTAX_CATEGORIES,
  SYNTAX_DATA,
} from '../utils/syntaxData';
import { Search, X, ChevronDown, Copy, Check } from 'lucide-react';

interface SyntaxCheatSheetProps {
  open: boolean;
  onClose: () => void;
}

const SyntaxCheatSheet: React.FC<SyntaxCheatSheetProps> = ({ open, onClose }) => {
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  if (!open) return null;

  const results = searchSyntax(filter);
  const filtered = activeCategory
    ? results.filter((item) => item.category === activeCategory)
    : results;

  const categoryIcons: Record<string, string> = {
    '调度': '⏱',
    '区域': '🔲',
    '组合': '🔗',
    'LoRA': '🎨',
    '编码': '⚙',
    '其他': '📝',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative w-[680px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden animate-in fade-in">
        {/* 头部 */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-100">语法速查手册</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="搜索语法关键字、名称或说明..."
              className="bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none w-full"
              autoFocus
            />
            {filter && (
              <button onClick={() => setFilter('')} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 分类标签 */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                !activeCategory
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
              }`}
            >
              全部 ({results.length})
            </button>
            {SYNTAX_CATEGORIES.map((cat) => {
              const count = results.filter((item) => item.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
                    activeCategory === cat
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {categoryIcons[cat]} {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 结果列表 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600 text-lg mb-1">没有匹配的语法</p>
              <p className="text-slate-700 text-sm">试试其他关键词</p>
            </div>
          ) : (
            filtered.map((item) => (
              <CheatSheetCard
                key={item.keyword}
                item={item}
                onCopy={handleCopy}
                copiedId={copiedId}
              />
            ))
          )}
        </div>

        {/* 底部统计 */}
        <div className="px-4 py-2.5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            共 {SYNTAX_DATA.length} 条语法，当前显示 {filtered.length} 条
          </span>
          <span className="text-xs text-slate-600">
            按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">Esc</kbd> 关闭
          </span>
        </div>
      </div>
    </div>
  );
};

const CheatSheetCard: React.FC<{
  item: SyntaxItem;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}> = ({ item, onCopy, copiedId }) => {
  const id = item.keyword;
  const isCopied = copiedId === id;

  return (
    <div className="px-4 py-3.5 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {item.keyword}
          </span>
          <span className="text-sm font-semibold text-slate-200">{item.name}</span>
        </div>
        <button
          onClick={() => onCopy(item.example, id)}
          className={`p-1.5 rounded transition-all shrink-0 ${
            isCopied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
          }`}
          title="复制示例"
        >
          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className="text-sm text-slate-400 mb-3">{item.desc}</p>
      <div className="space-y-2">
        <div className="bg-slate-950/80 rounded-lg px-3 py-2">
          <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">语法</span>
          <code className="block mt-0.5 text-sm text-sky-300 font-mono break-all">{item.syntax}</code>
        </div>
        <div className="bg-slate-950/80 rounded-lg px-3 py-2">
          <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">示例</span>
          <code className="block mt-0.5 text-sm text-emerald-400 font-mono break-all">{item.example}</code>
        </div>
      </div>
    </div>
  );
};

export default SyntaxCheatSheet;
