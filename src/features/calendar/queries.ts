import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/auth/session';
import type { CalendarSubscriptionResponse } from '@/api/types';

import { useContextKey } from '../useContext';

/** The feed belongs to the selected licensee (X-Licensee), not to the season. */
export function useCalendarSubscription() {
  const [licensee] = useContextKey();
  return useQuery({
    queryKey: ['calendar-subscription', licensee],
    queryFn: async () =>
      (await api.request<CalendarSubscriptionResponse>('/calendar-subscription')).subscription.url,
  });
}

export function useGenerateSubscription() {
  const queryClient = useQueryClient();
  const [licensee] = useContextKey();
  return useMutation({
    mutationFn: async () =>
      (await api.request<CalendarSubscriptionResponse>('/calendar-subscription', { method: 'PUT' }))
        .subscription.url,
    onSuccess: (url) => queryClient.setQueryData(['calendar-subscription', licensee], url),
  });
}

export function useRevokeSubscription() {
  const queryClient = useQueryClient();
  const [licensee] = useContextKey();
  return useMutation({
    mutationFn: () => api.request<void>('/calendar-subscription', { method: 'DELETE' }),
    onSuccess: () => queryClient.setQueryData(['calendar-subscription', licensee], null),
  });
}
