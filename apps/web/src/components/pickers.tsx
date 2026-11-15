import { Link, useSearchParams } from 'react-router-dom';
import { specById } from '../catalog/catalog';
import { useProfile } from '../lib/data';
import { subjectName } from '../pages/hooks';
import { IconCheck, IconLock } from './icons';
import { Topbar } from './Shell';

/** Subject and topic chosen in a tool. Tools opened from the planner arrive with ?spec=…&topic=… */
export function useToolTarget() {
  const [params] = useSearchParams();
  const [profile] = useProfile();
  const spec = params.get('spec');
  const known = !!spec && profile.subjects.some((s) => s.specId === spec);
  const topic = Number(params.get('topic'));
  return {
    specId: known ? spec! : profile.subjects[0]?.specId || '',
    topic: known && Number.isInteger(topic) && topic >= 0 ? topic : undefined,
  };
}

export function SubjectTopicSelect({ specId, topic, onChange, anyTopic = true, idPrefix = 'st' }: {
  specId: string; topic?: number; onChange: (specId: string, topic?: number) => void; anyTopic?: boolean; idPrefix?: string;
}) {
  const [profile] = useProfile();
  const spec = specById(specId);
  return (
    <div className="field-row">
      <div className="field"><label htmlFor={idPrefix + 's'}>Subject</label>
        <select id={idPrefix + 's'} className="select" value={specId} onChange={(e) => onChange(e.target.value, undefined)}>
          <option value="">None</option>
          {profile.subjects.map((s) => <option key={s.specId} value={s.specId}>{subjectName(s.specId)}</option>)}
        </select></div>
      <div className="field"><label htmlFor={idPrefix + 't'}>Topic</label>
        <select id={idPrefix + 't'} className="select" value={topic ?? ''} disabled={!spec} onChange={(e) => onChange(specId, e.target.value === '' ? undefined : Number(e.target.value))}>
          {anyTopic ? <option value="">Any topic</option> : <option value="" disabled>Choose a topic</option>}
          {spec?.topics.map((t, i) => <option key={i} value={i}>{t}</option>)}
        </select></div>
    </div>
  );
}

export const topicName = (specId?: string, topic?: number) => (specId && topic != null && topic >= 0 ? specById(specId)?.topics[topic] : undefined);

/** A whole Pro-only tool, seen by a free account: what it does, and a way to get it. */
export function ProGate({ title, intro, points }: { title: string; intro: string; points: string[] }) {
  return (
    <>
      <Topbar title={title} sub="Part of Hilite Pro" />
      <div className="content">
        <section className="panel panel-pad" style={{ maxWidth: 640 }}>
          <h2 style={{ marginBottom: 8 }}><IconLock width={18} height={18} style={{ verticalAlign: '-3px' }} /> {intro}</h2>
          <ul className="list" style={{ margin: '8px 0 16px' }}>
            {points.map((x) => <li key={x} className="item" style={{ alignItems: 'flex-start' }}><IconCheck width={17} height={17} style={{ color: 'var(--good)', flexShrink: 0, marginTop: 3 }} /><span>{x}</span></li>)}
          </ul>
          <Link className="btn btn-primary" to="/upgrade">See Pro</Link>
        </section>
      </div>
    </>
  );
}

/** Pro features show what they do with a lock and a link, never a blocking popup. */
export function ProLock({ children }: { children: React.ReactNode }) {
  return <p className="small muted"><IconLock width={14} height={14} style={{ verticalAlign: '-2px' }} /> {children} <Link to="/upgrade">See Pro</Link></p>;
}
