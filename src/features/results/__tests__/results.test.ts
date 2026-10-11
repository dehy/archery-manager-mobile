import type { ContestResult, HistoryResult } from '@/api/types';

import {
  groupByCategory,
  positionLabel,
  progression,
  scoreLine,
  seasonsOf,
  targetLine,
  tieBreakLine,
} from '../format';

const scores = {
  discipline: { code: 'indoor', label: 'Salle' },
  age_category: { code: 'S1', label: 'Senior 1' },
  activity: { code: 'CL', label: 'Classique' },
  distance: 18,
  target_type: { code: 'trispot', label: 'Trispot' },
  target_size: 40,
  score1: 280,
  score2: 288,
  total: 568,
  max_total: 600,
  nb10: 12,
  nb10p: 3,
  tie_break_labels: ['9', '10'],
  position: 1,
};

const history = (
  id: number,
  season: number | null,
  startsAt: string | null,
  overrides: Partial<Omit<HistoryResult, 'id' | 'event'>> = {},
): HistoryResult => ({
  id,
  ...scores,
  ...overrides,
  event:
    season === null
      ? null
      : {
          id: 100 + id,
          slug: null,
          title: `Concours ${id}`,
          starts_at: startsAt,
          ends_at: null,
          season,
        },
});

describe('result lines', () => {
  it('describes target, score, tie-breaks and position', () => {
    expect(targetLine(scores)).toBe('18 m · Trispot 40 cm');
    expect(targetLine({ ...scores, distance: null, target_size: null })).toBe('Trispot');
    expect(scoreLine(scores)).toBe('568 / 600');
    expect(scoreLine({ total: 300, max_total: null })).toBe('300');
    expect(scoreLine({ total: null, max_total: 600 })).toBeNull();
    expect(tieBreakLine(scores)).toBe('12 × 9 · 3 × 10');
    expect(tieBreakLine({ ...scores, tie_break_labels: ['10', 'X'] })).toBe('12 × 10 · 3 × X');
    expect(tieBreakLine({ ...scores, nb10: null, nb10p: null })).toBeNull();
    expect(positionLabel(1)).toBe('1er');
    expect(positionLabel(4)).toBe('4e');
    expect(positionLabel(null)).toBeNull();
  });
});

describe('seasonsOf', () => {
  it('lists seasons newest first and ignores results without one', () => {
    const results = [
      history(1, 2026, null),
      history(2, 2027, null),
      history(3, null, null),
      history(4, 2027, null),
    ];
    expect(seasonsOf(results)).toEqual([2027, 2026]);
  });
});

describe('progression', () => {
  it('charts the most frequent format of the season, oldest first', () => {
    const results = [
      history(1, 2027, '2027-02-01T09:00:00+01:00', { total: 571 }),
      history(2, 2027, '2026-11-15T09:00:00+01:00', { total: 540 }),
      history(3, 2027, '2026-12-10T09:00:00+01:00', { total: 555 }),
      // Another format in the same season: fewer results, must not be mixed in.
      history(4, 2027, '2027-05-01T09:00:00+02:00', {
        distance: 70,
        target_size: 122,
        total: 610,
        max_total: 720,
      }),
      history(5, 2027, '2027-06-01T09:00:00+02:00', {
        distance: 70,
        target_size: 122,
        total: 630,
        max_total: 720,
      }),
      // Another season.
      history(6, 2026, '2026-01-10T09:00:00+01:00', { total: 500 }),
    ];
    const trend = progression(results, 2027);
    expect(trend?.label).toBe('18 m · Trispot 40 cm');
    expect(trend?.max).toBe(600);
    expect(trend?.points.map((p) => p.total)).toEqual([540, 555, 571]);
  });

  it('needs two scored contests in one format', () => {
    expect(progression([history(1, 2027, '2026-11-15T09:00:00+01:00')], 2027)).toBeNull();
    const unscored = [
      history(1, 2027, '2026-11-15T09:00:00+01:00', { total: null }),
      history(2, 2027, '2026-12-15T09:00:00+01:00'),
    ];
    expect(progression(unscored, 2027)).toBeNull();
  });
});

describe('groupByCategory', () => {
  it('groups contest results under age category and activity', () => {
    const r = (id: number, age: string, activity: string): ContestResult => ({
      id,
      ...scores,
      age_category: { code: age, label: age },
      activity: { code: activity, label: activity },
      licensee: { id, display_name: `Archer ${id}`, can_view_profile: false },
      is_mine: false,
    });
    const groups = groupByCategory([
      r(1, 'S1', 'CL'),
      r(2, 'S1', 'CL'),
      r(3, 'S1', 'CO'),
      r(4, 'S2', 'CL'),
    ]);
    expect(groups.map((g) => [g.title, g.results.length])).toEqual([
      ['S1 · CL', 2],
      ['S1 · CO', 1],
      ['S2 · CL', 1],
    ]);
  });
});
