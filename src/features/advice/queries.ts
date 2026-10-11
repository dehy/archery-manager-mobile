import { useQuery } from '@tanstack/react-query';

import { api } from '@/auth/session';
import type { PracticeAdviceList, PracticeAdviceResponse } from '@/api/types';

import { useContextKey } from '../useContext';

export function useAdvices(archived: boolean) {
  const context = useContextKey();
  return useQuery({
    queryKey: ['advices', ...context, archived],
    queryFn: async () =>
      (
        await api.request<PracticeAdviceList>(
          `/practice-advices${archived ? '?archived=true' : ''}`,
        )
      ).advices,
  });
}

/** Advice is personal: another licensee's advice answers 404, never 403. */
export function useAdvice(id: number) {
  const context = useContextKey();
  return useQuery({
    queryKey: ['advice', id, ...context],
    queryFn: async () =>
      (await api.request<PracticeAdviceResponse>(`/practice-advices/${id}`)).advice,
  });
}
