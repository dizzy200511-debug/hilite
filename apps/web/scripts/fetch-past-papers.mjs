#!/usr/bin/env node
/**
 * Collects direct links to official past papers, mark schemes and examiner reports on the exam boards'
 * own websites, and saves them to src/catalog/papers/<specId>.json. Hilite only links to these files; it never
 * downloads, stores or re-hosts them.
 *
 *   AQA:     reads each subject's public assessment resources page (files are on AQA's CDN).
 *   Pearson: uses the same public search their past papers page uses. Secure (login-only) files are skipped.
 *   OCR:     reads each qualification's assessment page (OCR shows the recent public series there).
 *
 * Run from apps/web with Node 23.6 or newer:  npm run papers:update
 * Re-run each autumn, and after each results day, then commit the JSON.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { SPECS } from '../src/catalog/catalog.ts';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36 HiliteLinkChecker';
const OUT = new URL('../src/catalog/papers/', import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const AQA_PAGES = {
  'aqa-gcse-bio': 'biology/gcse/biology-8461', 'aqa-gcse-chem': 'chemistry/gcse/chemistry-8462', 'aqa-gcse-phys': 'physics/gcse/physics-8463',
  'aqa-gcse-trilogy': 'science/gcse/science-8464', 'aqa-gcse-maths': 'mathematics/gcse/mathematics-8300', 'aqa-gcse-englang': 'english/gcse/english-8700',
  'aqa-gcse-englit': 'english/gcse/english-8702', 'aqa-gcse-cs': 'computer-science/gcse/computer-science-8525', 'aqa-gcse-geog': 'geography/gcse/geography-8035',
  'aqa-gcse-hist': 'history/gcse/history-8145', 'aqa-gcse-psych': 'psychology/gcse/psychology-8182', 'aqa-gcse-rs': 'religious-studies/gcse/religious-studies-a-8062',
  'aqa-gcse-bus': 'business/gcse/business-8132', 'aqa-gcse-soc': 'sociology/gcse/sociology-8192',
  'aqa-al-bio': 'biology/a-level/biology-7402', 'aqa-al-chem': 'chemistry/a-level/chemistry-7405', 'aqa-al-phys': 'physics/a-level/physics-7408',
  'aqa-al-maths': 'mathematics/a-level/mathematics-7357', 'aqa-al-fmaths': 'mathematics/a-level/further-mathematics-7367',
  'aqa-al-psych': 'psychology/a-level/psychology-7182', 'aqa-al-soc': 'sociology/a-level/sociology-7192', 'aqa-al-englit': 'english/a-level/english-7712',
  'aqa-al-englang': 'english/a-level/english-7702', 'aqa-al-hist': 'history/a-level/history-7042', 'aqa-al-geog': 'geography/a-level/geography-7037',
  'aqa-al-econ': 'economics/a-level/economics-7136', 'aqa-al-bus': 'business/a-level/business-7132', 'aqa-al-cs': 'computer-science/a-level/computer-science-7517',
  'aqa-al-pol': 'politics/a-level/politics-7152', 'aqa-al-rs': 'religious-studies/a-level/religious-studies-7062',
};
const OCR_PAGES = {
  'ocr-gcse-cs': 'computer-science-j277-from-2020', 'ocr-gcse-maths': 'mathematics-j560-from-2015', 'ocr-gcse-bio': 'gateway-science-suite-biology-a-j247-from-2016',
  'ocr-gcse-chem': 'gateway-science-suite-chemistry-a-j248-from-2016', 'ocr-gcse-phys': 'gateway-science-suite-physics-a-j249-from-2016',
  'ocr-gcse-combined': 'gateway-science-suite-combined-science-a-j250-from-2016', 'ocr-gcse-englang': 'english-language-j351-from-2015',
  'ocr-gcse-englit': 'english-literature-j352-from-2015', 'ocr-gcse-hista': 'history-a-explaining-the-modern-world-j410-from-2016',
  'ocr-gcse-histb': 'history-b-schools-history-project-j411-from-2016', 'ocr-gcse-geoga': 'geography-a-geographical-themes-j383-from-2016',
  'ocr-gcse-geogb': 'geography-b-geography-for-enquiring-minds-j384-from-2016', 'ocr-gcse-rs': 'religious-studies-j625-j125-from-2016',
  'ocr-gcse-psych': 'psychology-j203-from-2017', 'ocr-gcse-bus': 'business-j204-from-2017', 'ocr-gcse-econ': 'economics-j205-from-2017',
  'ocr-gcse-pe': 'physical-education-j587-from-2016',
  'ocr-al-maths': 'mathematics-a-h230-h240-from-2017', 'ocr-al-bio': 'biology-a-h020-h420-from-2015', 'ocr-al-chem': 'chemistry-a-h032-h432-from-2015',
  'ocr-al-phys': 'physics-a-h156-h556-from-2015', 'ocr-al-cs': 'computer-science-h046-h446-from-2015', 'ocr-al-psych': 'psychology-h167-h567-from-2015',
  'ocr-al-hist': 'history-a-h105-h505-from-2015', 'ocr-al-englit': 'english-literature-h072-h472-from-2015', 'ocr-al-econ': 'economics-h060-h460-from-2019',
  'ocr-al-geog': 'geography-h081-h481-from-2016', 'ocr-al-rs': 'religious-studies-h173-h573-from-2016', 'ocr-al-soc': 'sociology-h180-h580-from-2015',
};
const PEARSON = { app: 'L639T95U5A', key: 'f79c7a8352e9ffbdaec387bf43612ee6', index: 'qualifications-uk_LIVE_master-content' };

/** Result: specId -> "2023-June" -> paperId -> list of { tier?, option?, qp?, ms?, er? }. */
const out = {};
const add = (specId, year, series, paperId, tier, option, kind, url) => {
  const s = (out[specId] ??= {}), k = year + '-' + series, p = ((s[k] ??= {})[paperId] ??= []);
  let e = p.find((x) => (x.tier || '') === (tier || '') && (x.option || '') === (option || ''));
  if (!e) { e = {}; if (tier) e.tier = tier; if (option) e.option = option; p.push(e); }
  if (!e[kind]) e[kind] = url;
};

