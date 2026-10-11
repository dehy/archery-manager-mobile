import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useSession } from '@/auth/session';
import { loadLicensee, saveLicensee } from '@/auth/tokenStorage';

import { useHome } from '@/features/home/useHome';

import { useMe, useSwitchLicensee } from '../queries';

const me = {
  user: { id: 1, email: 'a@b.c', firstname: 'Camille', lastname: 'Roux' },
  licensees: [
    { ffta_member_code: '111', firstname: 'Camille', lastname: 'Roux' },
    { ffta_member_code: '222', firstname: 'Noé', lastname: 'Roux' },
  ],
  context: { licensee: '111', season: 2027 },
};

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  useSession.setState({
    status: 'signedIn',
    licensee: null,
    tokens: { accessToken: 'a', accessTokenExpiresAt: Date.now() + 600_000, refreshToken: 'r' },
  });
  global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify(me), { status: 200 }));
});

describe('licensee choice', () => {
  it('persists the chosen licensee', async () => {
    await useSession.getState().setLicensee('222');
    expect(useSession.getState().licensee).toBe('222');
    expect(await loadLicensee()).toBe('222');
  });

  it('is restored with the session and cleared on sign out', async () => {
    await saveLicensee('222');
    await useSession.getState().restore();
    expect(useSession.getState().licensee).toBeNull(); // no stored tokens: signed out
    await useSession.getState().setLicensee('222');
    await useSession.getState().signOut();
    expect(await loadLicensee()).toBeNull();
    expect(useSession.getState().licensee).toBeNull();
  });

  it('falls back to the server default when the chosen licensee no longer exists', async () => {
    await useSession.getState().setLicensee('999');
    await renderHook(() => useMe(), { wrapper });
    await waitFor(() => expect(useSession.getState().licensee).toBeNull());
    expect(await loadLicensee()).toBeNull();
  });

  it('keeps a valid choice', async () => {
    await useSession.getState().setLicensee('222');
    const { result } = await renderHook(() => useMe(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(useSession.getState().licensee).toBe('222');
  });
});

describe('switching licensee with screens mounted', () => {
  it("loads the new licensee's data instead of hanging", async () => {
    const home = (licensee: string) => ({
      state: 'dashboard',
      season: 2027,
      licensee: { id: licensee === '111' ? 1 : 2, firstname: licensee, ffta_member_code: licensee },
      next_events: [],
      last_results: [],
    });
    global.fetch = jest.fn(async (_url: string, init: { headers: Record<string, string> }) => {
      const licensee = init.headers['X-Licensee'] ?? '111';
      return new Response(JSON.stringify(home(licensee)), { status: 200 });
    }) as unknown as typeof fetch;

    const { result } = await renderHook(
      () => ({ home: useHome(), switchTo: useSwitchLicensee() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.home.data?.licensee?.ffta_member_code).toBe('111'));

    await result.current.switchTo('222');

    await waitFor(() => expect(result.current.home.data?.licensee?.ffta_member_code).toBe('222'));
    expect(result.current.home.isPending).toBe(false);
  });

  it('keeps loading when the current licensee is picked again', async () => {
    global.fetch = jest.fn(
      async () =>
        new Response(
          JSON.stringify({
            state: 'dashboard',
            season: 2027,
            licensee: { id: 1, firstname: 'Camille', ffta_member_code: '111' },
            next_events: [],
            last_results: [],
          }),
          { status: 200 },
        ),
    ) as unknown as typeof fetch;
    await useSession.getState().setLicensee('111');

    const { result } = await renderHook(
      () => ({ home: useHome(), switchTo: useSwitchLicensee() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.home.data).toBeDefined());

    await result.current.switchTo('111');

    await waitFor(() => expect(result.current.home.data).toBeDefined());
    expect(result.current.home.isPending).toBe(false);
  });
});
