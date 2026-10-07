import { ApiError } from './errors';
import type { Tokens, TokenResponse } from './types';

/** Refresh slightly before expiry so a request doesn't race the deadline. */
const EXPIRY_MARGIN_MS = 15_000;

export type ApiClientDeps = {
  baseUrl: string;
  getTokens: () => Tokens | null;
  /** Persist new tokens, or null once the session is over. */
  setTokens: (tokens: Tokens | null) => Promise<void>;
  /** Called when the refresh token was rejected: the user must log in again. */
  onSessionExpired: () => void;
  /** Request-scoped context headers (X-Licensee, X-Season). */
  getContextHeaders?: () => Record<string, string>;
  fetch?: typeof fetch;
  now?: () => number;
};

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  /** Send the bearer token (default true). */
  auth?: boolean;
};

export function toTokens(response: TokenResponse, now: number): Tokens {
  return {
    accessToken: response.access_token,
    accessTokenExpiresAt: now + response.expires_in * 1000,
    refreshToken: response.refresh_token,
  };
}

export function createApiClient(deps: ApiClientDeps) {
  const doFetch: typeof fetch = (input, init) => (deps.fetch ?? fetch)(input, init);
  const now = deps.now ?? Date.now;
  let refreshing: Promise<Tokens> | null = null;

  async function send<T>(path: string, options: RequestOptions, accessToken?: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...deps.getContextHeaders?.(),
    };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    let response: Response;
    try {
      response = await doFetch(`${deps.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      throw new ApiError(0, 'network_error', 'Network request failed.');
    }

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = undefined;
    }

    if (!response.ok) {
      const body = (data ?? {}) as { error?: string; message?: string };
      const retryAfter = Number(response.headers.get('Retry-After'));
      throw new ApiError(
        response.status,
        body.error ?? 'unknown',
        body.message ?? `Request failed with status ${response.status}.`,
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
      );
    }
    return data as T;
  }

  /** Single-flight: concurrent 401s share one refresh, as refresh tokens rotate. */
  function refresh(refreshToken: string): Promise<Tokens> {
    refreshing ??= (async () => {
      try {
        const response = await send<TokenResponse>('/api/v1/auth/refresh', {
          method: 'POST',
          body: { refresh_token: refreshToken },
        });
        const tokens = toTokens(response, now());
        await deps.setTokens(tokens);
        return tokens;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await deps.setTokens(null);
          deps.onSessionExpired();
        }
        throw error;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (options.auth === false) return send<T>(path, options);

    let tokens = deps.getTokens();
    if (!tokens) throw new ApiError(401, 'invalid_refresh_token', 'Not signed in.');
    if (tokens.accessTokenExpiresAt - now() < EXPIRY_MARGIN_MS) {
      tokens = await refresh(tokens.refreshToken);
    }

    try {
      return await send<T>(path, options, tokens.accessToken);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      // Access token rejected (revoked or clock skew): rotate once and retry.
      const fresh = await refresh(deps.getTokens()?.refreshToken ?? tokens.refreshToken);
      return send<T>(path, options, fresh.accessToken);
    }
  }

  return { request, refresh };
}

export type ApiClient = ReturnType<typeof createApiClient>;
