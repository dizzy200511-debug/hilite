import { useEffect, useState } from 'react';
import { Topbar } from '../components/Shell';
import { Bars } from '../components/ui';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { PRICE } from './Upgrade';

interface OwnerStats {
  users: number; pro: number; new_7d: number; active_7d: number; active_1d: number; docs: number;
  signups_by_day: { day: string; n: number }[];
}
/** From supabase/migrations/0003_owner_ai.sql. */
interface AiStats { today: number; week: number; month: number; users_week: number; max_today: number; by_day: { day: string; n: number }[] }

export default function Owner() {
  const auth = useAuth();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [err, setErr] = useState('');
  const [ai, setAi] = useState<AiStats | null>(null);
  useEffect(() => {
    if (!supabase) { setErr('Owner stats need the live database. You’re in local mode.'); return; }
    supabase.rpc('owner_stats').then(({ data, error }) => {
      if (error) setErr('Couldn’t load stats. Only the owner account can see this.');
      else setStats(data as OwnerStats);
    });
    // Missing until 0003_owner_ai.sql is run; the panel just doesn't show.
    supabase.rpc('owner_ai_stats').then(({ data, error }) => { if (!error) setAi(data as AiStats); });
  }, []);
  if (!auth.isOwner) return null;
  const mrr = stats ? stats.pro * PRICE.month : 0;
  return (
    <>
      <Topbar title="Owner" sub="Only you can see this page" />
      <div className="content stack">
        {err && <div className="banner"><p>{err}</p></div>}
        {stats && (
          <>
            <section className="panel panel-pad">
              <div className="row wrap" style={{ gap: 36 }}>
                <div className="stat"><div className="v">{stats.users}</div><div className="k">accounts</div></div>
                <div className="stat"><div className="v">{stats.new_7d}</div><div className="k">new this week</div></div>
                <div className="stat"><div className="v">{stats.active_1d}</div><div className="k">active today</div></div>
                <div className="stat"><div className="v">{stats.active_7d}</div><div className="k">active this week</div></div>
                <div className="stat"><div className="v">{stats.pro}</div><div className="k">Pro</div></div>
                <div className="stat"><div className="v">£{mrr}</div><div className="k">max monthly revenue</div></div>
              </div>
            </section>
            <section className="panel panel-pad">
              <h3 style={{ marginBottom: 12 }}>Sign-ups, last 30 days</h3>
              <Bars values={stats.signups_by_day.map((d) => d.n)} labels={stats.signups_by_day.map((d, i) => (i % 5 === 0 ? d.day.slice(5) : ''))} unit="sign-ups" />
            </section>
            {ai && (
              <section className="panel panel-pad">
                <h3 style={{ marginBottom: 12 }}>AI requests</h3>
                <div className="row wrap" style={{ gap: 36, marginBottom: 16 }}>
                  <div className="stat"><div className="v">{ai.today}</div><div className="k">today</div></div>
                  <div className="stat"><div className="v">{ai.week}</div><div className="k">last 7 days</div></div>
                  <div className="stat"><div className="v">{ai.month}</div><div className="k">last 30 days</div></div>
                  <div className="stat"><div className="v">{ai.users_week}</div><div className="k">accounts using AI this week</div></div>
                  <div className="stat"><div className="v">{ai.max_today}</div><div className="k">most by one account today</div></div>
                </div>
                <Bars values={ai.by_day.map((d) => d.n)} labels={ai.by_day.map((d, i) => (i % 5 === 0 ? d.day.slice(5) : ''))} unit="requests" />
                <p className="small muted" style={{ marginTop: 10 }}>Compare with the spend in your Anthropic console to get the cost per request, then check it against the £{PRICE.month} price and the daily limit.</p>
              </section>
            )}
            <p className="small muted">Counts only. Hilite never shows you anyone’s revision data, flashcards or email address here.</p>
          </>
        )}
      </div>
    </>
  );
}
