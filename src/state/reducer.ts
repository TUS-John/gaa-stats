import { HALF_SECONDS, TOTAL_GAME_SECONDS, POSITIONS, FRONT_THREE } from './constants';
import type { AppState } from './types';
import { clone } from '../utils/format';

const defaultSquad = (names: string[] = []) => Array.from({ length: 30 }, (_, i) => ({ number: i + 1, name: names[i] || '' }));
const defaultOnField = () => Array.from({ length: 15 }, (_, i) => i + 1);
const buildPositionByNumber = (on: (number | null)[]) => { const m: Record<number, number> = {}; on.forEach((num, pos) => { if (num != null) m[num] = pos; }); return m; };
export const key = (teamIdx: number, number: number) => `${teamIdx}|${number}` as const;
function withHistory(state: AppState, next: AppState): AppState { const cap = (state.history || []).slice(-49); return { ...next, history: [...cap, clone(state)] }; }

const initialTeam = () => ({ name: 'Team', squad: defaultSquad([]), onField: defaultOnField(), positionByNumber: buildPositionByNumber(defaultOnField()), score: { goals: 0, points: 0 }, byPlayer: {} as any });
export const initialState: AppState = { setupComplete: false, teams: [{ ...initialTeam(), name: 'Home' }, { ...initialTeam(), name: 'Away' }], running: false, elapsedMs: 0, runAnchorMs: null, heartbeat: 0, currentHalf: 1, events: [], yellows: {}, reds: {}, history: [] };

