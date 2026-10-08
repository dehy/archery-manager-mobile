const LOCALE = 'fr-FR';

const day = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** Calendar date of an ISO string in its own offset, as a local noon Date (no timezone shift). */
function wallDate(iso: string, dayOffset = 0): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d + dayOffset, 12);
}

/**
 * "mar. 13 oct. · 19:00–21:00", "dim. 18 oct. · toute la journée", or a day range.
 * All-day events are shown by their own calendar dates: the API ends them at midnight of the
 * following day (exclusive), and a device in another timezone must not move them.
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
    let last = endsAt ? wallDate(endsAt) : first;
    if (endsAt && /T00:00(:00)?/.test(endsAt) && last > first) last = wallDate(endsAt, -1);
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
