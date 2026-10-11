import { Stack } from 'expo-router';

import { t } from '@/i18n';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTransparent: process.env.EXPO_OS === 'ios',
      }}
    >
      <Stack.Screen name="account" options={{ title: t('tabs.account') }} />
    </Stack>
  );
}
