import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import type { ReactNode } from 'react';

import { useSession } from '@/auth/session';
import { loadLicensee, saveLicensee } from '@/auth/tokenStorage';
import { useHome } from '@/features/home/useHome';

import { useMe, useSwitchLicensee, useSwitchSeason } from '../queries';

const GILLES = 253;
const GENEVIEVE = 254;

const me = (context: { licensee_id: number; season: number }) => ({
  user: { id: 1, email: 'a@b.c', firstname: 'Camille', lastname: 'Roux' },
  licensees: [
    {
      id: GILLES,
      ffta_member_code: '495732G',
      firstname: 'Gilles',
      lastname: 'Renault',
      seasons: [2027, 2026],
    },
    {
      id: GENEVIEVE,
      ffta_member_code: null,
      firstname: 'Geneviève',
      lastname: 'Roussel',
      seasons: [2027],
    },
  ],
  context: { ...context, licensee: null },
});

const home = (licenseeId: number, season: number) => ({
  state: 'dashboard',
  season,
  licensee: { id: licenseeId, firstname: String(licenseeId), ffta_member_code: null },
  next_events: [],
  last_results: [],
});

/** A fake API that answers from the context headers, like the real one. */
function fakeApi() {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  global.fetch = jest.fn(async (url: string, init: { headers: Record<string, string> }) => {
    calls.push({ url, headers: init.headers });
    const licenseeId = Number(init.headers['X-Licensee'] ?? GILLES);
    const season = Number(init.headers['X-Season'] ?? 2027);
    const body = url.endsWith('/me')
      ? me({ licensee_id: licenseeId, season })
      : home(licenseeId, season);
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  return calls;
}

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  useSession.setState({
    status: 'signedIn',
    licensee: null,
    season: null,
    tokens: { accessToken: 'a', accessTokenExpiresAt: Date.now() + 600_000, refreshToken: 'r' },
  });
});

describe('licensee choice', () => {
  it('persists the chosen licensee id', async () => {
    await useSession.getState().setLicensee(GENEVIEVE);
    expect(useSession.getState().licensee).toBe(GENEVIEVE);
    expect(await loadLicensee()).toBe(GENEVIEVE);
  });

  it('ignores an FFTA code saved by an older version', async () => {
    await SecureStore.setItemAsync('context.licensee', '495732G');
    expect(await loadLicensee()).toBeNull();
  });

  it('is cleared on sign out', async () => {
    fakeApi();
    await saveLicensee(GENEVIEVE);
    await useSession.getState().setLicensee(GENEVIEVE);
    await useSession.getState().signOut();
    expect(await loadLicensee()).toBeNull();
    expect(useSession.getState().licensee).toBeNull();
  });

  it('falls back to the server default when the chosen licensee no longer exists', async () => {
    fakeApi();
    await useSession.getState().setLicensee(999);
    await renderHook(() => useMe(), { wrapper });
    await waitFor(() => expect(useSession.getState().licensee).toBeNull());
    expect(await loadLicensee()).toBeNull();
  });

  it('keeps a valid choice', async () => {
    fakeApi();
    await useSession.getState().setLicensee(GENEVIEVE);
    const { result } = await renderHook(() => useMe(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(useSession.getState().licensee).toBe(GENEVIEVE);
  });
});

describe('switching context with screens mounted', () => {
  const mount = () =>
    renderHook(
      () => ({
        me: useMe(),
        home: useHome(),
        switchLicensee: useSwitchLicensee(),
        switchSeason: useSwitchSeason(),
      }),
      { wrapper },
    );

  it('sends the licensee id and loads its data instead of hanging', async () => {
    const calls = fakeApi();
    const { result } = await mount();
    await waitFor(() => expect(result.current.home.data?.licensee?.id).toBe(GILLES));

    await act(() => result.current.switchLicensee(GENEVIEVE));

    await waitFor(() => expect(result.current.home.data?.licensee?.id).toBe(GENEVIEVE));
    expect(calls.some((c) => c.headers['X-Licensee'] === String(GENEVIEVE))).toBe(true);
  });

  it('refreshes the context of /me after a switch', async () => {
    fakeApi();
    const { result } = await mount();
    await waitFor(() => expect(result.current.me.data?.context.licensee_id).toBe(GILLES));

    await act(() => result.current.switchLicensee(GENEVIEVE));

    await waitFor(() => expect(result.current.me.data?.context.licensee_id).toBe(GENEVIEVE));
  });

  it('switches season, and a licensee switch goes back to the current season', async () => {
    const calls = fakeApi();
    const { result } = await mount();
    await waitFor(() => expect(result.current.home.data).toBeDefined());

    await act(() => result.current.switchSeason(2026));
    await waitFor(() => expect(result.current.home.data?.season).toBe(2026));
    expect(calls.some((c) => c.headers['X-Season'] === '2026')).toBe(true);

    await act(() => result.current.switchLicensee(GENEVIEVE));
    expect(useSession.getState().season).toBeNull();
    await waitFor(() => expect(result.current.home.data?.season).toBe(2027));
  });
});
