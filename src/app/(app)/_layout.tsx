import { Stack } from 'expo-router';

import { useMe } from '@/features/account/queries';

export default function AppLayout() {
  // Loads /me for the whole signed-in area and repairs a stale persisted licensee.
  useMe();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="licensee/[id]" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen
        name="licensee-picker"
        options={{
          presentation: 'formSheet',
          headerShown: false,
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