async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      if (r.ok) return await r.text();
      if (r.status === 404) return '';
    } catch { /* retry */ }
    await sleep(1500);
  }
  return '';
}

/**
 * Paper key from a catalogue code: "8461/1" -> "1", "8464/B/1" -> "B1", "1SC0/1B" -> "1B", "1ET0/01" -> "1".
 * Option papers ("7042/1A–1L", "7367/3D, 3M or 3S", "9HI0/30–39") key on their paper number; the rest is the option.
 */
const keyOf = (code) => {
  const part = code.split('/').slice(1).join('');
  if (/[–,]| or /.test(part)) return part.replace(/^0+(?=\d)/, '')[0].toUpperCase();
  return part.replace(/^0+(?=\d)/, '').toUpperCase();
};

// ---------- AQA ----------
async function aqa(spec) {
  const html = (await get('https://www.aqa.org.uk/subjects/' + AQA_PAGES[spec.id] + '/assessment-resources')).replace(/\\"/g, '"');
  const re = /"originalFilename":"(AQA-[^"]+)".*?"url":"(https:\/\/cdn\.sanity\.io\/files\/[^"]+\.pdf)"/g;
  const papers = spec.papers.map((p) => ({ p, key: keyOf(p.code) })).sort((a, b) => b.key.length - a.key.length);
  let n = 0, m;
  while ((m = re.exec(html))) {
    // AQA-84611H-QP-JUN23.PDF; modified papers have an extra suffix and are skipped.
    const f = /^AQA-(\d{4})([A-Z0-9]+)-(QP|MS|WRE)-(JUN|NOV)(\d\d)\.PDF$/i.exec(m[1]);
    if (!f || f[1] !== spec.code) continue;
    const rest = f[2].toUpperCase();
    const hit = papers.find(({ key }) => rest.startsWith(key) && /^[FH]?$/.test(rest.slice(key.length)))
      ?? papers.find(({ key }) => rest.startsWith(key) && /^[A-Z]$/.test(rest.slice(key.length)));
    if (!hit) continue;
    const tail = rest.slice(hit.key.length);
    const tier = /^[FH]$/.test(tail) && spec.tiered ? tail : undefined;
    const option = tail && !tier ? tail : undefined;
    add(spec.id, 2000 + Number(f[5]), f[4].toUpperCase() === 'JUN' ? 'June' : 'November', hit.p.id, tier, option, { QP: 'qp', MS: 'ms', WRE: 'er' }[f[3].toUpperCase()], m[2]);
    n++;
  }
  return n;
}

// ---------- Pearson ----------
async function pearson(spec) {
  const code = spec.code.toLowerCase();
  const papers = spec.papers.map((p) => ({ p, key: keyOf(p.code).toLowerCase() })).sort((a, b) => b.key.length - a.key.length);
  let n = 0;
  for (let page = 0; page < 10; page++) {
    const r = await fetch(`https://${PEARSON.app}-dsn.algolia.net/1/indexes/${PEARSON.index}/query`, {
      method: 'POST',
      headers: { 'X-Algolia-Application-Id': PEARSON.app, 'X-Algolia-API-Key': PEARSON.key, 'content-type': 'application/json', referer: 'https://qualifications.pearson.com/' },
      body: JSON.stringify({ query: code, hitsPerPage: 200, page }),
    });
    if (!r.ok) break;
    const d = await r.json();
    for (const h of d.hits || []) {
      const url = h.url || '';
      if (url.includes('/secure/')) continue;
      // 1bi0-1h-que-20220518.pdf, 1hi0-10-rms-20230525.pdf, older ones 1ET0_02_rms_20190822.pdf
      const f = new RegExp('/' + code + '[-_]+([a-z0-9]+)[-_]+(que|rms|pef)[-_]+(\\d{4})(\\d\\d)\\d\\d\\.pdf$', 'i').exec(url);
      if (!f) continue;
      f[2] = f[2].toLowerCase();
      const tok = f[1].toLowerCase().replace(/^0+(?=\d)/, '');
      let hit = papers.find(({ key }) => tok === key || (spec.tiered && tok.length === key.length + 1 && tok.startsWith(key) && /[fh]$/.test(tok)));
      let option;
      if (!hit) { hit = papers.find(({ key }) => /^\d$/.test(key) && tok.startsWith(key) && /^\d+$/.test(tok)); option = hit ? tok : undefined; }
      // A-level option papers such as 9FM0/4A or 9PL0/3B.
      if (!hit) { hit = papers.find(({ key }) => /^\d$/.test(key) && tok.length === 2 && tok.startsWith(key) && /[a-z]$/.test(tok)); option = hit ? tok.toUpperCase() : undefined; }
      if (!hit) continue;
      const tier = spec.tiered && /[fh]$/.test(tok) ? tok.slice(-1).toUpperCase() : undefined;
      const month = Number(f[4]);
      add(spec.id, Number(f[3]), month >= 10 ? 'November' : 'June', hit.p.id, tier, option, { que: 'qp', rms: 'ms', pef: 'er' }[f[2]], 'https://qualifications.pearson.com' + encodeURI(url));
      n++;
    }
    if (page + 1 >= (d.nbPages || 0)) break;
    await sleep(400);
  }
  return n;
}

// ---------- OCR ----------
/** Component number -> { paperId, tier?, option? }, from catalogue codes like "J560/01 or 04" and "J625/01–05". */
function ocrComponents(spec) {
  const map = new Map();
  spec.papers.forEach((p) => {
    const nums = p.code.split('/')[1] || '';
    const or = /^(\d+) or (\d+)$/.exec(nums), range = /^(\d+)[–-](\d+)$/.exec(nums);
    if (or) { map.set(Number(or[1]), { paperId: p.id, tier: 'F' }); map.set(Number(or[2]), { paperId: p.id, tier: 'H' }); }
    else if (range) { for (let i = Number(range[1]); i <= Number(range[2]); i++) if (!map.has(i)) map.set(i, { paperId: p.id, option: String(i).padStart(2, '0') }); }
    else if (/^\d+$/.test(nums)) map.set(Number(nums), { paperId: p.id });
  });
  return map;
}
/** OCR titles for papers with options name the option, not the paper: which paper each option belongs to. */
const OCR_OPTIONS = {
  'ocr-gcse-hista': [[/international relations|period study/i, 'p1'], [/migrants|power:|war and british society|thematic/i, 'p2'], [/norman|elizabethans|peace and war|anglo|historic environment|british depth/i, 'p3']],
  'ocr-gcse-histb': [[/history around us/i, 'p2'], [/viking|mughal|making of america|nazi|aztec|cold war/i, 'p3'], [/people.s health|crime and punishment|migrants/i, 'p1']],
  'ocr-gcse-rs': [[/philosophy and ethics/i, 'p3'], [/beliefs and teaching/i, 'p1']],
  // A-level History A: unit codes Y1xx, Y2xx and Y3xx are the three unit groups.
  'ocr-al-hist': [[/\bY1\d\d\b|enquiry/i, 'p1'], [/\bY2\d\d\b/i, 'p2'], [/\bY3\d\d\b|interpretations|thematic/i, 'p3']],
  'ocr-al-rs': [[/developments in/i, 'p3']],
};
const norm = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
/** Which paper (and tier or option) an OCR link title is for, e.g. "Paper 3" or "Computer systems". */
function ocrMatch(spec, comps, title) {
  const num = /^paper (\d+)\b/i.exec(title);
  if (num && comps.get(Number(num[1]))) return comps.get(Number(num[1]));
  const code = new RegExp(spec.code + '\\/(\\d{2})', 'i').exec(title);
  if (code && comps.get(Number(code[1]))) return comps.get(Number(code[1]));
  for (const [re, paperId] of OCR_OPTIONS[spec.id] || []) if (re.test(title)) return { paperId, option: title.replace(/\s+/g, ' ').trim() };
  const t = norm(title);
  const p = spec.papers.find((x) => { const core = norm(x.name.replace(/^Paper \d+:\s*/, '')); return core && (t.startsWith(core) || core.startsWith(t)); });
  return p ? { paperId: p.id } : null;
}
async function ocr(spec) {
  const html = await get('https://www.ocr.org.uk/qualifications/' + (spec.qual === 'GCSE' ? 'gcse/' : 'as-and-a-level/') + OCR_PAGES[spec.id] + '/assessment/');
  const comps = ocrComponents(spec);
  const tokens = html.split(/(<h\d[^>]*>[\s\S]*?<\/h\d>|<a [^>]*href="[^"]+\.pdf"[^>]*>[\s\S]*?<\/a>)/);
  let year = 0, series = '', n = 0;
  for (const t of tokens) {
    const text = t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const head = /(\d{4}) - (June|November) series/i.exec(text);
    if (t.startsWith('<h') && head) { year = Number(head[1]); series = head[2][0].toUpperCase() + head[2].slice(1).toLowerCase(); continue; }
    if (!t.startsWith('<a') || !year) continue;
    const href = /href="([^"]+\.pdf)"/.exec(t)[1];
    const kind = /^question paper/i.test(text) ? 'qp' : /^mark scheme/i.test(text) ? 'ms' : /^examiners?'? report/i.test(text) ? 'er' : null;
    if (!kind) continue;
    const c = ocrMatch(spec, comps, text.replace(/^[^-]+-\s*/, ''));
    if (!c) continue;
    const url = href.startsWith('http') ? href : 'https://www.ocr.org.uk' + href;
    // RS: each religion paper can be sat as Religion 1 or Religion 2.
    const ids = spec.id === 'ocr-gcse-rs' && c.paperId === 'p1' ? ['p1', 'p2'] : [c.paperId];
    ids.forEach((id) => add(spec.id, year, series, id, c.tier, c.option, kind, url));
    n++;
  }
  return n;
}

