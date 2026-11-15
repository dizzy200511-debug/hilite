import { useEffect, useState } from 'react';

/**
 * Direct links to official past papers on the exam boards' own sites, collected by scripts/fetch-past-papers.mjs.
 * Hilite links to the boards' files; it never hosts them.
 */
export interface PaperLink { tier?: 'F' | 'H'; option?: string; qp?: string; ms?: string; er?: string }
/** series is keyed "2023-June", then by paper id. */
export interface SpecPapers { checked: string; series: Record<string, Record<string, PaperLink[]>> }

const files = import.meta.glob<SpecPapers>('../catalog/papers/*.json', { import: 'default' });
const path = (specId: string) => '../catalog/papers/' + specId + '.json';
export const hasPaperLinks = (specId: string) => path(specId) in files;

/** undefined while loading, null if Hilite has no links for this spec. */
export function usePaperLinks(specId?: string): SpecPapers | null | undefined {
  const [data, setData] = useState<SpecPapers | null | undefined>(undefined);
  useEffect(() => {
    if (!specId || !hasPaperLinks(specId)) { setData(null); return; }
    let live = true;
    setData(undefined);
    files[path(specId)]().then((d) => { if (live) setData(d); }).catch(() => { if (live) setData(null); });
    return () => { live = false; };
  }, [specId]);
  return data;
}

/** "2023-June" -> { year: 2023, series: 'June' } */
export const parseSeries = (key: string) => ({ year: Number(key.slice(0, 4)), series: key.slice(5) as 'June' | 'November' });

/** The links for one paper, keeping only the student's tier when there is one. */
export const linksFor = (list: PaperLink[] | undefined, tier?: 'F' | 'H') => (list || []).filter((l) => !tier || !l.tier || l.tier === tier);
