
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, CanvasSettings, Region } from './types';
import { useAppState, useAppDispatch, useUndoRedo } from './context/AppContext';
import { AppAction } from './reducer/appReducer';
import { generatePromptString } from './utils/promptGenerator';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RegionPanel from './components/RegionPanel';
import CanvasArea from './components/CanvasArea';
import OutputPanel from './components/OutputPanel';
import SyntaxCheatSheet from './components/SyntaxCheatSheet';
import ImportDialog from './components/ImportDialog';
import PresetsDialog from './components/PresetsDialog';
import GuidedWizard from './components/guided/GuidedWizard';

const AppContent: React.FC = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { canUndo, canRedo, undo, redo } = useUndoRedo();

  // Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [presetsDialogOpen, setPresetsDialogOpen] = useState(false);
  const [guidedWizardOpen, setGuidedWizardOpen] = useState(false);

  const updateCanvas = (updates: Partial<CanvasSettings>) =>
    dispatch({ type: 'UPDATE_CANVAS', updates });

  const addRegion = () =>
    dispatch({ type: 'ADD_REGION' });

  const updateRegion = (id: string, updates: Partial<Region>) =>
    dispatch({ type: 'UPDATE_REGION', id, updates });

  const deleteRegion = (id: string) =>
    dispatch({ type: 'DELETE_REGION', id });

  const moveRegion = (id: string, direction: 'up' | 'down') =>
    dispatch({ type: 'MOVE_REGION', id, direction });

  const selectRegion = (id: string | null) =>
    dispatch({ type: 'SELECT_REGION', id });

  const handleImport = (canvas: CanvasSettings, regions: Region[]) =>
    dispatch({ type: 'IMPORT', canvas, regions });

  const handleApplyPreset = (canvasUpdates: Partial<CanvasSettings>, regions: Region[]) =>
    dispatch({ type: 'APPLY_PRESET', canvasUpdates, regions });

  const handleGuidedConfirm = (canvas: CanvasSettings, regions: Region[]) =>
    dispatch({ type: 'IMPORT', canvas, regions });

  const generatedPrompt = useMemo(() => {
    return generatePromptString(state.canvas, state.regions);
  }, [state.canvas, state.regions]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 font-sans text-slate-200">
      <Header onOpenCheatSheet={() => setCheatSheetOpen(true)} onImport={() => setImportDialogOpen(true)} onOpenPresets={() => setPresetsDialogOpen(true)} onOpenGuided={() => setGuidedWizardOpen(true)} />
      
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
          <OutputPanel prompt={generatedPrompt} canvas={state.canvas} regions={state.regions} />
        </main>

        <RegionPanel
          regions={state.regions}
          selectedRegionId={state.selectedRegionId}
          canvas={state.canvas}
          onUpdateRegion={updateRegion}
          onAddRegion={addRegion}
          onDeleteRegion={deleteRegion}
          onMoveRegion={moveRegion}
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
        hasExistingRegions={state.regions.length > 0}
      />

      <GuidedWizard
        open={guidedWizardOpen}
        onClose={() => setGuidedWizardOpen(false)}
        onConfirm={handleGuidedConfirm}
      />
    </div>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
