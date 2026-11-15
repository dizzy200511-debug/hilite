// Stripe webhook: keeps profiles.plan in step with subscriptions.
// Deploy with --no-verify-jwt (Stripe doesn't send a Supabase token); the Stripe signature is checked instead.
// Set STRIPE_WEBHOOK_SECRET. Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted.
import { admin, safeEqual } from '../_shared/common.ts';

async function hmac(secret: string, payload: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function verify(req: Request, body: string): Promise<boolean> {
  const header = req.headers.get('stripe-signature') ?? '';
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = await hmac(Deno.env.get('STRIPE_WEBHOOK_SECRET')!, t + '.' + body);
  return header.split(',').some((p) => p.startsWith('v1=') && safeEqual(p.slice(3), expected));
}

Deno.serve(async (req) => {
  const body = await req.text();
  if (!(await verify(req, body))) return new Response('Bad signature', { status: 400 });
  const event = JSON.parse(body);
  const obj = event.data?.object ?? {};

  const setPlan = async (customer: string, active: boolean, until?: number, interval?: string) => {
    await admin.from('profiles').update({
      plan: active ? 'pro' : 'free',
      pro_until: until ? new Date(until * 1000).toISOString() : null,
      pro_period: active && (interval === 'month' || interval === 'year') ? interval : null,
    }).eq('stripe_customer', customer);
  };

  switch (event.type) {
    case 'checkout.session.completed':
      if (obj.customer && obj.client_reference_id) {
        await admin.from('profiles').update({ stripe_customer: obj.customer }).eq('id', obj.client_reference_id);
      }
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const active = ['active', 'trialing', 'past_due'].includes(obj.status) && event.type !== 'customer.subscription.deleted';
      await setPlan(obj.customer, active, obj.current_period_end, obj.items?.data?.[0]?.price?.recurring?.interval);
      break;
    }
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
});
