import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { LOCAL_MODE, SITE_URL, supabase } from '../lib/supabase';
import { deviceId, deviceName } from '../lib/device';
import { store } from '../lib/store';
import { localAuth, localSession, localStoreId } from './localAuth';

export type Plan = 'free' | 'pro';
interface AuthState {
  loading: boolean;
  user: User | null;
  deviceTrusted: boolean;
  plan: Plan;
  isOwner: boolean;
  localMode: boolean;
  /** Local mode only: the email code to show on screen, since no email is sent. */
  devCode: string | null;
  signUp(email: string, password: string): Promise<void>;
  confirmSignUp(email: string, code: string): Promise<void>;
  resendSignUp(email: string): Promise<void>;
  signIn(email: string, password: string): Promise<'ok' | 'confirm'>;
  signInWithGoogle(): Promise<void>;
  sendDeviceCode(): Promise<void>;
  verifyDeviceCode(code: string): Promise<void>;
  sendReset(email: string): Promise<void>;
  confirmReset(email: string, code: string, password: string): Promise<void>;
  signOut(everywhere?: boolean): Promise<void>;
  refreshPlan(): Promise<void>;
}
const Ctx = createContext<AuthState | null>(null);
export const useAuth = () => useContext(Ctx)!;

/** One message for every sign-in failure, so nobody can tell which emails have accounts. */
export const BAD_LOGIN = 'Email or password is incorrect.';
export class AuthError extends Error {}

function friendly(e: unknown, fallback: string): AuthError {
  const msg = (e as { message?: string })?.message || '';
  if (/rate limit|too many/i.test(msg)) return new AuthError('Too many attempts. Wait a few minutes and try again.');
  if (/expired|invalid.*(otp|token|code)|token.*(invalid|expired)/i.test(msg)) return new AuthError('That code is wrong or has expired. Check the latest email, or send a new code.');
  if (/network|fetch/i.test(msg)) return new AuthError('Can’t reach Hilite. Check your internet connection and try again.');
  return new AuthError(fallback);
}

