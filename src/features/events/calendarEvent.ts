import type { EventDetail } from '@/api/types';

/** What the system "new event" form is prefilled with. All-day ends are inclusive dates. */
export function calendarEvent(event: EventDetail) {
  const date = (iso: string) => {
    if (!event.all_day) return new Date(iso);
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const startDate = event.starts_at ? date(event.starts_at) : undefined;
  return {
    title: event.title,
    startDate,
    endDate: event.ends_at ? date(event.ends_at) : startDate,
    allDay: event.all_day,
    location: event.address?.replace(/\n/g, ', ') ?? undefined,
  };
}
