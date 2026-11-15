// Shared helpers for Hilite's edge functions (Deno).
import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// Requests are authorised with a bearer token, never cookies, so allowing any origin is safe
// and lets the website, localhost and the Windows app all call these functions.
export function cors(_req: Request): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

export const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json' } });

export const admin: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

/** The signed-in user making this request, from their access token. */
export async function userFrom(req: Request): Promise<{ user: User; claims: Record<string, unknown> } | null> {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  let claims: Record<string, unknown> = {};
  try { claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { /* ignore */ }
  return { user: data.user, claims };
}

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compare two strings in constant time so timing can't leak a code. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function sixDigitCode(): string {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(n[0] % 1_000_000).padStart(6, '0');
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Branded code email, matching the Supabase auth templates in supabase/templates. */
export function codeEmail(code: string, heading: string, line: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14161b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1px solid #e3e5ea;border-radius:14px">
<tr><td style="padding:28px 32px 0"><span style="display:inline-block;width:22px;height:22px;border-radius:6px;background:#14161b;vertical-align:middle"></span>
<b style="font-size:17px;vertical-align:middle;margin-left:8px">Hilite</b></td></tr>
<tr><td style="padding:22px 32px 4px"><h1 style="margin:0 0 8px;font-size:21px">${esc(heading)}</h1>
<p style="margin:0;color:#5b616e;font-size:15px;line-height:1.55">${esc(line)}</p></td></tr>
<tr><td style="padding:20px 32px"><div style="font-size:34px;font-weight:800;letter-spacing:10px;background:#f4f5f7;border-radius:10px;padding:16px 0;text-align:center;font-family:ui-monospace,Menlo,Consolas,monospace">${esc(code)}</div></td></tr>
<tr><td style="padding:0 32px 28px;color:#5b616e;font-size:13px;line-height:1.55">This code expires in 10 minutes. If you didn’t try to sign in, you can ignore this email, and consider changing your password.</td></tr>
</table><p style="color:#9aa0ac;font-size:12px;margin-top:16px">Hilite, revision built around your exams</p></td></tr></table></body></html>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) { console.error('RESEND_API_KEY is not set'); return false; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('EMAIL_FROM') ?? 'Hilite <codes@hilite.study>', to, subject, html }),
  });
  return res.ok;
}
