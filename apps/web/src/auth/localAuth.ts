/**
 * Local mode stand-in for Supabase auth, so sign-up, email codes, sign-in and password reset can be tried
 * without a backend. Accounts live in this browser only and no email is sent: the code is shown on screen.
 * Each local account gets its own data, so a new sign-up starts with onboarding like a real one.
 */
import { AuthError, BAD_LOGIN } from './AuthProvider';

interface LocalAccount { hash: string; confirmed: boolean }
const ACCOUNTS = 'hilite:localAccounts';
const SESSION = 'hilite:localSession';

function read(): Record<string, LocalAccount> {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS) || '{}') || {}; } catch { return {}; }
}
function write(a: Record<string, LocalAccount>) {
  try { localStorage.setItem(ACCOUNTS, JSON.stringify(a)); } catch { /* storage unavailable */ }
}
async function hash(pw: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('hilite-local:' + pw));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}
const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

/** The data store id for a local account: stable per email. */
export function localStoreId(email: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < email.length; i++) { h ^= email.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return 'local_' + (h >>> 0).toString(16);
}

export function localSession(): string | null {
  try { const e = localStorage.getItem(SESSION); return e && read()[e]?.confirmed ? e : null; } catch { return null; }
}

/** Codes waiting to be entered, by email and purpose. Kept in memory, like a real email that only this tab can see. */
const pending = new Map<string, string>();
const WRONG_CODE = 'That code is wrong or has expired. Check the latest email, or send a new code.';

export const localAuth = {
  /** Returns the code to show on screen, or null if no email would be sent. */
  async signUp(email: string, password: string): Promise<string | null> {
    const all = read();
    // Like Supabase: an existing account gets no code and no hint that it exists.
    if (all[email]?.confirmed) return null;
    all[email] = { hash: await hash(password), confirmed: false };
    write(all);
    const code = newCode(); pending.set('signup:' + email, code); return code;
  },
  resendSignUp(email: string): string | null {
    if (!read()[email] || read()[email].confirmed) return null;
    const code = newCode(); pending.set('signup:' + email, code); return code;
  },
  confirmSignUp(email: string, code: string) {
    if (pending.get('signup:' + email) !== code) throw new AuthError(WRONG_CODE);
    pending.delete('signup:' + email);
    const all = read(); all[email] = { ...all[email], confirmed: true }; write(all);
    this.start(email);
  },
  /** 'ok', or a code to show when the email still needs confirming. */
  async signIn(email: string, password: string): Promise<'ok' | { code: string }> {
    const acc = read()[email];
    if (!acc || acc.hash !== await hash(password)) throw new AuthError(BAD_LOGIN);
    if (!acc.confirmed) { const code = newCode(); pending.set('signup:' + email, code); return { code }; }
    this.start(email);
    return 'ok';
  },
  sendReset(email: string): string | null {
    if (!read()[email]) return null;
    const code = newCode(); pending.set('reset:' + email, code); return code;
  },
  async confirmReset(email: string, code: string, password: string) {
    if (!read()[email] || pending.get('reset:' + email) !== code) throw new AuthError(WRONG_CODE);
    pending.delete('reset:' + email);
    const all = read(); all[email] = { hash: await hash(password), confirmed: true }; write(all);
    this.start(email);
  },
  start(email: string) { try { localStorage.setItem(SESSION, email); } catch { /* ignore */ } },
  end() { try { localStorage.removeItem(SESSION); } catch { /* ignore */ } },
};
