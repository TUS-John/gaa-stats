import React from "react";
import Collapsible from "./Collapsible";
import { fmtClock, fmtPlayerLine } from "../utils/format";

export default function LivePanels({
  activeYellows,
  topScorersByTeam,
  teams,
  onRestore,
}: {
  activeYellows: any[];
  topScorersByTeam: any[];
  teams: any[];
  onRestore: (a: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 mb-3">
      <div className="bg-white rounded-2xl shadow p-3">
        <Collapsible title="Active Sin-bins (Yellow)" defaultOpen={false}>
          {activeYellows.length === 0 ? (
            <div className="text-sm text-gray-500">None</div>
          ) : (
            <ul className="text-sm space-y-1">
              {activeYellows.map((y, i) => {
                const hasEmpty = teams[y.teamIdx].onField.some(
                  (n: number | null) => n == null
                );
                const canRestore = hasEmpty;
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>
                      {teams[y.teamIdx].name} — #{y.number}{" "}
                      {teams[y.teamIdx].squad[y.number - 1]?.name ||
                        (y.number === 0 ? "Unknown" : "")}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono" title="elapsed / remaining">
                        {fmtClock(600 - y.left)} / {fmtClock(y.left)}
                      </span>
                      <button
                        className={`px-2 py-1 rounded ${
                          canRestore
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                        disabled={!canRestore}
                        onClick={() =>
                          onRestore({ teamIdx: y.teamIdx, number: y.number })
                        }
                      >
                        Restore
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Collapsible>
      </div>

      <div className="bg-white rounded-2xl shadow p-3 border-2 border-indigo-500">
        <div className="text-xl font-bold mb-2">Top Scorers (Combined)</div>
        <div className="grid grid-cols-1 gap-3">
          {topScorersByTeam.map((rows, idx) => (
            <div key={idx}>
              <div className="text-sm uppercase text-gray-500 mb-1">
                {teams[idx].name}
              </div>
              {rows.length === 0 ? (
                <div className="text-base text-gray-500">—</div>
              ) : (
                <ul className="text-base space-y-1">
                  {rows.map((r: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span className="font-medium">
                        #{r.number} {r.name}
                      </span>
                      <span className="font-mono">{fmtPlayerLine(r)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
