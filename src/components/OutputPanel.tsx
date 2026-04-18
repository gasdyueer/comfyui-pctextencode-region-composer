
import React, { useState } from 'react';
import { Copy, Check, Terminal, FileJson } from 'lucide-react';
import { CanvasSettings, Region } from '../types';

interface OutputPanelProps {
  prompt: string;
  canvas: CanvasSettings;
  regions: Region[];
}

const OutputPanel: React.FC<OutputPanelProps> = ({ prompt, canvas, regions }) => {
  const [copied, setCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const json = JSON.stringify({ canvas, regions }, null, 2);
    navigator.clipboard.writeText(json);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  return (
    <div className="h-48 border-t border-slate-800 bg-slate-900 p-4 flex flex-col shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>生成的提示词</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500"
          >
            {jsonCopied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">已复制！</span>
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4" />
                <span>导出 JSON</span>
              </>
            )}
          </button>
          <button
            onClick={handleCopy}
            disabled={!prompt}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-800 disabled:text-slate-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>已复制！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>复制到剪贴板</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded p-3 overflow-y-auto custom-scrollbar group relative">
        <code className="text-sm text-indigo-300 break-all leading-relaxed font-mono">
          {prompt || <span className="text-slate-700 italic">添加区域和文本以生成提示词...</span>}
        </code>
      </div>
    </div>
  );
};

export default OutputPanel;
