import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthError, BAD_LOGIN, passwordStrength, useAuth } from './AuthProvider';
import { GoogleLogo, IconMail } from '../components/icons';
import { cleanText } from '../lib/sanitize';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <div className="brand"><span className="brand-mark"><i /></span>Hilite</div>
        <div>
          <p className="auth-quote">Every exam, every paper, one plan. <span className="mark">Know exactly what to revise next.</span></p>
        </div>
        <div className="auth-points">
          <div><b>Your real exam dates</b> for AQA, Edexcel and OCR, with countdowns and clash warnings.</div>
          <div><b>Past papers by spec</b>, with marks and grades tracked over time.</div>
          <div><b>A revision plan</b> that schedules every topic before each paper.</div>
        </div>
      </aside>
      <main className="auth-main"><div className="auth-card">{children}</div></main>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return msg ? <div className="error" role="alert">{msg}</div> : null;
}

export function CodeInput({ onComplete, disabled }: { onComplete: (code: string) => void; disabled?: boolean }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);
  const set = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length > 1) {
      const next = clean.slice(0, 6).split('');
      while (next.length < 6) next.push('');
      setDigits(next);
      refs.current[Math.min(5, clean.length)]?.focus();
      if (clean.length >= 6) onComplete(clean.slice(0, 6));
      return;
    }
    const next = digits.slice(); next[i] = clean; setDigits(next);
    if (clean && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d)) onComplete(next.join(''));
  };
  return (
    <div className="code" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={6}
          aria-label={'Digit ' + (i + 1)} disabled={disabled}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }} />
      ))}
    </div>
  );
}

function useCooldown() {
  const [left, setLeft] = useState(0);
  useEffect(() => { if (!left) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);
  return { left, start: () => setLeft(45) };
}

export function SignIn() {
  const auth = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    const em = cleanText(email, 254).toLowerCase();
    if (!EMAIL_RE.test(em) || !password) { setErr(BAD_LOGIN); return; }
    setBusy(true);
    try {
      const r = await auth.signIn(em, password);
      if (r === 'confirm') setConfirm(true); else nav('/');
    } catch (x) { setErr(x instanceof AuthError ? x.message : BAD_LOGIN); }
    setBusy(false);
  };
  if (confirm) return <ConfirmEmail email={cleanText(email).toLowerCase()} />;
  return (
    <AuthFrame>
      <h1>Sign in</h1>
      <p className="lead">Welcome back. Pick up where you left off.</p>
      <ErrorBox msg={err} />
      <button className="google" onClick={() => auth.signInWithGoogle().catch((x) => setErr(x.message))}><GoogleLogo />Continue with Google</button>
      <div className="or">or with email</div>
      <form onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="em">Email</label><input id="em" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field">
          <div className="row between"><label htmlFor="pw">Password</label><Link to="/forgot" className="small">Forgot password?</Link></div>
          <input id="pw" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="fine">New to Hilite? <Link to="/signup">Create an account</Link></p>
    </AuthFrame>
  );
}

export function SignUp() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState('');
  const strength = passwordStrength(password);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    const em = cleanText(email, 254).toLowerCase();
    if (!EMAIL_RE.test(em)) { setErr('Enter a valid email address.'); return; }
    if (!strength.ok) { setErr(strength.tip); return; }
    if (!agree) { setErr('Please agree to the terms and privacy policy to continue.'); return; }
    setBusy(true);
    try { await auth.signUp(em, password); setSent(em); }
    catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };
  if (sent) return <ConfirmEmail email={sent} />;
  return (
    <AuthFrame>
      <h1>Create your account</h1>
      <p className="lead">Free forever for the essentials. Takes a minute.</p>
      <ErrorBox msg={err} />
      <button className="google" onClick={() => auth.signInWithGoogle().catch((x) => setErr(x.message))}><GoogleLogo />Sign up with Google</button>
      <div className="or">or with email</div>
      <form onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="em">Email</label><input id="em" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input id="pw" className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {password && (
            <>
              <div className={'pw-meter ' + (strength.score <= 1 ? 'weak' : strength.score === 2 ? 'ok' : '')}>{[1, 2, 3, 4].map((n) => <i key={n} className={strength.score >= n ? 'on' : ''} />)}</div>
              <span className="hint">{strength.tip}</span>
            </>
          )}
        </div>
        <label className="check small" style={{ marginBottom: 16 }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />I agree to the <Link to="/terms" target="_blank">terms</Link> and <Link to="/privacy" target="_blank">privacy policy</Link></label>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="fine">Already have an account? <Link to="/signin">Sign in</Link></p>
    </AuthFrame>
  );
}

