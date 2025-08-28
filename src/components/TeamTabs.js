import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import TeamPanel from './TeamPanel';
export default function TeamTabs({ state, gameSeconds, onScore, onCard, onSub, onMove }) {
    const [tab, setTab] = useState(0);
    const [expanded, setExpanded] = useState([null, null]);
    const setExp = (teamIdx, n) => { const next = [...expanded]; next[teamIdx] = (next[teamIdx] === n ? null : n); setExpanded(next); };
    return (_jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "flex gap-2 mb-2", children: [0, 1].map(i => (_jsx("button", { className: `flex-1 py-2 rounded-xl border ${tab === i ? 'bg-black text-white' : 'bg-white'}`, onClick: () => setTab(i), children: state.teams[i].name }, i))) }), _jsx(TeamPanel, { teamIdx: tab, team: state.teams[tab], gameSeconds: gameSeconds, expandedNumber: expanded[tab], setExpandedNumber: (n) => setExp(tab, n), onScore: onScore, onCard: onCard, onSub: onSub, onMove: onMove, reds: state.reds, yellows: state.yellows })] }));
}
