import type { EventListItem } from '@/api/types';

const monthFormat = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const dayFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export type Month = { year: number; month: number }; // month: 1-12

const pad = (n: number) => String(n).padStart(2, '0');

export const currentMonth = (now = new Date()): Month => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
});

export function addMonths({ year, month }: Month, delta: number): Month {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** First and last day of the month as YYYY-MM-DD (the `from` / `to` of GET /events). */
export function monthRange({ year, month }: Month): { from: string; to: string } {
  const last = new Date(year, month, 0).getDate();
  return { from: `${year}-${pad(month)}-01`, to: `${year}-${pad(month)}-${pad(last)}` };
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const monthLabel = ({ year, month }: Month) =>
  capitalize(monthFormat.format(new Date(year, month - 1, 1)));

/** "2026-10-10" -> "Samedi 10 octobre". */
export function dayLabel(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return capitalize(dayFormat.format(new Date(y, m - 1, d, 12)));
}

export type DaySection = { day: string; title: string; data: EventListItem[] };

/**
 * Groups events by the calendar day they start, read from the ISO string (the club's own date,
 * whatever the device timezone). The API already sorts them, oldest first.
 */
export function groupByDay(events: EventListItem[]): DaySection[] {
  const sections: DaySection[] = [];
  for (const event of events) {
    const day = (event.starts_at ?? '').slice(0, 10);
    const last = sections[sections.length - 1];
    if (last && last.day === day) last.data.push(event);
    else sections.push({ day, title: day ? dayLabel(day) : '', data: [event] });
  }
  return sections;
}
