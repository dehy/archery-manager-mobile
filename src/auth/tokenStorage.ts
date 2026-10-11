import * as SecureStore from 'expo-secure-store';

import type { Tokens } from '@/api/types';

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
