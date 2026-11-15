import { useCallback, useSyncExternalStore } from 'react';
import { supabase, LOCAL_MODE } from './supabase';

interface Meta { updatedAt: number; dirty: boolean; deleted?: boolean }
export type SyncState = 'idle' | 'saving' | 'offline' | 'error';
const MAX_DOC_CHARS = 480_000;

class DocStore {
  private uid: string | null = null;
  private docs = new Map<string, unknown>();
  private meta = new Map<string, Meta>();
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private syncing = false;
  version = 0;
  syncState: SyncState = 'idle';
  lastSynced = 0;

  private prefix() { return 'hilite:' + this.uid + ':'; }
  private notify() { this.version++; this.listeners.forEach((l) => l()); }
  subscribe = (l: () => void) => { this.listeners.add(l); return () => { this.listeners.delete(l); }; };

  open(uid: string) {
    if (this.uid === uid) return;
    this.uid = uid; this.docs.clear(); this.meta.clear();
    try {
      const p = this.prefix();
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (!k.startsWith(p)) continue;
        const rec = JSON.parse(localStorage.getItem(k) || 'null');
        if (!rec) continue;
        const key = k.slice(p.length);
        this.meta.set(key, rec.m);
        if (!rec.m.deleted) this.docs.set(key, rec.d);
      }
    } catch { /* storage unavailable: run in memory */ }
    this.notify();
    void this.sync();
  }
  close() { this.uid = null; this.docs.clear(); this.meta.clear(); this.notify(); }

  get<T>(key: string, fallback: T): T {
    return (this.docs.has(key) ? (this.docs.get(key) as T) : fallback);
  }
  keys(prefix = '') { return Array.from(this.docs.keys()).filter((k) => k.startsWith(prefix)); }

  set<T>(key: string, value: T) {
    const json = JSON.stringify(value);
    if (json.length > MAX_DOC_CHARS) throw new Error('This is too big to save. Try splitting it into smaller decks.');
    this.docs.set(key, value);
    this.write(key, value, { updatedAt: Date.now(), dirty: true });
  }
  remove(key: string) {
    this.docs.delete(key);
    this.write(key, null, { updatedAt: Date.now(), dirty: true, deleted: true });
  }
  private write(key: string, value: unknown, m: Meta) {
    this.meta.set(key, m);
    try { localStorage.setItem(this.prefix() + key, JSON.stringify({ m, d: value })); } catch { /* full */ }
    this.notify();
    this.schedule();
  }
  private schedule() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.sync(), 1200);
  }
  private setState(s: SyncState) { if (this.syncState !== s) { this.syncState = s; this.notify(); } }

  /** Two-way sync, newest change wins per document. */
  async sync() {
    if (LOCAL_MODE || !supabase || !this.uid || this.syncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) { this.setState('offline'); return; }
    this.syncing = true; this.setState('saving');
    const uid = this.uid;
    try {
      const { data: remote, error } = await supabase.from('user_docs').select('key, updated_at, deleted');
      if (error) throw error;
      const pull: string[] = [];
      const remoteMap = new Map<string, { updated_at: number; deleted: boolean }>();
      (remote || []).forEach((r) => remoteMap.set(r.key, r));
      remoteMap.forEach((r, key) => {
        const m = this.meta.get(key);
        if (!m || (!m.dirty && r.updated_at > m.updatedAt) || (m.dirty && r.updated_at > m.updatedAt)) pull.push(key);
      });
      if (pull.length) {
        for (let i = 0; i < pull.length; i += 50) {
          const { data, error: e2 } = await supabase.from('user_docs').select('key, data, updated_at, deleted').in('key', pull.slice(i, i + 50));
          if (e2) throw e2;
          (data || []).forEach((r) => {
            if (this.uid !== uid) return;
            const m = { updatedAt: r.updated_at, dirty: false, deleted: r.deleted };
            this.meta.set(r.key, m);
            if (r.deleted) this.docs.delete(r.key); else this.docs.set(r.key, r.data);
            try { localStorage.setItem(this.prefix() + r.key, JSON.stringify({ m, d: r.deleted ? null : r.data })); } catch { /* ignore */ }
          });
        }
      }
      const push: { user_id: string; key: string; data: unknown; updated_at: number; deleted: boolean }[] = [];
      this.meta.forEach((m, key) => {
        const r = remoteMap.get(key);
        if (m.dirty && (!r || m.updatedAt >= r.updated_at)) push.push({ user_id: uid, key, data: m.deleted ? null : this.docs.get(key) ?? null, updated_at: m.updatedAt, deleted: !!m.deleted });
      });
      for (let i = 0; i < push.length; i += 25) {
        const { error: e3 } = await supabase.from('user_docs').upsert(push.slice(i, i + 25), { onConflict: 'user_id,key' });
        if (e3) throw e3;
      }
      push.forEach((p) => {
        const m = this.meta.get(p.key);
        if (m && m.updatedAt === p.updated_at) { m.dirty = false; try { localStorage.setItem(this.prefix() + p.key, JSON.stringify({ m, d: p.deleted ? null : this.docs.get(p.key) })); } catch { /* ignore */ } }
      });
      this.lastSynced = Date.now();
      this.setState('idle');
    } catch {
      this.setState(navigator.onLine ? 'error' : 'offline');
    } finally {
      this.syncing = false;
      this.notify();
    }
  }

  exportAll() { const o: Record<string, unknown> = {}; this.docs.forEach((v, k) => { o[k] = v; }); return o; }
  /** Merge a backup in. Only well-formed keys are accepted. Returns how many items were restored. */
  importAll(data: Record<string, unknown>) {
    let n = 0;
    Object.keys(data).forEach((k) => {
      if (!/^[a-zA-Z0-9_-]{1,80}$/.test(k) || data[k] == null) return;
      try { this.set(k, data[k]); n++; } catch { /* too big: skip */ }
    });
    return n;
  }
  /** Remove this account's local copy (used after deleting the account). */
  wipe() {
    if (!this.uid) return;
    const p = this.prefix();
    try { Object.keys(localStorage).filter((k) => k.startsWith(p)).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
    this.close();
  }
  sizeChars() { let n = 0; this.docs.forEach((v) => { n += JSON.stringify(v).length; }); return n; }
}

export const store = new DocStore();
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void store.sync());
  setInterval(() => void store.sync(), 60_000);
}

export function useStoreVersion() {
  return useSyncExternalStore(store.subscribe, () => store.version);
}
export function useDoc<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  useStoreVersion();
  const value = store.get<T>(key, fallback);
  const update = useCallback((next: T | ((prev: T) => T)) => {
    const prev = store.get<T>(key, fallback);
    store.set(key, typeof next === 'function' ? (next as (p: T) => T)(prev) : next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [value, update];
}
