export const storageKey = "gaa-stats-state-v13";
export const panelSavesKey = "gaa-panel-saves-v1";

let saveTimer: number | undefined;

export function saveStateThrottled(state: any, delay = 400) {
  // Don’t persist undo history; it explodes JSON size
  const { history, ...rest } = state || {};
  const safe = rest;

  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(safe));
    } catch {}
  }, delay);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const loadSaves = () => {
  try {
    const raw = localStorage.getItem(panelSavesKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
export const saveSaves = (arr: any[]) => {
  try {
    localStorage.setItem(panelSavesKey, JSON.stringify(arr));
  } catch {}
};
