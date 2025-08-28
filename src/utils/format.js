export const pad2 = (n) => String(n).padStart(2, '0');
export const fmtClock = (s) => {
    const neg = s < 0;
    const abs = Math.abs(s);
    return `${neg ? '-' : ''}${Math.floor(abs / 60)}:${pad2(abs % 60)}`;
};
export const clone = (o) => JSON.parse(JSON.stringify(o));
export const totalPoints = (s) => s.goals * 3 + s.points;
export function fmtFreeSuffix(gf, pf) {
    const g = gf || 0, p = pf || 0;
    if (g === 0 && p === 0)
        return '';
    return ` (${g}-${p}f)`;
}
export function fmtPlayerLine(r) {
    const main = `${r.goals}-${r.points}`;
    const f = fmtFreeSuffix(r.freesGoals || 0, r.freesPoints || 0);
    const total = ` (${r.total})`;
    return `${main}${f}${total}`;
}
