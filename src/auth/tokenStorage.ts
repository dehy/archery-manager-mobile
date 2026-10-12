import * as SecureStore from 'expo-secure-store';

import type { Tokens } from '@/api/types';
import { normalizeHex } from '@/ui/clubColor';

const KEY = 'auth.tokens';

export async function loadTokens(): Promise<Tokens | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: Tokens | null): Promise<void> {
  if (tokens) await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
  else await SecureStore.deleteItemAsync(KEY);
}

const LICENSEE_KEY = 'context.licensee';

/**
 * The licensee the user picked (its id). Not a secret, but cheap to keep next to the tokens.
 * Anything that is not an id (such as an FFTA code saved by an older version) reads as null.
 */
export async function loadLicensee(): Promise<number | null> {
  try {
    const raw = await SecureStore.getItemAsync(LICENSEE_KEY);
    const id = raw !== null && /^\d+$/.test(raw) ? Number(raw) : NaN;
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export async function saveLicensee(id: number | null): Promise<void> {
  if (id) await SecureStore.setItemAsync(LICENSEE_KEY, String(id));
  else await SecureStore.deleteItemAsync(LICENSEE_KEY);
}

const CLUB_COLOR_KEY = 'context.clubColor';

/** The last club color seen, so a cold start opens in the club's tint before `/club` answers. */
export async function loadClubColor(): Promise<string | null> {
  try {
    return normalizeHex(await SecureStore.getItemAsync(CLUB_COLOR_KEY));
  } catch {
    return null;
  }
}

export async function saveClubColor(color: string | null): Promise<void> {
  if (color) await SecureStore.setItemAsync(CLUB_COLOR_KEY, color);
  else await SecureStore.deleteItemAsync(CLUB_COLOR_KEY);
}
