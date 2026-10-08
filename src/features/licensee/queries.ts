import { useQuery } from '@tanstack/react-query';

import { api } from '@/auth/session';
import type { LicenseeProfile } from '@/api/types';

import { useContextKey } from '../useContext';

export function useLicensee(id: number) {
  const context = useContextKey();
  return useQuery({
    queryKey: ['licensee', id, ...context],
    queryFn: async () =>
      (await api.request<{ licensee: LicenseeProfile }>(`/licensees/${id}`)).licensee,
  });
}
