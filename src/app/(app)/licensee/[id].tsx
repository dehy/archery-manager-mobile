import { useLocalSearchParams } from 'expo-router';

import { Screen, Text } from '@/ui';

export default function LicenseeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <Text>Licensee {id}</Text>
    </Screen>
  );
}
