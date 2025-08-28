import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { totalPoints } from '../utils/format';
export default function ScoreHeader({ teams }) {
    return (_jsx("div", { className: "grid grid-cols-2 gap-3 items-stretch mb-3", children: teams.map((t, i) => {
            const total = totalPoints(t.score);
            const gp = `${t.score.goals}-${t.score.points}`;
            return (_jsxs("div", { className: "bg-white rounded-2xl shadow p-4 flex flex-col items-center", children: [_jsx("div", { className: "text-xs uppercase tracking-wide text-gray-500", children: i === 0 ? "Home" : "Away" }), _jsx("div", { className: "text-lg font-semibold", children: t.name }), _jsx("div", { className: "text-5xl font-black mt-1 leading-none", children: gp }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Total ", total] })] }, i));
        }) }));
}
