import { participationLabel } from '@/features/labels';

import { formatEventWhen, formatResultTarget, formatSeason } from '../format';

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
