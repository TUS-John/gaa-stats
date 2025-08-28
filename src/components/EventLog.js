import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Collapsible from './Collapsible';
import { fmtClock } from '../utils/format';
import { HALF_SECONDS } from '../state/constants';
export default function EventLog({ events, teams }) {
    const rows = [...events].reverse();
    return (_jsx("div", { className: "bg-white rounded-2xl shadow p-3 mb-24", children: _jsx(Collapsible, { title: "Event Log", defaultOpen: false, children: rows.length === 0 ? (_jsx("div", { className: "text-sm text-gray-500", children: "No events yet." })) : (_jsx("ul", { className: "text-sm divide-y", children: rows.map((e, i) => {
                    const inHalfSec = e.half === 1 ? e.t : Math.max(0, e.t - HALF_SECONDS);
                    return (_jsxs("li", { className: "py-2 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [teams[e.teamIdx]?.name || '', " \u2014 ", e.type, e.detail ? ` · ${e.detail}` : '', e.playerNumber ? ` · #${e.playerNumber}` : '', e.name ? ` ${e.name}` : ''] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Half ", e.half, " \u00B7 ", fmtClock(inHalfSec)] })] }), _jsx("div", { className: "text-xs font-mono bg-gray-100 rounded px-2 py-1", children: fmtClock(e.t) })] }, i));
                }) })) }) }));
}
