import { create } from 'zustand';

/**
 * The selected licensee's club color (`#rrggbb`), which tints the signed-in app. Null (signed out,
 * no club, or a club without a color) keeps the default teal. Persisted by the session.
 */
export const useBrand = create<{ clubColor: string | null }>(() => ({ clubColor: null }));
