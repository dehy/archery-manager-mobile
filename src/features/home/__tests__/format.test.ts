import { participationLabel, participationShortLabel } from '@/features/labels';

import {
  dateTile,
  eventTime,
  formatEventWhen,
  formatResultTarget,
  formatSeason,
  relativeDay,
} from '../format';

describe('formatEventWhen', () => {
  const allDay = 'toute la journée';

  it('formats a same-day range', () => {
    const text = formatEventWhen(
      '2026-10-13T19:00:00+02:00',
      '2026-10-13T21:00:00+02:00',
      false,
      allDay,
    );
    expect(text).toMatch(/13 oct\./);
    expect(text).toMatch(/–/);
  });

  it('formats an all-day event', () => {
    const text = formatEventWhen(
      '2026-10-18T00:00:00+02:00',
      '2026-10-18T23:59:00+02:00',
      true,
      allDay,
    );
    expect(text).toContain(allDay);
  });

  it('reads an all-day end as inclusive (API contract): Saturday 10 to Sunday 11 is two days', () => {
    const text = formatEventWhen(
      '2026-10-10T00:00:00+02:00',
      '2026-10-11T00:00:00+02:00',
      true,
      allDay,
    );
    expect(text).not.toContain(allDay);
    expect(text).toMatch(/10 oct\. – .*11 oct\./);
  });

  it('shows a one-day all-day event (same date on both ends) as a single day', () => {
    const text = formatEventWhen(
      '2026-10-10T00:00:00+02:00',
      '2026-10-10T00:00:00+02:00',
      true,
      allDay,
    );
    expect(text).toContain(allDay);
  });

  it('formats a multi-day all-day event as a day range', () => {
    const text = formatEventWhen(
      '2026-10-17T00:00:00+02:00',
      '2026-10-18T23:59:00+02:00',
      true,
      allDay,
    );
    expect(text).not.toContain(allDay);
    expect(text).toContain('–');
  });

  it('copes with missing dates', () => {
    expect(formatEventWhen(null, null, false, allDay)).toBe('');
  });
});

describe('formatters', () => {
  it('describes a result target', () => {
    expect(formatResultTarget(18, 'Trispot', 40)).toBe('18 m · Trispot 40 cm');
    expect(formatResultTarget(null, null, null)).toBe('');
  });

  it('shows the season as 2026/2027', () => {
    expect(formatSeason(2027)).toBe('2026/2027');
  });
});

describe('participationLabel', () => {
  it('uses contest wording for contests and training wording otherwise', () => {
    expect(participationLabel('contest_official', 'registered')).toBe('Je suis inscrit');
    expect(participationLabel('training', 'registered')).toBe('Présent');
    expect(participationLabel('training', 'not_going')).toBe('Absent');
    expect(participationLabel('free_training', null)).toBe('Pas de réponse');
  });
});

describe('dateTile', () => {
  it('shows the month and day of an event', () => {
    expect(dateTile('2026-11-15T09:00:00+01:00', null, false)).toEqual({
      month: 'NOV.',
      day: '15',
    });
  });

  it('shows the day span of a weekend contest', () => {
    expect(dateTile('2026-11-22T00:00:00+01:00', '2026-11-23T00:00:00+01:00', true)).toEqual({
      month: 'NOV.',
      day: '22–23',
    });
  });
});

describe('eventTime', () => {
  const labels = { allDay: 'Toute la journée', days: (n: number) => `${n} jours` };

  it('gives the hours of a same-day event', () => {
    expect(eventTime('2026-11-19T18:00:00+01:00', '2026-11-19T20:00:00+01:00', false, labels)).toBe(
      '18:00–20:00',
    );
  });

  it('gives the length of a multi-day event and the all-day label otherwise', () => {
    expect(eventTime('2026-11-22T00:00:00+01:00', '2026-11-23T00:00:00+01:00', true, labels)).toBe(
      '2 jours',
    );
    expect(eventTime('2026-11-22T00:00:00+01:00', null, true, labels)).toBe('Toute la journée');
  });
});

describe('relativeDay', () => {
  const labels = {
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    inDays: (n: number) => `Dans ${n} jours`,
  };
  const now = new Date('2026-11-13T22:00:00+01:00');

  it('counts calendar days, not hours', () => {
    expect(relativeDay('2026-11-13T23:30:00+01:00', false, labels, now)).toBe("Aujourd'hui");
    expect(relativeDay('2026-11-14T08:00:00+01:00', false, labels, now)).toBe('Demain');
    expect(relativeDay('2026-11-16T00:00:00+01:00', true, labels, now)).toBe('Dans 3 jours');
  });

  it('gives the date beyond a week', () => {
    expect(relativeDay('2026-11-29T08:30:00+01:00', false, labels, now)).toBe('Dim. 29 nov.');
  });
});

describe('participationShortLabel', () => {
  it('keeps the pill short and follows the event kind', () => {
    expect(participationShortLabel('contest_official', 'registered')).toBe('Inscrit');
    expect(participationShortLabel('training', 'registered')).toBe('Présent');
    expect(participationShortLabel('contest_official', 'not_going')).toBe('Absent');
    expect(participationShortLabel('training', null)).toBe('Pas de réponse');
  });
});