// ---------- Run ----------
const report = [];
for (const spec of SPECS) {
  let n = 0;
  try {
    if (spec.board === 'AQA' && AQA_PAGES[spec.id]) n = await aqa(spec);
    else if (spec.board === 'Edexcel') n = await pearson(spec);
    else if (spec.board === 'OCR' && OCR_PAGES[spec.id]) n = await ocr(spec);
  } catch (e) { console.error(spec.id, e.message); }
  report.push(spec.id.padEnd(22) + String(n).padStart(4) + ' files, ' + Object.keys(out[spec.id] || {}).length + ' series');
  await sleep(600);
}

// Check a sample of links really open, so a changed site doesn't ship broken links.
const all = Object.values(out).flatMap((s) => Object.values(s).flatMap((p) => Object.values(p).flat().flatMap((e) => [e.qp, e.ms, e.er].filter(Boolean))));
const sample = all.filter((_, i) => i % Math.max(1, Math.floor(all.length / 40)) === 0);
let bad = 0;
for (const u of sample) {
  try { const r = await fetch(u, { method: 'HEAD', headers: { 'user-agent': UA }, redirect: 'follow' }); if (!r.ok) { bad++; console.warn('Broken:', r.status, u); } } catch { bad++; }
}

// One small file per spec, newest series first, so the app loads only the subject it needs.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const checked = new Date().toISOString().slice(0, 10);
for (const id of Object.keys(out)) {
  const series = Object.fromEntries(Object.entries(out[id]).sort(([a], [b]) => b.localeCompare(a)));
  writeFileSync(new URL(id + '.json', OUT), JSON.stringify({ checked, series }) + '\n');
}
console.log(report.join('\n'));
console.log(`\n${all.length} links saved. Checked ${sample.length}, ${bad} broken.`);
