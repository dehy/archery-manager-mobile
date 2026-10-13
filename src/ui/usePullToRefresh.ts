import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Spinner state for a pull to refresh. Only the user's pull shows it: TanStack Query's
 * `isRefetching` is also true for background refetches (remount, focus, licensee switch), which
 * would flash the spinner on screens that are just loading.
 */
export function usePullToRefresh(...refetches: (() => Promise<unknown>)[]) {
  const [refreshing, setRefreshing] = useState(false);
  const latest = useRef(refetches);
  useEffect(() => {
    latest.current = refetches;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(latest.current.map((refetch) => refetch()));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { refreshing, onRefresh };
}
