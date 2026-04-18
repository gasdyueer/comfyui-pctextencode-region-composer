import React, { createContext, useContext, useReducer, useCallback, useRef, Dispatch } from 'react';
import { AppState } from '../types';
import { appReducer, AppAction, INITIAL_STATE } from '../reducer/appReducer';

const MAX_HISTORY = 50;

// Actions that should NOT be recorded in undo history (UI-only)
const SKIP_HISTORY_ACTIONS = new Set(['SELECT_REGION']);

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const AppStateContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, rawDispatch] = useReducer(appReducer, INITIAL_STATE);

  const historyRef = useRef<AppState[]>([INITIAL_STATE]);
  const historyIndexRef = useRef(0);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const dispatch = useCallback((action: AppAction) => {
    if (action.type === 'UNDO') {
      if (historyIndexRef.current > 0) {
        historyIndexRef.current -= 1;
        const prev = historyRef.current[historyIndexRef.current];
        // Replace state by dispatching a special overwrite action
        rawDispatch({ type: '__RESTORE__', state: prev } as any);
      }
      return;
    }

    if (action.type === 'REDO') {
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyIndexRef.current += 1;
        const next = historyRef.current[historyIndexRef.current];
        rawDispatch({ type: '__RESTORE__', state: next } as any);
      }
      return;
    }

    rawDispatch(action);

    // Record to history after state change (skip UI-only actions)
    if (!SKIP_HISTORY_ACTIONS.has(action.type)) {
      // We need to compute the new state to store it
      // Since useReducer dispatch is async, we compute eagerly
      const newState = appReducer(historyRef.current[historyIndexRef.current], action);
      // Truncate future states if we're not at the end
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(newState);
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      } else {
        historyIndexRef.current += 1;
      }
    }
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' } as any), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'REDO' } as any), [dispatch]);

  return (
    <AppStateContext.Provider value={{ state, dispatch, canUndo, canRedo, undo, redo }}>
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx.state;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx.dispatch;
}

export function useUndoRedo() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useUndoRedo must be used within AppProvider');
  return { canUndo: ctx.canUndo, canRedo: ctx.canRedo, undo: ctx.undo, redo: ctx.redo };
}
