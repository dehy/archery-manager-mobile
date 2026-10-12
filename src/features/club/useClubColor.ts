import { useEffect } from 'react';

import { saveClubColor } from '@/auth/tokenStorage';
import { useBrand } from '@/ui/brand';
import { normalizeHex } from '@/ui/clubColor';

import { useClub } from './queries';

/**
 * Tints the app with the selected licensee's club. While another licensee's club loads, the
 * previous tint stays (no flash back to teal); a club without a color goes back to teal.
 */
export function useClubColor() {
  const { data } = useClub();
  const color = data ? normalizeHex(data.club.primary_color) : undefined;

  useEffect(() => {
    if (color === undefined || useBrand.getState().clubColor === color) return;
    useBrand.setState({ clubColor: color });
    saveClubColor(color).catch(() => {});
  }, [color]);
}
