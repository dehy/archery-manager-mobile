const LOCALE = 'fr-FR';

const day = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "mar. 13 oct. · 19:00–21:00", "dim. 18 oct. · toute la journée", or a day range. */
export function formatEventWhen(
  startsAt: string | null,
  endsAt: string | null,
  allDay: boolean,
  allDayLabel: string,
): string {
  if (!startsAt) return '';
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  if (allDay) {
    return end && !sameDay(start, end)
      ? `${day.format(start)} – ${day.format(end)}`
      : `${day.format(start)} · ${allDayLabel}`;
  }
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
