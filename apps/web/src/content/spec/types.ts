/**
 * What each topic of a specification covers, broken into the spec's own sections and sub-topics.
 * Section and sub-topic names follow the board's structure; every "know" line is written in Hilite's
 * own words. Never paste specification text here: the boards don't allow it to be reproduced in apps.
 */
export interface SpecPoint {
  name: string;
  /** What you need to know or be able to do, in our own words. */
  know: string;
  /** Higher tier only. */
  higher?: boolean;
  /** Separate science only (not in combined science). */
  separate?: boolean;
}
export interface SpecSection { name: string; points: SpecPoint[] }
export interface SpecContent {
  /** Which specification this follows, for the "check the official spec" link. */
  source: string;
  url: string;
  note?: string;
  /** One list of sections per catalogue topic, in the same order as the spec's `topics`. */
  topics: SpecSection[][];
}
