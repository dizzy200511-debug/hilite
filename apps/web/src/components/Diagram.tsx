import type { CellPart, Diagram as D, DiagramPart } from '../content/questions/types';

/**
 * Draws a question's picture from data: graphs, bar charts, tables, circuits, triangles, cells,
 * Venn diagrams, waves and force diagrams. Colours come from the theme, so it works in dark mode.
 */
export function Diagram({ d }: { d: D }) {
  if (d.type === 'table') {
    return (
      <div className="q-figure scroll-x">
        <table className="table q-table">
          <thead><tr>{d.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{d.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="num">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  return <figure className="q-figure"><svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label={label(d)} className="q-svg">{body(d)}</svg></figure>;
}

const W = 360, H = 240;
const INK = 'var(--ink-2)', TEXT = 'var(--ink)', FAINT = 'var(--line-strong)', ACC = 'var(--accent)';
const t = (x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = 12) =>
  <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={TEXT}>{s}</text>;

function label(d: D) {
  switch (d.type) {
    case 'graph': return 'Graph of ' + d.y + ' against ' + d.x;
    case 'bar': return 'Bar chart of ' + d.y + ' for each ' + d.x;
    case 'circuit': return 'Circuit diagram with ' + d.parts.join(', ');
    case 'triangle': return 'Right-angled triangle';
    case 'cell': return 'Diagram of ' + (d.kind === 'bacterium' ? 'a bacterial' : d.kind === 'animal' ? 'an animal' : 'a plant') + ' cell with labelled parts';
    case 'venn': return 'Venn diagram of ' + d.a + ' and ' + d.b;
    case 'wave': return 'Diagram of a transverse wave';
    case 'forces': return 'Force diagram';
    default: return 'Diagram';
  }
}

function body(d: D) {
  switch (d.type) {
    case 'graph': return graph(d);
    case 'bar': return bar(d);
    case 'circuit': return circuit(d);
    case 'triangle': return triangle(d);
    case 'cell': return cell(d);
    case 'venn': return venn(d);
    case 'wave': return wave(d);
    case 'forces': return forces(d);
    default: return null;
  }
}

// Plot area shared by graphs and bar charts.
const L = 52, R = 344, T = 14, B = 196;
function axes(xLabel: string, yLabel: string, yMax: number, yStep: number) {
  const ticks = [];
  for (let v = 0; v <= yMax + 1e-9; v += yStep) {
    const y = B - (v / yMax) * (B - T);
    ticks.push(<g key={'y' + v}><line x1={L} x2={R} y1={y} y2={y} stroke={FAINT} strokeWidth={0.6} />{t(L - 6, y + 4, fmt(v), 'end', 11)}</g>);
  }
  return (
    <>
      {ticks}
      <line x1={L} y1={T} x2={L} y2={B} stroke={INK} strokeWidth={1.4} />
      <line x1={L} y1={B} x2={R} y2={B} stroke={INK} strokeWidth={1.4} />
      {t((L + R) / 2, H - 6, xLabel)}
      <text x={14} y={(T + B) / 2} fontSize={12} fill={TEXT} textAnchor="middle" transform={'rotate(-90 14 ' + (T + B) / 2 + ')'}>{yLabel}</text>
    </>
  );
}
const fmt = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1));

function graph(d: Extract<D, { type: 'graph' }>) {
  const px = (x: number) => L + (x / d.xMax) * (R - L);
  const py = (y: number) => B - (y / d.yMax) * (B - T);
  const xt = [];
  for (let v = 0; v <= d.xMax + 1e-9; v += d.xStep) xt.push(<g key={'x' + v}><line x1={px(v)} x2={px(v)} y1={T} y2={B} stroke={FAINT} strokeWidth={0.6} />{t(px(v), B + 15, fmt(v), 'middle', 11)}</g>);
  return (
    <>
      {xt}
      {axes(d.x, d.y, d.yMax, d.yStep)}
      {d.series.map((s, i) => {
        const last = s.points[s.points.length - 1];
        return (
          <g key={i}>
            <polyline points={s.points.map(([x, y]) => px(x) + ',' + py(y)).join(' ')} fill="none" stroke={i ? INK : ACC} strokeWidth={2} strokeDasharray={i ? '5 4' : undefined} />
            {s.dots && s.points.map(([x, y], j) => <circle key={j} cx={px(x)} cy={py(y)} r={3} fill={i ? INK : ACC} />)}
            {s.label && t(Math.min(px(last[0]) + 4, R - 2), py(last[1]) - 6, s.label, px(last[0]) > R - 60 ? 'end' : 'start', 11)}
          </g>
        );
      })}
    </>
  );
}

function bar(d: Extract<D, { type: 'bar' }>) {
  const n = d.bars.length, gap = (R - L) / n;
  return (
    <>
      {axes(d.x, d.y, d.yMax, d.yStep)}
      {d.bars.map(([name, v], i) => {
        const h = (v / d.yMax) * (B - T);
        return <g key={name}><rect x={L + gap * i + gap * 0.2} y={B - h} width={gap * 0.6} height={h} fill={ACC} opacity={0.85} rx={2} />{t(L + gap * i + gap / 2, B + 15, name, 'middle', 11)}</g>;
      })}
    </>
  );
}

/** Components drawn centred on (0,0), about 40 wide, on a horizontal wire. */
function part(p: DiagramPart) {
  const s = { stroke: INK, strokeWidth: 1.6, fill: 'none' };
  switch (p) {
    case 'cell': return <g {...s}><line x1={-20} y1={0} x2={-4} y2={0} /><line x1={-4} y1={-14} x2={-4} y2={14} /><line x1={4} y1={-7} x2={4} y2={7} strokeWidth={3} /><line x1={4} y1={0} x2={20} y2={0} /></g>;
    case 'battery': return <g {...s}><line x1={-20} y1={0} x2={-12} y2={0} /><line x1={-12} y1={-14} x2={-12} y2={14} /><line x1={-5} y1={-7} x2={-5} y2={7} strokeWidth={3} /><line x1={-5} y1={0} x2={5} y2={0} strokeDasharray="2 2" /><line x1={5} y1={-14} x2={5} y2={14} /><line x1={12} y1={-7} x2={12} y2={7} strokeWidth={3} /><line x1={12} y1={0} x2={20} y2={0} /></g>;
    case 'resistor': return <g {...s}><line x1={-20} y1={0} x2={-14} y2={0} /><rect x={-14} y={-7} width={28} height={14} fill="var(--surface)" /><line x1={14} y1={0} x2={20} y2={0} /></g>;
    case 'variable': return <g {...s}><line x1={-20} y1={0} x2={-14} y2={0} /><rect x={-14} y={-7} width={28} height={14} fill="var(--surface)" /><line x1={14} y1={0} x2={20} y2={0} /><line x1={-14} y1={12} x2={14} y2={-12} /><path d="M14 -12 l-7 1 l4 5 z" fill={INK} /></g>;
    case 'thermistor': return <g {...s}><line x1={-20} y1={0} x2={-14} y2={0} /><rect x={-14} y={-7} width={28} height={14} fill="var(--surface)" /><line x1={14} y1={0} x2={20} y2={0} /><polyline points="-16,12 -10,12 14,-12" /></g>;
    case 'ldr': return <g {...s}><circle r={16} fill="var(--surface)" /><rect x={-10} y={-5} width={20} height={10} /><line x1={-20} y1={0} x2={-10} y2={0} /><line x1={10} y1={0} x2={20} y2={0} /><line x1={-14} y1={-26} x2={-6} y2={-16} /><line x1={-4} y1={-28} x2={4} y2={-18} /></g>;
    case 'lamp': return <g {...s}><line x1={-20} y1={0} x2={-12} y2={0} /><circle r={12} fill="var(--surface)" /><line x1={-8.5} y1={-8.5} x2={8.5} y2={8.5} /><line x1={-8.5} y1={8.5} x2={8.5} y2={-8.5} /><line x1={12} y1={0} x2={20} y2={0} /></g>;
    case 'ammeter': return <g {...s}><line x1={-20} y1={0} x2={-12} y2={0} /><circle r={12} fill="var(--surface)" /><text y={5} textAnchor="middle" fontSize={13} fill={TEXT} stroke="none">A</text><line x1={12} y1={0} x2={20} y2={0} /></g>;
    case 'switch': return <g {...s}><line x1={-20} y1={0} x2={-10} y2={0} /><circle cx={-10} r={2} fill={INK} /><line x1={-10} y1={0} x2={10} y2={-12} /><circle cx={12} r={2} fill={INK} /><line x1={12} y1={0} x2={20} y2={0} /></g>;
    case 'diode': return <g {...s}><line x1={-20} y1={0} x2={-8} y2={0} /><path d="M-8 -9 L8 0 L-8 9 Z" fill="var(--surface)" /><line x1={8} y1={-9} x2={8} y2={9} /><line x1={8} y1={0} x2={20} y2={0} /></g>;
    case 'fuse': return <g {...s}><line x1={-20} y1={0} x2={20} y2={0} /><rect x={-12} y={-6} width={24} height={12} fill="var(--surface)" /><line x1={-12} y1={0} x2={12} y2={0} /></g>;
  }
}

function circuit(d: Extract<D, { type: 'circuit' }>) {
  // Parts sit along the top wire; the loop closes along the bottom.
  const x0 = 40, x1 = 320, top = 70, bottom = 190, n = d.parts.length;
  const slot = (i: number) => x0 + ((x1 - x0) / (n + 1)) * (i + 1);
  const v = d.voltmeterAcross;
  return (
    <>
      <polyline points={x0 + ',' + top + ' ' + x0 + ',' + bottom + ' ' + x1 + ',' + bottom + ' ' + x1 + ',' + top} fill="none" stroke={INK} strokeWidth={1.6} />
      <line x1={x0} y1={top} x2={x1} y2={top} stroke={INK} strokeWidth={1.6} />
      {d.parts.map((p, i) => (
        <g key={i} transform={'translate(' + slot(i) + ' ' + top + ')'}>
          <rect x={-21} y={-3} width={42} height={6} fill="var(--surface)" />
          {part(p)}
          {d.labels?.[i] && t(0, p === 'ldr' ? 34 : 30, d.labels[i], 'middle', 11)}
        </g>
      ))}
      {v != null && v < n && (
        <g stroke={INK} strokeWidth={1.4} fill="none">
          <polyline points={(slot(v) - 26) + ',' + top + ' ' + (slot(v) - 26) + ',' + (top - 40) + ' ' + (slot(v) - 12) + ',' + (top - 40)} />
          <polyline points={(slot(v) + 26) + ',' + top + ' ' + (slot(v) + 26) + ',' + (top - 40) + ' ' + (slot(v) + 12) + ',' + (top - 40)} />
          <circle cx={slot(v)} cy={top - 40} r={12} fill="var(--surface)" />
          <text x={slot(v)} y={top - 35} textAnchor="middle" fontSize={13} fill={TEXT} stroke="none">V</text>
        </g>
      )}
    </>
  );
}

function triangle(d: Extract<D, { type: 'triangle' }>) {
  // Right angle at the bottom right; the marked angle is at the bottom left.
  const A = [60, 200], Bp = [300, 200], C = [300, 50];
  return (
    <>
      <polygon points={[A, Bp, C].map((p) => p.join(',')).join(' ')} fill="none" stroke={INK} strokeWidth={1.8} />
      <polyline points="286,200 286,186 300,186" fill="none" stroke={INK} strokeWidth={1.2} />
      {d.base && t(180, 220, d.base)}
      {d.height && t(312, 130, d.height, 'start')}
      {d.hyp && t(168, 114, d.hyp, 'end')}
      {d.angle && <><path d="M100 200 A40 40 0 0 0 94 179" fill="none" stroke={ACC} strokeWidth={1.4} />{t(110, 192, d.angle, 'start')}</>}
    </>
  );
}

const CELL_POINTS: Record<'animal' | 'plant' | 'bacterium', Partial<Record<CellPart, [number, number]>>> = {
  animal: { membrane: [89, 112], nucleus: [180, 118], cytoplasm: [140, 160], mitochondrion: [236, 92], ribosome: [212, 160] },
  plant: { wall: [96, 120], membrane: [106, 150], vacuole: [200, 120], nucleus: [126, 92], chloroplast: [246, 170], cytoplasm: [250, 136], mitochondrion: [118, 170] },
  bacterium: { wall: [150, 80], membrane: [150, 90], dna: [176, 120], plasmid: [236, 140], ribosome: [140, 140], flagellum: [316, 120], cytoplasm: [220, 125] },
};
function cell(d: Extract<D, { type: 'cell' }>) {
  const s = { stroke: INK, strokeWidth: 1.6, fill: 'none' };
  const shape = d.kind === 'animal' ? (
    <g {...s}>
      <path d="M90 120 C 80 60, 170 40, 230 56 C 290 70, 300 150, 250 182 C 200 210, 100 200, 90 120 Z" />
      <circle cx={180} cy={118} r={22} fill="var(--surface-2)" />
      <ellipse cx={236} cy={92} rx={14} ry={7} /><ellipse cx={140} cy={84} rx={13} ry={6} transform="rotate(30 140 84)" />
      {[[212, 160], [130, 130], [250, 132], [160, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2} fill={INK} />)}
    </g>
  ) : d.kind === 'plant' ? (
    <g {...s}>
      <rect x={96} y={46} width={180} height={148} rx={6} strokeWidth={3} />
      <rect x={106} y={56} width={160} height={128} rx={4} />
      <rect x={146} y={86} width={92} height={70} rx={14} fill="var(--surface-2)" />
      <circle cx={126} cy={92} r={14} fill="var(--surface-2)" />
      {[[246, 170], [128, 140], [250, 100]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={11} ry={6} />)}
      <ellipse cx={118} cy={170} rx={9} ry={5} />
    </g>
  ) : (
    <g {...s}>
      <rect x={100} y={80} width={190} height={84} rx={42} strokeWidth={3} />
      <rect x={110} y={90} width={170} height={64} rx={32} />
      <path d="M150 110 c 20 -14, 40 20, 60 4 s 20 20, -10 22 s -60 4, -50 -26" />
      <circle cx={236} cy={140} r={6} /><circle cx={250} cy={110} r={5} />
      {[[140, 140], [200, 136], [170, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2} fill={INK} />)}
      <path d="M290 122 c 10 -10, 16 10, 26 0 s 16 10, 26 0" />
    </g>
  );
  // Each label goes on the side nearest its part, level with it, nudged apart so lines never cross.
  const pts = CELL_POINTS[d.kind];
  const placed = (Object.entries(d.labels) as [CellPart, string][]).filter(([p]) => pts[p]).map(([p, text]) => ({ p, text, at: pts[p]!, left: pts[p]![0] < 190, y: pts[p]![1] }));
  [true, false].forEach((side) => {
    const col = placed.filter((l) => l.left === side).sort((a, b) => a.y - b.y);
    col.forEach((l, i) => { if (i && l.y - col[i - 1].y < 24) l.y = col[i - 1].y + 24; });
  });
  return (
    <>
      {shape}
      {placed.map(({ p, text, at, left, y }) => {
        const lx = left ? 26 : 334;
        return <g key={p}><line x1={at[0]} y1={at[1]} x2={lx + (left ? 12 : -12)} y2={y} stroke={ACC} strokeWidth={1.2} /><circle cx={at[0]} cy={at[1]} r={2.5} fill={ACC} />{t(lx, y + 4, text, 'middle', 13)}</g>;
      })}
    </>
  );
}

function venn(d: Extract<D, { type: 'venn' }>) {
  return (
    <>
      <rect x={20} y={14} width={320} height={204} rx={6} fill="none" stroke={INK} strokeWidth={1.4} />
      <circle cx={140} cy={116} r={70} fill="none" stroke={ACC} strokeWidth={1.8} />
      <circle cx={220} cy={116} r={70} fill="none" stroke={INK} strokeWidth={1.8} />
      {t(96, 40, d.a, 'middle', 13)}{t(264, 40, d.b, 'middle', 13)}
      {t(112, 121, d.onlyA, 'middle', 15)}{t(180, 121, d.both, 'middle', 15)}{t(248, 121, d.onlyB, 'middle', 15)}
      {t(318, 206, d.outside, 'end', 15)}
    </>
  );
}

function wave(d: Extract<D, { type: 'wave' }>) {
  const mid = 120, amp = 60, x0 = 30, len = 140;
  const pts: string[] = [];
  for (let x = 0; x <= 300; x += 3) pts.push((x0 + x) + ',' + (mid - amp * Math.sin((x / len) * 2 * Math.PI)).toFixed(1));
  const peak1 = x0 + len / 4, peak2 = peak1 + len;
  return (
    <>
      <line x1={x0} y1={mid} x2={x0 + 300} y2={mid} stroke={FAINT} strokeWidth={1} strokeDasharray="4 4" />
      <polyline points={pts.join(' ')} fill="none" stroke={ACC} strokeWidth={2} />
      {d.amplitude && <g stroke={INK} strokeWidth={1.2}><line x1={peak1} y1={mid} x2={peak1} y2={mid - amp} /><path d={'M' + peak1 + ' ' + (mid - amp) + ' l-4 7 h8 z'} fill={INK} />{t(peak1 + 8, mid - amp / 2, d.amplitude, 'start')}</g>}
      {d.wavelength && <g stroke={INK} strokeWidth={1.2}><line x1={peak1} y1={mid - amp - 18} x2={peak2} y2={mid - amp - 18} /><line x1={peak1} y1={mid - amp - 24} x2={peak1} y2={mid - amp - 12} /><line x1={peak2} y1={mid - amp - 24} x2={peak2} y2={mid - amp - 12} />{t((peak1 + peak2) / 2, mid - amp - 24, d.wavelength)}</g>}
    </>
  );
}

function forces(d: Extract<D, { type: 'forces' }>) {
  const cx = 180, cy = 120;
  const arrow = (dx: number, dy: number, text?: string) => {
    if (!text) return null;
    const x2 = cx + dx * 100, y2 = cy + dy * 80;
    const ang = Math.atan2(dy, dx);
    const head = [[x2, y2], [x2 - 10 * Math.cos(ang - 0.4), y2 - 10 * Math.sin(ang - 0.4)], [x2 - 10 * Math.cos(ang + 0.4), y2 - 10 * Math.sin(ang + 0.4)]];
    return (
      <g key={dx + ',' + dy}>
        <line x1={cx + dx * 34} y1={cy + dy * 24} x2={x2} y2={y2} stroke={ACC} strokeWidth={2.2} />
        <polygon points={head.map((p) => p.join(',')).join(' ')} fill={ACC} />
        {t(x2 + dx * 8, y2 + (dy ? dy * 14 : -8), text, dx > 0 ? 'start' : dx < 0 ? 'end' : 'middle')}
      </g>
    );
  };
  return (
    <>
      <rect x={cx - 34} y={cy - 24} width={68} height={48} rx={4} fill="var(--surface-2)" stroke={INK} strokeWidth={1.6} />
      {d.label && t(cx, cy + 4, d.label, 'middle', 11)}
      {arrow(0, -1, d.up)}{arrow(0, 1, d.down)}{arrow(-1, 0, d.left)}{arrow(1, 0, d.right)}
    </>
  );
}
