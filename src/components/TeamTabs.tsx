import React, { useState } from "react";
import TeamPanel from "./TeamPanel";

export default function TeamTabs({
  state,
  gameSeconds,
  onScore,
  onCard,
  onSub,
  onMiss,
}: {
  state: any;
  gameSeconds: number;
  onScore: (a: any) => void;
  onCard: (a: any) => void;
  onSub: (a: any) => void;
  onMiss: (a: any) => void; // NEW
}) {
  const [tab, setTab] = useState(0);
  const [expanded, setExpanded] = useState<any[]>([null, null]);
  const setExp = (teamIdx: number, n: number | null) => {
    const next = [...expanded];
    next[teamIdx] = next[teamIdx] === n ? null : n;
    setExpanded(next);
  };
  return (
    <div className="mb-3">
      <div className="flex gap-2 mb-2">
        {[0, 1].map((i) => (
          <button
            key={i}
            className={`flex-1 py-2 rounded-xl border ${
              tab === i ? "bg-black text-white" : "bg-white"
            }`}
            onClick={() => setTab(i)}
          >
            {state.teams[i].name}
          </button>
        ))}
      </div>
      <TeamPanel
        teamIdx={tab}
        team={state.teams[tab]}
        gameSeconds={gameSeconds}
        expandedNumber={expanded[tab]}
        setExpandedNumber={(n) => setExp(tab, n)}
        onScore={onScore}
        onCard={onCard}
        onSub={onSub}
        onMiss={onMiss} // NEW
        reds={state.reds}
        yellows={state.yellows}
      />
    </div>
  );
}
