import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useProfile } from '../lib/data';
import { store, useStoreVersion } from '../lib/store';
import { useTimer } from '../lib/timer';
import { fmtClock } from '../lib/dates';
import { IconCalendar, IconCards, IconChecklist, IconGuide, IconMistake, IconMore, IconOwner, IconPapers, IconPlanner, IconSettings, IconSparkle, IconStar, IconStats, IconSubjects, IconTimer, IconToday, IconTools } from './icons';
import { useDueCount } from '../pages/hooks';
import { useMistakes, usePlanner } from '../lib/data';
import { isDueMistake } from '../lib/mistakes';
import { sessionsOn } from '../lib/planner';
import { today } from '../lib/dates';

/** Windows app only: one gentle nudge at 6pm if today's planned revision hasn't started. */
function useReminders(on: boolean) {
  const [planner] = usePlanner();
  useEffect(() => {
    if (!on || !window.hiliteDesktop) return;
    const check = () => {
      const now = new Date();
      const key = 'hilite:reminded';
      if (now.getHours() < 18 || now.getHours() >= 22) return;
      try { if (localStorage.getItem(key) === today()) return; } catch { return; }
      const left = sessionsOn(planner.sessions, today()).filter((s) => !s.done);
      if (!left.length) return;
      window.hiliteDesktop!.notify('Time to revise', left.length + (left.length === 1 ? ' session' : ' sessions') + ' planned for today. Even one helps.');
      try { localStorage.setItem(key, today()); } catch { /* ignore */ }
    };
    check();
    const id = setInterval(check, 5 * 60_000);
    return () => clearInterval(id);
  }, [on, planner.sessions]);
}

export function Topbar({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  useStoreVersion();
  const state = store.syncState;
  const label = state === 'saving' ? 'Saving' : state === 'offline' ? 'Offline, saved on this device' : state === 'error' ? 'Couldn’t sync, retrying' : 'Saved';
  return (
    <header className="topbar">
      <h1>{title}{sub && <span className="sub">{sub}</span>}</h1>
      {children}
      <span className={'sync ' + state} title={label}><i />{label}</span>
    </header>
  );
}

export function Shell() {
  const auth = useAuth();
  const [profile] = useProfile();
  const t = useTimer();
  const due = useDueCount();
  const [mistakes] = useMistakes();
  const dueMistakes = mistakes.list.filter(isDueMistake).length;
  useReminders(profile.reminders);
  useEffect(() => {
    const apply = () => {
      const dark = profile.theme === 'dark' || (profile.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      try { localStorage.setItem('hilite:theme', profile.theme); } catch { /* ignore */ }
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [profile.theme]);

  const link = (to: string, label: string, icon: ReactNode, extra?: ReactNode) => (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{icon}<span>{label}</span>{extra}</NavLink>
  );
  const initials = (profile.name || auth.user?.email || '?').slice(0, 1).toUpperCase();
  return (
    <div className="app">
      <aside className="side">
        <div className="brand"><span className="brand-mark"><i /></span>Hilite</div>
        <nav className="nav">
          {link('/', 'Today', <IconToday />)}
          {link('/timetable', 'Exam timetable', <IconCalendar />)}
          {link('/planner', 'Revision planner', <IconPlanner />)}
          <div className="nav-group"><div className="nav-label">Practise</div>
            {link('/papers', 'Past papers', <IconPapers />)}
            {link('/topics', 'Topic checklist', <IconChecklist />)}
            {link('/flashcards', 'Flashcards', <IconCards />, due ? <span className="count">{due}</span> : null)}
            {link('/tools/mistakes', 'Mistake log', <IconMistake />, dueMistakes ? <span className="count">{dueMistakes}</span> : null)}
            {link('/tools', 'Revision tools', <IconTools />)}
            {link('/coach', 'AI coach', <IconSparkle />, auth.plan !== 'pro' && !auth.isOwner ? <span className="nav-pro">Pro</span> : null)}
            {link('/focus', 'Focus timer', <IconTimer />, t.running ? <span className="count num">{fmtClock(t.left)}</span> : null)}
            {link('/guides', 'Guides', <IconGuide />)}
          </div>
          <div className="nav-group"><div className="nav-label">You</div>
            {link('/stats', 'Progress', <IconStats />)}
            {link('/subjects', 'Subjects', <IconSubjects />)}
            {link('/settings', 'Settings', <IconSettings />)}
            {auth.plan !== 'pro' && link('/upgrade', 'Upgrade to Pro', <IconStar />)}
            {auth.isOwner && link('/owner', 'Owner', <IconOwner />)}
          </div>
        </nav>
        <div className="side-foot">
          <span className="avatar">{initials}</span>
          <div className="who"><b>{profile.name || 'Your account'}</b><span>{(auth.plan === 'pro' ? 'Hilite Pro' : 'Free plan') + (auth.localMode ? ', local mode' : '')}</span></div>
        </div>
      </aside>
      <div className="main"><Outlet /></div>
      <nav className="tabbar">
        {link('/', 'Today', <IconToday />)}
        {link('/timetable', 'Exams', <IconCalendar />)}
        {link('/planner', 'Plan', <IconPlanner />)}
        {link('/flashcards', 'Cards', <IconCards />)}
        {link('/more', 'More', <IconMore />)}
      </nav>
    </div>
  );
}
