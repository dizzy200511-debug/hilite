#!/usr/bin/env node
/**
 * Draws the Hilite mark (the same one as `.brand-mark` in app.css: an ink square with a highlighted line
 * between two faint ones) and writes every icon the web and Windows apps need:
 *   web:     public/favicon.svg, public/icon.png (512), public/apple-touch-icon.png (180), public/favicon-32.png
 *   Windows: apps/desktop/build/icon.png (512) and icon.ico (16, 24, 32, 48, 64, 128, 256)
 * Run from apps/web:  npm run icons
 */
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// The mark on a 512 grid, scaled from the 26px brand mark (bar 12×4, faint lines 10×2 at ±6).
const INK = [20, 22, 27], HL = [255, 225, 77], FAINT = [148, 150, 156];
const SHAPES = [
  { x: 0, y: 0, w: 512, h: 512, r: 116, c: INK },
  { x: 158, y: 118, w: 196, h: 40, r: 20, c: FAINT },
  { x: 138, y: 217, w: 236, h: 78, r: 39, c: HL },
  { x: 158, y: 354, w: 196, h: 40, r: 20, c: FAINT },
];
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${SHAPES.map((s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.r}" fill="${hex(s.c)}"/>`).join('')}</svg>\n`;

/** Is the point inside a rounded rectangle? */
function inside(s, x, y) {
  if (x < s.x || y < s.y || x > s.x + s.w || y > s.y + s.h) return false;
  const cx = Math.min(Math.max(x, s.x + s.r), s.x + s.w - s.r), cy = Math.min(Math.max(y, s.y + s.r), s.y + s.h - s.r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= s.r * s.r;
}

/** Renders at `size` px with 8×8 supersampling, so small sizes stay crisp and edges are smooth. */
function render(size) {
  const px = Buffer.alloc(size * size * 4), N = 8, k = 512 / size;
  for (let py = 0; py < size; py++) for (let qx = 0; qx < size; qx++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < N; sy++) for (let sx = 0; sx < N; sx++) {
      const x = (qx + (sx + 0.5) / N) * k, y = (py + (sy + 0.5) / N) * k;
      let col = null;
      for (const s of SHAPES) if (inside(s, x, y)) col = s.c;
      if (col) { r += col[0]; g += col[1]; b += col[2]; a++; }
    }
    const i = (py * size + qx) * 4;
    if (a) { px[i] = Math.round(r / a); px[i + 1] = Math.round(g / a); px[i + 2] = Math.round(b / a); }
    px[i + 3] = Math.round((a / (N * N)) * 255);
  }
  return px;
}

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const v of buf) c = CRC[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
}
function png(size) {
  const px = render(size), raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
/** A Windows .ico holding PNG images at each size. */
function ico(sizes) {
  const imgs = sizes.map(png), head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let off = head.length;
  sizes.forEach((s, i) => {
    const e = 6 + i * 16;
    head[e] = s >= 256 ? 0 : s; head[e + 1] = s >= 256 ? 0 : s; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(imgs[i].length, e + 8); head.writeUInt32LE(off, e + 12); off += imgs[i].length;
  });
  return Buffer.concat([head, ...imgs]);
}

const web = new URL('../public/', import.meta.url), desk = new URL('../../desktop/build/', import.meta.url);
writeFileSync(new URL('favicon.svg', web), svg);
writeFileSync(new URL('icon.png', web), png(512));
writeFileSync(new URL('apple-touch-icon.png', web), png(180));
writeFileSync(new URL('favicon-32.png', web), png(32));
writeFileSync(new URL('icon.png', desk), png(512));
writeFileSync(new URL('icon.ico', desk), ico([16, 24, 32, 48, 64, 128, 256]));
console.log('Icons written.');
