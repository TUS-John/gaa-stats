import React, { useEffect, useRef, useState } from "react";
import { loadSaves, saveSaves } from "../utils/storage";

function SavesUI({
  team,
  saveName,
  setSaveName,
  saves,
  onSave,
  onLoad,
  onDelete,
}: {
  team: number;
  saveName: string;
  setSaveName: (s: string) => void;
  saves: any[];
  onSave: (team: number) => void;
  onLoad: (team: number, name: string) => void;
  onDelete: (name: string) => void;
}) {
  const [selected, setSelected] = useState(saves[0]?.name || "");
  useEffect(() => {
    if (saves.length && !saves.find((s) => s.name === selected))
      setSelected(saves[0]?.name || "");
  }, [saves]);
  return (
    <div className="mt-3 grid grid-cols-1 gap-2">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl p-2"
          placeholder="Save name (e.g. Senior A)"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
        />
        <button
          className="px-3 rounded-xl bg-gray-900 text-white"
          onClick={() => onSave(team)}
        >
          Save Panel
        </button>
      </div>
      <div className="flex gap-2">
        <select
          className="flex-1 border rounded-xl p-2"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {saves.length === 0 ? (
            <option value="">No saved panels</option>
          ) : (
            saves.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))
          )}
        </select>
        <button
          className="px-3 rounded-xl bg-white border"
          disabled={!selected}
          onClick={() => onLoad(team, selected)}
        >
          Load
        </button>
        <button
          className="px-3 rounded-xl bg-white border"
          disabled={!selected}
          onClick={() => onDelete(selected)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function PanelRow({
  slot,
  index,
  team,
  onCommit,
  drag,
  inputRef,
  requestFocusNext,
  requestFocusPrev,
}: {
  slot: any;
  index: number;
  team: number;
  onCommit: (t: number, i: number, v: string) => void;
  drag: any;
  inputRef: (el: HTMLInputElement | null) => void;
  requestFocusNext: (i: number) => void;
  requestFocusPrev: (i: number) => void;
}) {
  const [val, setVal] = useState(slot.name || "");
  useEffect(() => {
    setVal(slot.name || "");
  }, [slot.id, slot.name]);
  const commit = () => onCommit(team, index, val);
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
      requestFocusNext && requestFocusNext(index + 1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      commit();
      const next = (e as any).shiftKey ? index - 1 : index + 1;
      ((e as any).shiftKey ? requestFocusPrev : requestFocusNext)?.(next);
    }
  };
  return (
    <div
      className="text-sm flex items-center gap-2"
      onDragOver={drag.onDragOverRow(index)}
      onDrop={drag.onDropRow(index)}
    >
      <span
        className="w-10 text-right text-gray-600 cursor-grab select-none"
        title="Drag to reorder"
        draggable
        onDragStart={drag.onDragStart(index)}
      >
        #{index + 1}
      </span>
      <input
        ref={inputRef}
        className="flex-1 border rounded-xl p-2"
        placeholder={`Player ${index + 1}`}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}

function PanelList({
  team,
  teamLabel,
  slots,
  update,
  add,
  drag,
  saveName,
  setSaveName,
  saves,
  onSave,
  onLoad,
  onDelete,
}: {
  team: number;
  teamLabel: string;
  slots: any[];
  update: (t: number, i: number, v: string) => void;
  add: (t: number) => void;
  drag: any;
  saveName: string;
  setSaveName: (s: string) => void;
  saves: any[];
  onSave: (t: number) => void;
  onLoad: (t: number, n: string) => void;
  onDelete: (s: string) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, slots.length);
  }, [slots.length]);
  const focusIndex = (idx: number) => {
    if (idx < 0) idx = 0;
    if (idx < slots.length) {
      const el = inputRefs.current[idx];
      if (el) el.focus();
    } else if (idx === slots.length && slots.length < 30) {
      add(team);
      setTimeout(() => {
        const el = inputRefs.current[idx];
        if (el) el && el.focus();
      }, 0);
    }
  };
  const focusPrev = (idx: number) => {
    if (idx < 0) idx = 0;
    const el = inputRefs.current[idx];
    if (el) el.focus();
  };
  return (
    <div className="border rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{teamLabel} panel</div>
        <button
          className="px-3 py-1 rounded-lg bg-gray-100"
          onClick={() => {
            const nextIdx = slots.length;
            add(team);
            setTimeout(() => focusIndex(nextIdx), 0);
          }}
        >
          + Add
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {slots.map((slot, i) => (
          <PanelRow
            key={slot.id}
            slot={slot}
            index={i}
            team={team}
            onCommit={update}
            drag={drag}
            inputRef={(el) => {
              inputRefs.current[i] = el;
            }}
            requestFocusNext={focusIndex}
            requestFocusPrev={focusPrev}
          />
        ))}
      </div>
      <SavesUI
        team={team}
        saveName={saveName}
        setSaveName={setSaveName}
        saves={saves}
        onSave={onSave}
        onLoad={onLoad}
        onDelete={onDelete}
      />
    </div>
  );
}

