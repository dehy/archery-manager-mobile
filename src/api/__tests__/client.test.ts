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

    await expect(client.request('/me')).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api/api/v1/me');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer a1', 'X-Licensee': '123' });
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(json(401, { error: 'invalid_token', message: 'expired' }))
      .mockResolvedValueOnce(json(200, refreshed))
      .mockResolvedValueOnce(json(200, { ok: true }));
    const { client, getTokens } = setup(valid, fetchMock);

    await expect(client.request('/me')).resolves.toEqual({ ok: true });

    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer a2');
    expect(getTokens()?.refreshToken).toBe('r2');
  });

  it('shares one refresh between concurrent expired requests', async () => {
    const expired = { ...valid, accessTokenExpiresAt: NOW };
    const fetchMock = jest.fn(async (url: string) =>
      url.endsWith('/auth/refresh') ? json(200, refreshed) : json(200, { ok: true }),
    );
    const { client } = setup(expired, fetchMock);

    await Promise.all([client.request('/a'), client.request('/b')]);

    const refreshCalls = fetchMock.mock.calls.filter(([u]) => u.endsWith('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('ends the session when the refresh token is rejected', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(json(401, { error: 'invalid_token', message: 'x' }))
      .mockResolvedValueOnce(json(401, { error: 'invalid_refresh_token', message: 'x' }));
    const { client, onSessionExpired, getTokens } = setup(valid, fetchMock);

    await expect(client.request('/me')).rejects.toMatchObject({
      code: 'invalid_refresh_token',
    });

    expect(onSessionExpired).toHaveBeenCalled();
    expect(getTokens()).toBeNull();
  });

  it('keeps the tokens when the account is locked during a refresh', async () => {
    const expired = { ...valid, accessTokenExpiresAt: NOW };
    const fetchMock = jest
      .fn()
      .mockResolvedValue(json(401, { error: 'account_locked', message: 'locked' }));
    const { client, onSessionExpired, getTokens } = setup(expired, fetchMock);

    await expect(client.request('/me')).rejects.toMatchObject({ code: 'account_locked' });

    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(getTokens()).toEqual(expired);
  });

  it('does not refresh on a 401 that is not invalid_token', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(json(401, { error: 'account_locked', message: 'locked' }));
    const { client } = setup(valid, fetchMock);

    await expect(client.request('/me')).rejects.toMatchObject({ code: 'account_locked' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reuses tokens rotated by another request instead of spending the refresh token twice', async () => {
    let release!: (r: Response) => void;
    const slow = new Promise<Response>((resolve) => (release = resolve));
    const fetchMock = jest.fn(async (url: string, init: { headers: Record<string, string> }) => {
      if (url.endsWith('/auth/refresh')) return json(200, refreshed);
      if (init.headers.Authorization === 'Bearer a1' && url.endsWith('/slow')) return slow;
      if (init.headers.Authorization === 'Bearer a1')
        return json(401, { error: 'invalid_token', message: 'x' });
      return json(200, { ok: true });
    });
    const { client } = setup(valid, fetchMock as unknown as jest.Mock);

    const first = client.request('/slow');
    await client.request('/other'); // 401 with a1, refreshes once, retries with a2
    release(json(401, { error: 'invalid_token', message: 'x' }));
    await first; // 401 with a1, but tokens already rotated: retries with a2, no second refresh

    const refreshCalls = fetchMock.mock.calls.filter(([u]) => u.endsWith('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('builds file URLs from the host root and authenticates file requests', () => {
    const { client } = setup(valid, jest.fn());
    expect(client.fileUrl('/api/v1/licensees/1/picture')).toBe(
      'http://api/api/v1/licensees/1/picture',
    );
    expect(client.fileHeaders()).toMatchObject({ Authorization: 'Bearer a1', 'X-Licensee': '123' });
  });

  it('downloads files as bytes with the bearer token and keeps JSON errors', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), { status: 200 }))
      .mockResolvedValueOnce(json(404, { error: 'not_found', message: 'x' }));
    const { client } = setup(valid, fetchMock);

    const bytes = await client.requestFile('/api/v1/licensees/7/attachments/42');
    expect(new Uint8Array(bytes)).toEqual(new Uint8Array([1, 2, 3]));
    expect(fetchMock.mock.calls[0][0]).toBe('http://api/api/v1/licensees/7/attachments/42');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer a1');

    await expect(client.requestFile('/api/v1/licensees/7/attachments/43')).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
    });
  });

  it('surfaces the server error body and Retry-After', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        json(429, { error: 'too_many_attempts', message: 'slow down' }, { 'Retry-After': '900' }),
      );
    const { client } = setup(null, fetchMock);

    const error = await client
      .request('/auth/login', { method: 'POST', body: {}, auth: false })
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
