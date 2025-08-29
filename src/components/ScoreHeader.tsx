import React from "react";
import { totalPoints } from "../utils/format";

export default function ScoreHeader({ teams }: { teams: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 items-stretch mb-3">
      {teams.map((t, i) => {
        const total = totalPoints(t.score);
        const gp = `${t.score.goals}-${t.score.points}`;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl shadow p-4 flex flex-col items-center"
          >
            <div className="text-xs uppercase tracking-wide text-gray-500">
              {i === 0 ? "Home" : "Away"}
            </div>
            <div className="text-lg font-semibold">{t.name}</div>
            <div className="text-7xl md:text-8xl font-black mt-1 leading-none">
              {gp}
            </div>
            <div className="text-2xl font-bold mt-1">Total {total}</div>
          </div>
        );
      })}
    </div>
  );
}
