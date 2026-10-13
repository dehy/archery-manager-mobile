import { Stack, useLocalSearchParams } from 'expo-router';

import { ApiError } from '@/api/errors';
import { EventActions } from '@/features/events/EventActions';
import { EventContent } from '@/features/events/EventContent';
import { useEvent } from '@/features/events/queries';
import { loadErrorMessage } from '@/features/errors';
import { t } from '@/i18n';
import { Message, ScrollScreen, SkeletonRows, usePullToRefresh } from '@/ui';

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, isPending, refetch } = useEvent(Number(id));
  const pull = usePullToRefresh(refetch);
  const status = error instanceof ApiError ? error.status : null;

  return (
    <ScrollScreen refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
      <Stack.Screen
        options={{
          title: '',
          headerBackButtonDisplayMode: 'minimal',
          headerRight: data ? () => <EventActions event={data} /> : undefined,
        }}
      />
      {isPending && !error ? <SkeletonRows count={5} /> : null}
      {status === 403 ? <Message title={t('events.forbidden')} /> : null}
      {status === 404 ? <Message title={t('events.notFound')} /> : null}
      {error && status !== 403 && status !== 404 ? (
        <Message
          title={loadErrorMessage(error)}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data ? <EventContent event={data} /> : null}
    </ScrollScreen>
  );
}
