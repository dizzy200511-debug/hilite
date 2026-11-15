import { useEffect, useState } from 'react';
import type { SpecContent, SpecSection } from './types';

/** Each spec's content is its own chunk, downloaded only when a student opens it. */
const LOADERS: Record<string, () => Promise<SpecContent>> = {
  'aqa-gcse-bio': () => import('./aqa-bio').then((m) => m.default),
  'aqa-gcse-chem': () => import('./aqa-chem').then((m) => m.default),
  'aqa-gcse-phys': () => import('./aqa-phys').then((m) => m.default),
  'edx-gcse-bio': () => import('./edx-bio').then((m) => m.default),
  'edx-gcse-chem': () => import('./edx-chem').then((m) => m.default),
  'edx-gcse-phys': () => import('./edx-phys').then((m) => m.default),
  'edx-gcse-combined': () => Promise.all([import('./edx-bio'), import('./edx-chem'), import('./edx-phys')]).then(([b, c, p]) => ({
    source: 'Pearson Edexcel GCSE Combined Science (1SC0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/sciences-2016.html',
    note: 'Combined science covers the same content as the separate sciences, without the parts marked separate science only.',
    // The catalogue's combined topics: all of biology, chemistry topics 1–7, and physics without astronomy and static electricity.
    topics: combined([...b.default.topics, ...c.default.topics.slice(0, 7), ...[0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14].map((i) => p.default.topics[i])]),
  })),
  'aqa-gcse-geog': () => import('./aqa-humanities').then((m) => m.geography),
  'aqa-gcse-psych': () => import('./aqa-humanities').then((m) => m.psychology),
  'aqa-gcse-soc': () => import('./aqa-humanities').then((m) => m.sociology),
  'aqa-gcse-bus': () => import('./aqa-humanities').then((m) => m.business),
  'aqa-gcse-rs': () => import('./aqa-rs').then((m) => m.default),
  'aqa-gcse-englang': () => import('./english').then((m) => m.aqaLanguage),
  'aqa-gcse-englit': () => import('./english').then((m) => m.aqaLiterature),
  'edx-gcse-englang': () => import('./english').then((m) => m.edxLanguage),
  'edx-gcse-englit': () => import('./english').then((m) => m.edxLiterature),
  'aqa-gcse-hist': () => import('./history').then((m) => m.aqaHistory),
  'edx-gcse-hist': () => import('./history').then((m) => m.edxHistory),
  'edx-gcse-geoga': () => import('./edx-other').then((m) => m.geographyA),
  'edx-gcse-geogb': () => import('./edx-other').then((m) => m.geographyB),
  'edx-gcse-bus': () => import('./edx-other').then((m) => m.edxBusiness),
  'edx-gcse-french': () => import('./edx-other').then((m) => m.french),
  'edx-gcse-spanish': () => import('./edx-other').then((m) => m.spanish),
  'edx-gcse-german': () => import('./edx-other').then((m) => m.german),
  'aqa-gcse-cs': () => import('./aqa-cs').then((m) => m.default),
  'ocr-gcse-cs': () => import('./ocr-cs').then((m) => m.default),
  'aqa-gcse-maths': () => import('./gcse-maths').then((m) => m.default),
  'edx-gcse-maths': () => import('./gcse-maths').then((m) => m.default),
  'ocr-gcse-maths': () => import('./gcse-maths').then((m) => m.default),
  'aqa-gcse-trilogy': () => Promise.all([import('./aqa-bio'), import('./aqa-chem'), import('./aqa-phys')]).then(([b, c, p]) => ({
    source: 'AQA GCSE Combined Science: Trilogy (8464)', url: 'https://www.aqa.org.uk/subjects/science/gcse/combined-science-trilogy-8464/specification',
    note: 'Combined science covers the same content as the separate sciences, without the parts marked separate science only.',
    topics: combined([...b.default.topics, ...c.default.topics, ...p.default.topics.slice(0, 7)]),
  })),
};

/** Combined science: the separate science content without the separate-only parts. */
function combined(topics: SpecSection[][]): SpecSection[][] {
  return topics.map((sections) => sections
    .map((s) => ({ ...s, points: s.points.filter((p) => !p.separate) }))
    .filter((s) => s.points.length));
}

export const hasSpecContent = (specId: string) => specId in LOADERS;

const cache = new Map<string, SpecContent>();
const pending = new Map<string, Promise<SpecContent>>();

export function loadSpecContent(specId: string): Promise<SpecContent | null> {
  const loader = LOADERS[specId];
  if (!loader) return Promise.resolve(null);
  if (cache.has(specId)) return Promise.resolve(cache.get(specId)!);
  if (!pending.has(specId)) pending.set(specId, loader().then((c) => { cache.set(specId, c); return c; }));
  return pending.get(specId)!;
}

/** undefined while loading, null if Hilite has no breakdown for this spec yet. */
export function useSpecContent(specId?: string): SpecContent | null | undefined {
  const [content, setContent] = useState<SpecContent | null | undefined>(() => (specId ? cache.get(specId) ?? (hasSpecContent(specId) ? undefined : null) : null));
  useEffect(() => {
    if (!specId) { setContent(null); return; }
    let live = true;
    setContent(cache.get(specId) ?? (hasSpecContent(specId) ? undefined : null));
    loadSpecContent(specId).then((c) => { if (live) setContent(c); }).catch(() => { if (live) setContent(null); });
    return () => { live = false; };
  }, [specId]);
  return content;
}

/** Stable key for ticking off one sub-topic. */
export const pointKey = (topic: number, section: number, point: number) => topic + '.' + section + '.' + point;
