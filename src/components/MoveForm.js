import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { POSITIONS } from '../state/constants';
export default function MoveForm({ team, selectedNumber, onMove }) {
    const [source, setSource] = useState(selectedNumber || team.onField.find((n) => !!n) || 1);
    const [targetPos, setTargetPos] = useState(14);
    useEffect(() => { if (selectedNumber)
        setSource(selectedNumber); }, [selectedNumber]);
    return (_jsxs("div", { className: "grid grid-cols-1 gap-2", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("label", { className: "text-sm", children: ["Player (on field)", _jsx("select", { className: "mt-1 w-full border rounded-xl p-2", value: source, onChange: e => setSource(Number(e.target.value)), children: team.onField.filter(Boolean).map((n) => (_jsxs("option", { value: n, children: ["#", n, " ", team.squad[n - 1]?.name || ''] }, n))) })] }), _jsxs("label", { className: "text-sm", children: ["To position", _jsx("select", { className: "mt-1 w-full border rounded-xl p-2", value: targetPos, onChange: e => setTargetPos(Number(e.target.value)), children: POSITIONS.map((p, i) => (_jsxs("option", { value: i, children: [p, " (#", i + 1, ")"] }, i))) })] })] }), _jsx("button", { className: "py-2 rounded-xl bg-blue-600 text-white", onClick: () => onMove(source, targetPos), children: "Move / Rotate (front 3 auto-rotate)" })] }));
}
