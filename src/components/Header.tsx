
import React from 'react';
import { Layout, BookOpen, Upload, Layers, Wand2 } from 'lucide-react';
import { APP_VERSION } from '../constants';

interface HeaderProps {
  onOpenCheatSheet: () => void;
  onImport: () => void;
  onOpenPresets: () => void;
  onOpenGuided: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenCheatSheet, onImport, onOpenPresets, onOpenGuided }) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-6 shrink-0">
      <div className="flex items-center gap-2 text-indigo-400">
        <Layout className="w-6 h-6" />
        <h1 className="font-bold text-lg tracking-tight text-slate-100">
          ComfyUI 区域提示词编辑器
        </h1>
      </div>
      <button
        onClick={onOpenGuided}
        className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-300 hover:bg-indigo-600/30 hover:border-indigo-500/50 transition-all"
      >
        <Wand2 className="w-3.5 h-3.5" />
        <span>引导创建</span>
      </button>
      <button
        onClick={onOpenCheatSheet}
        className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>语法速查手册</span>
      </button>
      <button
        onClick={onOpenPresets}
        className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>蒙版预设</span>
      </button>
      <button
        onClick={onImport}
        className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all"
      >
        <Upload className="w-3.5 h-3.5" />
        <span>导入</span>
      </button>
      <div className="ml-auto text-xs text-slate-500 font-mono">
        v{APP_VERSION}
      </div>
    </header>
  );
};

export default Header;