export default function reducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case 'LOAD': return action.state;
    case 'NEW_MATCH': return clone(initialState);
    case 'SETUP': {
      const { teamA, teamB, rosterA, rosterB } = action;
      const next = clone(initialState); next.setupComplete = true;
      next.teams[0].name = teamA || 'Team A';
      next.teams[0].squad = defaultSquad(rosterA || []);
      next.teams[0].onField = defaultOnField();
      next.teams[0].positionByNumber = buildPositionByNumber(next.teams[0].onField);
      next.teams[1].name = teamB || 'Team B';
      next.teams[1].squad = defaultSquad(rosterB || []);
      next.teams[1].onField = defaultOnField();
      next.teams[1].positionByNumber = buildPositionByNumber(next.teams[1].onField);
      return next;
    }
    case 'TICK': { if (!state.running) return state; return { ...state, heartbeat: (state.heartbeat || 0) + 1 }; }
    case 'START': { if (state.running) return state; return { ...state, running: true, runAnchorMs: action.nowMs }; }
    case 'PAUSE': { if (!state.running) return state; const elapsed = (state.elapsedMs || 0) + (action.nowMs - (state.runAnchorMs || action.nowMs)); return { ...state, running: false, elapsedMs: elapsed, runAnchorMs: null }; }
    case 'NEXT_HALF': { const nowMs = action.nowMs; const currentMs = (state.elapsedMs || 0) + (state.running && state.runAnchorMs ? (nowMs - state.runAnchorMs) : 0); const newElapsed = currentMs < HALF_SECONDS * 1000 ? HALF_SECONDS * 1000 : currentMs; return { ...state, currentHalf: 2, elapsedMs: newElapsed, runAnchorMs: state.running ? nowMs : null }; }
    case 'RESET_TIME': {
      const now = action.nowSec || 0; const next = clone(state);
      next.running = false; next.elapsedMs = 0; next.runAnchorMs = null; next.currentHalf = 1;
      const ny: Record<string, any[]> = {};
      for (const k in state.yellows) { const recs = (state.yellows as any)[k]; if (!Array.isArray(recs)) continue; ny[k] = recs.map((r: any) => ({ ...r, at: 0, expiresAt: Math.max(0, (r.expiresAt || 0) - now) })); }
      next.yellows = ny; return withHistory(state, next);
    }
    case 'RESET_ALL': {
      const next = clone(state);
      next.running = false; next.elapsedMs = 0; next.runAnchorMs = null; next.currentHalf = 1;
      next.events = []; next.yellows = {}; next.reds = {};
      for (const t of next.teams as any[]) { t.score = { goals: 0, points: 0 }; t.byPlayer = {}; }
      return withHistory(state, next);
    }
    case 'SCORE': {
      const { teamIdx, kind, via, playerNumber } = action;
      const next = clone(state);
      const team = next.teams[teamIdx] as any;
      if (kind === 'goal') team.score.goals += 1; else team.score.points += 1;
      const n = Number(playerNumber) || 0;
      const squadEntry = team.squad[n - 1] || { name: '' };
      team.byPlayer[n] = team.byPlayer[n] || { name: (n === 0 ? 'Unknown' : (squadEntry.name || `#${n}`)), goals: 0, points: 0, freesGoals: 0, freesPoints: 0 };
      if (kind === 'goal') { team.byPlayer[n].goals += 1; if (via === 'free') team.byPlayer[n].freesGoals += 1; }
      else { team.byPlayer[n].points += 1; if (via === 'free') team.byPlayer[n].freesPoints += 1; }
      next.events.push({ t: action.nowSec, half: next.currentHalf, teamIdx, type: (kind === 'goal' ? (via === 'free' ? 'Free Goal' : 'Goal') : (via === 'free' ? 'Free Point' : 'Point')), playerNumber: n, name: (n === 0 ? 'Unknown' : (squadEntry.name || '')) });
      return withHistory(state, next);
    }
    case 'CARD': {
      const { teamIdx, card, playerNumber } = action;
      const next = clone(state); const team = next.teams[teamIdx] as any; const n = Number(playerNumber); const k = key(teamIdx, n); const pos = team.positionByNumber[n];
      if (card === 'red') { (next.reds as any)[k] = true; if (pos != null) { team.onField[pos] = null; delete team.positionByNumber[n]; } next.events.push({ t: action.nowSec, half: next.currentHalf, teamIdx, type: 'Red Card', playerNumber: n, name: (n === 0 ? 'Unknown' : (team.squad[n - 1]?.name || '')) }); return withHistory(state, next); }
      const hasActive = Array.isArray((next.yellows as any)[k]) && (next.yellows as any)[k].some((r: any) => r.expiresAt > action.nowSec);
      if (hasActive) { (next.reds as any)[k] = true; delete (next.yellows as any)[k]; if (pos != null) { team.onField[pos] = null; delete team.positionByNumber[n]; } next.events.push({ t: action.nowSec, half: next.currentHalf, teamIdx, type: 'Second Yellow → Red', playerNumber: n, name: (n === 0 ? 'Unknown' : (team.squad[n - 1]?.name || '')) }); return withHistory(state, next); }
      const expiresAt = Math.min(action.nowSec + 10 * 60, TOTAL_GAME_SECONDS);
      (next.yellows as any)[k] = [{ at: action.nowSec, expiresAt, pos }];
      if (pos != null) { team.onField[pos] = null; delete team.positionByNumber[n]; }
      next.events.push({ t: action.nowSec, half: next.currentHalf, teamIdx, type: 'Yellow Card (10m)', playerNumber: n, name: (n === 0 ? 'Unknown' : (team.squad[n - 1]?.name || '')) });
      return withHistory(state, next);
    }
    case 'SUB': {
      const { teamIdx, inNumber, outNumber } = action;
      const next = clone(state); const team = next.teams[teamIdx] as any; const outPos = team.positionByNumber[outNumber];
      if (outPos == null) return state;
      const inKey = key(teamIdx, inNumber);
      if ((next.reds as any)[inKey]) return state;
      team.onField[outPos] = inNumber; team.positionByNumber[inNumber] = outPos; delete team.positionByNumber[outNumber];
      next.events.push({ t: action.nowSec, half: next.currentHalf, teamIdx, type: 'Substitution', detail: `#${inNumber} for #${outNumber}`, playerNumber: inNumber, name: team.squad[inNumber - 1]?.name || '' });
      return withHistory(state, next);
    }
    case 'MOVE': {
      const { teamIdx, sourceNumber, targetPos } = action;
      const next = clone(state); const team = next.teams[teamIdx] as any; const srcPos = team.positionByNumber[sourceNumber];
      if (srcPos == null) return state;
      if (FRONT_THREE.includes(srcPos) && FRONT_THREE.includes(targetPos)) {
        const cycle = FRONT_THREE; const tIdx = cycle.indexOf(targetPos);
        if (tIdx !== -1) {
          const path: number[] = []; for (let i = 0; i < cycle.length; i++) path.push(cycle[(tIdx + i) % cycle.length]);
          const nums = path.map((p) => team.onField[p]);
          const srcNum = team.onField[srcPos];
          const after = [srcNum, ...nums.slice(0, nums.length - 1)];
          path.forEach((p, i) => { team.onField[p] = after[i]; if (after[i] != null) team.positionByNumber[after[i] as number] = p; });
          next.events.push({ t: action.nowSec, half: next.currentHalf, teamIdx, type: 'Position Rotate (Front 3)', detail: `#${action.sourceNumber} → ${POSITIONS[targetPos]}` });
          return withHistory(state, next);
        }
      }
      const targetOccupant = team.onField[targetPos];
      team.onField[targetPos] = action.sourceNumber; team.positionByNumber[action.sourceNumber] = targetPos;
      if (targetOccupant != null) { team.onField[srcPos] = targetOccupant; team.positionByNumber[targetOccupant] = srcPos; }
      else { team.onField[srcPos] = null; delete team.positionByNumber[action.sourceNumber]; }
      next.events.push({ t: action.nowSec, half: next.currentHalf, teamIdx, type: 'Position Move', detail: `#${action.sourceNumber} → ${POSITIONS[targetPos]}` });
      return withHistory(state, next);
    }
    case 'RESTORE_SINBIN': {
      const { teamIdx, number } = action;
      const next = clone(state); const team = next.teams[teamIdx] as any;
      const k = key(teamIdx, number); const recs = (next.yellows as any)[k];
      if (!Array.isArray(recs) || recs.length === 0) return state;
      const rec = recs[0];
      if (team.positionByNumber[number] != null) { delete (next.yellows as any)[k]; return withHistory(state, next); }
      let targetPos: number | null = (rec.pos != null && team.onField[rec.pos] == null) ? rec.pos : null;
      if (targetPos == null) { for (let i = 0; i < 15; i++) { if (team.onField[i] == null) { targetPos = i; break; } } }
      if (targetPos == null) return state;
      team.onField[targetPos] = number; team.positionByNumber[number] = targetPos; delete (next.yellows as any)[k];
      next.events.push({ t: action.nowSec, half: next.currentHalf, teamIdx, type: 'Return from Sin-bin', playerNumber: number, name: team.squad[number - 1]?.name || '' });
      return withHistory(state, next);
    }
    case 'UNDO': { const hist = state.history || []; if (hist.length === 0) return state; const prev = hist[hist.length - 1]; return { ...prev, history: hist.slice(0, -1) } as AppState; }
    case 'SET_HALF': return { ...state, currentHalf: action.half };
    case 'IMPORT': return action.state;
    default: return state;
  }
}
export { defaultSquad, defaultOnField, buildPositionByNumber, initialTeam };
