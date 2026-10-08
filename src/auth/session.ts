import * as Device from 'expo-device';
import { create } from 'zustand';

import { createApiClient, toTokens } from '@/api/client';
import { getApiUrl } from '@/api/config';
import type { MeResponse, Tokens, TokenResponse } from '@/api/types';

import { loadTokens, saveTokens } from './tokenStorage';

type SessionState = {
  status: 'loading' | 'signedOut' | 'signedIn';
  tokens: Tokens | null;
  /** FFTA member code sent as X-Licensee; null lets the server pick its default. */
  licensee: string | null;
  season: number | null;
  restore: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useSession = create<SessionState>((set, get) => ({
  status: 'loading',
  tokens: null,
  licensee: null,
  season: null,

  async restore() {
    const tokens = await loadTokens();
    set({ tokens, status: tokens ? 'signedIn' : 'signedOut' });
  },

  async signIn(email, password) {
    const response = await api.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: { email, password, device_name: Device.deviceName ?? undefined },
      auth: false,
    });
    const tokens = toTokens(response, Date.now());
    await saveTokens(tokens);
    set({ tokens, status: 'signedIn' });
  },

  async signOut() {
    const refreshToken = get().tokens?.refreshToken;
    // Clear locally first: logging out must work offline too.
    await saveTokens(null);
    set({ tokens: null, status: 'signedOut', licensee: null, season: null });
    if (!refreshToken) return;
    try {
      await api.request('/auth/logout', {
        method: 'POST',
        body: { refresh_token: refreshToken },
        auth: false,
      });
    } catch {
      // Best effort: the server-side session expires on its own.
    }
  },
}));

export const api = createApiClient({
  baseUrl: getApiUrl(),
  getTokens: () => useSession.getState().tokens,
  setTokens: async (tokens) => {
    await saveTokens(tokens);
    useSession.setState({ tokens });
  },
  onSessionExpired: () => useSession.setState({ status: 'signedOut', tokens: null }),
  getContextHeaders: () => {
    const { licensee, season } = useSession.getState();
    const headers: Record<string, string> = {};
    if (licensee) headers['X-Licensee'] = licensee;
    if (season) headers['X-Season'] = String(season);
    return headers;
  },
});

export const fetchMe = () => api.request<MeResponse>('/me');
