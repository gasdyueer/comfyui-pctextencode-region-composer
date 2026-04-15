
import React from 'react';
import { Layout, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenCheatSheet: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenCheatSheet }) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-6 shrink-0">
      <div className="flex items-center gap-2 text-indigo-400">
        <Layout className="w-6 h-6" />
        <h1 className="font-bold text-lg tracking-tight text-slate-100">
          ComfyUI 区域提示词编辑器
        </h1>
      </div>
      <button
        onClick={onOpenCheatSheet}
        className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>语法速查手册</span>
      </button>
      <div className="ml-auto text-xs text-slate-500 font-mono">
        v1.0.0
      </div>
    </header>
  );
};

export default Header;
