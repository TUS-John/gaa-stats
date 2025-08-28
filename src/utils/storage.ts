export const storageKey = 'gaa-stats-state-v12';
export const panelSavesKey = 'gaa-panel-saves-v1';

export const loadState = () => { try { const r = localStorage.getItem(storageKey); return r ? JSON.parse(r) : null; } catch { return null; } };
export const saveState = (st: any) => { try { localStorage.setItem(storageKey, JSON.stringify(st)); } catch {} };

export const loadSaves = () => { try { const raw = localStorage.getItem(panelSavesKey); return raw ? JSON.parse(raw) : []; } catch { return []; } };
export const saveSaves = (arr: any[]) => { try { localStorage.setItem(panelSavesKey, JSON.stringify(arr)); } catch {} };
