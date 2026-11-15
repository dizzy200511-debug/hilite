// Device confirmation, called by the app as supabase.functions.invoke('device', { body }).
//
// Actions
//   send               email a 6-digit code to confirm this device
//   verify             check the code and trust this device
//   trust-new-account  trust the device that just confirmed a brand-new account by email code
//   trust-after-reset  trust the device that just reset the password by email code
//   delete-account     permanently delete the account (from a trusted device only)
//
// Codes are stored only as hashes, expire after 10 minutes, allow 5 attempts, and sending is rate limited.
import { admin, codeEmail, cors, json, safeEqual, sendEmail, sha256, sixDigitCode, userFrom } from '../_shared/common.ts';

const CODE_TTL_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  const who = await userFrom(req);
  if (!who) return json(req, { error: 'Your session has ended. Sign in again.' }, 401);
  const { user, claims } = who;

  let body: { action?: string; deviceId?: string; deviceName?: string; code?: string };
  try { body = await req.json(); } catch { return json(req, { error: 'Bad request' }, 400); }

  const deviceId = String(body.deviceId ?? '');
  if (!/^[0-9a-f]{48}$/.test(deviceId)) return json(req, { error: 'Bad device' }, 400);
  const deviceHash = await sha256(deviceId);
  const deviceName = String(body.deviceName ?? 'Device').replace(/[\u0000-\u001f<>]/g, '').slice(0, 80) || 'Device';

  const trust = async () => {
    const { error } = await admin.from('trusted_devices').upsert(
      { user_id: user.id, device_hash: deviceHash, name: deviceName, last_seen: new Date().toISOString() },
      { onConflict: 'user_id,device_hash' },
    );
    if (error) throw error;
    await admin.from('device_codes').delete().eq('user_id', user.id).eq('device_hash', deviceHash);
  };

  /** True if this session came from an email code entered in the last 15 minutes. */
  const freshEmailCode = () => {
    const amr = (claims.amr as { method: string; timestamp: number }[] | undefined) ?? [];
    const cutoff = Date.now() / 1000 - 15 * 60;
    return amr.some((a) => ['otp', 'recovery', 'email/signup', 'magiclink'].includes(a.method) && a.timestamp > cutoff);
  };

  try {
    switch (body.action) {
      case 'send': {
        if (!user.email) return json(req, { error: 'Your account has no email address.' }, 400);
        const since = new Date(Date.now() - 60 * 60_000).toISOString();
        const { data: sends } = await admin.from('code_sends').select('sent_at').eq('user_id', user.id).gte('sent_at', since).order('sent_at', { ascending: false });
        if ((sends?.length ?? 0) >= 6) return json(req, { error: 'Too many codes sent. Wait an hour and try again.' }, 429);
        if (sends?.[0] && Date.now() - new Date(sends[0].sent_at).getTime() < 40_000) return json(req, { error: 'Wait a few seconds before sending another code.' }, 429);

        const code = sixDigitCode();
        const { error } = await admin.from('device_codes').upsert({
          user_id: user.id, device_hash: deviceHash, device_name: deviceName,
          code_hash: await sha256(code + ':' + user.id + ':' + deviceHash), attempts: 0,
          expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
        }, { onConflict: 'user_id,device_hash' });
        if (error) throw error;
        await admin.from('code_sends').insert({ user_id: user.id });
        const ok = await sendEmail(user.email, code + ' is your Hilite code',
          codeEmail(code, 'Confirm it’s you', 'Someone, hopefully you, is signing in to Hilite on ' + deviceName + '. Enter this code to finish signing in.'));
        if (!ok) return json(req, { error: 'Couldn’t send the email. Try again in a minute.' }, 502);
        return json(req, { ok: true });
      }

      case 'verify': {
        const code = String(body.code ?? '');
        if (!/^\d{6}$/.test(code)) return json(req, { error: 'Enter the 6-digit code from the email.' }, 400);
        const { data: row } = await admin.from('device_codes').select('*').eq('user_id', user.id).eq('device_hash', deviceHash).maybeSingle();
        const wrong = 'That code is wrong or has expired. Check the latest email, or send a new code.';
        if (!row || new Date(row.expires_at).getTime() < Date.now()) return json(req, { error: wrong }, 400);
        if (row.attempts >= MAX_ATTEMPTS) return json(req, { error: 'Too many wrong codes. Send a new one.' }, 429);
        const match = safeEqual(row.code_hash, await sha256(code + ':' + user.id + ':' + deviceHash));
        if (!match) {
          await admin.from('device_codes').update({ attempts: row.attempts + 1 }).eq('user_id', user.id).eq('device_hash', deviceHash);
          return json(req, { error: wrong }, 400);
        }
        await trust();
        return json(req, { ok: true });
      }

      case 'trust-new-account':
      case 'trust-after-reset': {
        if (!freshEmailCode()) return json(req, { error: 'Confirm this device with a code instead.' }, 403);
        if (body.action === 'trust-new-account') {
          const { count } = await admin.from('trusted_devices').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
          if ((count ?? 0) > 0) return json(req, { error: 'Confirm this device with a code instead.' }, 403);
        }
        await trust();
        return json(req, { ok: true });
      }

      case 'delete-account': {
        const { data: dev } = await admin.from('trusted_devices').select('id').eq('user_id', user.id).eq('device_hash', deviceHash).maybeSingle();
        if (!dev) return json(req, { error: 'Delete your account from a device you’ve confirmed.' }, 403);
        const { data: profile } = await admin.from('profiles').select('stripe_customer').eq('id', user.id).maybeSingle();
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (profile?.stripe_customer && stripeKey) {
          // Cancel any running subscription so nobody is charged for a deleted account.
          const subs = await fetch('https://api.stripe.com/v1/subscriptions?status=active&customer=' + encodeURIComponent(profile.stripe_customer), { headers: { Authorization: 'Bearer ' + stripeKey } }).then((r) => r.json());
          for (const s of subs?.data ?? []) await fetch('https://api.stripe.com/v1/subscriptions/' + s.id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + stripeKey } });
        }
        const { error } = await admin.auth.admin.deleteUser(user.id);
        if (error) throw error;
        return json(req, { ok: true });
      }

      default:
        return json(req, { error: 'Unknown action' }, 400);
    }
  } catch (e) {
    console.error(e);
    return json(req, { error: 'Something went wrong. Try again.' }, 500);
  }
});
