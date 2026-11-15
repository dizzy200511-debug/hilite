/**
 * Static, crawlable exam-date pages: /exam-dates and one page per spec, plus sitemap.xml and robots.txt.
 * Built at `vite build` time by the plugin in vite.config.ts (and served by the dev server too).
 * Plain HTML styled with the app's own CSS, so search engines see everything without running the app.
 */
import { paperPages, paperSpecs } from './paperPages';
import type { SpecPapers } from '../lib/paperLinks';
import { BOARDS, CONTINGENCY_DAY, SPECS, TIMETABLE_YEAR, type Board, type Paper, type Spec } from '../catalog/catalog';

export interface StaticFile { fileName: string; source: string }
export interface Assets { css: string[]; script: string; site: string }

export const COUNTDOWN_SCRIPT = 'exam-dates/countdown.js';
const BOARD_ORDER: Board[] = ['AQA', 'Edexcel', 'OCR'];

export const specSlug = (s: Spec) => (s.board + ' ' + s.qual + ' ' + s.subject).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso: string, short = false) {
  const [y, m, d] = iso.split('-').map(Number);
  const day = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return short ? day.slice(0, 3) + ' ' + d + ' ' + MONTHS[m - 1].slice(0, 3) : day + ' ' + d + ' ' + MONTHS[m - 1] + ' ' + y;
}
const length = (mins: number) => (mins >= 60 ? Math.floor(mins / 60) + ' h' : '') + (mins % 60 ? (mins >= 60 ? ' ' : '') + (mins % 60) + ' min' : '');
const session = (p: Paper) => (p.sitting!.session === 'AM' ? 'Morning, 9am' : 'Afternoon, 1.30pm');
const dated = (s: Spec) => s.papers.filter((p) => p.sitting).sort((a, b) => a.sitting!.date.localeCompare(b.sitting!.date) || a.sitting!.session.localeCompare(b.sitting!.session));
const boardName = (s: Spec) => BOARDS[s.board].name;
export const specTitle = (s: Spec) => boardName(s) + ' ' + s.qual + ' ' + s.subject;

export function page(a: Assets, path: string, pageTitle: string, description: string, body: string) {
  const url = a.site + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(pageTitle)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(a.site)}/icon.png" />
<meta name="theme-color" content="#f4f5f7" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0f1115" media="(prefers-color-scheme: dark)" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
${a.css.map((h) => `<link rel="stylesheet" href="${esc(h)}" />`).join('\n')}
<script src="${esc(a.script)}"></script>
</head>
<body>
<div class="landing">
<header class="lnav">
<a class="brand" href="/" style="color:var(--ink);text-decoration:none"><span class="brand-mark"><i></i></span>Hilite</a>
<nav class="row" style="gap:6px"><a class="btn btn-ghost hide-sm" href="/past-papers">Past papers</a><a class="btn btn-ghost hide-sm" href="/exam-dates">Exam dates</a><a class="btn btn-ghost" href="/signin">Sign in</a><a class="btn btn-primary" href="/signup">Get started</a></nav>
</header>
<main class="lsection seo">
${body}
</main>
<footer class="lfoot">
<span>© 2026 Hilite</span><a href="/exam-dates">GCSE exam dates ${TIMETABLE_YEAR}</a><a href="/past-papers">GCSE past papers</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a>
<span style="margin-left:auto">Dates from the boards’ published timetables. Always check your school’s final timetable.</span>
</footer>
</div>
</body>
</html>
`;
}

const until = (iso: string) => `<span class="num" data-until="${iso}">${esc(longDate(iso, true))}</span>`;

function specPage(spec: Spec, a: Assets): string {
  const papers = dated(spec);
  const first = papers[0]?.sitting!.date, last = papers[papers.length - 1]?.sitting!.date;
  const name = specTitle(spec);
  const sameBoard = SPECS.filter((s) => s.board === spec.board && s.qual === spec.qual && s.id !== spec.id && dated(s).length);
  const rows = papers.map((p) => {
    const covers = p.topics?.length ? `<div class="small muted">Covers ${esc(p.topics.map((i) => spec.topics[i]).join(', '))}</div>` : '';
    return `<tr><td><b>${esc(p.name)}</b><div class="small muted num">${esc(p.code)}</div>${covers}</td>`
      + `<td class="num">${esc(longDate(p.sitting!.date))}<div class="small muted">${session(p)}</div></td>`
      + `<td class="num hide-sm" style="white-space:nowrap">${length(p.mins)}</td><td class="num">${until(p.sitting!.date)}</td></tr>`;
  }).join('\n');
  const summary = papers.length === 1
    ? `One paper, on ${longDate(first!)}.`
    : `${papers.length} papers, from ${longDate(first!)} to ${longDate(last!)}.`;
  const body = `
