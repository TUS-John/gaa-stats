import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import ScoreHeader from "./components/ScoreHeader";
import ClockBar from "./components/ClockBar";
import TeamTabs from "./components/TeamTabs";
import LivePanels from "./components/LivePanels";
import EventLog from "./components/EventLog";
import MoreModal from "./components/MoreModal";
import SetupScreen from "./pages/SetupScreen";
import StatsView from "./pages/StatsView";
import { HALF_SECONDS } from "./state/constants";
import reducer, { initialState, key } from "./state/reducer";
import useHashRoute from "./hooks/useHashRoute";
import { b64urlEncode, b64urlDecode } from "./utils/b64url";
import { loadState, enqueueSave, saveNow } from "./utils/storage";
import { storageKey } from "./utils/storage";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hash, nav] = useHashRoute();
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const loaded = loadState();
    if (loaded) dispatch({ type: "LOAD", state: loaded });
  }, []);

  const latestRef = useRef(state);
  useEffect(() => {
    latestRef.current = state;
  }, [state]);

  const persist = () => enqueueSave(latestRef.current);
  const persistNow = () => saveNow(latestRef.current);

  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.running]);

  // Flush on tab close / refresh / backgrounding (Safari)
  useEffect(() => {
    const handler = () => persistNow();
    window.addEventListener("pagehide", handler); // best for Safari/iOS
    window.addEventListener("beforeunload", handler); // others
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handler();
    });
    return () => {
      window.removeEventListener("pagehide", handler);
      window.removeEventListener("beforeunload", handler);
      document.removeEventListener("visibilitychange", handler as any);
    };
  }, []);

  const scoreRef = useRef<HTMLDivElement>(null);
  const lastScrollRef = useRef(0);

  const focusScoreHeader = () => {
    const el = scoreRef.current;
    if (el) el.focus({ preventScroll: true });

    const now = performance.now();
    if (now - lastScrollRef.current < 500) return; // throttle to 1 call / 500ms
    lastScrollRef.current = now;

    // Only scroll if the header isn't fully visible
    if (el) {
      const r = el.getBoundingClientRect();
      const visible = r.top >= 0 && r.bottom <= window.innerHeight;
      if (visible) return;
    }
    // Use instant scroll; Safari can stack 'smooth' animations
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  // when the main page becomes visible (not stats) and setup is complete
  useEffect(() => {
    if (state.setupComplete && !hash.startsWith("#/stats")) {
      setTimeout(focusScoreHeader, 0);
    }
  }, [state.setupComplete, hash]);

  const gameSeconds = useMemo(() => {
    const baseMs = state.elapsedMs || 0;
    const extraMs =
      state.running && state.runAnchorMs ? Date.now() - state.runAnchorMs : 0;
    const totalMs = baseMs + extraMs;
    return Math.floor(totalMs / 1000);
  }, [state.elapsedMs, state.runAnchorMs, state.running, state.heartbeat]);

  const halfElapsed = useMemo(
    () =>
      state.currentHalf === 1
        ? gameSeconds
        : Math.max(0, gameSeconds - HALF_SECONDS),
    [gameSeconds, state.currentHalf]
  );
  const halfLeft = Math.max(0, HALF_SECONDS - halfElapsed);
  const isOvertimeH1 = state.currentHalf === 1 && halfElapsed > HALF_SECONDS;

  const activeYellows = useMemo(() => {
    const list: any[] = [];
    const now = gameSeconds;
    for (const k in state.yellows) {
      const recs = (state.yellows as any)[k];
      if (!Array.isArray(recs)) continue;
      const [ti, ns] = k.split("|");
      const teamIdx = Number(ti),
        number = Number(ns);
      const redKey = key(teamIdx, number);
      if ((state.reds as any)[redKey]) continue;
      for (const r of recs) {
        const left = Math.max(0, r.expiresAt - now);
        list.push({ teamIdx, number, left, rec: r });
      }
    }
    list.sort((a, b) => a.left - b.left);
    return list;
  }, [state.yellows, state.reds, gameSeconds]);

  const topScorersByTeam = useMemo(
    () =>
      state.teams.map((t: any) => {
        const rows = Object.entries<any>(t.byPlayer).map(([num, r]) => ({
          number: Number(num),
          name:
            Number(num) === 0
              ? "Unknown"
              : t.squad[Number(num) - 1]?.name || r.name || `#${num}`,
          goals: r.goals || 0,
          points: r.points || 0,
          total: (r.goals || 0) * 3 + (r.points || 0),
          freesGoals: r.freesGoals || 0,
          freesPoints: r.freesPoints || 0,
        }));
        rows.sort((a, b) => b.total - a.total);
        return rows.slice(0, 5);
      }),
    [state.teams]
  );

  const handleNewMatch = () => {
    localStorage.removeItem(storageKey);
    dispatch({ type: "NEW_MATCH" });
    nav("/setup");
  };
  const makeShareUrl = () => {
    const snap = {
      teams: state.teams.map((t: any) => ({
        name: t.name,
        score: t.score,
        byPlayer: t.byPlayer,
        squad: t.squad,
      })),
      currentHalf: state.currentHalf,
      gameSeconds: gameSeconds,
      yellows: state.yellows,
    };
    const enc = b64urlEncode(snap);
    return `${window.location.origin}${window.location.pathname}#/stats?d=${enc}`;
  };

  const saveSnapshot = () => {
    const raw = JSON.stringify(state, null, 2);
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gaa-stats-save-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importSnapshot = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        dispatch({ type: "IMPORT", state: JSON.parse(String(reader.result)) });
      } catch {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  const clearSave = () => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  };

  const routeIsStats = hash.startsWith("#/stats");
  const sharedData = (() => {
    if (!routeIsStats) return null;
    const q = hash.indexOf("?");
    if (q === -1) return null;
    const d = new URLSearchParams(hash.slice(q + 1)).get("d");
    if (!d) return null;
    try {
      return b64urlDecode(d);
    } catch {
      return null;
    }
  })();

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 flex flex-col items-stretch">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 p-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold">GAA Stats</h1>
          {!routeIsStats ? (
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-2 rounded-xl border ${
                  state.events.length > 0
                    ? "bg-white"
                    : "bg-gray-100 text-gray-400"
                }`}
                disabled={!(state.events.length > 0)}
                onClick={() => {
                  dispatch({ type: "UNDO_LAST_EVENT" });
                  // make it durable right away
                  saveNow(latestRef.current);
                }}
              >
                Undo
              </button>

              <button
                className="px-3 py-2 rounded-xl border bg-white"
                onClick={() => {
                  setShareUrl(makeShareUrl());
                  setMoreOpen(true);
                }}
              >
                More
              </button>
            </div>
          ) : (
            <button
              className="px-3 py-2 rounded-xl border bg-white"
              onClick={() => nav("/match")}
            >
              Back
            </button>
          )}
        </div>
      </div>

      {routeIsStats ? (
        <StatsView data={sharedData} />
      ) : !state.setupComplete ? (
        <SetupScreen
          onComplete={(p: any) => {
            dispatch({ type: "SETUP", ...p });
            persist();
            nav("/match");
          }}
        />
      ) : (
        <div className="p-3 max-w-md w-full mx-auto">
          <div ref={scoreRef} tabIndex={-1} className="outline-none">
            <ScoreHeader teams={state.teams} />
          </div>
          <ClockBar
            half={state.currentHalf}
            elapsed={halfElapsed}
            running={state.running}
            overTime={isOvertimeH1}
            onStart={() => {
              dispatch({ type: "START", nowMs: Date.now() });
              persist();
            }}
            onPause={() => dispatch({ type: "PAUSE", nowMs: Date.now() })}
            onNextHalf={() => {
              dispatch({ type: "NEXT_HALF", nowMs: Date.now() });
              persist();
            }}
            onResetTime={() => {
              dispatch({ type: "RESET_TIME", nowSec: gameSeconds });
              persist();
            }}
            onResetAll={() => {
              dispatch({ type: "RESET_ALL", nowSec: gameSeconds });
              persist();
            }}
          />
          <TeamTabs
            state={state}
            gameSeconds={gameSeconds}
            onScore={(a: any) => {
              dispatch({ type: "SCORE", nowSec: gameSeconds, ...a });
              {
                persistNow();
                requestAnimationFrame(focusScoreHeader);
              }
            }}
            onCard={(a: any) => {
              dispatch({ type: "CARD", nowSec: gameSeconds, ...a });
              {
                persistNow();
                requestAnimationFrame(focusScoreHeader);
              }
            }}
            onSub={(a: any) => {
              dispatch({ type: "SUB", nowSec: gameSeconds, ...a });
              {
                persist();
              }
            }}
          />
          <LivePanels
            activeYellows={activeYellows}
            topScorersByTeam={topScorersByTeam}
            teams={state.teams}
            onRestore={(args: any) => {
              dispatch({
                type: "RESTORE_SINBIN",
                nowSec: gameSeconds,
                ...args,
              });
              {
                persist();
              }
            }}
          />
          <EventLog events={state.events} teams={state.teams} />
        </div>
      )}

      <div className="h-8" />

      <MoreModal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        shareUrl={shareUrl}
        onRefreshShare={() => setShareUrl(makeShareUrl())}
        onSaveSnapshot={saveSnapshot}
        onImportSnapshot={importSnapshot}
        onClearSave={clearSave}
        onNewMatch={handleNewMatch}
      />
    </div>
  );
}
