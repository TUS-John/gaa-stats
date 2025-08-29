import React, { useMemo } from "react";
import SubForm from "./SubForm";

export default function TeamPanel({
  teamIdx,
  team,
  gameSeconds,
  expandedNumber,
  setExpandedNumber,
  onScore,
  onCard,
  onSub,
  reds,
  yellows,
}: {
  teamIdx: number;
  team: any;
  gameSeconds: number;
  expandedNumber: number | null;
  setExpandedNumber: (n: number | null) => void;
  onScore: (a: any) => void;
  onCard: (a: any) => void;
  onSub: (a: any) => void;
  reds: any;
  yellows: any;
}) {
  const redSet = new Set(
    Object.keys(reds || {})
      .filter((k: any) => k.startsWith(teamIdx + "|"))
      .map((k: any) => Number(k.split("|")[1]))
  );
  const sinBinSet = new Set(
    Object.entries<any>(yellows || {})
      .filter(
        ([k, recs]) =>
          k.startsWith(teamIdx + "|") &&
          recs.some((r: any) => r.expiresAt > gameSeconds)
      )
      .map(([k]) => Number(k.split("|")[1]))
  );

  const onFieldNumbers = team.onField as (number | null)[];
  const benchNumbers = useMemo(() => {
    const s = new Set(onFieldNumbers.filter(Boolean) as number[]);
    const list: number[] = [];
    for (let n = 1; n <= 30; n++) if (!s.has(n)) list.push(n);
    return list;
  }, [onFieldNumbers]);

  const logThenClose = (fn: () => void) => {
    fn();
    setExpandedNumber(null);
  };
  const Btn = (label: string, classes: string, onClick: () => void) => (
    <button className={`py-2 rounded-xl ${classes}`} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow p-3 space-y-3">
      {/* Unknown inline logger */}
      <div
        className={`w-full border rounded-xl ${
          expandedNumber === 0 ? "ring-2 ring-black" : ""
        }`}
      >
        <button
          className="w-full text-left p-2 flex items-center justify-between bg-white rounded-xl"
          onClick={() => setExpandedNumber(0)}
        >
          <div>
            <div className="text-xs uppercase text-gray-500">Unknown</div>
            <div className="text-lg md:text-xl font-semibold">#? · Unknown</div>
          </div>
          <div className="text-xs text-gray-400">Tap to log</div>
        </button>
        {expandedNumber === 0 && (
          <div className="p-2 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="grid grid-cols-1 gap-2">
                {Btn("Point (Play)", "bg-gray-900 text-white", () =>
                  logThenClose(() =>
                    onScore({
                      teamIdx,
                      kind: "point",
                      via: "play",
                      playerNumber: 0,
                    })
                  )
                )}
                {Btn("Goal (Play)", "bg-gray-900 text-white", () =>
                  logThenClose(() =>
                    onScore({
                      teamIdx,
                      kind: "goal",
                      via: "play",
                      playerNumber: 0,
                    })
                  )
                )}
                {Btn("Yellow Card", "bg-yellow-400", () =>
                  logThenClose(() =>
                    onCard({ teamIdx, card: "yellow", playerNumber: 0 })
                  )
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Btn("Point (Free)", "bg-gray-900 text-white", () =>
                  logThenClose(() =>
                    onScore({
                      teamIdx,
                      kind: "point",
                      via: "free",
                      playerNumber: 0,
                    })
                  )
                )}
                {Btn("Goal (Free)", "bg-gray-900 text-white", () =>
                  logThenClose(() =>
                    onScore({
                      teamIdx,
                      kind: "goal",
                      via: "free",
                      playerNumber: 0,
                    })
                  )
                )}
                {Btn("Red Card", "bg-red-600 text-white", () =>
                  logThenClose(() =>
                    onCard({ teamIdx, card: "red", playerNumber: 0 })
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* On-field list: 15 slots, no positions */}
      <div className="grid grid-cols-1 gap-2">
        {Array.from({ length: 15 }, (_, slot) => {
          const num = team.onField[slot] as number | null;
          const name = num ? team.squad[num - 1]?.name || "" : "";
          const isRed = !!(num && redSet.has(num));
          const isSin = !!(num && sinBinSet.has(num));
          const open = !!(num && expandedNumber === num);

          return (
            <div
              key={slot}
              className={`w-full border rounded-xl ${
                open ? "ring-2 ring-black" : ""
              }`}
            >
              <button
                className={`w-full text-left p-2 flex items-center justify-between ${
                  !num ? "bg-gray-50" : "bg-white"
                } rounded-xl`}
                onClick={() =>
                  num && !isRed && !isSin && setExpandedNumber(num)
                }
                disabled={!num || isRed || isSin}
              >
                <div className="text-lg md:text-xl font-semibold">
                  {num ? `#${num}` : "—"} {name ? `· ${name}` : ""}
                </div>
                <div className="text-xs">
                  {isRed ? (
                    <span className="px-2 py-1 rounded bg-red-100 text-red-700">
                      RED
                    </span>
                  ) : null}
                  {!isRed && isSin ? (
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                      SIN-BIN
                    </span>
                  ) : null}
                </div>
              </button>

              {open && (
                <div className="p-2 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid grid-cols-1 gap-2">
                      {Btn("Point (Play)", "bg-gray-900 text-white", () =>
                        logThenClose(() =>
                          onScore({
                            teamIdx,
                            kind: "point",
                            via: "play",
                            playerNumber: num,
                          })
                        )
                      )}
                      {Btn("Goal (Play)", "bg-gray-900 text-white", () =>
                        logThenClose(() =>
                          onScore({
                            teamIdx,
                            kind: "goal",
                            via: "play",
                            playerNumber: num,
                          })
                        )
                      )}
                      {Btn("Yellow Card", "bg-yellow-400", () =>
                        logThenClose(() =>
                          onCard({ teamIdx, card: "yellow", playerNumber: num })
                        )
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {Btn("Point (Free)", "bg-gray-900 text-white", () =>
                        logThenClose(() =>
                          onScore({
                            teamIdx,
                            kind: "point",
                            via: "free",
                            playerNumber: num,
                          })
                        )
                      )}
                      {Btn("Goal (Free)", "bg-gray-900 text-white", () =>
                        logThenClose(() =>
                          onScore({
                            teamIdx,
                            kind: "goal",
                            via: "free",
                            playerNumber: num,
                          })
                        )
                      )}
                      {Btn("Red Card", "bg-red-600 text-white", () =>
                        logThenClose(() =>
                          onCard({ teamIdx, card: "red", playerNumber: num })
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Substitutions only (move/swap/rotate removed) */}
      <div className="border-t pt-3">
        <div className="font-semibold mb-2">Substitution</div>
        <SubForm
          team={team}
          onSub={(inN, outN) =>
            onSub({ teamIdx, inNumber: inN, outNumber: outN })
          }
          benchNumbers={benchNumbers}
        />
      </div>
    </div>
  );
}
