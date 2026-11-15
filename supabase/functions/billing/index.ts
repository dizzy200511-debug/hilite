// Stripe Checkout and the billing portal, called by the Upgrade page.
// Set STRIPE_SECRET_KEY, STRIPE_PRICE_MONTH (£5/month) and STRIPE_PRICE_YEAR (£50/year) as function secrets.
import { admin, cors, json, userFrom } from '../_shared/common.ts';

const SITE = Deno.env.get('SITE_URL') ?? 'https://hilite.study';

async function stripe(path: string, params: Record<string, string>) {
  const res = await fetch('https://api.stripe.com/v1/' + path, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + Deno.env.get('STRIPE_SECRET_KEY'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? 'Stripe error');
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  if (!Deno.env.get('STRIPE_SECRET_KEY')) return json(req, { error: 'Payments aren’t open yet. Everything in Free stays free.' }, 503);
  const who = await userFrom(req);
  if (!who) return json(req, { error: 'Sign in again to continue.' }, 401);
  const { user } = who;
  const { action, period } = await req.json().catch(() => ({}));

  try {
    const { data: profile } = await admin.from('profiles').select('stripe_customer, plan').eq('id', user.id).single();
    let customer = profile?.stripe_customer as string | null;
    if (!customer) {
      const c = await stripe('customers', { email: user.email ?? '', 'metadata[user_id]': user.id });
      customer = c.id;
      await admin.from('profiles').update({ stripe_customer: customer }).eq('id', user.id);
    }

    if (action === 'portal') {
      const s = await stripe('billing_portal/sessions', { customer: customer!, return_url: SITE + '/upgrade' });
      return json(req, { url: s.url });
    }
    if (action === 'checkout') {
      if (profile?.plan === 'pro') return json(req, { error: 'You’re already on Pro.' }, 400);
      const price = period === 'month' ? Deno.env.get('STRIPE_PRICE_MONTH') : Deno.env.get('STRIPE_PRICE_YEAR');
      const s = await stripe('checkout/sessions', {
        mode: 'subscription',
        customer: customer!,
        client_reference_id: user.id,
        'line_items[0][price]': price!,
        'line_items[0][quantity]': '1',
        'subscription_data[metadata][user_id]': user.id,
        allow_promotion_codes: 'true',
        success_url: SITE + '/upgrade?welcome=1',
        cancel_url: SITE + '/upgrade',
      });
      return json(req, { url: s.url });
    }
    return json(req, { error: 'Unknown action' }, 400);
  } catch (e) {
    console.error(e);
    return json(req, { error: 'Couldn’t open checkout. Try again.' }, 500);
  }
});
