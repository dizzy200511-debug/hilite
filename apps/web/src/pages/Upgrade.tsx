import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { Seg, useToast } from '../components/ui';
import { IconCheck } from '../components/icons';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';

/** Pro prices in pounds. Keep in step with the Stripe prices (STRIPE_PRICE_MONTH, STRIPE_PRICE_YEAR). */
export const PRICE = { month: 8, year: 60 };
/** What a year costs on the monthly plan, minus the yearly price. */
export const YEAR_SAVING = PRICE.month * 12 - PRICE.year;

export const FREE_FEATURES = [
  'Exam timetable for every subject, with countdowns and clash warnings',
  'Your own school tests and mocks, with revision planned before each one',
  'A revision plan built around your exam dates, in two plan styles',
  'Unlimited flashcards with spaced repetition',
  'Past paper tracker with links to every official paper, and mock mode',
  'Mistake log that retests you until you get it right',
  'Blurting, teach-back, command words and exam timing',
  'Cornell notes, mind maps and the memoriser, to try',
  'Guides to every revision method',
  'Topic checklist, focus timer, and sync across web and Windows',
];
export const PRO_FEATURES = [
  'Everything in Free',
  'AI coach that learns from your mistakes and tests you on your weak spots',
  'AI marking and feedback on written exam answers',
  'AI flashcards from your notes',
  'All eight plan styles, including Auto, and a plan that adapts to your weak topics',
  'See why you lose marks: content, technique, misreading or timing',
  'Unlimited Cornell notes, mind maps and memoriser items',
  'Mixed quizzes across all your subjects, and the grade target calculator',
  'Every subject and exam technique guide, and ready-made equation and formula decks',
  'Predicted grades and full progress history',
];

export function PriceCards({ cta }: { cta: (period: 'month' | 'year') => React.ReactNode }) {
  const [period, setPeriod] = useState<'month' | 'year'>('year');
  return (
    <>
      <div style={{ marginBottom: 18 }}><Seg label="Billing period" value={period} onChange={setPeriod} options={[['month', 'Monthly'], ['year', 'Yearly, save £' + YEAR_SAVING]]} /></div>
      <div className="prices">
        <div className="price">
          <h3>Free</h3>
          <div className="amt">£0</div>
          <div className="small muted">Free for good, not a trial.</div>
          <ul>{FREE_FEATURES.map((f) => <li key={f}><IconCheck />{f}</li>)}</ul>
        </div>
        <div className="price pro">
          <h3>Pro</h3>
          <div className="amt">£{period === 'month' ? PRICE.month : PRICE.year}<span className="small muted" style={{ fontWeight: 500, letterSpacing: 0 }}> / {period}</span></div>
          <div className="small muted">{period === 'year' ? 'Works out at £' + (PRICE.year / 12).toFixed(2).replace(/\.00$/, '') + ' a month.' : 'Cancel any time.'}</div>
          <ul>{PRO_FEATURES.map((f) => <li key={f}><IconCheck />{f}</li>)}</ul>
          {cta(period)}
        </div>
      </div>
    </>
  );
}

/**
 * Opens Stripe checkout or the billing portal. Local mode has no payments, so checkout switches Pro on
 * straight away (and the portal switches it off) to make Pro testable. Resolves true when Pro was turned on here.
 */
export function useBilling() {
  const auth = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const go = async (action: 'checkout' | 'portal', period?: 'month' | 'year'): Promise<boolean> => {
    if (!supabase) {
      try { if (action === 'checkout') localStorage.setItem('hilite:localPlan', 'pro'); else localStorage.removeItem('hilite:localPlan'); } catch { /* ignore */ }
      await auth.refreshPlan();
      toast(action === 'checkout' ? 'Local mode: Pro is on. No payment was taken.' : 'Local mode: back on the free plan.');
      return action === 'checkout';
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('billing', { body: { action, period } });
    setBusy(false);
    if (error || !data?.url) { toast(data?.error || 'Payments aren’t open yet. Everything in Free stays free.'); return false; }
    if (window.hiliteDesktop) window.hiliteDesktop.openExternal(data.url); else window.location.href = data.url;
    return false;
  };
  return { busy, go };
}

export default function Upgrade() {
  const auth = useAuth();
  const { busy, go } = useBilling();
  const pro = auth.plan === 'pro';
  return (
    <>
      <Topbar title={pro ? 'Your Pro plan' : 'Hilite Pro'} sub={pro ? 'Thanks for supporting Hilite' : 'The free plan has everything you need to revise. Pro adds the extras.'} />
      <div className="content">
        {pro ? (
          <section className="panel panel-pad" style={{ maxWidth: 560 }}>
            <p>You’re on Hilite Pro. Change your billing period, update your card or cancel from the billing page.</p>
            <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={busy} onClick={() => go('portal')}>Manage billing</button>
          </section>
        ) : (
          <PriceCards cta={(period) => <button className="btn btn-primary btn-block btn-lg" disabled={busy} onClick={() => go('checkout', period)}>{busy ? 'Opening checkout…' : 'Get Pro'}</button>} />
        )}
        <p className="small muted" style={{ marginTop: 22, maxWidth: 640 }}>Payments are handled by Stripe. Hilite never sees your card details. If you’re under 18, ask a parent or carer before you buy. See the <Link to="/terms">terms</Link> for refunds and cancelling.</p>
      </div>
    </>
  );
}
