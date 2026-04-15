import React, { useState, useRef, useEffect } from 'react';
import { SyntaxItem, searchSyntax, SYNTAX_CATEGORIES } from '../utils/syntaxData';
import { HelpCircle, Search, X, BookOpen } from 'lucide-react';

interface SyntaxTooltipProps {
  trigger?: React.ReactNode;
}

const SyntaxTooltip: React.FC<SyntaxTooltipProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const results = searchSyntax(filter);
  const filtered = activeCategory
    ? results.filter((item) => item.category === activeCategory)
    : results;

  const categoryColors: Record<string, string> = {
    '调度': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    '区域': 'bg-green-500/20 text-green-400 border-green-500/30',
    '组合': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'LoRA': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    '编码': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    '其他': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`p-1.5 rounded transition-colors ${
          open
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
        }`}
        title="语法速查"
      >
        {trigger || <HelpCircle className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[420px] max-h-[520px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl shadow-black/50 z-50 flex flex-col overflow-hidden">
          {/* 搜索栏 */}
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center gap-2 bg-slate-800 rounded px-2 py-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="搜索语法..."
                className="bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none w-full"
                autoFocus
              />
              {filter && (
                <button onClick={() => setFilter('')} className="text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* 分类标签 */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  !activeCategory
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                }`}
              >
                全部
              </button>
              {SYNTAX_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-all border ${
                    activeCategory === cat
                      ? categoryColors[cat]
                      : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 结果列表 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-slate-600 text-sm">
                没有匹配的语法
              </div>
            ) : (
              filtered.map((item) => (
                <SyntaxCard key={item.keyword} item={item} categoryColors={categoryColors} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SyntaxCard: React.FC<{
  item: SyntaxItem;
  categoryColors: Record<string, string>;
}> = ({ item, categoryColors }) => (
  <div className="p-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
    <div className="flex items-start justify-between gap-2 mb-1">
      <span className="text-sm font-semibold text-slate-200">{item.name}</span>
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${categoryColors[item.category]}`}
      >
        {item.category}
      </span>
    </div>
    <p className="text-xs text-slate-400 mb-2">{item.desc}</p>
    <div className="bg-slate-950 rounded px-2 py-1.5 mb-1.5 font-mono">
      <span className="text-[10px] text-slate-600 block mb-0.5">语法</span>
      <code className="text-xs text-indigo-300 break-all">{item.syntax}</code>
    </div>
    <div className="font-mono">
      <span className="text-[10px] text-slate-600">示例: </span>
      <code className="text-xs text-emerald-400/80 break-all">{item.example}</code>
    </div>
  </div>
);

export default SyntaxTooltip;
