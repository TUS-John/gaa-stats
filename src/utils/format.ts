export const pad2 = (n: number) => String(n).padStart(2, '0');
export const fmtClock = (s: number) => {
  const neg = s < 0;
  const abs = Math.abs(s);
  return `${neg ? '-' : ''}${Math.floor(abs / 60)}:${pad2(abs % 60)}`;
};
export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
export const totalPoints = (s: { goals: number; points: number }) => s.goals * 3 + s.points;

export function fmtFreeSuffix(gf: number, pf: number) {
  const g = gf || 0, p = pf || 0;
  if (g === 0 && p === 0) return '';
  return ` (${g}-${p}f)`;
}
export function fmtPlayerLine(r: { goals: number; points: number; freesGoals?: number; freesPoints?: number; total: number; }) {
  const main = `${r.goals}-${r.points}`;
  const f = fmtFreeSuffix(r.freesGoals || 0, r.freesPoints || 0);
  const total = ` (${r.total})`;
  return `${main}${f}${total}`;
}
