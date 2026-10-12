import { Stack } from 'expo-router';

import { t } from '@/i18n';
import { useStackColors } from '@/ui/nav';

export default function ClubLayout() {
  const stackColors = useStackColors();
  return (
    <Stack
      screenOptions={{
        ...stackColors,
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTransparent: process.env.EXPO_OS === 'ios',
      }}
    >
      <Stack.Screen name="club" options={{ title: t('tabs.club') }} />
    </Stack>
  );
}
