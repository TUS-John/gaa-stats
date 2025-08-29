import { produce } from "immer";
import { HALF_SECONDS, TOTAL_GAME_SECONDS } from "./constants";

// --- helpers / inits (unchanged in spirit) ---
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
  heartbeat: 0, // used by your TICK UI
  currentHalf: 1 as 1 | 2,
  events: [] as any[],
  yellows: {} as Record<string, { at: number; expiresAt: number }[]>,
  reds: {} as Record<string, true>,
  history: [] as any[], // keep small; see pushHistory
};

type AppState = typeof initialState;

// small & safe history (cap to 10). If undo isn’t critical, you can remove history entirely.
function pushHistory(draft: AppState, prev: AppState) {
  const MAX = 10;
  draft.history.push(prev); // NOTE: prev is the *base* (frozen) state reference
  if (draft.history.length > MAX) draft.history.shift();
}

// --- reducer ---
export default function reducer(state: AppState, action: any): AppState {
  return produce(state, (draft) => {
    switch (action.type) {
      case "LOAD": {
        // Replace state entirely
        return action.state as AppState;
      }

      case "NEW_MATCH": {
        return initialState as AppState;
      }

      case "SETUP": {
        const { teamA, teamB, rosterA, rosterB } = action;
        // full replace from initial template
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

      // --- timing ---
      case "TICK": {
        if (!draft.running) return;
        draft.heartbeat += 1;
        return;
      }

      case "START": {
        if (draft.running) return;
        pushHistory(draft, state);
        draft.running = true;
        draft.runAnchorMs = action.nowMs;
        return;
      }

      case "PAUSE": {
        if (!draft.running) return;
        pushHistory(draft, state);
        const now = action.nowMs;
        draft.elapsedMs += now - (draft.runAnchorMs || now);
        draft.runAnchorMs = null;
        draft.running = false;
        return;
      }

      case "NEXT_HALF": {
        pushHistory(draft, state);
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
        pushHistory(draft, state);
        // reset timers
        draft.running = false;
        draft.elapsedMs = 0;
        draft.runAnchorMs = null;
        draft.currentHalf = 1;
        // optional: adjust yellows if you were carrying remaining time; your current app doesn’t need it
        return;
      }

      case "RESET_ALL": {
        pushHistory(draft, state);
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

      // --- gameplay ---
      case "SCORE": {
        pushHistory(draft, state);

        const { teamIdx, kind, via, playerNumber } = action;
        const team = draft.teams[teamIdx];
        if (kind === "goal") team.score.goals += 1;
        else team.score.points += 1;

        const n = Number(playerNumber) || 0;
        const name = n === 0 ? "Unknown" : team.squad[n - 1]?.name || `#${n}`;
        const row = (team.byPlayer[n] ||= {
          name,
          goals: 0,
          points: 0,
          freesGoals: 0,
          freesPoints: 0,
        });
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
          playerNumber: n,
          name: n === 0 ? "Unknown" : team.squad[n - 1]?.name || "",
        });
        // (optional) cap events to keep UI snappy
        if (draft.events.length > 500)
          draft.events.splice(0, draft.events.length - 500);
        return;
      }

      case "CARD": {
        pushHistory(draft, state);

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
            name: n === 0 ? "Unknown" : team.squad[n - 1]?.name || "",
          });
          return;
        }

        // yellow / second yellow
        const recs = draft.yellows[k];
        const hasActive =
          Array.isArray(recs) && recs.some((r) => r.expiresAt > nowSec);
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
            name: n === 0 ? "Unknown" : team.squad[n - 1]?.name || "",
          });
          return;
        }

        const expiresAt = Math.min(nowSec + 10 * 60, TOTAL_GAME_SECONDS);
        draft.yellows[k] = [{ at: nowSec, expiresAt }];
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
          name: n === 0 ? "Unknown" : team.squad[n - 1]?.name || "",
        });
        return;
      }

      case "SUB": {
        pushHistory(draft, state);

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
          detail: `#${inNumber} for #${outNumber}`,
          playerNumber: inNumber,
          name: team.squad[inNumber - 1]?.name || "",
        });
        return;
      }

      case "RESTORE_SINBIN": {
        pushHistory(draft, state);

        const { teamIdx, number, nowSec } = action;
        const team = draft.teams[teamIdx];
        const k = key(teamIdx, number);
        if (!Array.isArray(draft.yellows[k]) || draft.yellows[k].length === 0)
          return;

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
          name: team.squad[number - 1]?.name || "",
        });
        return;
      }

      case "UNDO": {
        const hist = draft.history;
        if (!hist || hist.length === 0) return;
        // Replace entire state with the last snapshot
        const prev = hist[hist.length - 1];
        // pop before returning
        hist.pop();
        return prev as AppState;
      }

      case "SET_HALF": {
        draft.currentHalf = action.half;
        return;
      }

      case "IMPORT": {
        return action.state as AppState;
      }

      default:
        return;
    }
  });
}
