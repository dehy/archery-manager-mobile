import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { api } from '@/auth/session';
import type { ClubOverview, MemberPage } from '@/api/types';

import { useContextKey } from '../useContext';

export const PER_PAGE = 30;

/** `all` means no group filter; `none` members without a group; otherwise a group id. */
export type GroupFilter = 'all' | 'none' | number;

export function membersPath(page: number, group: GroupFilter, search: string): string {
  const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE) });
  if (group !== 'all') params.set('group', String(group));
  const q = search.trim();
  if (q) params.set('q', q);
  return `/club/members?${params.toString()}`;
}

/** The next page number, or undefined once every matching member was loaded. */
export function nextPage(page: MemberPage): number | undefined {
  const { page: current, per_page, total } = page.meta;
  return current * per_page < total ? current + 1 : undefined;
}

export function useClub() {
  const context = useContextKey();
  return useQuery({
    queryKey: ['club', ...context],
    queryFn: () => api.request<ClubOverview>('/club'),
  });
}

export function useMembers(group: GroupFilter, search: string) {
  const context = useContextKey();
  return useInfiniteQuery({
    queryKey: ['members', ...context, group, search.trim()],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api.request<MemberPage>(membersPath(pageParam, group, search)),
    getNextPageParam: nextPage,
    // Keep the list and filter chips on screen while a new filter or search loads.
    placeholderData: keepPreviousData,
  });
}