export default function SetupScreen({
  onComplete,
}: {
  onComplete: (p: any) => void;
}) {
  const newSlot = (name: string = "") => ({
    id: crypto?.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    name,
  });
  const listFromNames = (names: string[]) =>
    names.map((nm) => newSlot(nm || ""));

  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [aSlots, setASlots] = useState(
    Array.from({ length: 20 }, () => newSlot(""))
  );
  const [bSlots, setBSlots] = useState(
    Array.from({ length: 20 }, () => newSlot(""))
  );
  const [aSaveName, setASaveName] = useState("");
  const [bSaveName, setBSaveName] = useState("");
  const [saves, setSaves] = useState<any[]>(loadSaves());
  useEffect(() => {
    saveSaves(saves);
  }, [saves]);

  const updateSlot = (team: number, idx: number, val: string) => {
    if (team === 0) {
      const c = [...aSlots];
      c[idx] = { ...c[idx], name: val };
      setASlots(c);
    } else {
      const c = [...bSlots];
      c[idx] = { ...c[idx], name: val };
      setBSlots(c);
    }
  };
  const addSlot = (team: number) => {
    if (team === 0) {
      if (aSlots.length < 30) setASlots([...aSlots, newSlot("")]);
    } else {
      if (bSlots.length < 30) setBSlots([...bSlots, newSlot("")]);
    }
  };
  const makeRoster = (slots: any[]) => {
    const arr = Array(30).fill("");
    for (let i = 0; i < Math.min(30, slots.length); i++)
      arr[i] = slots[i]?.name?.trim() || "";
    return arr;
  };

  const savePanel = (team: number) => {
    const name = (team === 0 ? aSaveName : bSaveName).trim();
    if (!name) {
      alert("Enter a name for this panel");
      return;
    }
    const roster = team === 0 ? makeRoster(aSlots) : makeRoster(bSlots);
    const existingIdx = saves.findIndex((s) => s.name === name);
    const newRec = { name, roster, savedAt: Date.now() };
    const next =
      existingIdx >= 0
        ? [
            ...saves.slice(0, existingIdx),
            newRec,
            ...saves.slice(existingIdx + 1),
          ]
        : [...saves, newRec];
    setSaves(next);
  };
  const loadPanel = (team: number, name: string) => {
    const rec = saves.find((s) => s.name === name);
    if (!rec) return;
    const list = listFromNames(rec.roster);
    if (team === 0) setASlots(list);
    else setBSlots(list);
  };
  const deletePanel = (name: string) => {
    if (!confirm(`Delete panel "${name}"?`)) return;
    setSaves(saves.filter((s) => s.name !== name));
  };

  const useDragList = (list: any[], setList: (l: any[]) => void) => {
    const dragIndex = useRef<number | null>(null);
    const onDragStart = (idx: number) => (e: React.DragEvent) => {
      dragIndex.current = idx;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(idx));
    };
    const onDragOverRow = (idx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };
    const onDropRow = (idx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIndex.current;
      if (from === null || from === idx) return;
      const arr = [...list];
      const [moved] = arr.splice(from, 1);
      arr.splice(idx, 0, moved);
      setList(arr);
      dragIndex.current = null;
    };
    return { onDragStart, onDragOverRow, onDropRow };
  };
  const dragA = useDragList(aSlots, setASlots);
  const dragB = useDragList(bSlots, setBSlots);

  return (
    <div className="p-4 max-w-md w-full mx-auto">
      <div className="bg-white shadow rounded-2xl p-4 space-y-6">
        <h2 className="text-lg font-semibold">Pre-game Setup</h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">
            Home team name
            <input
              className="mt-1 w-full border rounded-xl p-2"
              placeholder="Team A"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Away team name
            <input
              className="mt-1 w-full border rounded-xl p-2"
              placeholder="Team B"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
            />
          </label>
        </div>
        <p className="text-sm text-gray-600">
          Enter jersey names in order. Leave blanks to skip. Start with up to
          20, tap + to add more (max 30). Drag using the jersey number handle to
          reorder. #1–#15 start in default positions.
        </p>
        <PanelList
          team={0}
          teamLabel={teamA}
          slots={aSlots}
          update={updateSlot}
          add={addSlot}
          drag={dragA}
          saves={saves}
          saveName={aSaveName}
          setSaveName={setASaveName}
          onSave={savePanel}
          onLoad={loadPanel}
          onDelete={deletePanel}
        />
        <PanelList
          team={1}
          teamLabel={teamB}
          slots={bSlots}
          update={updateSlot}
          add={addSlot}
          drag={dragB}
          saves={saves}
          saveName={bSaveName}
          setSaveName={setBSaveName}
          onSave={savePanel}
          onLoad={loadPanel}
          onDelete={deletePanel}
        />
        <button
          className="w-full py-3 rounded-xl bg-black text-white font-semibold"
          onClick={() =>
            onComplete({
              teamA: teamA.trim() || "Team A",
              teamB: teamB.trim() || "Team B",
              rosterA: makeRoster(aSlots),
              rosterB: makeRoster(bSlots),
            })
          }
        >
          Start Match
        </button>
      </div>
    </div>
  );
}
