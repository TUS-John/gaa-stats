import React from "react";
import { fmtClock, totalPoints } from "../utils/format";
import { HALF_SECONDS } from "../state/constants";

export default function StatsView({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="p-3 max-w-md w-full mx-auto">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="font-semibold mb-2">Stats Link Invalid</div>
          <p className="text-sm text-gray-600">
            Ask the scorer to send a fresh link.
          </p>
        </div>
      </div>
    );
  }
  const teams = data.teams || [];
  const half = data.currentHalf || 1;
  const elapsed =
    half === 1
      ? data.gameSeconds || 0
      : Math.max(0, (data.gameSeconds || 0) - HALF_SECONDS);
  const left = Math.max(0, HALF_SECONDS - elapsed);
  const topScorersByTeam = (teams || []).map((t: any) => {
    const rows = Object.entries<any>(t.byPlayer || {}).map(([num, r]) => ({
      number: Number(num),
      name:
        Number(num) === 0
          ? "Unknown"
          : (t.squad || [])[Number(num) - 1]?.name || r.name || `#${num}`,
      goals: r.goals || 0,
      points: r.points || 0,
      total: (r.goals || 0) * 3 + (r.points || 0),
      freesGoals: r.freesGoals || 0,
      freesPoints: r.freesPoints || 0,
    }));
    rows.sort((a, b) => b.total - a.total);
    return rows.slice(0, 5);
  });
  const activeYellows = (() => {
    const list: any[] = [];
    const now = data.gameSeconds || 0;
    const yell = data.yellows || {};
    for (const k in yell) {
      const recs = yell[k];
      if (!Array.isArray(recs)) continue;
      const [ti, ns] = k.split("|");
      const teamIdx = Number(ti),
        number = Number(ns);
      for (const r of recs) {
        const l = Math.max(0, r.expiresAt - now);
        list.push({ teamIdx, number, left: l });
      }
    }
    list.sort((a, b) => a.left - b.left);
    return list;
  })();
  const fmtFree = (gf: number, pf: number) => {
    const g = gf || 0,
      p = pf || 0;
    return g === 0 && p === 0 ? "" : ` (${g}-${p}f)`;
  };
  return (
    <div className="p-3 max-w-md w-full mx-auto space-y-3">
      <div className="bg-white rounded-2xl shadow p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold">Half:</span> {half}/2
          </div>
          <div
            className={`text-sm ${
              half === 1 && elapsed > HALF_SECONDS
                ? "text-red-600 font-semibold"
                : ""
            }`}
          >
            <span className="font-semibold">Elapsed:</span> {fmtClock(elapsed)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-stretch">
        {(teams || []).map((t: any, idx: number) => {
          const gp = `${t.score?.goals || 0}-${t.score?.points || 0}`;
          const total = totalPoints(t.score || { goals: 0, points: 0 });
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow p-3 flex flex-col items-center"
            >
              <div className="text-xs uppercase text-gray-500">
                {idx === 0 ? "Home" : "Away"}
              </div>
              <div className="text-base font-semibold">{t.name || ""}</div>
              <div className="text-3xl font-black mt-1">{gp}</div>
              <div className="text-xs text-gray-500">Total {total}</div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-2xl shadow p-3">
        <div className="font-semibold mb-2">Top Scorers</div>
        <div className="grid grid-cols-1 gap-3">
          {topScorersByTeam.map((rows: any[], idx: number) => (
            <div key={idx}>
              <div className="text-xs uppercase text-gray-500 mb-1">
                {teams[idx]?.name || ""}
              </div>
              {rows.length === 0 ? (
                <div className="text-sm text-gray-500">—</div>
              ) : (
                <ul className="text-sm space-y-1">
                  {rows.map((r: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        #{r.number} {r.name}
                      </span>
                      <span className="font-mono">
                        {r.goals}-{r.points}
                        {fmtFree(r.freesGoals, r.freesPoints)} ({r.total})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-3">
        <div className="font-semibold mb-2">Active Sin-bins</div>
        {activeYellows.length === 0 ? (
          <div className="text-sm text-gray-500">None</div>
        ) : (
          <ul className="text-sm space-y-1">
            {activeYellows.map((y: any, i: number) => (
              <li key={i} className="flex justify-between">
                <span>
                  {teams[y.teamIdx]?.name || ""} — #{y.number}{" "}
                  {y.number === 0
                    ? "Unknown"
                    : teams[y.teamIdx]?.squad?.[y.number - 1]?.name || ""}
                </span>
                <span className="font-mono">{fmtClock(y.left)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
