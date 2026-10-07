import { ApiError } from '@/api/errors';

import { loginErrorMessage } from '../loginError';
import { useSession } from '../session';
import { loadTokens, saveTokens } from '../tokenStorage';

const tokens = { accessToken: 'a', accessTokenExpiresAt: Date.now() + 1000, refreshToken: 'r' };

describe('token storage', () => {
  it('round-trips and clears tokens', async () => {
    await saveTokens(tokens);
    expect(await loadTokens()).toEqual(tokens);
    await saveTokens(null);
    expect(await loadTokens()).toBeNull();
  });
});

describe('session store', () => {
  beforeEach(() => useSession.setState({ status: 'loading', tokens: null }));

  it('restores a signed-in session from secure storage', async () => {
    await saveTokens(tokens);
    await useSession.getState().restore();
    expect(useSession.getState().status).toBe('signedIn');
  });

  it('is signed out when nothing is stored', async () => {
    await useSession.getState().restore();
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('signs in, persists tokens, and signs out locally even if the server is unreachable', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token_type: 'Bearer',
            access_token: 'a',
            expires_in: 900,
            refresh_token: 'r',
          }),
          { status: 200 },
        ),
      )
      .mockRejectedValueOnce(new TypeError('offline')) as unknown as typeof fetch;

    await useSession.getState().signIn('a@b.c', 'pw');
    expect(useSession.getState().status).toBe('signedIn');
    expect((await loadTokens())?.refreshToken).toBe('r');

    await useSession.getState().signOut();
    expect(useSession.getState().status).toBe('signedOut');
    expect(await loadTokens()).toBeNull();
  });
});

describe('loginErrorMessage', () => {
  it('translates known codes and falls back for unknown ones', () => {
    expect(loginErrorMessage(new ApiError(401, 'invalid_credentials', 'x'))).toBe(
      'Identifiants incorrects.',
    );
    expect(loginErrorMessage(new ApiError(429, 'too_many_attempts', 'x', 900))).toContain('15 min');
    expect(loginErrorMessage(new ApiError(500, 'weird', 'x'))).toBe('Une erreur est survenue.');
    expect(loginErrorMessage(new Error('boom'))).toBe('Une erreur est survenue.');
  });
});
