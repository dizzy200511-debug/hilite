import { pointKey, useSpecContent } from '../content/spec';
import { useProfile, useSpecTicks } from '../lib/data';

/** The sub-topics of one topic, from the spec's structure, each with what to know and a tick. */
export function SpecPoints({ specId, topic, compact }: { specId: string; topic: number; compact?: boolean }) {
  const content = useSpecContent(specId);
  const [profile] = useProfile();
  const [ticks, setTicks] = useSpecTicks();
  if (content === undefined) return <p className="small muted">Loading…</p>;
  const sections = content?.topics[topic];
  if (!content || !sections?.length) return null;
  const foundation = profile.subjects.find((s) => s.specId === specId)?.tier === 'F';
  const mine = ticks[specId] || {};
  const toggle = (k: string) => setTicks((t) => {
    const cur = { ...(t[specId] || {}) };
    if (cur[k]) delete cur[k]; else cur[k] = 1;
    return { ...t, [specId]: cur };
  });
  return (
    <div className="spec-points">
      {sections.map((s, si) => (
        <div key={si} className="spec-section">
          {sections.length > 1 && <div className="spec-section-name">{s.name}</div>}
          <ul>{s.points.map((p, pi) => {
            if (foundation && p.higher) return null;
            const k = pointKey(topic, si, pi);
            return (
              <li key={pi} className={mine[k] ? 'on' : ''}>
                {!compact && <input type="checkbox" checked={!!mine[k]} onChange={() => toggle(k)} aria-label={'I know ' + p.name} />}
                <div><b>{p.name}</b>{p.higher && <span className="tag">Higher</span>}<p>{p.know}</p></div>
              </li>
            );
          })}</ul>
        </div>
      ))}
      <p className="tiny faint">Summarised by Hilite from the {content.source} specification. <a href={content.url} target="_blank" rel="noopener noreferrer">Check the official spec</a>{content.note ? '. ' + content.note : ''}</p>
    </div>
  );
}

/** How many of a topic's sub-topics are ticked, for progress labels. */
export function useTopicProgress(specId: string) {
  const content = useSpecContent(specId);
  const [profile] = useProfile();
  const [ticks] = useSpecTicks();
  const foundation = profile.subjects.find((s) => s.specId === specId)?.tier === 'F';
  return (topic: number) => {
    const sections = content?.topics[topic];
    if (!sections) return null;
    let total = 0, done = 0;
    sections.forEach((s, si) => s.points.forEach((p, pi) => {
      if (foundation && p.higher) return;
      total++;
      if (ticks[specId]?.[pointKey(topic, si, pi)]) done++;
    }));
    return { total, done };
  };
}
