import { useEffect, useState } from 'react';
import { specById } from '../../catalog/catalog';
import type { Bank, Question } from './types';

/** Each bank is its own chunk, downloaded only when a student opens practice for that subject. */
const BANKS: Record<string, () => Promise<Bank>> = {
  bio: () => import('./bio').then((m) => m.default),
  chem: () => import('./chem').then((m) => m.default),
  phys: () => import('./phys').then((m) => m.default),
  maths: () => import('./maths').then((m) => m.default),
  cs: () => import('./cs').then((m) => m.default),
  hum: () => import('./humanities').then((m) => m.default),
  eng: () => import('./english').then((m) => m.default),
};

// Which content areas each topic of a spec draws on, as "bank:area".
const AQA_BIO = [['cells', 'division'], ['organisation'], ['infection'], ['photosynthesis', 'respiration'], ['nervous', 'hormones'], ['inheritance', 'evolution'], ['ecology']];
const EDX_BIO = [['cells'], ['division', 'nervous'], ['inheritance'], ['evolution'], ['infection'], ['photosynthesis'], ['hormones'], ['organisation', 'respiration'], ['ecology']];
const OCR_BIO = [['cells', 'respiration', 'photosynthesis'], ['division', 'organisation'], ['nervous', 'hormones'], ['ecology'], ['inheritance', 'evolution'], ['infection']];
const AQA_CHEM = [['atoms'], ['bonding'], ['quantitative'], ['reactions', 'electrolysis'], ['energy'], ['rates', 'equilibrium'], ['organic'], ['analysis'], ['atmosphere'], ['resources']];
const EDX_CHEM = [['atoms', 'bonding', 'quantitative'], ['bonding', 'analysis'], ['reactions', 'electrolysis'], ['reactions', 'equilibrium'], ['atoms'], ['rates', 'energy'], ['organic', 'atmosphere'], ['resources', 'quantitative']];
const OCR_CHEM = [['atoms'], ['bonding', 'analysis'], ['quantitative', 'reactions', 'electrolysis', 'energy'], ['atoms', 'analysis'], ['rates', 'equilibrium', 'quantitative'], ['resources', 'organic', 'atmosphere']];
const AQA_PHYS = [['energy'], ['electricity'], ['particles'], ['atomic'], ['forces', 'motion'], ['waves', 'em'], ['magnetism'], ['space']];
const EDX_PHYS = [['motion'], ['motion', 'forces'], ['energy'], ['waves'], ['em'], ['atomic'], ['space'], ['energy', 'forces'], ['forces'], ['electricity'], ['electricity'], ['magnetism'], ['magnetism'], ['particles'], ['forces', 'particles']];
const OCR_PHYS = [['particles'], ['motion', 'forces'], ['electricity'], ['magnetism'], ['waves', 'em'], ['atomic'], ['energy'], ['energy']];
const MATHS = [['number'], ['algebra'], ['ratio'], ['geometry'], ['probability'], ['statistics']];

const on = (bank: string, topics: string[][]) => topics.map((areas) => areas.map((a) => bank + ':' + a));

