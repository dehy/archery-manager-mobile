import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchMe, useSession } from '@/auth/session';

/** `/me` does not depend on the licensee: only on who is signed in. */
export function useMe() {
  const licensee = useSession((s) => s.licensee);
  const setLicensee = useSession((s) => s.setLicensee);
  const query = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  // A persisted choice can outlive its licensee (account changed on the web): fall back to the
  // server default instead of sending an X-Licensee that answers 403.
  useEffect(() => {
    const licensees = query.data?.licensees;
    if (licensee && licensees && !licensees.some((l) => l.id === licensee)) {
      setLicensee(null);
    }
  }, [licensee, query.data, setLicensee]);

  return query;
}

/** Every cached answer depends on the context: reset it all and refetch what is on screen. */
async function resetContext(queryClient: ReturnType<typeof useQueryClient>) {
  // Reset, never remove: resetting clears every cached answer (the previous context's data must
  // not linger) and refetches what is on screen. Removing queries that mounted screens observe
  // orphans those screens, which then stay pending forever.
  await Promise.all([
    queryClient.resetQueries({ predicate: (q) => q.queryKey[0] !== 'me' }),
    // `/me` keeps its key (the account does not change) but its `context` follows the headers.
    queryClient.invalidateQueries({ queryKey: ['me'] }),
  ]);
}

/** Switch the licensee (and back to its current season). */
export function useSwitchLicensee() {
  const queryClient = useQueryClient();
  const setLicensee = useSession((s) => s.setLicensee);
  return async (id: number) => {
    await setLicensee(id);
    await resetContext(queryClient);
  };
}

/** Switch the season of the selected licensee (`null` for the current season). */
export function useSwitchSeason() {
  const queryClient = useQueryClient();
  const setSeason = useSession((s) => s.setSeason);
  return async (season: number | null) => {
    setSeason(season);
    await resetContext(queryClient);
  };
}
