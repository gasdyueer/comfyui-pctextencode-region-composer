
import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface OutputPanelProps {
  prompt: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-48 border-t border-slate-800 bg-slate-900 p-4 flex flex-col shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>生成的提示词</span>
        </div>
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
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded p-3 overflow-y-auto custom-scrollbar group relative">
        <code className="text-sm text-indigo-300 break-all leading-relaxed font-mono">
          {prompt || <span className="text-slate-700 italic">添加区域和文本以生成提示词...</span>}
        </code>
      </div>
    </div>
  );
};

export default OutputPanel;
