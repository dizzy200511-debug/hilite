/**
 * Practice question bank. Every question is written for Hilite in our own words, in the style of GCSE
 * exam questions. Never copy questions from past papers or board materials: they're the boards' copyright.
 *
 * Questions are grouped into content areas (like "cells" or "algebra") rather than one spec's topics,
 * so one bank serves every board that teaches that content. `SPEC_AREAS` in index.ts maps each spec's
 * topics to areas.
 */

export type DiagramPart = 'cell' | 'battery' | 'resistor' | 'lamp' | 'ammeter' | 'switch' | 'variable' | 'diode' | 'ldr' | 'thermistor' | 'fuse';
export type CellPart = 'membrane' | 'nucleus' | 'cytoplasm' | 'mitochondrion' | 'ribosome' | 'wall' | 'chloroplast' | 'vacuole' | 'dna' | 'plasmid' | 'flagellum';

/** Pictures are drawn in code from data, so they suit light and dark mode and need no image files. */
export type Diagram =
  | { type: 'graph'; x: string; y: string; xMax: number; yMax: number; xStep: number; yStep: number; series: { points: [number, number][]; label?: string; dots?: boolean }[] }
  | { type: 'bar'; x: string; y: string; yMax: number; yStep: number; bars: [string, number][] }
  | { type: 'table'; head: string[]; rows: (string | number)[][] }
  | { type: 'circuit'; parts: DiagramPart[]; labels?: string[]; voltmeterAcross?: number }
  | { type: 'triangle'; base?: string; height?: string; hyp?: string; angle?: string }
  | { type: 'cell'; kind: 'animal' | 'plant' | 'bacterium'; labels: Partial<Record<CellPart, string>> }
  | { type: 'venn'; a: string; b: string; onlyA: string; both: string; onlyB: string; outside: string }
  | { type: 'wave'; amplitude?: string; wavelength?: string }
  | { type: 'forces'; up?: string; down?: string; left?: string; right?: string; label?: string };

export interface Question {
  /** Stable and unique across the whole bank, e.g. "bio-cells-03". Attempts are saved against it. */
  id: string;
  /** mcq: pick one option. short: a few words or a sentence or two. calc: working and an answer. long: 4 marks or more of extended writing. */
  kind: 'mcq' | 'short' | 'calc' | 'long';
  marks: number;
  /** 1 easy, 2 medium, 3 hard. */
  level: 1 | 2 | 3;
  q: string;
  options?: string[];
  /** Index of the right option, for mcq. */
  answer?: number;
  /** Mark scheme: one line per marking point. */
  scheme: string[];
  /** A full-mark answer, for written and calculation questions. */
  model?: string;
  diagram?: Diagram;
  /** Higher tier only. */
  higher?: boolean;
  /** Separate science only, so left out for combined science. */
  separate?: boolean;
}

/** One bank per subject area: questions by content area. */
export type Bank = Record<string, Question[]>;
