import { useQuery } from '@tanstack/react-query';

import { api } from '@/auth/session';
import type { HomeResponse } from '@/api/types';

import { useContextKey } from '../useContext';

export function useHome() {
  const context = useContextKey();
  return useQuery({
    queryKey: ['home', ...context],
    queryFn: () => api.request<HomeResponse>('/home'),
  });
}
