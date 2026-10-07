import { createApiClient } from '../client';
import { ApiError } from '../errors';
import type { Tokens } from '../types';

const NOW = 1_000_000;
const valid: Tokens = {
  accessToken: 'a1',
  accessTokenExpiresAt: NOW + 600_000,
  refreshToken: 'r1',
};

const json = (status: number, body?: unknown, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers });

function setup(initial: Tokens | null, fetchMock: jest.Mock) {
  let tokens = initial;
  const onSessionExpired = jest.fn();
  const client = createApiClient({
    baseUrl: 'http://api',
    getTokens: () => tokens,
    setTokens: async (t) => {
      tokens = t;
    },
    onSessionExpired,
    getContextHeaders: () => ({ 'X-Licensee': '123' }),
    fetch: fetchMock as unknown as typeof fetch,
    now: () => NOW,
  });
  return { client, onSessionExpired, getTokens: () => tokens };
}

const refreshed = {
  token_type: 'Bearer',
  access_token: 'a2',
  expires_in: 900,
  refresh_token: 'r2',
};

describe('api client', () => {
  it('sends the bearer token and context headers', async () => {
    const fetchMock = jest.fn().mockResolvedValue(json(200, { ok: true }));
    const { client } = setup(valid, fetchMock);

    await expect(client.request('/api/v1/me')).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api/api/v1/me');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer a1', 'X-Licensee': '123' });
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(json(401, { error: 'unauthorized', message: 'expired' }))
      .mockResolvedValueOnce(json(200, refreshed))
      .mockResolvedValueOnce(json(200, { ok: true }));
    const { client, getTokens } = setup(valid, fetchMock);

    await expect(client.request('/api/v1/me')).resolves.toEqual({ ok: true });

    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer a2');
    expect(getTokens()?.refreshToken).toBe('r2');
  });

  it('shares one refresh between concurrent expired requests', async () => {
    const expired = { ...valid, accessTokenExpiresAt: NOW };
    const fetchMock = jest.fn(async (url: string) =>
      url.endsWith('/auth/refresh') ? json(200, refreshed) : json(200, { ok: true }),
    );
    const { client } = setup(expired, fetchMock);

    await Promise.all([client.request('/api/v1/a'), client.request('/api/v1/b')]);

    const refreshCalls = fetchMock.mock.calls.filter(([u]) => u.endsWith('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('ends the session when the refresh token is rejected', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(json(401, { error: 'unauthorized', message: 'x' }))
      .mockResolvedValueOnce(json(401, { error: 'invalid_refresh_token', message: 'x' }));
    const { client, onSessionExpired, getTokens } = setup(valid, fetchMock);

    await expect(client.request('/api/v1/me')).rejects.toMatchObject({
      code: 'invalid_refresh_token',
    });

    expect(onSessionExpired).toHaveBeenCalled();
    expect(getTokens()).toBeNull();
  });

  it('surfaces the server error body and Retry-After', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        json(429, { error: 'too_many_attempts', message: 'slow down' }, { 'Retry-After': '900' }),
      );
    const { client } = setup(null, fetchMock);

    const error = await client
      .request('/api/v1/auth/login', { method: 'POST', body: {}, auth: false })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, code: 'too_many_attempts', retryAfter: 900 });
  });

  it('maps a network failure to network_error', async () => {
    const { client } = setup(null, jest.fn().mockRejectedValue(new TypeError('fail')));
    await expect(client.request('/x', { auth: false })).rejects.toMatchObject({
      code: 'network_error',
    });
  });
});
