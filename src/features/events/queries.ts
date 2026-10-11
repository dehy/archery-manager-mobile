import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/auth/session';
import type {
  EventDetail,
  EventListResponse,
  EventParticipantList,
  EventResponse,
  ParticipationRequest,
} from '@/api/types';

import { useContextKey } from '../useContext';

import { monthRange, type Month } from './dates';

export function useEvents(month: Month) {
  const context = useContextKey();
  const { from, to } = monthRange(month);
  return useQuery({
    queryKey: ['events', ...context, from, to],
    queryFn: () => api.request<EventListResponse>(`/events?from=${from}&to=${to}`),
  });
}

export function useEvent(id: number) {
  const context = useContextKey();
  return useQuery({
    queryKey: ['event', id, ...context],
    queryFn: async () => (await api.request<EventResponse>(`/events/${id}`)).event,
  });
}

export function useParticipants(id: number) {
  const context = useContextKey();
  return useQuery({
    queryKey: ['event-participants', id, ...context],
    queryFn: async () =>
      (await api.request<EventParticipantList>(`/events/${id}/participants`)).participants,
  });
}

/**
 * RSVP. The server replaces the whole answer and answers with the updated event, which becomes
 * the cached detail; lists and the dashboard (their counts and states) are refetched.
 */
export function useAnswerEvent(id: number) {
  const queryClient = useQueryClient();
  const context = useContextKey();
  return useMutation({
    mutationFn: async (answer: ParticipationRequest) =>
      (
        await api.request<EventResponse>(`/events/${id}/participation`, {
          method: 'PUT',
          body: answer,
        })
      ).event,
    onSuccess: (event: EventDetail) => {
      queryClient.setQueryData(['event', id, ...context], event);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['event-participants', id] });
    },
  });
}
