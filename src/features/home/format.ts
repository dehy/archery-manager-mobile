const LOCALE = 'fr-FR';

const day = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

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
