const LOCALE = 'fr-FR';

const day = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const DAY_MS = 86_400_000;

/** Calendar date of an ISO string in its own offset, as a local noon Date (no timezone shift). */
function wallDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

/**
 * "mar. 13 oct. · 19:00–21:00", "dim. 18 oct. · toute la journée", or a day range.
 * All-day events count in dates only and their end is inclusive (API contract): a Saturday and
 * Sunday contest runs from the date of `starts_at` to the date of `ends_at`. The dates are read
 * from the ISO strings, so a device in another timezone does not move the event.
 */
export function formatEventWhen(
  startsAt: string | null,
  endsAt: string | null,
  allDay: boolean,
  allDayLabel: string,
): string {
  if (!startsAt) return '';

  if (allDay) {
    const first = wallDate(startsAt);
    const last = endsAt ? wallDate(endsAt) : first;
    return sameDay(first, last)
      ? `${day.format(first)} · ${allDayLabel}`
      : `${day.format(first)} – ${day.format(last)}`;
  }

  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  if (end && !sameDay(start, end)) {
    return `${day.format(start)} ${time.format(start)} – ${day.format(end)} ${time.format(end)}`;
  }
  return `${day.format(start)} · ${time.format(start)}${end ? `–${time.format(end)}` : ''}`;
}

/** "18 m · trispot 40 cm", skipping what the result does not carry. */
export function formatResultTarget(
  distance: number | null,
  targetLabel: string | null,
  targetSize: number | null,
): string {
  const parts = [
    distance != null ? `${distance} m` : null,
    targetLabel && targetSize != null ? `${targetLabel} ${targetSize} cm` : targetLabel,
  ];
  return parts.filter(Boolean).join(' · ');
}

/** 2027 -> "2026/2027" */
export const formatSeason = (season: number) => `${season - 1}/${season}`;

const tileMonth = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
const dayNumber = new Intl.DateTimeFormat(LOCALE, { day: 'numeric' });

/** First and last calendar day of an event, read in the club's own dates (see `formatEventWhen`). */
function eventDays(startsAt: string, endsAt: string | null, allDay: boolean): [Date, Date] {
  if (allDay) return [wallDate(startsAt), endsAt ? wallDate(endsAt) : wallDate(startsAt)];
  const start = new Date(startsAt);
  return [start, endsAt ? new Date(endsAt) : start];
}

/** The date tile of an event row: { month: "NOV.", day: "15" } or { day: "22–23" } for a span. */
export function dateTile(
  startsAt: string,
  endsAt: string | null,
  allDay: boolean,
): { month: string; day: string } {
  const [first, last] = eventDays(startsAt, endsAt, allDay);
  const day = sameDay(first, last)
    ? dayNumber.format(first)
    : `${dayNumber.format(first)}–${dayNumber.format(last)}`;
  return { month: tileMonth.format(first).toUpperCase(), day };
}

/**
 * The time part of an event row, the tile giving the date: "18:00–20:00", "09:00",
 * "Toute la journée" or "2 jours".
 */
export function eventTime(
  startsAt: string,
  endsAt: string | null,
  allDay: boolean,
  labels: { allDay: string; days: (count: number) => string },
): string {
  const [first, last] = eventDays(startsAt, endsAt, allDay);
  if (!sameDay(first, last)) {
    return labels.days(Math.round((midnight(last) - midnight(first)) / DAY_MS) + 1);
  }
  if (allDay) return labels.allDay;
  const end = endsAt ? new Date(endsAt) : null;
  return `${time.format(first)}${end ? `–${time.format(end)}` : ''}`;
}

/**
 * How far an event is: "Aujourd'hui", "Demain", "Dans 3 jours" within a week, its date after.
 * Calendar days, not 24-hour periods: tonight's training is "Aujourd'hui" whatever the hour.
 */
export function relativeDay(
  startsAt: string,
  allDay: boolean,
  labels: { today: string; tomorrow: string; inDays: (count: number) => string },
  now = new Date(),
): string {
  const start = allDay ? wallDate(startsAt) : new Date(startsAt);
  const days = Math.round((midnight(start) - midnight(now)) / DAY_MS);
  if (days <= 0) return labels.today;
  if (days === 1) return labels.tomorrow;
  if (days < 7) return labels.inDays(days);
  const label = day.format(start);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
