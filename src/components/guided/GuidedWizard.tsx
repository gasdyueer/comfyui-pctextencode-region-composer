import React, { useState, useCallback } from 'react';
import { CanvasSettings, Region, OutputMode, CoordFormat, RegionType, MaskOp, CoupleMaskType } from '../../types';
import { INITIAL_STATE, COLORS, PRESETS, presetToRegions } from '../../constants';
import { generatePromptString } from '../../utils/promptGenerator';
import StepMode from './StepMode';
import StepSize from './StepSize';
import StepLayout from './StepLayout';
import StepRegions from './StepRegions';
import StepGlobal from './StepGlobal';
import StepPreview from './StepPreview';

export type WizardStep = 'mode' | 'size' | 'layout' | 'regions' | 'global' | 'preview';

export interface WizardState {
  step: WizardStep;
  canvas: CanvasSettings;
  regions: Region[];
  currentRegionIndex: number;
}

const STEPS: { key: WizardStep; label: string; num: number }[] = [
  { key: 'mode', label: '模式', num: 1 },
  { key: 'size', label: '画布', num: 2 },
  { key: 'layout', label: '布局', num: 3 },
  { key: 'regions', label: '区域', num: 4 },
  { key: 'global', label: '全局', num: 5 },
  { key: 'preview', label: '预览', num: 6 },
];

interface GuidedWizardProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (canvas: CanvasSettings, regions: Region[]) => void;
}

const GuidedWizard: React.FC<GuidedWizardProps> = ({ open, onClose, onConfirm }) => {
  const [wizard, setWizard] = useState<WizardState>({
    step: 'mode',
    canvas: { ...INITIAL_STATE.canvas },
    regions: [],
    currentRegionIndex: 0,
  });

  const currentStepIndex = STEPS.findIndex(s => s.key === wizard.step);

  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setWizard(prev => ({ ...prev, step: STEPS[nextIndex].key }));
    }
  }, [currentStepIndex]);

  const goPrev = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setWizard(prev => ({ ...prev, step: STEPS[prevIndex].key }));
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((step: WizardStep) => {
    setWizard(prev => ({ ...prev, step }));
  }, []);

  const updateCanvas = useCallback((updates: Partial<CanvasSettings>) => {
    setWizard(prev => ({ ...prev, canvas: { ...prev.canvas, ...updates } }));
  }, []);

  const updateRegions = useCallback((regions: Region[]) => {
    setWizard(prev => ({
      ...prev,
      regions,
      currentRegionIndex: 0,
    }));
  }, []);

  const updateRegionAt = useCallback((index: number, updates: Partial<Region>) => {
    setWizard(prev => ({
      ...prev,
      regions: prev.regions.map((r, i) => i === index ? { ...r, ...updates } : r),
    }));
  }, []);

  const setCurrentRegionIndex = useCallback((index: number) => {
    setWizard(prev => ({ ...prev, currentRegionIndex: index }));
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(wizard.canvas, wizard.regions);
    // Reset wizard
    setWizard({
      step: 'mode',
      canvas: { ...INITIAL_STATE.canvas },
      regions: [],
      currentRegionIndex: 0,
    });
  }, [wizard.canvas, wizard.regions, onConfirm]);

  const handleClose = useCallback(() => {
    onClose();
    // Reset wizard for next open
    setWizard({
      step: 'mode',
      canvas: { ...INITIAL_STATE.canvas },
      regions: [],
      currentRegionIndex: 0,
    });
  }, [onClose]);

  if (!open) return null;

  const generatedPrompt = generatePromptString(wizard.canvas, wizard.regions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} />

      <div className="relative w-[860px] max-h-[90vh] bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden"
        style={{ backdropFilter: 'blur(20px)' }}>

        {/* Step Indicator */}
        <div className="px-8 pt-6 pb-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-slate-100">引导创建</h2>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-1 mt-4">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => i <= currentStepIndex ? goToStep(s.key) : undefined}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    i === currentStepIndex
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : i < currentStepIndex
                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 cursor-pointer'
                        : 'bg-slate-800/40 text-slate-600'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i < currentStepIndex
                      ? 'bg-green-500/20 text-green-400'
                      : i === currentStepIndex
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-slate-700/50 text-slate-600'
                  }`}>
                    {i < currentStepIndex ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${i < currentStepIndex ? 'bg-green-500/30' : 'bg-slate-700/50'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {wizard.step === 'mode' && (
            <StepMode
              mode={wizard.canvas.mode}
              onSelect={(mode) => { updateCanvas({ mode }); goNext(); }}
            />
          )}
          {wizard.step === 'size' && (
            <StepSize
              canvas={wizard.canvas}
              onUpdate={updateCanvas}
            />
          )}
          {wizard.step === 'layout' && (
            <StepLayout
              canvas={wizard.canvas}
              onSelect={(regions) => { updateRegions(regions); goNext(); }}
              onSkip={goNext}
            />
          )}
          {wizard.step === 'regions' && (
            <StepRegions
              canvas={wizard.canvas}
              regions={wizard.regions}
              currentRegionIndex={wizard.currentRegionIndex}
              onUpdateRegion={updateRegionAt}
              onSetCurrentIndex={setCurrentRegionIndex}
            />
          )}
          {wizard.step === 'global' && (
            <StepGlobal
              canvas={wizard.canvas}
              onUpdate={updateCanvas}
            />
          )}
          {wizard.step === 'preview' && (
            <StepPreview
              canvas={wizard.canvas}
              regions={wizard.regions}
              prompt={generatedPrompt}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={goPrev}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                ← 上一步
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {wizard.step !== 'mode' && wizard.step !== 'layout' && wizard.step !== 'preview' && (
              <button
                onClick={goNext}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-medium transition-colors"
              >
                跳过
              </button>
            )}
            {wizard.step !== 'preview' ? (
              <button
                onClick={goNext}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
              >
                下一步 →
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                  }}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                >
                  📋 复制提示词
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                  ✓ 确认并编辑
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedWizard;
