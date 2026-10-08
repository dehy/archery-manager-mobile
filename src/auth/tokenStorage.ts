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

/** The licensee the user picked (FFTA member code). Not a secret, but cheap to keep next to the tokens. */
export async function loadLicensee(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(LICENSEE_KEY);
  } catch {
    return null;
  }
}

export async function saveLicensee(code: string | null): Promise<void> {
  if (code) await SecureStore.setItemAsync(LICENSEE_KEY, code);
  else await SecureStore.deleteItemAsync(LICENSEE_KEY);
}