<nav class="small crumbs"><a href="/exam-dates">GCSE exam dates ${TIMETABLE_YEAR}</a> <span class="faint">/</span> <span class="muted">${esc(boardName(spec))}</span></nav>
<h1>${esc(name)} exam dates ${TIMETABLE_YEAR}</h1>
<p class="lead">Specification <span class="num">${esc(spec.code)}</span>. ${esc(summary)}${spec.tiered ? ' Foundation and Higher tier papers are sat at the same time.' : ''}</p>
${first ? `<div class="countdown" style="margin-bottom:24px"><b data-until="${first}" data-plain>–</b><span class="muted">until the first paper</span></div>` : ''}
<div class="panel scroll-x"><table class="table" style="margin-top:14px">
<thead><tr><th>Paper</th><th>Date</th><th class="hide-sm">Length</th><th>Countdown</th></tr></thead>
<tbody>
${rows}
</tbody></table></div>
${spec.note ? `<p class="small muted" style="margin-top:10px">${esc(spec.note)}</p>` : ''}
<div class="panel panel-pad seo-cta">
<div class="grow"><h2>Plan your revision around these dates</h2><p class="muted">Hilite loads every paper for your subjects, then builds a revision plan that gets each topic done before its exam. Free, with no card needed.</p></div>
<a class="btn btn-primary btn-lg" href="/signup">Plan your revision free</a>
</div>
<h2>Good to know</h2>
<ul class="seo-notes">
<li>Morning exams start at 9am and afternoon exams at 1.30pm. Your school can move the start time a little, so check your own timetable for times and rooms.</li>
<li>${esc(longDate(CONTINGENCY_DAY))} is the contingency day. Stay available until then in case an exam has to be moved.</li>
<li>Practise with the official past papers and mark schemes on the <a href="${esc(BOARDS[spec.board].pastPapers)}" rel="noopener">${esc(boardName(spec))} website</a>.</li>
<li>Source: ${esc(BOARDS[spec.board].timetableSource)}.</li>
</ul>
${sameBoard.length ? `<h2>Other ${esc(boardName(spec))} ${esc(spec.qual)} exam dates</h2>
<ul class="subject-links">${sameBoard.map((s) => `<li><a href="/exam-dates/${specSlug(s)}">${esc(s.subject)}</a></li>`).join('')}</ul>` : ''}
`;
  const desc = `Every ${name} (${spec.code}) exam date for summer ${TIMETABLE_YEAR}: ${papers.map((p) => p.name.split(':')[0] + ' on ' + longDate(p.sitting!.date, true)).join(', ')}. With session times, lengths and a countdown.`;
  return page(a, '/exam-dates/' + specSlug(spec), name + ' exam dates ' + TIMETABLE_YEAR + ' · Hilite', desc, body);
}

function indexPage(a: Assets): string {
  const groups = BOARD_ORDER.map((b) => {
    const specs = SPECS.filter((s) => s.board === b && dated(s).length).sort((x, y) => x.subject.localeCompare(y.subject));
    if (!specs.length) return '';
    const items = specs.map((s) => {
      const p = dated(s);
      return `<li class="item"><div class="grow"><a class="title" href="/exam-dates/${specSlug(s)}">${esc(s.subject)}</a><div class="meta"><span class="num">${esc(s.code)}</span><span>${p.length} paper${p.length === 1 ? '' : 's'}</span></div></div>`
        + `<div class="small muted num" style="text-align:right">${esc(longDate(p[0].sitting!.date, true))}${p.length > 1 ? ' to ' + esc(longDate(p[p.length - 1].sitting!.date, true)) : ''}</div></li>`;
    }).join('\n');
    return `<h2>${esc(BOARDS[b].name)} GCSE</h2><div class="panel"><ul class="list" style="padding:0 20px">${items}</ul></div>`;
  }).join('\n');
  const body = `