async function hashDevice(): Promise<string> {
  const data = new TextEncoder().encode(deviceId());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

const localPlan = () => { try { return localStorage.getItem('hilite:localPlan'); } catch { return null; } };
const localUser = (email: string) => ({ id: localStoreId(email), email, user_metadata: {} }) as unknown as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [deviceTrusted, setDeviceTrusted] = useState(false);
  const [plan, setPlan] = useState<Plan>('free');
  const [isOwner, setIsOwner] = useState(false);
  const [localEmail, setLocalEmail] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const startLocal = (email: string) => { store.open(localStoreId(email)); setLocalEmail(email); setDevCode(null); };

  const checkDevice = useCallback(async (s: Session | null) => {
    if (!supabase || !s) { setDeviceTrusted(false); return; }
    const hash = await hashDevice();
    const { data } = await supabase.from('trusted_devices').select('id').eq('device_hash', hash).maybeSingle();
    setDeviceTrusted(!!data);
    if (data) void supabase.rpc('touch_device', { p_hash: hash });
  }, []);

  const refreshPlan = useCallback(async () => {
    if (!supabase) { setPlan(localPlan() === 'pro' ? 'pro' : 'free'); return; }
    const { data } = await supabase.from('profiles').select('plan, is_owner').maybeSingle();
    setPlan(data?.plan === 'pro' ? 'pro' : 'free');
    setIsOwner(!!data?.is_owner);
  }, []);

  useEffect(() => {
    if (LOCAL_MODE || !supabase) {
      const email = localSession();
      if (email) { store.open(localStoreId(email)); setLocalEmail(email); }
      setPlan(localPlan() === 'pro' ? 'pro' : 'free');
      setDeviceTrusted(true);
      setLoading(false);
      return;
    }
    const sb = supabase;
    const apply = async (s: Session | null) => {
      setSession(s);
      await checkDevice(s);
      if (s) await refreshPlan();
      setLoading(false);
    };
    sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => { void apply(s); });
    if (window.hiliteDesktop) {
      window.hiliteDesktop.onAuthCallback(async (url) => {
        const code = new URL(url).searchParams.get('code');
        if (code) await sb.auth.exchangeCodeForSession(code);
      });
    }
    return () => sub.subscription.unsubscribe();
  }, [checkDevice, refreshPlan]);

  useEffect(() => {
    if (LOCAL_MODE) return;
    if (session && deviceTrusted) store.open(session.user.id); else store.close();
  }, [session, deviceTrusted]);

  const fn = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase!.functions.invoke('device', { body: { ...body, deviceId: deviceId(), deviceName: deviceName() } });
    if (error || data?.error) throw new AuthError(data?.error || 'Something went wrong. Try again.');
    return data;
  };

  const value: AuthState = {
    loading,
    user: LOCAL_MODE ? (localEmail ? localUser(localEmail) : null) : session?.user ?? null,
    deviceTrusted,
    plan,
    // Local mode is the owner, unless you set localStorage 'hilite:localPlan' to 'free' to see what free accounts see.
    isOwner: LOCAL_MODE ? localPlan() !== 'free' : isOwner,
    localMode: LOCAL_MODE,
    devCode,

    async signUp(email, password) {
      if (LOCAL_MODE) { setDevCode(await localAuth.signUp(email, password)); return; }
      const { error } = await supabase!.auth.signUp({ email, password, options: { emailRedirectTo: SITE_URL } });
      // Supabase hides whether an email is already registered, which is what we want.
      if (error) throw friendly(error, 'Couldn’t create your account. Check your details and try again.');
    },
    async confirmSignUp(email, code) {
      if (LOCAL_MODE) { localAuth.confirmSignUp(email, code); startLocal(email); return; }
      const { data, error } = await supabase!.auth.verifyOtp({ email, token: code, type: 'signup' });
      if (error || !data.session) throw friendly(error, 'That code is wrong or has expired.');
      await fn({ action: 'trust-new-account' });
      await checkDevice(data.session);
    },
    async resendSignUp(email) {
      if (LOCAL_MODE) { setDevCode(localAuth.resendSignUp(email)); return; }
      const { error } = await supabase!.auth.resend({ type: 'signup', email });
      if (error) throw friendly(error, 'Couldn’t send a new code. Try again in a minute.');
    },
    async signIn(email, password) {
      if (LOCAL_MODE) {
        const r = await localAuth.signIn(email, password);
        if (r === 'ok') { startLocal(email); return 'ok'; }
        setDevCode(r.code); return 'confirm';
      }
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) {
        if (/not confirmed/i.test(error.message)) { await supabase!.auth.resend({ type: 'signup', email }); return 'confirm'; }
        throw friendly(error, BAD_LOGIN);
      }
      return 'ok';
    },
    async signInWithGoogle() {
      if (LOCAL_MODE) throw new AuthError('Google sign-in works once Hilite is connected to Supabase. In local mode, use email.');
      const redirectTo = window.hiliteDesktop ? 'hilite://auth' : SITE_URL;
      const { data, error } = await supabase!.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: !!window.hiliteDesktop } });
      if (error) throw friendly(error, 'Couldn’t start Google sign-in. Try again.');
      if (window.hiliteDesktop && data.url) window.hiliteDesktop.openExternal(data.url);
    },
    async sendDeviceCode() { if (!LOCAL_MODE) await fn({ action: 'send' }); },
    async verifyDeviceCode(code) {
      if (LOCAL_MODE) return;
      await fn({ action: 'verify', code });
      await checkDevice(session);
    },
    async sendReset(email) {
      if (LOCAL_MODE) { setDevCode(localAuth.sendReset(email)); return; }
      const { error } = await supabase!.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL });
      if (error && !/rate/i.test(error.message)) return;
      if (error) throw friendly(error, 'Try again in a minute.');
    },
    async confirmReset(email, code, password) {
      if (LOCAL_MODE) { await localAuth.confirmReset(email, code, password); startLocal(email); return; }
      const { error } = await supabase!.auth.verifyOtp({ email, token: code, type: 'recovery' });
      if (error) throw friendly(error, 'That code is wrong or has expired.');
      const { error: e2 } = await supabase!.auth.updateUser({ password });
      if (e2) throw friendly(e2, 'Couldn’t set the new password. Try a different one.');
      await fn({ action: 'trust-after-reset' });
      const { data } = await supabase!.auth.getSession();
      await checkDevice(data.session);
    },
    async signOut(everywhere) {
      store.close();
      if (LOCAL_MODE) { localAuth.end(); setLocalEmail(null); setDevCode(null); return; }
      if (supabase) await supabase.auth.signOut({ scope: everywhere ? 'global' : 'local' });
    },
    refreshPlan,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Simple, explainable password strength: length plus variety. */
export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; ok: boolean; tip: string } {
  let s = 0;
  if (pw.length >= 10) s++;
  if (pw.length >= 14) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  const common = /^(password|qwerty|letmein|123456|iloveyou|hilite)/i.test(pw);
  const score = (common ? 0 : Math.min(4, s)) as 0 | 1 | 2 | 3 | 4;
  const ok = pw.length >= 10 && !common;
  const tip = pw.length < 10 ? 'Use at least 10 characters.' : common ? 'That password is too common.' : score < 3 ? 'Good. Mixing in capitals, numbers or symbols makes it stronger.' : 'Strong password.';
  return { score, ok, tip };
}
