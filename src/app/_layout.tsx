import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { useSession } from '@/auth/session';
import { Sentry } from '@/observability/sentry';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const status = useSession((s) => s.status);
  const restore = useSession((s) => s.restore);

  useEffect(() => {
    restore().finally(() => SplashScreen.hideAsync());
  }, [restore]);

  // Drop cached server data whenever the user is signed out.
  useEffect(() => {
    if (status === 'signedOut') queryClient.clear();
  }, [status, queryClient]);

  if (status === 'loading') return null;

  return (
    <QueryClientProvider client={queryClient}>
      {/* iOS follows the light/dark appearance on its own, and expo-status-bar calls an API that iOS 27
          deprecated on every screen change (log spam). Android needs it for the icon color. */}
      {process.env.EXPO_OS === 'android' ? <StatusBar style="auto" /> : null}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={status === 'signedIn'}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signedOut'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
