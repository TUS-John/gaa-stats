import { produce } from "immer";
import { HALF_SECONDS, TOTAL_GAME_SECONDS } from "./constants";

const defaultSquad = (names: string[] = []) =>
  Array.from({ length: 30 }, (_, i) => ({
    number: i + 1,
    name: names[i] || "",
  }));

const defaultOnField = () => Array.from({ length: 15 }, (_, i) => i + 1);

const buildPositionByNumber = (on: (number | null)[]) => {
  const m: Record<number, number> = {};
  on.forEach((num, pos) => {
    if (num != null) m[num] = pos;
  });
  return m;
};

export const key = (teamIdx: number, number: number) =>
  `${teamIdx}|${number}` as const;

const initialTeam = () => ({
  name: "Team",
  squad: defaultSquad([]),
  onField: defaultOnField(),
  positionByNumber: buildPositionByNumber(defaultOnField()),
  score: { goals: 0, points: 0 },
  byPlayer: {} as Record<
    number,
    {
      name: string;
      goals: number;
      points: number;
      freesGoals: number;
      freesPoints: number;
    }
  >,
});

export const initialState = {
  setupComplete: false,
  teams: [
    { ...initialTeam(), name: "Home" },
    { ...initialTeam(), name: "Away" },
  ],
  running: false,
  elapsedMs: 0,
  runAnchorMs: null as number | null,
  heartbeat: 0,
  currentHalf: 1 as 1 | 2,
  events: [] as any[],
  yellows: {} as Record<string, { at: number; expiresAt: number }[]>,
  reds: {} as Record<string, true>,
};

type AppState = typeof initialState;

function ensurePlayerRow(team: any, n: number) {
  const name = n === 0 ? "Unknown" : team.squad[n - 1]?.name || `#${n}`;
  return (team.byPlayer[n] ||= {
    name,
    goals: 0,
    points: 0,
    freesGoals: 0,
    freesPoints: 0,
    attempts: 0, // NEW
    made: 0, // NEW
  });
}

