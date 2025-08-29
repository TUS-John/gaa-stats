export const storageKey = "gaa-stats-state-v4";
export const panelSavesKey = "gaa-panel-saves-v1";

let timer: number | undefined;

const idle = (cb: () => void, t = 250) =>
  (window as any).requestIdleCallback
    ? (window as any).requestIdleCallback(cb)
    : window.setTimeout(cb, t);

// Strip heavy or derived fields before persisting
function persistable(state: any) {
  const { history, heartbeat, ...rest } = state || {};
  // cap events to last 100 for persistence (keeps UI snappy; full history remains in memory)
  const events = Array.isArray(rest.events) ? rest.events.slice(-100) : [];
  return { ...rest, events };
}

export function enqueueSave(state: any, delay = 400) {
  // coalesce saves
  if (timer) window.clearTimeout(timer);
  const snapshot = persistable(state);
  timer = window.setTimeout(() => {
    idle(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(snapshot));
      } catch {}
    }, 200);
  }, delay);
}

// NEW: force an immediate, synchronous write (no throttle/idle)
export function saveNow(state: any) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(persistable(state)));
  } catch {}
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
