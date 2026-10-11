import { Stack } from 'expo-router';

import { useMe } from '@/features/account/queries';

const pickerSheet = {
  presentation: 'formSheet',
  headerShown: false,
  sheetAllowedDetents: 'fitToContents',
  sheetGrabberVisible: true,
} as const;

export default function AppLayout() {
  // Loads /me for the whole signed-in area and repairs a stale persisted licensee.
  useMe();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="licensee/[id]" />
      <Stack.Screen name="event/[id]/index" />
      <Stack.Screen name="event/[id]/participants" />
      <Stack.Screen name="event/[id]/results" />
      <Stack.Screen name="results" />
      <Stack.Screen name="advice/index" />
      <Stack.Screen name="advice/[id]" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="licensee-picker" options={pickerSheet} />
      <Stack.Screen name="season-picker" options={pickerSheet} />
    </Stack>
  );
}
