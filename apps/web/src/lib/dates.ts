export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad2 = (n: number) => (n < 10 ? '0' : '') + n;

/** A study day runs 4am to 4am, so late-night work counts towards the day before. */
export const DAY_START_HOUR = 4;

export function dayKey(ms: number): string {
  const d = new Date(ms);
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}
export const studyDayOf = (ms: number) => dayKey(ms - DAY_START_HOUR * 3600e3);
export const today = () => studyDayOf(Date.now());
export function keyDate(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}
export function addDays(k: string, n: number): string {
  const d = keyDate(k);
  d.setDate(d.getDate() + n);
  return dayKey(d.getTime());
}
export const daysBetween = (a: string, b: string) => Math.round((keyDate(b).getTime() - keyDate(a).getTime()) / 864e5);
export const dow = (k: string) => keyDate(k).getDay();
export function fmtDay(k: string): string {
  const d = keyDate(k);
  return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
}
export function fmtDayLong(k: string): string {
  const d = keyDate(k);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
export function relDay(k: string): string {
  const t = today();
  if (k === t) return 'Today';
  if (k === addDays(t, 1)) return 'Tomorrow';
  if (k === addDays(t, -1)) return 'Yesterday';
  return fmtDay(k);
}
export function fmtMins(m: number): string {
  m = Math.round(m || 0);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return h + 'h' + (r ? ' ' + r + 'm' : '');
}
export const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
};
export function greeting(): string {
  const h = new Date().getHours();
  return h < 5 ? 'Late one' : h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
}
export const isWeekend = (k: string) => dow(k) === 0 || dow(k) === 6;
