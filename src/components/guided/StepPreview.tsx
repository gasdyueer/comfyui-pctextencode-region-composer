import React from 'react';
import { Region, CanvasSettings } from '../../types';

interface StepPreviewProps {
  canvas: CanvasSettings;
  regions: Region[];
  prompt: string;
}

const StepPreview: React.FC<StepPreviewProps> = ({ canvas, regions, prompt }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-1">预览确认</h3>
        <p className="text-sm text-slate-400">检查画布和生成的提示词</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Canvas Preview */}
        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
          <p className="text-[10px] text-slate-600 uppercase font-bold mb-2">
            画布 {canvas.width}×{canvas.height} · {canvas.mode}
          </p>
          <div className="relative aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
            {regions.map((region, idx) => (
              <div
                key={region.id}
                className="absolute"
                style={{
                  left: `${(region.x / canvas.width) * 100}%`,
                  top: `${(region.y / canvas.height) * 100}%`,
                  width: `${(region.width / canvas.width) * 100}%`,
                  height: `${(region.height / canvas.height) * 100}%`,
                  backgroundColor: region.color,
                  opacity: 0.4,
                  border: `2px solid ${region.color}`,
                  borderRadius: '2px',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold drop-shadow-md">
                    #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-0.5">
            {regions.map((region, idx) => (
              <div key={region.id} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: region.color }} />
                <span className="text-slate-400 truncate">{region.prompt || `区域 ${idx + 1}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Preview */}
        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col">
          <p className="text-[10px] text-slate-600 uppercase font-bold mb-2">生成提示词</p>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {prompt ? (
              <pre className="text-xs text-indigo-300 font-mono leading-relaxed whitespace-pre-wrap break-all">
                {prompt}
              </pre>
            ) : (
              <p className="text-slate-700 italic text-xs">暂无提示词内容...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPreview;
