import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { adviceByline, adviceCaption } from '@/features/advice/format';
import { useAdvices } from '@/features/advice/queries';
import { isForbidden, loadErrorMessage } from '@/features/errors';
import { t } from '@/i18n';
import { Chip, Message, Row, ScrollScreen, Section, SkeletonRows, usePullToRefresh } from '@/ui';

export default function AdviceListScreen() {
  const router = useRouter();
  const [archived, setArchived] = useState(false);
  const { data, error, isPending, refetch } = useAdvices(archived);
  const pull = usePullToRefresh(refetch);

  return (
    <ScrollScreen refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
      <Stack.Screen
        options={{ title: t('advice.title'), headerBackButtonDisplayMode: 'minimal' }}
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 12, alignItems: 'flex-start' }}>
        <Chip
          label={t('advice.showArchived')}
          selected={archived}
          onPress={() => setArchived((a) => !a)}
        />
      </View>
      {isPending && !error ? <SkeletonRows count={4} /> : null}
      {error ? (
        <Message
          title={isForbidden(error) ? t('common.forbiddenSeason') : loadErrorMessage(error)}
          actionLabel={isForbidden(error) ? undefined : t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data && data.length === 0 ? (
        <Message title={archived ? t('advice.noneArchived') : t('advice.none')} />
      ) : null}
      {data && data.length > 0 ? (
        <Section>
          {data.map((a, i) => (
            <Row
              key={a.id}
              testID={`advice-${a.id}`}
              title={a.title}
              subtitle={adviceByline(a)}
              caption={adviceCaption(a)}
              onPress={() => router.push({ pathname: '/advice/[id]', params: { id: a.id } })}
              last={i === data.length - 1}
            />
          ))}
        </Section>
      ) : null}
    </ScrollScreen>
  );
}