export default function reducer(state: AppState, action: any): AppState {
  return produce(state, (draft) => {
    switch (action.type) {
      case "LOAD":
        return action.state as AppState;

      case "NEW_MATCH":
        return initialState as AppState;

      case "SETUP": {
        const { teamA, teamB, rosterA, rosterB } = action;
        const next = produce(initialState, (d) => {
          d.setupComplete = true;
          d.teams[0].name = teamA || "Team A";
          d.teams[0].squad = defaultSquad(rosterA || []);
          d.teams[0].onField = defaultOnField();
          d.teams[0].positionByNumber = buildPositionByNumber(
            d.teams[0].onField
          );
          d.teams[1].name = teamB || "Team B";
          d.teams[1].squad = defaultSquad(rosterB || []);
          d.teams[1].onField = defaultOnField();
          d.teams[1].positionByNumber = buildPositionByNumber(
            d.teams[1].onField
          );
        });
        return next;
      }

      // ---- timing ----
      case "TICK": {
        if (!draft.running) return;
        draft.heartbeat += 1;
        return;
      }

      case "START": {
        if (draft.running) return;
        draft.running = true;
        draft.runAnchorMs = action.nowMs;
        return;
      }

      case "PAUSE": {
        if (!draft.running) return;
        const now = action.nowMs;
        draft.elapsedMs += now - (draft.runAnchorMs || now);
        draft.runAnchorMs = null;
        draft.running = false;
        return;
      }

      case "NEXT_HALF": {
        const now = action.nowMs;
        const currentMs =
          draft.elapsedMs +
          (draft.running && draft.runAnchorMs ? now - draft.runAnchorMs : 0);
        const newElapsed =
          currentMs < HALF_SECONDS * 1000 ? HALF_SECONDS * 1000 : currentMs;
        draft.currentHalf = 2;
        draft.elapsedMs = newElapsed;
        draft.runAnchorMs = draft.running ? now : null;
        return;
      }

      case "RESET_TIME": {
        draft.running = false;
        draft.elapsedMs = 0;
        draft.runAnchorMs = null;
        draft.currentHalf = 1;
        return;
      }

      case "RESET_ALL": {
        draft.running = false;
        draft.elapsedMs = 0;
        draft.runAnchorMs = null;
        draft.currentHalf = 1;
        draft.events = [];
        draft.yellows = {};
        draft.reds = {};
        for (const t of draft.teams) {
          t.score = { goals: 0, points: 0 };
          t.byPlayer = {};
        }
        return;
      }

      // ---- gameplay ----
      case "SCORE": {
        const { teamIdx, kind, via, playerNumber } = action;
        const team = draft.teams[teamIdx];
        if (kind === "goal") team.score.goals += 1;
        else team.score.points += 1;

        const n = Number(playerNumber) || 0;
        const row = ensurePlayerRow(team, n);

        row.attempts += 1; // NEW
        row.made += 1; // NEW

        if (kind === "goal") {
          row.goals += 1;
          if (via === "free") row.freesGoals += 1;
        } else {
          row.points += 1;
          if (via === "free") row.freesPoints += 1;
        }

        draft.events.push({
          t: action.nowSec,
          half: draft.currentHalf,
          teamIdx,
          type:
            kind === "goal"
              ? via === "free"
                ? "Free Goal"
                : "Goal"
              : via === "free"
              ? "Free Point"
              : "Point",
          kind,
          via,
          playerNumber: n,
        });
        if (draft.events.length > 500)
          draft.events.splice(0, draft.events.length - 500);
        return;
      }

      case "MISS": {
        const { teamIdx, playerNumber, nowSec } = action;
        const team = draft.teams[teamIdx];
        const n = Number(playerNumber) || 0;
        const row = ensurePlayerRow(team, n);

        row.attempts += 1; // attempt, not made

        draft.events.push({
          t: nowSec,
          half: draft.currentHalf,
          teamIdx,
          type: "Miss/Save",
          playerNumber: n,
        });

        if (draft.events.length > 500)
          draft.events.splice(0, draft.events.length - 500);
        return;
      }

      case "CARD": {
        const { teamIdx, card, playerNumber, nowSec } = action;
        const team = draft.teams[teamIdx];
        const n = Number(playerNumber);
        const k = key(teamIdx, n);
        const pos = team.positionByNumber[n]; // may be undefined/null

        if (card === "red") {
          draft.reds[k] = true;
          if (pos != null) {
            team.onField[pos] = null;
            delete team.positionByNumber[n];
          }
          draft.events.push({
            t: nowSec,
            half: draft.currentHalf,
            teamIdx,
            type: "Red Card",
            playerNumber: n,
            prevPos: pos ?? null,
          });
          return;
        }

        // yellow or second yellow
        const prevYellow = draft.yellows[k];
        const hasActive =
          Array.isArray(prevYellow) &&
          prevYellow.some((r) => r.expiresAt > nowSec);
        if (hasActive) {
          draft.reds[k] = true;
          delete draft.yellows[k];
          if (pos != null) {
            team.onField[pos] = null;
            delete team.positionByNumber[n];
          }
          draft.events.push({
            t: nowSec,
            half: draft.currentHalf,
            teamIdx,
            type: "Second Yellow → Red",
            playerNumber: n,
            prevPos: pos ?? null,
            prevYellow,
          });
          return;
        }

        const rec = {
          at: nowSec,
          expiresAt: Math.min(nowSec + 10 * 60, TOTAL_GAME_SECONDS),
        };
        draft.yellows[k] = [rec];
        if (pos != null) {
          team.onField[pos] = null;
          delete team.positionByNumber[n];
        }
        draft.events.push({
          t: nowSec,
          half: draft.currentHalf,
          teamIdx,
          type: "Yellow Card (10m)",
          playerNumber: n,
          prevPos: pos ?? null,
          yellowRec: rec,
        });
        return;
      }

      case "SUB": {
        const { teamIdx, inNumber, outNumber, nowSec } = action;
        const team = draft.teams[teamIdx];
        const outPos = team.positionByNumber[outNumber];
        if (outPos == null) return;
        const inKey = key(teamIdx, inNumber);
        if (draft.reds[inKey]) return;

        team.onField[outPos] = inNumber;
        team.positionByNumber[inNumber] = outPos;
        delete team.positionByNumber[outNumber];

        draft.events.push({
          t: nowSec,
          half: draft.currentHalf,
          teamIdx,
          type: "Substitution",
          inNumber,
          outNumber,
          pos: outPos,
        });
        if (draft.events.length > 500)
          draft.events.splice(0, draft.events.length - 500);
        return;
      }

      case "RESTORE_SINBIN": {
        const { teamIdx, number, nowSec } = action;
        const team = draft.teams[teamIdx];
        const k = key(teamIdx, number);
        const prevYellow = draft.yellows[k];
        if (!Array.isArray(prevYellow) || prevYellow.length === 0) return;

        // first empty slot
        let targetPos: number | null = null;
        for (let i = 0; i < 15; i++)
          if (team.onField[i] == null) {
            targetPos = i;
            break;
          }
        if (targetPos == null) return;

        team.onField[targetPos] = number;
        team.positionByNumber[number] = targetPos;
        delete draft.yellows[k];

        draft.events.push({
          t: nowSec,
          half: draft.currentHalf,
          teamIdx,
          type: "Return from Sin-bin",
          playerNumber: number,
          pos: targetPos,
          prevYellow,
        });
        return;
      }

      // ---- tiny, event-only undo ----
      case "UNDO_LAST_EVENT": {
        const e = draft.events.pop();
        if (!e) return;

        const team = draft.teams[e.teamIdx];

        switch (e.type) {
          case "Goal":
          case "Free Goal": {
            // reverse scoreboard + player stats
            team.score.goals = Math.max(0, team.score.goals - 1);
            const n = Number(e.playerNumber) || 0;
            const row = ensurePlayerRow(team, n);
            row.goals = Math.max(0, row.goals - 1);
            row.made = Math.max(0, row.made - 1); // NEW
            row.attempts = Math.max(0, row.attempts - 1); // NEW
            if (e.type === "Free Goal")
              row.freesGoals = Math.max(0, row.freesGoals - 1);
            return;
          }
          case "Point":
          case "Free Point": {
            team.score.points = Math.max(0, team.score.points - 1);
            const n = Number(e.playerNumber) || 0;
            const row = ensurePlayerRow(team, n);
            row.points = Math.max(0, row.points - 1);
            row.made = Math.max(0, row.made - 1); // NEW
            row.attempts = Math.max(0, row.attempts - 1); // NEW
            if (e.type === "Free Point")
              row.freesPoints = Math.max(0, row.freesPoints - 1);
            return;
          }
          case "Miss/Save": {
            const n = Number(e.playerNumber) || 0;
            const row = ensurePlayerRow(team, n);
            row.attempts = Math.max(0, row.attempts - 1);
            return;
          }
          case "Yellow Card (10m)": {
            // put player back (best effort) and remove yellow
            const n = Number(e.playerNumber);
            const k = key(e.teamIdx, n);
            // remove the exact yellow we added (or just clear)
            delete draft.yellows[k];
            const prevPos = e.prevPos as number | null;
            if (prevPos != null && team.onField[prevPos] == null) {
              team.onField[prevPos] = n;
              team.positionByNumber[n] = prevPos;
            } else {
              // fallback: first empty slot
              for (let i = 0; i < 15; i++)
                if (team.onField[i] == null) {
                  team.onField[i] = n;
                  team.positionByNumber[n] = i;
                  break;
                }
            }
            return;
          }
          case "Second Yellow → Red": {
            const n = Number(e.playerNumber);
            const k = key(e.teamIdx, n);
            // remove red, restore previous yellow(s) if we have them
            delete draft.reds[k];
            if (e.prevYellow) draft.yellows[k] = e.prevYellow;
            const prevPos = e.prevPos as number | null;
            if (prevPos != null && team.onField[prevPos] == null) {
              team.onField[prevPos] = n;
              team.positionByNumber[n] = prevPos;
            } else {
              for (let i = 0; i < 15; i++)
                if (team.onField[i] == null) {
                  team.onField[i] = n;
                  team.positionByNumber[n] = i;
                  break;
                }
            }
            return;
          }
          case "Red Card": {
            const n = Number(e.playerNumber);
            const k = key(e.teamIdx, n);
            delete draft.reds[k];
            const prevPos = e.prevPos as number | null;
            if (prevPos != null && team.onField[prevPos] == null) {
              team.onField[prevPos] = n;
              team.positionByNumber[n] = prevPos;
            } else {
              for (let i = 0; i < 15; i++)
                if (team.onField[i] == null) {
                  team.onField[i] = n;
                  team.positionByNumber[n] = i;
                  break;
                }
            }
            return;
          }
          case "Substitution": {
            const pos = e.pos as number;
            const inN = e.inNumber as number;
            const outN = e.outNumber as number;
            // invert: put outN back in the same pos, bench inN
            if (team.onField[pos] === inN) {
              team.onField[pos] = outN;
              team.positionByNumber[outN] = pos;
              delete team.positionByNumber[inN];
            }
            return;
          }
          case "Return from Sin-bin": {
            const n = Number(e.playerNumber);
            const k = key(e.teamIdx, n);
            // remove from field at recorded pos and restore yellow(s)
            const pos = e.pos as number | null;
            if (pos != null && team.onField[pos] === n) {
              team.onField[pos] = null;
              delete team.positionByNumber[n];
            } else {
              // if not at pos for some reason, try to remove wherever it is
              const p = team.positionByNumber[n];
              if (p != null) {
                team.onField[p] = null;
                delete team.positionByNumber[n];
              }
            }
            if (e.prevYellow) draft.yellows[k] = e.prevYellow;
            return;
          }
          default:
            return; // non-undoable event types
        }
      }

      case "SET_HALF": {
        draft.currentHalf = action.half;
        return;
      }

      case "IMPORT":
        return action.state as AppState;

      default:
        return;
    }
  });
}

export { defaultSquad, defaultOnField, buildPositionByNumber, initialTeam };
