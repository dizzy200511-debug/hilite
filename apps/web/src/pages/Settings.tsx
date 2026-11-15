import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Modal, Seg, useToast } from '../components/ui';
import { useAuth } from '../auth/AuthProvider';
import { useProfile } from '../lib/data';
import { store } from '../lib/store';
import { supabase } from '../lib/supabase';
import { cleanText } from '../lib/sanitize';
import { deviceId } from '../lib/device';
import { fmtMins } from '../lib/dates';

interface Device { id: string; name: string; created_at: string; last_seen: string | null; device_hash: string }

function Row({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="row between wrap" style={{ padding: '14px 0', borderTop: '1px solid var(--line)', gap: 16 }}>
      <div style={{ maxWidth: 440 }}><div style={{ fontWeight: 600 }}>{title}</div>{hint && <div className="small muted">{hint}</div>}</div>
      <div className="row wrap">{children}</div>
    </div>
  );
}

async function myHash() {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(deviceId()));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

export default function Settings() {
  const auth = useAuth();
  const [profile, setProfile] = useProfile();
  const toast = useToast();
  const [name, setName] = useState(profile.name);
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [mine, setMine] = useState('');
  const [startup, setStartup] = useState<boolean | null>(null);
  const [update, setUpdate] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDevices = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('trusted_devices').select('id, name, created_at, last_seen, device_hash').order('last_seen', { ascending: false });
    setDevices((data as Device[]) || []);
  };
  useEffect(() => {
    void loadDevices();
    void myHash().then(setMine);
    window.hiliteDesktop?.getStartWithWindows().then(setStartup);
    window.hiliteDesktop?.onUpdate((s) => setUpdate(s.status));
  }, []);

  const removeDevice = async (d: Device) => {
    if (!supabase) return;
    await supabase.from('trusted_devices').delete().eq('id', d.id);
    toast(d.name + ' removed. It will need a code to sign in again.');
    void loadDevices();
    if (d.device_hash === mine) void auth.signOut();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ app: 'hilite', version: 1, exported: new Date().toISOString(), docs: store.exportAll() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hilite-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importData = async (file: File) => {
    if (file.size > 5_000_000) { toast('That file is too big to be a Hilite backup.'); return; }
    try {
      const json = JSON.parse(await file.text());
      if (json?.app !== 'hilite' || typeof json.docs !== 'object') throw new Error();
      const n = store.importAll(json.docs);
      toast('Restored ' + n + ' items from your backup');
    } catch { toast('That isn’t a Hilite backup file.'); }
  };

  return (
    <>
      <Topbar title="Settings" />
      <div className="content stack" style={{ maxWidth: 860 }}>
        <section className="panel panel-pad">
          <h2>Profile</h2>
          <Row title="Name" hint="Shown on your Today page.">
            <input className="input" style={{ width: 220 }} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => cleanText(name) && setProfile((p) => ({ ...p, name: cleanText(name, 40) }))} aria-label="Name" />
          </Row>
          <Row title="Daily study goal" hint="Used for the Focus today meter and your streak.">
            <select className="select" style={{ width: 160 }} value={profile.dailyGoalMins} onChange={(e) => setProfile((p) => ({ ...p, dailyGoalMins: Number(e.target.value) }))} aria-label="Daily goal">
              {Array.from(new Set([30, 45, 60, 90, 120, 150, 180, 240, 300, profile.dailyGoalMins])).sort((a, b) => a - b).map((n) => <option key={n} value={n}>{fmtMins(n)}</option>)}
            </select>
          </Row>
          <Row title="New flashcards per day" hint="How many unseen cards each review session can introduce.">
            <select className="select" style={{ width: 160 }} value={profile.newCardsPerDay} onChange={(e) => setProfile((p) => ({ ...p, newCardsPerDay: Number(e.target.value) }))} aria-label="New cards per day">
              {[5, 10, 15, 20, 30, 50, 100].map((n) => <option key={n} value={n}>{n} cards</option>)}
            </select>
          </Row>
          <Row title="Subjects" hint={profile.subjects.length + ' subjects'}><Link className="btn" to="/subjects">Manage subjects</Link></Row>
        </section>

        <section className="panel panel-pad">
          <h2>Appearance and reminders</h2>
          <Row title="Theme"><Seg label="Theme" value={profile.theme} onChange={(t) => setProfile((p) => ({ ...p, theme: t }))} options={[['auto', 'Match system'], ['light', 'Light'], ['dark', 'Dark']]} /></Row>
          <Row title="Study reminders" hint={window.hiliteDesktop ? 'A desktop notification when your planned revision hasn’t started by the evening.' : 'Reminders appear in the Windows app. On the web you’ll see them on your Today page.'}>
            <Seg label="Reminders" value={profile.reminders ? 'on' : 'off'} onChange={(v) => setProfile((p) => ({ ...p, reminders: v === 'on' }))} options={[['on', 'On'], ['off', 'Off']]} />
          </Row>
          {window.hiliteDesktop && startup != null && (
            <Row title="Start Hilite with Windows" hint="Opens quietly in the tray so reminders still arrive.">
              <Seg label="Start with Windows" value={startup ? 'on' : 'off'} onChange={(v) => { window.hiliteDesktop!.setStartWithWindows(v === 'on'); setStartup(v === 'on'); }} options={[['on', 'On'], ['off', 'Off']]} />
            </Row>
          )}
          {window.hiliteDesktop && (
            <Row title={'Hilite for Windows ' + window.hiliteDesktop.version} hint={update === 'ready' ? 'An update has downloaded.' : update === 'downloading' ? 'Downloading an update…' : 'Updates download automatically.'}>
              {update === 'ready' && <button className="btn btn-primary" onClick={() => window.hiliteDesktop!.installUpdate()}>Restart and update</button>}
            </Row>
          )}
        </section>

        <section className="panel panel-pad">
          <h2>Account</h2>
          <Row title="Email" hint={auth.localMode ? 'Local mode: data stays on this device.' : auth.user?.email}>{null}</Row>
          <Row title="Plan" hint={auth.plan === 'pro' ? 'Hilite Pro. Thanks for supporting Hilite.' : 'Free plan'}>
            {auth.plan === 'pro' ? <span className="tag hl">Pro</span> : <Link className="btn" to="/upgrade">See Pro</Link>}
          </Row>
          {!auth.localMode && (
            <Row title="Signed-in devices" hint="A new device needs a code from your email before it can open your account.">{null}</Row>
          )}
          {!auth.localMode && devices && (
            <ul className="list" style={{ marginTop: -6 }}>{devices.map((d) => (
              <li key={d.id} className="item">
                <div className="grow"><div className="title">{d.name}{d.device_hash === mine && <span className="tag accent" style={{ marginLeft: 8 }}>This device</span>}</div>
                  <div className="meta">Added {new Date(d.created_at).toLocaleDateString('en-GB')}{d.last_seen && ', last used ' + new Date(d.last_seen).toLocaleDateString('en-GB')}</div></div>
                <button className="btn btn-sm btn-ghost btn-danger" onClick={() => removeDevice(d)}>Remove</button>
              </li>
            ))}</ul>
          )}
          {!auth.localMode && (
            <Row title="Sign out" hint="Sign out everywhere also signs out every other browser and computer.">
              <button className="btn" onClick={() => auth.signOut()}>Sign out</button>
              <button className="btn" onClick={() => auth.signOut(true)}>Sign out everywhere</button>
            </Row>
          )}
        </section>

        <section className="panel panel-pad">
          <h2>Your data</h2>
          <Row title="Download a backup" hint="Everything you’ve made in Hilite, as a JSON file.">
            <button className="btn" onClick={exportData}>Download</button>
          </Row>
          <Row title="Restore from a backup" hint="Merges a backup into your account. Newer changes win.">
            <button className="btn" onClick={() => fileRef.current?.click()}>Choose file</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void importData(f); e.target.value = ''; }} />
          </Row>
          {!auth.localMode && (
            <Row title="Delete account" hint="Permanently deletes your account and everything in it. This can’t be undone.">
              <button className="btn btn-danger" onClick={() => setDeleting(true)}>Delete account</button>
            </Row>
          )}
          <p className="small muted" style={{ marginTop: 10 }}>Read how we handle your data in the <Link to="/privacy">privacy policy</Link>.</p>
        </section>
      </div>
      {deleting && <DeleteAccount onClose={() => setDeleting(false)} />}
    </>
  );
}

function DeleteAccount({ onClose }: { onClose: () => void }) {
  const auth = useAuth();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const go = async () => {
    setBusy(true); setErr('');
    const { data, error } = await supabase!.functions.invoke('device', { body: { action: 'delete-account', deviceId: deviceId() } });
    if (error || data?.error) { setErr(data?.error || 'Couldn’t delete your account. Try again.'); setBusy(false); return; }
    store.wipe();
    await auth.signOut();
  };
  return (
    <Modal title="Delete your account?" onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-danger" disabled={typed !== 'DELETE' || busy} onClick={go}>{busy ? 'Deleting…' : 'Delete everything'}</button></>}>
      <p>Your plan, flashcards, paper marks and settings will be deleted from Hilite’s servers and this device. If you pay for Pro, cancel it first from the Upgrade page.</p>
      <div className="field" style={{ marginTop: 14 }}><label htmlFor="del">Type DELETE to confirm</label><input id="del" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" /></div>
      {err && <div className="error" role="alert">{err}</div>}
    </Modal>
  );
}
