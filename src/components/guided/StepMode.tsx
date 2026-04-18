import React from 'react';
import { OutputMode } from '../../types';

interface StepModeProps {
  mode: OutputMode;
  onSelect: (mode: OutputMode) => void;
}

const StepMode: React.FC<StepModeProps> = ({ mode, onSelect }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-1">选择语法模式</h3>
        <p className="text-sm text-slate-400">不同的模式决定了区域提示词的编码方式</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect(OutputMode.AND)}
          className={`group p-6 rounded-xl border-2 text-left transition-all ${
            mode === OutputMode.AND
              ? 'border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : 'border-slate-700/50 bg-slate-800/30 hover:border-amber-500/30 hover:bg-amber-500/5'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
              mode === OutputMode.AND ? 'bg-amber-500/20' : 'bg-slate-700/50'
            }`}>
              🔲
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">标准 (AND)</h4>
              <span className="text-xs text-amber-400/70 font-mono">AND</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            各区域完全独立，使用 MASK/AREA 关键字指定遮罩区域和提示词。适合区域不重叠的场景，支持权重和合成运算。
          </p>
          <div className="mt-3 flex gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400/70">独立遮罩</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400/70">权重控制</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400/70">合成运算</span>
          </div>
        </button>

        <button
          onClick={() => onSelect(OutputMode.COUPLE)}
          className={`group p-6 rounded-xl border-2 text-left transition-all ${
            mode === OutputMode.COUPLE
              ? 'border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
              : 'border-slate-700/50 bg-slate-800/30 hover:border-cyan-500/30 hover:bg-cyan-500/5'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
              mode === OutputMode.COUPLE ? 'bg-cyan-500/20' : 'bg-slate-700/50'
            }`}>
              🔗
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">注意力耦合</h4>
              <span className="text-xs text-cyan-400/70 font-mono">COUPLE</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            区域间注意力自然过渡，使用 MASK/IMASK 实现柔性遮罩。适合区域需要平滑融合的场景，自动 FILL 编码。
          </p>
          <div className="mt-3 flex gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400/70">自然过渡</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400/70">IMASK 支持</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400/70">自动 FILL</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default StepMode;
