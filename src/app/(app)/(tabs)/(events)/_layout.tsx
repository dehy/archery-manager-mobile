import { Stack } from 'expo-router';

import { t } from '@/i18n';

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTransparent: process.env.EXPO_OS === 'ios',
      }}
    >
      <Stack.Screen name="events" options={{ title: t('tabs.events') }} />
    </Stack>
  );
}
