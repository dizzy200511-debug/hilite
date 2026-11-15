import { useEffect, useState } from 'react';
import { Topbar } from '../components/Shell';
import { Bars } from '../components/ui';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';

interface OwnerStats {
  users: number; pro: number; new_7d: number; active_7d: number; active_1d: number; docs: number;
  signups_by_day: { day: string; n: number }[];
}

export default function Owner() {
  const auth = useAuth();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!supabase) { setErr('Owner stats need the live database. You’re in local mode.'); return; }
    supabase.rpc('owner_stats').then(({ data, error }) => {
      if (error) setErr('Couldn’t load stats. Only the owner account can see this.');
      else setStats(data as OwnerStats);
    });
  }, []);
  if (!auth.isOwner) return null;
  const mrr = stats ? stats.pro * 5 : 0;
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
            <p className="small muted">Counts only. Hilite never shows you anyone’s revision data, flashcards or email address here.</p>
          </>
        )}
      </div>
    </>
  );
}
