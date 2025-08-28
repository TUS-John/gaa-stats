import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export default function SubForm({ team, onSub, benchNumbers }) {
    const [outN, setOutN] = useState(team.onField.find((n) => !!n) || 1);
    const [inN, setInN] = useState(benchNumbers[0] || 16);
    const onFieldNumbers = team.onField.filter(Boolean);
    useEffect(() => { setInN(benchNumbers[0] || 16); }, [benchNumbers]);
    return (_jsxs("div", { className: "grid grid-cols-1 gap-2", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("label", { className: "text-sm", children: ["Out (on field)", _jsx("select", { className: "mt-1 w-full border rounded-xl p-2", value: outN, onChange: e => setOutN(Number(e.target.value)), children: onFieldNumbers.map(n => (_jsxs("option", { value: n, children: ["#", n, " ", team.squad[n - 1]?.name || ''] }, n))) })] }), _jsxs("label", { className: "text-sm", children: ["In (bench)", _jsx("select", { className: "mt-1 w-full border rounded-xl p-2", value: inN, onChange: e => setInN(Number(e.target.value)), children: benchNumbers.map(n => (_jsxs("option", { value: n, children: ["#", n, " ", team.squad[n - 1]?.name || ''] }, n))) })] })] }), _jsx("button", { className: "py-2 rounded-xl bg-gray-900 text-white", onClick: () => onSub(inN, outN), children: "Make Sub" })] }));
}
