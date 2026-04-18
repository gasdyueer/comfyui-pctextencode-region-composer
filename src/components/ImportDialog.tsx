import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileJson, Terminal, AlertCircle } from 'lucide-react';
import { parsePromptString, parseJsonInput } from '../utils/promptParser';
import { CanvasSettings, Region } from '../types';
import Modal from './Modal';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (canvas: CanvasSettings, regions: Region[]) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setText('');
      setError('');
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open]);

  const detectType = (): 'json' | 'prompt' => {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
    return 'prompt';
  };

  const handleImport = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('请输入要导入的内容');
      return;
    }

    const type = detectType();

    if (type === 'json') {
      const result = parseJsonInput(trimmed);
      if (result) {
        onImport(result.canvas, result.regions);
        onClose();
        return;
      }
      setError('JSON 解析失败，请检查格式是否正确');
      return;
    }

    const result = parsePromptString(trimmed);
    if (result && result.regions.length > 0) {
      onImport(result.canvas, result.regions);
      onClose();
      return;
    }

    const jsonResult = parseJsonInput(trimmed);
    if (jsonResult) {
      onImport(jsonResult.canvas, jsonResult.regions);
      onClose();
      return;
    }

    setError('无法解析输入内容。请确认是有效的提示词语法或 JSON 格式');
  };

  const inputType = detectType();

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[680px]"
      icon={<Upload className="w-4 h-4 text-indigo-400" />}
      title="导入编辑状态"
      subtitle={
        <span className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
          {inputType === 'json' ? (
            <><FileJson className="w-3 h-3 text-emerald-400" /> <span className="text-emerald-400">JSON</span></>
          ) : (
            <><Terminal className="w-3 h-3 text-amber-400" /> <span className="text-amber-400">提示词</span></>
          )}
        </span>
      }
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">{text.length} 字符</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={!text.trim()}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:bg-slate-800 disabled:text-slate-600"
            >
              导入
            </button>
          </div>
        </div>
      }
    >
      {/* Hints */}
      <div className="px-5 pt-3 pb-1 flex gap-3 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <FileJson className="w-3 h-3" />
          <span>JSON：从编辑器导出的 <code className="text-slate-400">{'{ canvas, regions }'}</code> 或区域数组</span>
        </div>
        <div className="flex items-center gap-1">
          <Terminal className="w-3 h-3" />
          <span>提示词：Prompt Control 语法的字符串</span>
        </div>
      </div>

      {/* Textarea */}
      <div className="px-5 py-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          placeholder={`粘贴 JSON 或提示词...\n\nJSON 示例：\n{"canvas":{"width":1024,"height":1024,"mode":"AND"},"regions":[...]}\n\n提示词示例：\na landscape MASK(0 0.5, 0 0.5, 1.0) a red sun AND a blue sky AREA(0.5 1.0, 0 0.5, 0.8)`}
          className="w-full min-h-[260px] bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60 resize-none font-mono leading-relaxed custom-scrollbar"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 pb-3 flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </Modal>
  );
};

export default ImportDialog;
