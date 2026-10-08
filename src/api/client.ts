import { ApiError } from './errors';
import type { Tokens, TokenResponse } from './types';

/** Refresh slightly before expiry so a request doesn't race the deadline. */
const EXPIRY_MARGIN_MS = 15_000;

const API_PREFIX = '/api/v1';

export type ApiClientDeps = {
  /** Origin of the backend, without trailing slash and without /api/v1. */
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
  /** `binary` returns the raw bytes (files); errors are still JSON. Default `json`. */
  responseType?: 'json' | 'binary';
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
      response = await doFetch(`${deps.baseUrl}${API_PREFIX}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      throw new ApiError(0, 'network_error', 'Network request failed.');
    }

    if (response.status === 204) return undefined as T;
    if (response.ok && options.responseType === 'binary') {
      return (await response.arrayBuffer()) as T;
    }

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
        const response = await send<TokenResponse>('/auth/refresh', {
          method: 'POST',
          body: { refresh_token: refreshToken },
        });
        const tokens = toTokens(response, now());
        await deps.setTokens(tokens);
        return tokens;
      } catch (error) {
        // Only a dead refresh token ends the session. A locked account keeps its server-side
        // session, so the tokens stay and the caller shows the message.
        if (error instanceof ApiError && error.code === 'invalid_refresh_token') {
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

  /** Authenticated download of a file URL (a host-root path from the API), with the same token handling. */
  function requestFile(path: string): Promise<ArrayBuffer> {
    return request<ArrayBuffer>(path.replace(API_PREFIX, ''), { responseType: 'binary' });
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
      if (!(error instanceof ApiError) || error.code !== 'invalid_token') throw error;
      // Another request may have rotated the tokens meanwhile: refresh tokens are single-use,
      // so reuse the newer pair instead of spending the current refresh token again.
      const current = deps.getTokens();
      if (!current) throw error;
      const fresh =
        current.accessToken !== tokens.accessToken ? current : await refresh(current.refreshToken);
      return send<T>(path, options, fresh.accessToken);
    }
  }

  /** File URLs from the API (`picture_url`, attachment `url`) are paths from the host root. */
  function fileUrl(path: string): string {
    return /^https?:\/\//.test(path) ? path : `${deps.baseUrl}${path}`;
  }

  /** Headers to send with a file request (images, downloads). */
  function fileHeaders(): Record<string, string> {
    const tokens = deps.getTokens();
    return {
      ...deps.getContextHeaders?.(),
      ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
    };
  }

  return { request, requestFile, refresh, fileUrl, fileHeaders };
}

export type ApiClient = ReturnType<typeof createApiClient>;
