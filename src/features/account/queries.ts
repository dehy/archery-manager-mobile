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
    if (licensee && licensees && !licensees.some((l) => l.ffta_member_code === licensee)) {
      setLicensee(null);
    }
  }, [licensee, query.data, setLicensee]);

  return query;
}

/** Switch the licensee and drop everything cached for the previous one. */
export function useSwitchLicensee() {
  const queryClient = useQueryClient();
  const setLicensee = useSession((s) => s.setLicensee);
  return async (code: string) => {
    await setLicensee(code);
    // Reset, never remove: resetting clears every cached answer (the previous licensee's data
    // must not linger) and refetches what is on screen. Removing queries that mounted screens
    // observe orphans those screens, which then stay pending forever.
    await queryClient.resetQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
  };
}