const SPEC_AREAS: Record<string, string[][]> = {
  'aqa-gcse-bio': on('bio', AQA_BIO),
  'edx-gcse-bio': on('bio', EDX_BIO),
  'ocr-gcse-bio': on('bio', OCR_BIO),
  'aqa-gcse-chem': on('chem', AQA_CHEM),
  'edx-gcse-chem': on('chem', EDX_CHEM),
  'ocr-gcse-chem': on('chem', OCR_CHEM),
  'aqa-gcse-phys': on('phys', AQA_PHYS),
  'edx-gcse-phys': on('phys', EDX_PHYS),
  'ocr-gcse-phys': on('phys', OCR_PHYS),
  // Combined science follows the catalogue's topic order: biology, then chemistry, then physics.
  'aqa-gcse-trilogy': [...on('bio', AQA_BIO), ...on('chem', AQA_CHEM), ...on('phys', AQA_PHYS.slice(0, 7))],
  'edx-gcse-combined': [...on('bio', EDX_BIO), ...on('chem', EDX_CHEM.slice(0, 7)), ...on('phys', [0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14].map((i) => EDX_PHYS[i]))],
  'ocr-gcse-combined': [...on('bio', OCR_BIO), ...on('chem', OCR_CHEM), ...on('phys', [['particles'], ['motion', 'forces'], ['electricity', 'magnetism'], ['waves', 'em', 'atomic'], ['energy'], ['energy']])],
  'aqa-gcse-maths': on('maths', MATHS),
  'edx-gcse-maths': on('maths', MATHS),
  'ocr-gcse-maths': on('maths', MATHS),
  'aqa-gcse-cs': on('cs', [['algorithms'], ['programming'], ['datarep'], ['hardware', 'storage', 'software', 'logic'], ['networks'], ['security'], ['databases'], ['impacts']]),
  'ocr-gcse-cs': on('cs', [['hardware'], ['storage', 'datarep'], ['networks'], ['security'], ['software'], ['impacts'], ['algorithms'], ['programming', 'databases'], ['programming'], ['logic'], ['software']]),
  // English and the essay subjects: one area per catalogue topic, named by spec.
  ...Object.fromEntries(['aqa-gcse-englang', 'aqa-gcse-englit', 'edx-gcse-englang', 'edx-gcse-englit', 'ocr-gcse-englang', 'ocr-gcse-englit']
    .map((id) => [id, specById(id)!.topics.map((_, i) => ['eng:' + id + ':' + i])])),
  ...Object.fromEntries(['aqa-gcse-geog', 'aqa-gcse-hist', 'aqa-gcse-psych', 'aqa-gcse-rs', 'aqa-gcse-bus', 'aqa-gcse-soc',
    'edx-gcse-hist', 'edx-gcse-geoga', 'edx-gcse-geogb', 'edx-gcse-bus',
    'ocr-gcse-hista', 'ocr-gcse-histb', 'ocr-gcse-geoga', 'ocr-gcse-geogb', 'ocr-gcse-rs', 'ocr-gcse-psych', 'ocr-gcse-bus', 'ocr-gcse-econ', 'ocr-gcse-pe']
    .map((id) => [id, specById(id)!.topics.map((_, i) => ['hum:' + id + ':' + i])])),
};

export const hasQuestions = (specId: string) => specId in SPEC_AREAS;
const combinedSpecs = new Set(['aqa-gcse-trilogy', 'edx-gcse-combined', 'ocr-gcse-combined']);

const cache = new Map<string, Bank>();
async function bank(name: string) {
  if (!cache.has(name)) cache.set(name, await BANKS[name]());
  return cache.get(name)!;
}

/** Questions for every topic of a spec, in topic order. Higher-only questions are dropped for Foundation. */
export async function loadQuestions(specId: string, tier?: 'F' | 'H'): Promise<Question[][] | null> {
  const map = SPEC_AREAS[specId];
  if (!map) return null;
  const names = Array.from(new Set(map.flat().map((k) => k.split(':')[0])));
  await Promise.all(names.map(bank));
  const combined = combinedSpecs.has(specId);
  return map.map((keys) => {
    const seen = new Set<string>();
    return keys.flatMap((k) => {
      const [b, ...area] = k.split(':');
      return cache.get(b)?.[area.join(':')] ?? [];
    }).filter((q) => !seen.has(q.id) && seen.add(q.id) && !(combined && q.separate) && !(tier === 'F' && q.higher));
  });
}

/** undefined while loading, null if Hilite has no questions for this spec yet. */
export function useQuestions(specId?: string, tier?: 'F' | 'H'): Question[][] | null | undefined {
  const [qs, setQs] = useState<Question[][] | null | undefined>(undefined);
  useEffect(() => {
    if (!specId || !hasQuestions(specId)) { setQs(null); return; }
    let live = true;
    setQs(undefined);
    loadQuestions(specId, tier).then((r) => { if (live) setQs(r); }).catch(() => { if (live) setQs(null); });
    return () => { live = false; };
  }, [specId, tier]);
  return qs;
}
