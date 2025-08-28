import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fmtClock, totalPoints } from '../utils/format';
import { HALF_SECONDS } from '../state/constants';
export default function StatsView({ data }) {
    if (!data) {
        return (_jsx("div", { className: "p-3 max-w-md w-full mx-auto", children: _jsxs("div", { className: "bg-white rounded-2xl shadow p-4", children: [_jsx("div", { className: "font-semibold mb-2", children: "Stats Link Invalid" }), _jsx("p", { className: "text-sm text-gray-600", children: "Ask the scorer to send a fresh link." })] }) }));
    }
    const teams = data.teams || [];
    const half = data.currentHalf || 1;
    const elapsed = half === 1 ? (data.gameSeconds || 0) : Math.max(0, (data.gameSeconds || 0) - HALF_SECONDS);
    const left = Math.max(0, HALF_SECONDS - elapsed);
    const topScorersByTeam = (teams || []).map((t) => { const rows = Object.entries(t.byPlayer || {}).map(([num, r]) => ({ number: Number(num), name: (Number(num) === 0 ? 'Unknown' : ((t.squad || [])[Number(num) - 1]?.name || r.name || `#${num}`)), goals: r.goals || 0, points: r.points || 0, total: (r.goals || 0) * 3 + (r.points || 0), freesGoals: r.freesGoals || 0, freesPoints: r.freesPoints || 0 })); rows.sort((a, b) => b.total - a.total); return rows.slice(0, 5); });
    const activeYellows = (() => { const list = []; const now = data.gameSeconds || 0; const yell = data.yellows || {}; for (const k in yell) {
        const recs = yell[k];
        if (!Array.isArray(recs))
            continue;
        const [ti, ns] = k.split('|');
        const teamIdx = Number(ti), number = Number(ns);
        for (const r of recs) {
            const l = Math.max(0, r.expiresAt - now);
            list.push({ teamIdx, number, left: l });
        }
    } list.sort((a, b) => a.left - b.left); return list; })();
    const fmtFree = (gf, pf) => { const g = gf || 0, p = pf || 0; return (g === 0 && p === 0) ? '' : ` (${g}-${p}f)`; };
    return (_jsxs("div", { className: "p-3 max-w-md w-full mx-auto space-y-3", children: [_jsx("div", { className: "bg-white rounded-2xl shadow p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-semibold", children: "Half:" }), " ", half, "/2"] }), _jsxs("div", { className: `text-sm ${half === 1 && elapsed > HALF_SECONDS ? 'text-red-600 font-semibold' : ''}`, children: [_jsx("span", { className: "font-semibold", children: "Elapsed:" }), " ", fmtClock(elapsed)] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-semibold", children: "Left:" }), " ", fmtClock(left)] })] }) }), _jsx("div", { className: "grid grid-cols-2 gap-3 items-stretch", children: (teams || []).map((t, idx) => {
                    const gp = `${t.score?.goals || 0}-${t.score?.points || 0}`;
                    const total = totalPoints(t.score || { goals: 0, points: 0 });
                    return (_jsxs("div", { className: "bg-white rounded-2xl shadow p-3 flex flex-col items-center", children: [_jsx("div", { className: "text-xs uppercase text-gray-500", children: idx === 0 ? 'Home' : 'Away' }), _jsx("div", { className: "text-base font-semibold", children: t.name || '' }), _jsx("div", { className: "text-3xl font-black mt-1", children: gp }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Total ", total] })] }, idx));
                }) }), _jsxs("div", { className: "bg-white rounded-2xl shadow p-3", children: [_jsx("div", { className: "font-semibold mb-2", children: "Top Scorers" }), _jsx("div", { className: "grid grid-cols-1 gap-3", children: topScorersByTeam.map((rows, idx) => (_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase text-gray-500 mb-1", children: teams[idx]?.name || '' }), rows.length === 0 ? (_jsx("div", { className: "text-sm text-gray-500", children: "\u2014" })) : (_jsx("ul", { className: "text-sm space-y-1", children: rows.map((r, i) => (_jsxs("li", { className: "flex justify-between", children: [_jsxs("span", { children: ["#", r.number, " ", r.name] }), _jsxs("span", { className: "font-mono", children: [r.goals, "-", r.points, fmtFree(r.freesGoals, r.freesPoints), " (", r.total, ")"] })] }, i))) }))] }, idx))) })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow p-3", children: [_jsx("div", { className: "font-semibold mb-2", children: "Active Sin-bins" }), activeYellows.length === 0 ? (_jsx("div", { className: "text-sm text-gray-500", children: "None" })) : (_jsx("ul", { className: "text-sm space-y-1", children: activeYellows.map((y, i) => (_jsxs("li", { className: "flex justify-between", children: [_jsxs("span", { children: [teams[y.teamIdx]?.name || '', " \u2014 #", y.number, " ", y.number === 0 ? 'Unknown' : (teams[y.teamIdx]?.squad?.[y.number - 1]?.name || '')] }), _jsx("span", { className: "font-mono", children: fmtClock(y.left) })] }, i))) }))] })] }));
}
