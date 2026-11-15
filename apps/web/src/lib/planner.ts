import { addDays, daysBetween, dow, today } from './dates';
import { uid } from './sanitize';
import { presetFor } from './presets';
import { effectivePreset } from './pro';
import type { MySitting } from './exams';
import type { Checklist, Method, OwnTest, Profile, Session } from './types';

export interface PlanOptions {
  /** Pro, adaptive: how weak each topic is, 0 to 1. Key: specId:topic. */
  weak?: Map<string, number>;
  /** Open mistakes per subject, so the plan can schedule time to redo them. */
  openMistakes?: Record<string, number>;
  /** Pro, adaptive: weak topics get extra sessions. */
  pro?: boolean;
  /** Pro account: all plan styles. Free accounts on a Pro style get Balanced. */
  proPlans?: boolean;
  /** Your own tests: each topic on one gets revision in the days before it. */
  tests?: OwnTest[];
}

/** A stable number per test, so its sessions keep the same stage numbers across rebuilds. */
function testStage(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return 1000 + h * 100;
}

/**
 * Builds a revision timetable from your real exam dates.
 * Every topic follows its subject's preset: learnt, then revisited at spaced intervals with different active methods.
 * Red topics get an extra session, green topics lose one. Done sessions are always kept.
 */
export function buildPlan(sittings: MySitting[], checklist: Checklist, profile: Profile, existing: Session[], opts: PlanOptions = {}): Session[] {
  const t = today();
  const keep = existing.filter((s) => s.done);
  const capFor = (k: string) => (dow(k) === 0 || dow(k) === 6 ? profile.weekendMins : profile.weekdayMins);
  const isRest = (k: string) => (profile.restDays || []).indexOf(dow(k)) >= 0;

  interface Req { specId: string; topic: number; stage: number; method: Method; target: string; deadline: string; mins: number; testId?: string }
  const reqs: Req[] = [];
  const done = new Set(keep.map((s) => s.specId + ':' + s.topic + ':' + s.stage));

  const bySpec = new Map<string, MySitting[]>();
  sittings.forEach((s) => { if (s.date && s.date > t) { const a = bySpec.get(s.spec.id) || []; a.push(s); bySpec.set(s.spec.id, a); } });

  let specIndex = 0;
  bySpec.forEach((papers, specId) => {
    const spec = papers[0].spec;
    const preset = presetFor(effectivePreset(profile.planPreset, !!opts.proPlans), spec);
    const len = preset.sessionMins || profile.sessionMins || 30;
    const add = (r: Omit<Req, 'mins' | 'specId'>) => { if (!done.has(specId + ':' + r.topic + ':' + r.stage)) reqs.push({ ...r, specId, mins: len }); };

    spec.topics.forEach((_, topic) => {
      const paper = papers.find((p) => !p.paper.topics || p.paper.topics.indexOf(topic) >= 0) || papers[0];
      const last = addDays(paper.date!, -1);
      const span = Math.max(1, daysBetween(t, last));
      const rating = (checklist[specId] || {})[topic];
      const weak = opts.pro ? opts.weak?.get(specId + ':' + topic) ?? 0 : 0;
      const order = topic / Math.max(1, spec.topics.length);
      const learnDay = addDays(t, Math.floor(order * Math.max(1, span - 14)));
      const stages: [number, number, Method][] = preset.stages.map(([off, m], i) => [i, off, m]);
      if (preset.id === 'balanced' && topic % 2) stages[0][2] = 'cards';
      if (rating === 'r' || weak >= 0.75) stages.push([8, preset.red[0], preset.red[1]]);
      if (rating === 'g' && weak < 0.5 && stages.length > 3) stages.splice(1, 1);
      if (weak >= 0.5) stages.push([7, 6, 'coach']);
      // When the exam is close, squeeze the gaps so the later methods still fit.
      const room = Math.max(1, daysBetween(learnDay, last));
      const furthest = Math.max(...stages.map((s) => s[1]));
      const squeeze = furthest > room ? Math.max(0.25, room / furthest) : 1;
      stages.forEach(([stage, offset, method]) => {
        let target = addDays(learnDay, Math.round(offset * squeeze));
        if (target > last) { if (stage > 1) return; target = last; }
        add({ topic, stage, method, target, deadline: last });
      });
      // A timed session near the exam, unless the preset already ends with one.
      if (span > 4 && !stages.some((st) => st[2] === 'timed')) add({ topic, stage: 9, method: 'timed', target: addDays(last, -(topic % 4)), deadline: last });
    });

    // Whole-subject sessions: weekly mixed practice for some presets, and time to redo open mistakes.
    const lastExam = addDays(papers[papers.length - 1].date!, -1);
    const weeks = Math.floor(daysBetween(t, lastExam) / 7);
    const weekly = preset.weekly.slice();
    for (let w = 0; w <= weeks; w++) {
      const target = addDays(t, w * 7 + (specIndex % 7));
      if (target > lastExam) break;
      weekly.forEach((method, i) => add({ topic: -1, stage: 100 + w * 4 + i, method, target, deadline: lastExam }));
      if ((opts.openMistakes?.[specId] || 0) > 0 && w < 3) add({ topic: -1, stage: 300 + w, method: 'mistakes', target: addDays(target, 3), deadline: lastExam });
    }
    specIndex++;
  });

  // Your own tests: learn and blurt each topic a few days before, then exam questions the day before.
  (opts.tests || []).forEach((test) => {
    if (!test.specId || test.date <= t || !test.topics.length) return;
    const last = addDays(test.date, -1);
    const room = daysBetween(t, last);
    const base = testStage(test.id);
    const len = profile.sessionMins || 30;
    test.topics.forEach((topic, i) => {
      const key = (stage: number) => test.specId + ':' + topic + ':' + stage;
      if (room >= 2 && !done.has(key(base + i * 2))) reqs.push({ specId: test.specId!, topic, stage: base + i * 2, method: 'blurt', target: addDays(last, -Math.min(4, room) + (i % 2)), deadline: last, mins: len, testId: test.id });
      if (!done.has(key(base + i * 2 + 1))) reqs.push({ specId: test.specId!, topic, stage: base + i * 2 + 1, method: 'pastq', target: addDays(last, -(i % 2)), deadline: last, mins: len, testId: test.id });
    });
  });

  reqs.sort((a, b) => a.target.localeCompare(b.target) || a.deadline.localeCompare(b.deadline));
  const load: Record<string, number> = {};
  keep.forEach((s) => { if (s.day >= t) load[s.day] = (load[s.day] || 0) + s.mins; });
  const out: Session[] = keep.slice();
  reqs.forEach((r) => {
    let day = r.target < t ? t : r.target;
    while (day <= r.deadline && (isRest(day) || (load[day] || 0) + r.mins > capFor(day))) day = addDays(day, 1);
    if (day > r.deadline) {
      let best: string | null = null;
      for (let k = t; k <= r.deadline; k = addDays(k, 1)) {
        if (isRest(k)) continue;
        if (best === null || (load[k] || 0) < (load[best] || 0)) best = k;
      }
      day = best || r.deadline;
    }
    load[day] = (load[day] || 0) + r.mins;
    out.push({ id: uid(), specId: r.specId, topic: r.topic, method: r.method, stage: r.stage, day, mins: r.mins, done: false, ...(r.testId ? { testId: r.testId } : {}) });
  });
  return out.sort((a, b) => a.day.localeCompare(b.day));
}

export const missedSessions = (sessions: Session[]) => sessions.filter((s) => !s.done && s.day < today());
export const sessionsOn = (sessions: Session[], day: string) => sessions.filter((s) => s.day === day);
