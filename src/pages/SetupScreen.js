import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { loadSaves, saveSaves } from '../utils/storage';
function SavesUI({ team, saveName, setSaveName, saves, onSave, onLoad, onDelete }) {
    const [selected, setSelected] = useState(saves[0]?.name || '');
    useEffect(() => { if (saves.length && !saves.find(s => s.name === selected))
        setSelected(saves[0]?.name || ''); }, [saves]);
    return (_jsxs("div", { className: "mt-3 grid grid-cols-1 gap-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "flex-1 border rounded-xl p-2", placeholder: "Save name (e.g. Senior A)", value: saveName, onChange: (e) => setSaveName(e.target.value) }), _jsx("button", { className: "px-3 rounded-xl bg-gray-900 text-white", onClick: () => onSave(team), children: "Save Panel" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("select", { className: "flex-1 border rounded-xl p-2", value: selected, onChange: (e) => setSelected(e.target.value), children: saves.length === 0 ? _jsx("option", { value: "", children: "No saved panels" }) : saves.map((s) => _jsx("option", { value: s.name, children: s.name }, s.name)) }), _jsx("button", { className: "px-3 rounded-xl bg-white border", disabled: !selected, onClick: () => onLoad(team, selected), children: "Load" }), _jsx("button", { className: "px-3 rounded-xl bg-white border", disabled: !selected, onClick: () => onDelete(selected), children: "Delete" })] })] }));
}
function PanelRow({ slot, index, team, onCommit, drag, inputRef, requestFocusNext, requestFocusPrev }) {
    const [val, setVal] = useState(slot.name || '');
    useEffect(() => { setVal(slot.name || ''); }, [slot.id, slot.name]);
    const commit = () => onCommit(team, index, val);
    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commit();
            requestFocusNext && requestFocusNext(index + 1);
        }
        else if (e.key === 'Tab') {
            e.preventDefault();
            commit();
            const next = e.shiftKey ? index - 1 : index + 1;
            (e.shiftKey ? requestFocusPrev : requestFocusNext)?.(next);
        }
    };
    return (_jsxs("div", { className: "text-sm flex items-center gap-2", onDragOver: drag.onDragOverRow(index), onDrop: drag.onDropRow(index), children: [_jsxs("span", { className: "w-10 text-right text-gray-600 cursor-grab select-none", title: "Drag to reorder", draggable: true, onDragStart: drag.onDragStart(index), children: ["#", index + 1] }), _jsx("input", { ref: inputRef, className: "flex-1 border rounded-xl p-2", placeholder: `Player ${index + 1}`, value: val, onChange: (e) => setVal(e.target.value), onBlur: commit, onKeyDown: onKeyDown, onDragStart: (e) => e.preventDefault() })] }));
}
function PanelList({ team, teamLabel, slots, update, add, drag, saveName, setSaveName, saves, onSave, onLoad, onDelete }) {
    const inputRefs = useRef([]);
    useEffect(() => { inputRefs.current = inputRefs.current.slice(0, slots.length); }, [slots.length]);
    const focusIndex = (idx) => { if (idx < 0)
        idx = 0; if (idx < slots.length) {
        const el = inputRefs.current[idx];
        if (el)
            el.focus();
    }
    else if (idx === slots.length && slots.length < 30) {
        add(team);
        setTimeout(() => { const el = inputRefs.current[idx]; if (el)
            el && el.focus(); }, 0);
    } };
    const focusPrev = (idx) => { if (idx < 0)
        idx = 0; const el = inputRefs.current[idx]; if (el)
        el.focus(); };
    return (_jsxs("div", { className: "border rounded-2xl p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "font-semibold", children: [teamLabel, " panel"] }), _jsx("button", { className: "px-3 py-1 rounded-lg bg-gray-100", onClick: () => { const nextIdx = slots.length; add(team); setTimeout(() => focusIndex(nextIdx), 0); }, children: "+ Add" })] }), _jsx("div", { className: "grid grid-cols-1 gap-2", children: slots.map((slot, i) => (_jsx(PanelRow, { slot: slot, index: i, team: team, onCommit: update, drag: drag, inputRef: (el) => { inputRefs.current[i] = el; }, requestFocusNext: focusIndex, requestFocusPrev: focusPrev }, slot.id))) }), _jsx(SavesUI, { team: team, saveName: saveName, setSaveName: setSaveName, saves: saves, onSave: onSave, onLoad: onLoad, onDelete: onDelete })] }));
}
export default function SetupScreen({ onComplete }) {
    const newSlot = (name = '') => ({ id: (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`), name });
    const listFromNames = (names) => names.map((nm) => newSlot(nm || ''));
    const [teamA, setTeamA] = useState('Team A');
    const [teamB, setTeamB] = useState('Team B');
    const [aSlots, setASlots] = useState(Array.from({ length: 20 }, () => newSlot('')));
    const [bSlots, setBSlots] = useState(Array.from({ length: 20 }, () => newSlot('')));
    const [aSaveName, setASaveName] = useState('');
    const [bSaveName, setBSaveName] = useState('');
    const [saves, setSaves] = useState(loadSaves());
    useEffect(() => { saveSaves(saves); }, [saves]);
    const updateSlot = (team, idx, val) => { if (team === 0) {
        const c = [...aSlots];
        c[idx] = { ...c[idx], name: val };
        setASlots(c);
    }
    else {
        const c = [...bSlots];
        c[idx] = { ...c[idx], name: val };
        setBSlots(c);
    } };
    const addSlot = (team) => { if (team === 0) {
        if (aSlots.length < 30)
            setASlots([...aSlots, newSlot('')]);
    }
    else {
        if (bSlots.length < 30)
            setBSlots([...bSlots, newSlot('')]);
    } };
    const makeRoster = (slots) => { const arr = Array(30).fill(''); for (let i = 0; i < Math.min(30, slots.length); i++)
        arr[i] = slots[i]?.name?.trim() || ''; return arr; };
    const savePanel = (team) => { const name = (team === 0 ? aSaveName : bSaveName).trim(); if (!name) {
        alert('Enter a name for this panel');
        return;
    } const roster = team === 0 ? makeRoster(aSlots) : makeRoster(bSlots); const existingIdx = saves.findIndex(s => s.name === name); const newRec = { name, roster, savedAt: Date.now() }; const next = existingIdx >= 0 ? [...saves.slice(0, existingIdx), newRec, ...saves.slice(existingIdx + 1)] : [...saves, newRec]; setSaves(next); };
    const loadPanel = (team, name) => { const rec = saves.find(s => s.name === name); if (!rec)
        return; const list = listFromNames(rec.roster); if (team === 0)
        setASlots(list);
    else
        setBSlots(list); };
    const deletePanel = (name) => { if (!confirm(`Delete panel "${name}"?`))
        return; setSaves(saves.filter(s => s.name !== name)); };
    const useDragList = (list, setList) => {
        const dragIndex = useRef(null);
        const onDragStart = (idx) => (e) => { dragIndex.current = idx; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(idx)); };
        const onDragOverRow = (idx) => (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
        const onDropRow = (idx) => (e) => { e.preventDefault(); const from = dragIndex.current; if (from === null || from === idx)
            return; const arr = [...list]; const [moved] = arr.splice(from, 1); arr.splice(idx, 0, moved); setList(arr); dragIndex.current = null; };
        return { onDragStart, onDragOverRow, onDropRow };
    };
    const dragA = useDragList(aSlots, setASlots);
    const dragB = useDragList(bSlots, setBSlots);
    return (_jsx("div", { className: "p-4 max-w-md w-full mx-auto", children: _jsxs("div", { className: "bg-white shadow rounded-2xl p-4 space-y-6", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Pre-game Setup" }), _jsxs("div", { className: "grid grid-cols-1 gap-3", children: [_jsxs("label", { className: "text-sm", children: ["Home team name", _jsx("input", { className: "mt-1 w-full border rounded-xl p-2", value: teamA, onChange: e => setTeamA(e.target.value) })] }), _jsxs("label", { className: "text-sm", children: ["Away team name", _jsx("input", { className: "mt-1 w-full border rounded-xl p-2", value: teamB, onChange: e => setTeamB(e.target.value) })] })] }), _jsx("p", { className: "text-sm text-gray-600", children: "Enter jersey names in order. Leave blanks to skip. Start with up to 20, tap + to add more (max 30). Drag using the jersey number handle to reorder. #1\u2013#15 start in default positions." }), _jsx(PanelList, { team: 0, teamLabel: teamA, slots: aSlots, update: updateSlot, add: addSlot, drag: dragA, saves: saves, saveName: aSaveName, setSaveName: setASaveName, onSave: savePanel, onLoad: loadPanel, onDelete: deletePanel }), _jsx(PanelList, { team: 1, teamLabel: teamB, slots: bSlots, update: updateSlot, add: addSlot, drag: dragB, saves: saves, saveName: bSaveName, setSaveName: setBSaveName, onSave: savePanel, onLoad: loadPanel, onDelete: deletePanel }), _jsx("button", { className: "w-full py-3 rounded-xl bg-black text-white font-semibold", onClick: () => onComplete({ teamA: teamA.trim() || 'Team A', teamB: teamB.trim() || 'Team B', rosterA: makeRoster(aSlots), rosterB: makeRoster(bSlots) }), children: "Start Match" })] }) }));
}
