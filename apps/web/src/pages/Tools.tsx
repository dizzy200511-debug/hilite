import { Link } from 'react-router-dom';
import { Topbar } from '../components/Shell';
import { TOOLS } from '../content/tools';
import { guideById } from '../content/guides';
import { useMistakes } from '../lib/data';
import { isDueMistake } from '../lib/mistakes';
import { useDueCount, usePro } from './hooks';
import { FREE_LIMITS, PRO_TOOLS } from '../lib/pro';

const LIMITED: Record<string, string> = { '/tools/notes': FREE_LIMITS.notes + ' free', '/tools/mindmap': FREE_LIMITS.mindmaps + ' free', '/tools/memorise': FREE_LIMITS.memos + ' free' };

export default function Tools() {
  const pro = usePro();
  const [mistakes] = useMistakes();
  const dueMistakes = mistakes.list.filter(isDueMistake).length;
  const dueCards = useDueCount();
  return (
    <>
      <Topbar title="Revision tools" sub="One tool for each active revision method, each with a guide on doing it well" />
      <div className="content stack">
        {(dueMistakes > 0 || dueCards > 0) && (
          <div className="banner info">
            <p>{dueMistakes > 0 && <><b>{dueMistakes} {dueMistakes === 1 ? 'mistake' : 'mistakes'}</b> to retest. </>}{dueCards > 0 && <><b>{dueCards} flashcards</b> to review.</>} Start with these: they’re what you’re most likely to forget.</p>
            {dueMistakes > 0 ? <Link className="btn btn-sm" to="/tools/mistakes?retest=1">Retest mistakes</Link> : <Link className="btn btn-sm" to="/flashcards">Review cards</Link>}
          </div>
        )}
        <div className="tool-grid">
          {TOOLS.map((t) => (
            <div key={t.to} className="tool">
              <div className="row between"><Link to={t.to} className="tool-name">{t.name}</Link>{PRO_TOOLS.has(t.to) ? <span className="tag accent">Pro</span> : !pro && LIMITED[t.to] ? <span className="tag">{LIMITED[t.to]}</span> : null}</div>
              <p>{t.summary}</p>
              <Link className="small" to={'/guides/' + t.guide}>Guide: {guideById(t.guide)?.title}</Link>
            </div>
          ))}
        </div>
        <p className="small muted">Not sure where to start? Read <Link to="/guides/active-recall">active recall</Link> and <Link to="/guides/building-a-plan">choosing a revision plan</Link>, or follow today’s sessions: each one opens the right tool.</p>
      </div>
    </>
  );
}
