export type PlayerStats = { name: string; goals: number; points: number; freesGoals: number; freesPoints: number; };
export type Team = {
  name: string;
  squad: { number: number; name: string }[];
  onField: (number|null)[];
  positionByNumber: Record<number, number>;
  score: { goals: number; points: number };
  byPlayer: Record<number, PlayerStats>;
};
export type YellowRec = { at: number; expiresAt: number; pos?: number|null };
export type AppEvent = { t: number; half: number; teamIdx: number; type: string; detail?: string; playerNumber?: number; name?: string; };
export type AppState = {
  setupComplete: boolean;
  teams: Team[];
  running: boolean;
  elapsedMs: number;
  runAnchorMs: number|null;
  heartbeat: number;
  currentHalf: number;
  events: AppEvent[];
  yellows: Record<string, YellowRec[]>;
  reds: Record<string, boolean>;
  history: any[];
};
