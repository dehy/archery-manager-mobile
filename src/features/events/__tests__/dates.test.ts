import type { EventListItem } from '@/api/types';

import { addMonths, dayLabel, groupByDay, monthLabel, monthRange } from '../dates';

const event = (id: number, startsAt: string | null): EventListItem =>
  ({ id, starts_at: startsAt }) as EventListItem;

describe('months', () => {
  it('computes the first and last day', () => {
    expect(monthRange({ year: 2026, month: 10 })).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(monthRange({ year: 2028, month: 2 })).toEqual({ from: '2028-02-01', to: '2028-02-29' });
    expect(monthRange({ year: 2026, month: 11 }).to).toBe('2026-11-30');
  });

  it('moves across year boundaries', () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths({ year: 2027, month: 1 }, -1)).toEqual({ year: 2026, month: 12 });
    expect(addMonths({ year: 2026, month: 10 }, -13)).toEqual({ year: 2025, month: 9 });
  });

  it('keeps a month well under the 100 days the API allows', () => {
    const { from, to } = monthRange({ year: 2026, month: 12 });
    expect((Date.parse(to) - Date.parse(from)) / 86_400_000).toBeLessThan(100);
  });

  it('labels in French', () => {
    expect(monthLabel({ year: 2026, month: 10 })).toBe('Octobre 2026');
    expect(dayLabel('2026-10-10')).toBe('Samedi 10 octobre');
  });
});

describe('groupByDay', () => {
  it('groups consecutive events of the same club day, whatever the device timezone', () => {
    const sections = groupByDay([
      event(1, '2026-10-10T00:00:00+02:00'),
      event(2, '2026-10-10T19:00:00+02:00'),
      event(3, '2026-10-12T09:00:00+02:00'),
    ]);
    expect(sections.map((s) => [s.day, s.data.length])).toEqual([
      ['2026-10-10', 2],
      ['2026-10-12', 1],
    ]);
    expect(sections[0].title).toBe('Samedi 10 octobre');
  });

  it('handles an empty list', () => {
    expect(groupByDay([])).toEqual([]);
  });
});
