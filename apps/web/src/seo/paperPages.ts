/**
 * Free, public past paper pages: /past-papers and one page per spec, with no sign-in. Every link opens the
 * official file on the exam board's own website; Hilite never hosts the papers.
 */
import { BOARDS, SPECS, type Board, type Spec } from '../catalog/catalog';
import type { PaperLink, SpecPapers } from '../lib/paperLinks';
import { esc, page, specSlug, specTitle, type Assets, type StaticFile } from './examPages';

const BOARD_ORDER: Board[] = ['AQA', 'Edexcel', 'OCR'];
export const paperSpecs = (papers: Record<string, SpecPapers>) => SPECS.filter((s) => papers[s.id] && Object.keys(papers[s.id].series).length);
const seriesName = (k: string) => k.slice(5) + ' ' + k.slice(0, 4);

function fileLinks(l: PaperLink) {
  const a = (href: string | undefined, label: string, cls: string) => (href ? `<a class="btn btn-sm ${cls}" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>` : '');
  return a(l.qp, 'Question paper', '') + a(l.ms, 'Mark scheme', 'btn-ghost') + a(l.er, 'Examiners’ report', 'btn-ghost hide-sm');
}

function specPage(spec: Spec, data: SpecPapers, all: Record<string, SpecPapers>, a: Assets): string {
  const name = specTitle(spec);
  const keys = Object.keys(data.series);
  const sections = keys.map((k) => {
    const rows = spec.papers.flatMap((p) => (data.series[k][p.id] || [])
      .slice().sort((x, y) => (x.option || '').localeCompare(y.option || '') || (x.tier || '').localeCompare(y.tier || ''))
      .map((l) => `<tr><td><b>${esc(p.name)}</b>${l.tier ? `<span class="tag" style="margin-left:8px">${l.tier === 'H' ? 'Higher' : 'Foundation'}</span>` : ''}${l.option ? `<div class="small muted">${esc(l.option)}</div>` : ''}</td><td class="pp-links">${fileLinks(l)}</td></tr>`)).join('');
    return rows ? `<section class="panel pp-series"><div class="panel-head"><h2>${esc(seriesName(k))}</h2></div><div class="panel-body scroll-x" style="padding-left:0;padding-right:0"><table class="table"><tbody>${rows}</tbody></table></div></section>` : '';
  }).join('\n');
  const others = paperSpecs(all).filter((s) => s.board === spec.board && s.id !== spec.id);
  const body = `
<nav class="small crumbs"><a href="/past-papers">GCSE past papers</a> <span class="faint">/</span> <span class="muted">${esc(BOARDS[spec.board].name)}</span></nav>
<h1>${esc(name)} past papers</h1>
<p class="lead">Question papers, mark schemes and examiners’ reports for specification <span class="num">${esc(spec.code)}</span>, free with no sign-up. ${keys.length} ${keys.length === 1 ? 'series' : 'series'}, from ${esc(seriesName(keys[keys.length - 1]))} to ${esc(seriesName(keys[0]))}. Every file opens on the ${esc(BOARDS[spec.board].name)} website.</p>
<div class="row wrap" style="margin-bottom:8px"><a class="btn" href="/exam-dates/${specSlug(spec)}">${esc(spec.subject)} exam dates 2027</a><a class="btn btn-ghost" href="${esc(BOARDS[spec.board].pastPapers)}" rel="noopener" target="_blank">${esc(BOARDS[spec.board].name)} past paper finder</a></div>
<div class="panel panel-pad seo-cta">
<div class="grow"><h2>Turn past papers into progress</h2><p class="muted">Sit papers in timed mock mode, log your marks to see your trend, and send every lost mark to a mistake log that retests you. Free.</p></div>
<a class="btn btn-primary btn-lg" href="/signup">Track your marks free</a>
</div>
<div class="stack" style="margin-top:24px">${sections}</div>
<p class="small muted" style="margin-top:16px">Links checked ${esc(data.checked)}. The newest series usually stay private until the board releases them. Papers are © ${esc(BOARDS[spec.board].name)}; Hilite only links to them.</p>
${others.length ? `<h2>Other ${esc(BOARDS[spec.board].name)} ${esc(spec.qual)} past papers</h2><ul class="subject-links">${others.map((s) => `<li><a href="/past-papers/${specSlug(s)}">${esc(s.subject)}</a></li>`).join('')}</ul>` : ''}
`;
  const desc = `Free ${name} (${spec.code}) past papers, mark schemes and examiners’ reports from ${seriesName(keys[keys.length - 1])} to ${seriesName(keys[0])}. No sign-up; every file opens on the official ${BOARDS[spec.board].name} site.`;
  return page(a, '/past-papers/' + specSlug(spec), name + ' past papers and mark schemes · Hilite', desc, body);
}

function indexPage(papers: Record<string, SpecPapers>, a: Assets): string {
  const groups = BOARD_ORDER.map((b) => {
    const specs = paperSpecs(papers).filter((s) => s.board === b).sort((x, y) => x.subject.localeCompare(y.subject));
    if (!specs.length) return '';
    return `<section><h2>${esc(BOARDS[b].name)} GCSE</h2><div class="pp-grid">${specs.map((s) => {
      const keys = Object.keys(papers[s.id].series);
      return `<a class="tool" href="/past-papers/${specSlug(s)}"><span class="tool-name">${esc(s.subject)}</span><p><span class="num">${esc(s.code)}</span>, ${keys.length} series, latest ${esc(seriesName(keys[0]))}</p></a>`;
    }).join('')}</div></section>`;
  }).join('\n');
  const body = `
<h1>Free GCSE past papers</h1>
<p class="lead">Question papers, mark schemes and examiners’ reports for AQA, Pearson Edexcel and OCR GCSEs. No account, no paywall: pick your subject and every file opens on the exam board’s own website.</p>
<div class="panel panel-pad seo-cta">
<div class="grow"><h2>Practise with a plan</h2><p class="muted">Hilite times your mocks, tracks your marks paper by paper and builds a revision plan around your real exam dates.</p></div>
<a class="btn btn-primary btn-lg" href="/signup">Start revising free</a>
</div>
<div class="stack" style="margin-top:8px">${groups}</div>
`;
  return page(a, '/past-papers', 'Free GCSE past papers and mark schemes: AQA, Edexcel, OCR · Hilite',
    'Free GCSE past papers, mark schemes and examiners’ reports for AQA, Pearson Edexcel and OCR, by subject. No sign-up; every file opens on the official exam board website.', body);
}

export function paperPages(a: Assets, papers: Record<string, SpecPapers>): StaticFile[] {
  const specs = paperSpecs(papers);
  if (!specs.length) return [];
  return [
    { fileName: 'past-papers.html', source: indexPage(papers, a) },
    ...specs.map((s) => ({ fileName: 'past-papers/' + specSlug(s) + '.html', source: specPage(s, papers[s.id], papers, a) })),
  ];
}
