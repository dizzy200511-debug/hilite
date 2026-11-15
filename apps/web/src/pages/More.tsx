import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { useAuth } from '../auth/AuthProvider';
import { IconChecklist, IconGuide, IconMistake, IconOwner, IconPapers, IconQuestion, IconSettings, IconSparkle, IconStar, IconStats, IconSubjects, IconTimer, IconTools } from '../components/icons';

export default function More() {
  const auth = useAuth();
  const items: [string, string, JSX.Element][] = [
    ['/practice', 'Practice questions', <IconQuestion />],
    ['/papers', 'Past papers', <IconPapers />],
    ['/topics', 'Topic checklist', <IconChecklist />],
    ['/tools/mistakes', 'Mistake log', <IconMistake />],
    ['/tools', 'Revision tools', <IconTools />],
    ['/coach', 'AI coach', <IconSparkle />],
    ['/guides', 'Revision guides', <IconGuide />],
    ['/focus', 'Focus timer', <IconTimer />],
    ['/stats', 'Progress', <IconStats />],
    ['/subjects', 'Subjects', <IconSubjects />],
    ['/settings', 'Settings', <IconSettings />],
  ];
  if (auth.plan !== 'pro') items.push(['/upgrade', 'Upgrade to Pro', <IconStar />]);
  if (auth.isOwner) items.push(['/owner', 'Owner', <IconOwner />]);
  return (
    <>
      <Topbar title="More" />
      <div className="content">
        <nav className="panel"><ul className="list" style={{ padding: '0 16px' }}>{items.map(([to, label, icon]) => (
          <li key={to}><Link to={to} className="item" style={{ color: 'var(--ink)', gap: 14 }}><span style={{ color: 'var(--muted)', display: 'flex' }}>{icon}</span><span className="grow title">{label}</span></Link></li>
        ))}</ul></nav>
      </div>
    </>
  );
}
