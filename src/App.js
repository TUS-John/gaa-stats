import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ScoreHeader from './components/ScoreHeader';
import ClockBar from './components/ClockBar';
import TeamTabs from './components/TeamTabs';
import LivePanels from './components/LivePanels';
import EventLog from './components/EventLog';
import PersistenceBar from './components/PersistenceBar';
import SetupScreen from './pages/SetupScreen';
import StatsView from './pages/StatsView';
import { HALF_SECONDS } from './state/constants';
import reducer, { initialState, key } from './state/reducer';
import useHashRoute from './hooks/useHashRoute';
import { b64urlEncode, b64urlDecode } from './utils/b64url';
import { loadState, saveState } from './utils/storage';
export default function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [hash, nav] = useHashRoute();
    const [shareOpen, setShareOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const shareInputRef = useRef(null);
    useEffect(() => { const loaded = loadState(); if (loaded)
        dispatch({ type: 'LOAD', state: loaded }); }, []);
    useEffect(() => { saveState(state); }, [state]);
    useEffect(() => { if (!state.running)
        return; const id = setInterval(() => dispatch({ type: 'TICK' }), 1000); return () => clearInterval(id); }, [state.running]);
    const gameSeconds = useMemo(() => {
        const baseMs = state.elapsedMs || 0;
        const extraMs = state.running && state.runAnchorMs ? (Date.now() - state.runAnchorMs) : 0;
        const totalMs = baseMs + extraMs;
        return Math.floor(totalMs / 1000);
    }, [state.elapsedMs, state.runAnchorMs, state.running, state.heartbeat]);
    const halfElapsed = useMemo(() => state.currentHalf === 1 ? gameSeconds : Math.max(0, gameSeconds - HALF_SECONDS), [gameSeconds, state.currentHalf]);
    const halfLeft = Math.max(0, HALF_SECONDS - halfElapsed);
    const isOvertimeH1 = state.currentHalf === 1 && halfElapsed > HALF_SECONDS;
    const activeYellows = useMemo(() => { const list = []; const now = gameSeconds; for (const k in state.yellows) {
        const recs = state.yellows[k];
        if (!Array.isArray(recs))
            continue;
        const [ti, ns] = k.split('|');
        const teamIdx = Number(ti), number = Number(ns);
        const redKey = key(teamIdx, number);
        if (state.reds[redKey])
            continue;
        for (const r of recs) {
            const left = Math.max(0, r.expiresAt - now);
            list.push({ teamIdx, number, left, rec: r });
        }
    } list.sort((a, b) => a.left - b.left); return list; }, [state.yellows, state.reds, gameSeconds]);
    const topScorersByTeam = useMemo(() => state.teams.map((t) => { const rows = Object.entries(t.byPlayer).map(([num, r]) => ({ number: Number(num), name: Number(num) === 0 ? 'Unknown' : (t.squad[Number(num) - 1]?.name || r.name || `#${num}`), goals: r.goals || 0, points: r.points || 0, total: (r.goals || 0) * 3 + (r.points || 0), freesGoals: r.freesGoals || 0, freesPoints: r.freesPoints || 0 })); rows.sort((a, b) => b.total - a.total); return rows.slice(0, 5); }), [state.teams]);
    const handleNewMatch = () => { localStorage.removeItem('gaa-stats-state-v12'); dispatch({ type: 'NEW_MATCH' }); nav('/setup'); };
    const makeShareUrl = () => { const snap = { teams: state.teams.map((t) => ({ name: t.name, score: t.score, byPlayer: t.byPlayer, squad: t.squad })), currentHalf: state.currentHalf, gameSeconds: gameSeconds, yellows: state.yellows }; const enc = b64urlEncode(snap); return `${window.location.origin}${window.location.pathname}#/stats?d=${enc}`; };
    const routeIsStats = hash.startsWith('#/stats');
    const sharedData = (() => { if (!routeIsStats)
        return null; const q = hash.indexOf('?'); if (q === -1)
        return null; const d = new URLSearchParams(hash.slice(q + 1)).get('d'); if (!d)
        return null; try {
        return b64urlDecode(d);
    }
    catch {
        return null;
    } })();
    return (_jsxs("div", { className: "w-full min-h-screen bg-gray-50 text-gray-900 flex flex-col items-stretch", children: [_jsx("div", { className: "sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 p-3", children: _jsxs("div", { className: "max-w-md mx-auto flex items-center justify-between gap-2", children: [_jsx("h1", { className: "text-xl font-bold", children: "GAA Stats" }), !routeIsStats ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: `px-3 py-2 rounded-xl border ${(state.history && state.history.length > 0) ? 'bg-white' : 'bg-gray-100 text-gray-400'}`, disabled: !(state.history && state.history.length > 0), onClick: () => dispatch({ type: 'UNDO' }), children: "Undo" }), state.setupComplete && (_jsx("button", { className: "px-3 py-2 rounded-xl border bg-white", onClick: () => { const url = makeShareUrl(); setShareUrl(url); setShareOpen(true); }, children: "Share" })), _jsx("button", { className: "px-3 py-2 rounded-xl border bg-white", onClick: handleNewMatch, children: "New Match" })] })) : (_jsx("button", { className: "px-3 py-2 rounded-xl border bg-white", onClick: () => nav('/match'), children: "Back" }))] }) }), shareOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-4 w-full max-w-md", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Share Live Stats" }), _jsx("button", { className: "text-sm px-2 py-1", onClick: () => setShareOpen(false), children: "Close" })] }), _jsx("label", { className: "text-sm block mb-2", children: "Shareable URL" }), _jsx("input", { ref: shareInputRef, className: "w-full border rounded-xl p-2 font-mono text-xs", readOnly: true, value: shareUrl }), _jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2", children: [_jsx("button", { className: "py-2 rounded-xl bg-gray-900 text-white", onClick: () => { try {
                                        shareInputRef.current?.focus();
                                        shareInputRef.current?.select();
                                    }
                                    catch { } }, children: "Select Link" }), _jsx("a", { className: "py-2 rounded-xl bg-blue-600 text-white text-center", href: shareUrl, target: "_blank", rel: "noopener noreferrer", children: "Open" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Tip: Tap \"Select Link\" then use Copy. Some browsers block automatic clipboard access." })] }) })), routeIsStats ? (_jsx(StatsView, { data: sharedData })) : !state.setupComplete ? (_jsx(SetupScreen, { onComplete: (p) => { dispatch({ type: 'SETUP', ...p }); nav('/match'); } })) : (_jsxs("div", { className: "p-3 max-w-md w-full mx-auto", children: [_jsx(ScoreHeader, { teams: state.teams }), _jsx(ClockBar, { half: state.currentHalf, elapsed: halfElapsed, left: halfLeft, running: state.running, overTime: isOvertimeH1, onStart: () => dispatch({ type: 'START', nowMs: Date.now() }), onPause: () => dispatch({ type: 'PAUSE', nowMs: Date.now() }), onNextHalf: () => dispatch({ type: 'NEXT_HALF', nowMs: Date.now() }), onResetTime: () => dispatch({ type: 'RESET_TIME', nowSec: gameSeconds }), onResetAll: () => dispatch({ type: 'RESET_ALL', nowSec: gameSeconds }) }), _jsx(TeamTabs, { state: state, gameSeconds: gameSeconds, onScore: (a) => dispatch({ type: 'SCORE', nowSec: gameSeconds, ...a }), onCard: (a) => dispatch({ type: 'CARD', nowSec: gameSeconds, ...a }), onSub: (a) => dispatch({ type: 'SUB', nowSec: gameSeconds, ...a }), onMove: (a) => dispatch({ type: 'MOVE', nowSec: gameSeconds, ...a }) }), _jsx(LivePanels, { activeYellows: activeYellows, topScorersByTeam: topScorersByTeam, teams: state.teams, onRestore: (args) => dispatch({ type: 'RESTORE_SINBIN', nowSec: gameSeconds, ...args }) }), _jsx(EventLog, { events: state.events, teams: state.teams }), _jsx(PersistenceBar, { state: state, onImport: (obj) => dispatch({ type: 'IMPORT', state: obj }) })] })), _jsx("div", { className: "h-8" })] }));
}
