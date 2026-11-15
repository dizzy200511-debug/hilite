import { SPECS, specById, type Paper, type Spec } from '../catalog/catalog';
import { daysBetween, today } from './dates';
import type { ExamDates, Profile } from './types';

export interface MySitting {
  key: string; spec: Spec; paper: Paper; colour: number; tier?: 'F' | 'H';
  date: string | null; session: 'AM' | 'PM' | null; custom: boolean;
}

export function mySittings(profile: Profile, overrides: ExamDates): MySitting[] {
  const out: MySitting[] = [];
  profile.subjects.forEach((choice) => {
    const spec = specById(choice.specId);
    if (!spec) return;
    spec.papers.forEach((paper) => {
      const key = spec.id + ':' + paper.id;
      const o = overrides[key];
      out.push({
        key, spec, paper, colour: choice.colour, tier: choice.tier,
        date: o ? o.date : paper.sitting ? paper.sitting.date : null,
        session: o ? o.session : paper.sitting ? paper.sitting.session : null,
        custom: !!o,
      });
    });
  });
  return out.sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || (a.session === 'PM' ? 1 : -1));
}

export const upcoming = (list: MySitting[]) => list.filter((s) => s.date && s.date >= today());
export const undated = (list: MySitting[]) => list.filter((s) => !s.date);

/** Two papers in the same session on the same day. */
export function clashes(list: MySitting[]): [MySitting, MySitting][] {
  const out: [MySitting, MySitting][] = [];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    if (a.date && a.date === b.date && a.session === b.session && a.spec.id !== b.spec.id) out.push([a, b]);
  }
  return out;
}
export const daysUntil = (date: string) => daysBetween(today(), date);

export function examStart(s: MySitting): Date | null {
  if (!s.date) return null;
  const [y, m, d] = s.date.split('-').map(Number);
  return new Date(y, m - 1, d, s.session === 'PM' ? 13 : 9, s.session === 'PM' ? 30 : 0);
}

/** iCalendar file for adding your exams to Google, Outlook or Apple calendars. */
export function toICS(list: MySitting[]): string {
  const pad = (n: number) => (n < 10 ? '0' : '') + n;
  const stamp = (dt: Date) => dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()) + 'T' + pad(dt.getUTCHours()) + pad(dt.getUTCMinutes()) + '00Z';
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hilite//Exams//EN', 'CALSCALE:GREGORIAN'];
  list.forEach((s) => {
    const start = examStart(s);
    if (!start) return;
    const end = new Date(start.getTime() + s.paper.mins * 60000);
    lines.push('BEGIN:VEVENT', 'UID:' + s.key + '-' + s.date + '@hilite', 'DTSTAMP:' + stamp(new Date()),
      'DTSTART:' + stamp(start), 'DTEND:' + stamp(end),
      'SUMMARY:' + esc(s.spec.subject + ' ' + s.paper.name),
      'DESCRIPTION:' + esc(s.spec.board + ' ' + s.spec.code + ' ' + s.paper.code + '. Check your school’s timetable for the exact start time and room.'),
      'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export const allSpecs = SPECS;
