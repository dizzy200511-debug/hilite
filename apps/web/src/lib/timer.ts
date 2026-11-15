import { useSyncExternalStore } from 'react';
import { fmtClock } from './dates';
import { store } from './store';
import { DEFAULT_FOCUS, type Focus } from './types';

export type TimerMode = 'work' | 'short' | 'long';
interface TimerState { mode: TimerMode; running: boolean; endAt: number; left: number | null; startedAt: number | null; count: number; specId?: string }
const KEY = 'hilite:timer';
let s: TimerState = { mode: 'work', running: false, endAt: 0, left: null, startedAt: null, count: 0 };
try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved) s = { ...s, ...saved }; } catch { /* ignore */ }
const listeners = new Set<() => void>();
let version = 0;
const emit = () => { version++; listeners.forEach((l) => l()); try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } };
const focus = (): Focus => ({ ...DEFAULT_FOCUS, ...store.get<Focus>('focus', DEFAULT_FOCUS) });

export const lengthOf = (m: TimerMode) => { const f = focus(); return (m === 'work' ? f.work : m === 'short' ? f.brk : f.lbrk) * 60000; };
export const timeLeft = () => (s.running ? Math.max(0, s.endAt - Date.now()) : s.left ?? lengthOf(s.mode));
export const timerState = () => s;

function logSession(mins: number) {
  if (mins < 1) return;
  const f = focus();
  const sessions = f.sessions.concat({ s: Date.now() - mins * 60000, m: Math.round(mins), specId: s.specId }).slice(-4000);
  store.set('focus', { ...f, sessions });
}
function chime() {
  try {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const a = new C();
    [0, 0.2, 0.4].forEach((t, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.value = i === 2 ? 880 : 660; o.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(0.0001, a.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.18, a.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t + 0.2);
      o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.22);
    });
  } catch { /* no audio */ }
}
function finish() {
  chime();
  if (s.mode === 'work') {
    logSession(lengthOf('work') / 60000);
    s.count++;
    s.mode = s.count % focus().every === 0 ? 'long' : 'short';
    window.hiliteDesktop?.notify('Focus session done', 'Nice work. Time for a break.');
    s.left = null; s.startedAt = Date.now(); s.endAt = Date.now() + lengthOf(s.mode); s.running = true;
  } else {
    window.hiliteDesktop?.notify('Break over', 'Ready for the next focus session?');
    s.mode = 'work'; s.running = false; s.left = null; s.startedAt = null;
  }
  emit();
}
setInterval(() => {
  if (!s.running) return;
  if (timeLeft() <= 0) finish();
  window.hiliteDesktop?.setTimer(s.running ? (s.mode === 'work' ? 'Focus ' : 'Break ') + fmtClock(timeLeft()) : null);
  version++; listeners.forEach((l) => l());
}, 500);

export const timer = {
  start() { if (s.running) return; s.endAt = Date.now() + timeLeft(); s.startedAt = s.startedAt ?? Date.now(); s.running = true; s.left = null; emit(); },
  pause() { s.left = timeLeft(); s.running = false; emit(); window.hiliteDesktop?.setTimer(null); },
  stop() {
    if (s.mode === 'work' && s.startedAt) { const worked = (lengthOf('work') - timeLeft()) / 60000; if (worked >= 5) logSession(worked); }
    s.running = false; s.left = null; s.startedAt = null; if (s.mode !== 'work') s.mode = 'work'; emit(); window.hiliteDesktop?.setTimer(null);
  },
  setMode(m: TimerMode) { s.mode = m; s.running = false; s.left = null; s.startedAt = null; emit(); },
  setSubject(specId?: string) { s.specId = specId; emit(); },
  refresh() { if (!s.running && !s.startedAt) s.left = null; emit(); },
};
export function useTimer() {
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => version);
  return { ...s, left: timeLeft(), total: lengthOf(s.mode) };
}
