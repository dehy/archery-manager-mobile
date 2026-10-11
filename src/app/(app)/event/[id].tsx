import { useLocalSearchParams } from 'expo-router';

import { Screen, Text } from '@/ui';

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <Text>Event {id}</Text>
    </Screen>
  );
}
