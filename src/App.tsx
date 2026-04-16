
import React, { useState, useMemo, useCallback } from 'react';
import { INITIAL_STATE, COLORS } from './constants';
import { AppState, CanvasSettings, Region, RegionType, MaskOp, CoupleMaskType } from './types';
import { generatePromptString } from './utils/promptGenerator';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RegionPanel from './components/RegionPanel';
import CanvasArea from './components/CanvasArea';
import OutputPanel from './components/OutputPanel';
import SyntaxCheatSheet from './components/SyntaxCheatSheet';
import ImportDialog from './components/ImportDialog';
import PresetsDialog from './components/PresetsDialog';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [presetsDialogOpen, setPresetsDialogOpen] = useState(false);

  const updateCanvas = useCallback((updates: Partial<CanvasSettings>) => {
    setState(prev => ({
      ...prev,
      canvas: { ...prev.canvas, ...updates },
    }));
  }, []);

  const addRegion = useCallback(() => {
    const id = Math.random().toString(36).substr(2, 9);
    const color = COLORS[state.regions.length % COLORS.length];
    
    const newRegion: Region = {
      id,
      x: state.canvas.width / 2 - 128,
      y: state.canvas.height / 2 - 128,
      width: 256,
      height: 256,
      prompt: '',
      type: RegionType.MASK,
      weight: 1.0,
      op: MaskOp.MULTIPLY,
      feather: { left: 0, top: 0, right: 0, bottom: 0 },
      color,
      coupleMaskType: CoupleMaskType.MASK,
      imaskIndex: 0,
      imaskWeight: 1.0,
      imaskOp: MaskOp.MULTIPLY,
    };

    setState(prev => ({
      ...prev,
      regions: [...prev.regions, newRegion],
      selectedRegionId: id,
    }));
  }, [state.regions.length, state.canvas.width, state.canvas.height]);

  const updateRegion = useCallback((id: string, updates: Partial<Region>) => {
    setState(prev => ({
      ...prev,
      regions: prev.regions.map(r => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, []);

  const deleteRegion = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      regions: prev.regions.filter(r => r.id !== id),
      selectedRegionId: prev.selectedRegionId === id ? null : prev.selectedRegionId,
    }));
  }, []);

  const selectRegion = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedRegionId: id }));
  }, []);

  const handleImport = useCallback((canvas: CanvasSettings, regions: Region[]) => {
    setState({ canvas, regions, selectedRegionId: regions.length > 0 ? regions[0].id : null });
  }, []);

  const handleApplyPreset = useCallback((canvasUpdates: Partial<CanvasSettings>, regions: Region[]) => {
    setState(prev => ({
      ...prev,
      canvas: { ...prev.canvas, ...canvasUpdates },
      regions,
      selectedRegionId: regions.length > 0 ? regions[0].id : null,
    }));
  }, []);

  const generatedPrompt = useMemo(() => {
    return generatePromptString(state.canvas, state.regions);
  }, [state.canvas, state.regions]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 font-sans text-slate-200">
      <Header onOpenCheatSheet={() => setCheatSheetOpen(true)} onImport={() => setImportDialogOpen(true)} onOpenPresets={() => setPresetsDialogOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          canvas={state.canvas}
          onUpdateCanvas={updateCanvas}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <CanvasArea
            canvas={state.canvas}
            regions={state.regions}
            selectedRegionId={state.selectedRegionId}
            onUpdateRegion={updateRegion}
            onSelectRegion={selectRegion}
          />
          <OutputPanel prompt={generatedPrompt} />
        </main>

        <RegionPanel
          regions={state.regions}
          selectedRegionId={state.selectedRegionId}
          canvas={state.canvas}
          onUpdateRegion={updateRegion}
          onAddRegion={addRegion}
          onDeleteRegion={deleteRegion}
          onSelectRegion={selectRegion}
        />
      </div>

      <SyntaxCheatSheet
        open={cheatSheetOpen}
        onClose={() => setCheatSheetOpen(false)}
      />

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />

      <PresetsDialog
        open={presetsDialogOpen}
        onClose={() => setPresetsDialogOpen(false)}
        onApply={handleApplyPreset}
        canvas={state.canvas}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
    </div>
  );
};

export default App;
