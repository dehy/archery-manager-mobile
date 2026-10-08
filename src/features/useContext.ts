import { useSession } from '@/auth/session';

/** Part of every query key: data differs per licensee and season (X-Licensee / X-Season). */
export function useContextKey() {
  const licensee = useSession((s) => s.licensee);
  const season = useSession((s) => s.season);
  return [licensee, season] as const;
}
