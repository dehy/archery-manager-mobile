import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useSession } from '@/auth/session';
import { loadLicensee, saveLicensee } from '@/auth/tokenStorage';

import { useMe } from '../queries';

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
