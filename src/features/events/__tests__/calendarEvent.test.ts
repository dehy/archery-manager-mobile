import { contestEvent, trainingEvent } from '@/test/events';

import { calendarEvent } from '../calendarEvent';

describe('calendarEvent', () => {
  it('prefills a timed event with its hours and one-line place', () => {
    const prefill = calendarEvent({ ...trainingEvent, address: 'Gymnase\n33000 Bordeaux' });
    expect(prefill.title).toBe(trainingEvent.title);
    expect(prefill.allDay).toBe(false);
    expect(prefill.location).toBe('Gymnase, 33000 Bordeaux');
    expect(prefill.startDate?.toISOString()).toBe(new Date(trainingEvent.starts_at!).toISOString());
  });

  it('keeps the club dates of an all-day event', () => {
    const prefill = calendarEvent({
      ...contestEvent,
      all_day: true,
      starts_at: '2026-11-22T00:00:00+01:00',
      ends_at: '2026-11-23T00:00:00+01:00',
    });
    expect(prefill.startDate).toEqual(new Date(2026, 10, 22));
    expect(prefill.endDate).toEqual(new Date(2026, 10, 23));
  });
});
