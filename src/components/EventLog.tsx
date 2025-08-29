import React from "react";
import Collapsible from "./Collapsible";
import { fmtClock } from "../utils/format";
import { HALF_SECONDS } from "../state/constants";

export default function EventLog({
  events,
  teams,
}: {
  events: any[];
  teams: any[];
}) {
  const MAX = 50;
  const rows = [...events].slice(-MAX).reverse();

  return (
    <div className="bg-white rounded-2xl shadow p-3 mb-24">
      <Collapsible title="Event Log" defaultOpen={false}>
        {rows.length === 0 ? (
          <div className="text-sm text-gray-500">No events yet.</div>
        ) : (
          <ul className="text-sm divide-y">
            {rows.map((e, i) => {
              const inHalfSec =
                e.half === 1 ? e.t : Math.max(0, e.t - HALF_SECONDS);
              return (
                <li key={i} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {teams[e.teamIdx]?.name || ""} — {e.type}
                      {e.detail ? ` · ${e.detail}` : ""}
                      {e.playerNumber ? ` · #${e.playerNumber}` : ""}
                      {e.name ? ` ${e.name}` : ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      Half {e.half} · {fmtClock(inHalfSec)}
                    </div>
                  </div>
                  <div className="text-xs font-mono bg-gray-100 rounded px-2 py-1">
                    {fmtClock(e.t)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Collapsible>
    </div>
  );
}
