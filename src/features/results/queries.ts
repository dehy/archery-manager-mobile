import { useQuery } from '@tanstack/react-query';

import { api } from '@/auth/session';
import type { ContestResults, ResultHistory } from '@/api/types';

import { useContextKey } from '../useContext';

/** Every season at once: the API returns the whole history, the screen filters by season. */
export function useMyResults() {
  const context = useContextKey();
  return useQuery({
    queryKey: ['results', ...context],
    queryFn: async () => (await api.request<ResultHistory>('/results')).results,
  });
}

export function useContestResults(eventId: number) {
  const context = useContextKey();
  return useQuery({
    queryKey: ['event-results', eventId, ...context],
    queryFn: async () => (await api.request<ContestResults>(`/events/${eventId}/results`)).results,
  });
}
