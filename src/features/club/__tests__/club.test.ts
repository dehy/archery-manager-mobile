import type { MemberPage } from '@/api/types';

import { initials } from '../initials';
import { membersPath, nextPage } from '../queries';

const page = (p: number, perPage: number, total: number): MemberPage => ({
  data: [],
  meta: { page: p, per_page: perPage, total, total_in_club: total },
  filters: { groups: [], without_group_count: 0 },
});

describe('membersPath', () => {
  it('sends only the filters that are set', () => {
    expect(membersPath(1, 'all', '')).toBe('/club/members?page=1&per_page=30');
    expect(membersPath(2, 12, ' léa ')).toBe(
      '/club/members?page=2&per_page=30&group=12&q=l%C3%A9a',
    );
    expect(membersPath(1, 'none', '')).toContain('group=none');
  });
});

describe('nextPage', () => {
  it('continues until every matching member is loaded', () => {
    expect(nextPage(page(1, 30, 48))).toBe(2);
    expect(nextPage(page(2, 30, 48))).toBeUndefined();
    expect(nextPage(page(1, 30, 30))).toBeUndefined();
    expect(nextPage(page(1, 30, 0))).toBeUndefined();
  });
});

describe('initials', () => {
  it('builds initials from a display name', () => {
    expect(initials('Camille R.')).toBe('CR');
    expect(initials('Léa Martin')).toBe('LM');
    expect(initials('Maëlle')).toBe('M');
    expect(initials('')).toBe('?');
  });
});
