import { AppState, CanvasSettings, Region, RegionType, MaskOp, CoupleMaskType, OutputMode } from '../types';
import { COLORS, INITIAL_STATE } from '../constants';

export type AppAction =
  | { type: 'UPDATE_CANVAS'; updates: Partial<CanvasSettings> }
  | { type: 'ADD_REGION' }
  | { type: 'UPDATE_REGION'; id: string; updates: Partial<Region> }
  | { type: 'DELETE_REGION'; id: string }
  | { type: 'SELECT_REGION'; id: string | null }
  | { type: 'IMPORT'; canvas: CanvasSettings; regions: Region[] }
  | { type: 'APPLY_PRESET'; canvasUpdates: Partial<CanvasSettings>; regions: Region[] }
  | { type: '__RESTORE__'; state: AppState };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPDATE_CANVAS': {
      const newCanvas = { ...state.canvas, ...action.updates };
      // Clean up mode-incompatible params when switching mode
      if (action.updates.mode && action.updates.mode !== state.canvas.mode) {
        if (action.updates.mode === OutputMode.COUPLE) {
          delete (newCanvas as Partial<CanvasSettings>).maskWidth;
          delete (newCanvas as Partial<CanvasSettings>).maskHeight;
          delete (newCanvas as Partial<CanvasSettings>).maskWeight;
        }
      }
      return { ...state, canvas: newCanvas };
    }

    case 'ADD_REGION': {
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
        scheduleStart: 0,
        scheduleEnd: 1,
      };
      return {
        ...state,
        regions: [...state.regions, newRegion],
        selectedRegionId: id,
      };
    }

    case 'UPDATE_REGION':
      return {
        ...state,
        regions: state.regions.map(r =>
          r.id === action.id ? { ...r, ...action.updates } : r
        ),
      };

    case 'DELETE_REGION':
      return {
        ...state,
        regions: state.regions.filter(r => r.id !== action.id),
        selectedRegionId: state.selectedRegionId === action.id ? null : state.selectedRegionId,
      };

    case 'SELECT_REGION':
      return { ...state, selectedRegionId: action.id };

    case 'IMPORT':
      return {
        canvas: action.canvas,
        regions: action.regions,
        selectedRegionId: action.regions.length > 0 ? action.regions[0].id : null,
      };

    case 'APPLY_PRESET':
      return {
        ...state,
        canvas: { ...state.canvas, ...action.canvasUpdates },
        regions: action.regions,
        selectedRegionId: action.regions.length > 0 ? action.regions[0].id : null,
      };

    case '__RESTORE__':
      return action.state;

    default:
      return state;
  }
}

export { INITIAL_STATE };