<h1>GCSE exam dates ${TIMETABLE_YEAR}</h1>
<p class="lead">Every written paper for AQA, Pearson Edexcel and OCR GCSEs in summer ${TIMETABLE_YEAR}, with dates, sessions and a countdown. Exams run from ${esc(longDate(firstDate()))} to ${esc(longDate(lastDate()))}, and ${esc(longDate(CONTINGENCY_DAY))} is the contingency day.</p>
<div class="panel panel-pad seo-cta">
<div class="grow"><h2>See only your own exams</h2><p class="muted">Pick your board and subjects in Hilite and get your personal timetable, clash warnings and a revision plan that fits every topic in.</p></div>
<a class="btn btn-primary btn-lg" href="/signup">Plan your revision free</a>
</div>
${groups}
`;
  return page(a, '/exam-dates', 'GCSE exam dates ' + TIMETABLE_YEAR + ': AQA, Edexcel and OCR · Hilite',
    `Every GCSE exam date for summer ${TIMETABLE_YEAR} by board and subject: AQA, Pearson Edexcel and OCR, with session times and a countdown to each paper.`, body);
}

const allDates = () => SPECS.flatMap((s) => dated(s).map((p) => p.sitting!.date)).sort();
const firstDate = () => allDates()[0];
const lastDate = () => allDates()[allDates().length - 1];

/** Sets the theme before paint (same rule as the app) and fills in every countdown. */
export const countdownScript = `(function () {
  try {
    var t = localStorage.getItem('hilite:theme');
    var dark = t === 'dark' || ((!t || t === 'auto') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  } catch (e) { /* ignore */ }
  function run() {
    var now = new Date();
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    document.querySelectorAll('[data-until]').forEach(function (el) {
      var p = el.getAttribute('data-until').split('-');
      var n = Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - today) / 864e5);
      if (el.hasAttribute('data-plain')) { el.textContent = n > 0 ? String(n) : '0'; if (el.nextElementSibling) el.nextElementSibling.textContent = n === 1 ? 'day until the first paper' : n > 0 ? 'days until the first paper' : 'Exams have started'; return; }
      el.textContent = n > 1 ? n + ' days' : n === 1 ? 'Tomorrow' : n === 0 ? 'Today' : 'Done';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
`;

export function buildExamPages(assets: Omit<Assets, 'script'>, papers: Record<string, SpecPapers> = {}): StaticFile[] {
  const a: Assets = { ...assets, script: '/' + COUNTDOWN_SCRIPT };
  const specs = SPECS.filter((s) => dated(s).length);
  const files: StaticFile[] = [
    { fileName: 'exam-dates.html', source: indexPage(a) },
    ...specs.map((s) => ({ fileName: 'exam-dates/' + specSlug(s) + '.html', source: specPage(s, a) })),
    { fileName: COUNTDOWN_SCRIPT, source: countdownScript },
    ...paperPages(a, papers),
  ];
  const urls = ['/', '/exam-dates', ...specs.map((s) => '/exam-dates/' + specSlug(s)), '/past-papers', ...paperSpecs(papers).map((s) => '/past-papers/' + specSlug(s)), '/privacy', '/terms'];
  files.push({
    fileName: 'sitemap.xml',
    source: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + urls.map((u) => `  <url><loc>${esc(a.site + (u === '/' ? '/' : u))}</loc></url>`).join('\n') + '\n</urlset>\n',
  });
  files.push({ fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${a.site}/sitemap.xml\n` });
  return files;
}