function ConfirmEmail({ email }: { email: string }) {
  const auth = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const cd = useCooldown();
  useEffect(() => { cd.start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const verify = async (code: string) => {
    setBusy(true); setErr('');
    try { await auth.confirmSignUp(email, code); nav('/'); } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };
  return (
    <AuthFrame>
      <div className="avatar" style={{ width: 44, height: 44, marginBottom: 18 }}><IconMail width={20} height={20} /></div>
      <h1>Check your email</h1>
      <p className="lead">We sent a 6-digit code to <b>{email}</b>. It expires in 10 minutes.</p>
      <ErrorBox msg={err} />
      <CodeInput onComplete={verify} disabled={busy} />
      <p className="small muted">Didn’t get it? Check spam, or {cd.left ? <span>send a new code in {cd.left}s</span> : <button className="link" onClick={() => auth.resendSignUp(email).then(cd.start).catch((x) => setErr(x.message))}>send a new code</button>}.</p>
    </AuthFrame>
  );
}

export function DeviceCheck() {
  const auth = useAuth();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const cd = useCooldown();
  const send = () => { setErr(''); auth.sendDeviceCode().then(() => { setSent(true); cd.start(); }).catch((x) => setErr(x.message)); };
  useEffect(send, []); // eslint-disable-line react-hooks/exhaustive-deps
  const verify = async (code: string) => {
    setBusy(true); setErr('');
    try { await auth.verifyDeviceCode(code); } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };
  return (
    <AuthFrame>
      <div className="avatar" style={{ width: 44, height: 44, marginBottom: 18 }}><IconMail width={20} height={20} /></div>
      <h1>Confirm it’s you</h1>
      <p className="lead">{sent ? <>We sent a 6-digit code to <b>{auth.user?.email}</b> to confirm this device.</> : 'Sending a code to your email…'}</p>
      <ErrorBox msg={err} />
      <CodeInput onComplete={verify} disabled={busy} />
      <p className="small muted">You only need to do this once on each device. {cd.left ? <span>New code in {cd.left}s.</span> : <button className="link" onClick={send}>Send a new code</button>}</p>
      <p className="fine"><button className="link" onClick={() => auth.signOut()}>Use a different account</button></p>
    </AuthFrame>
  );
}

export function Forgot() {
  const auth = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const strength = passwordStrength(password);

  const sendCode = async (e: FormEvent) => {
    e.preventDefault(); setErr('');
    const em = cleanText(email, 254).toLowerCase();
    if (!EMAIL_RE.test(em)) { setErr('Enter a valid email address.'); return; }
    setBusy(true);
    try { await auth.sendReset(em); setStage('code'); } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };
  const reset = async (e: FormEvent) => {
    e.preventDefault(); setErr('');
    if (code.length !== 6) { setErr('Enter the 6-digit code from the email.'); return; }
    if (!strength.ok) { setErr(strength.tip); return; }
    setBusy(true);
    try { await auth.confirmReset(cleanText(email).toLowerCase(), code, password); nav('/'); } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };
  return (
    <AuthFrame>
      <h1>Reset your password</h1>
      {stage === 'email' ? (
        <>
          <p className="lead">Enter your email and we’ll send you a code.</p>
          <ErrorBox msg={err} />
          <form onSubmit={sendCode} noValidate>
            <div className="field"><label htmlFor="em">Email</label><input id="em" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Sending…' : 'Send code'}</button>
          </form>
        </>
      ) : (
        <>
          <p className="lead">If <b>{email}</b> has an account, a 6-digit code is on its way.</p>
          <ErrorBox msg={err} />
          <form onSubmit={reset} noValidate>
            <CodeInput onComplete={setCode} />
            <div className="field">
              <label htmlFor="npw">New password</label>
              <input id="npw" className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {password && <span className="hint">{strength.tip}</span>}
            </div>
            <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Saving…' : 'Set new password'}</button>
          </form>
        </>
      )}
      <p className="fine"><Link to="/signin">Back to sign in</Link></p>
    </AuthFrame>
  );
}
