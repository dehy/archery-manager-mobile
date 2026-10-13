import { Stack, useLocalSearchParams } from 'expo-router';

import { ApiError } from '@/api/errors';
import { loadErrorMessage } from '@/features/errors';
import { LicenseeContent } from '@/features/licensee/LicenseeContent';
import { useLicensee } from '@/features/licensee/queries';
import { t } from '@/i18n';
import { Message, ScrollScreen, SkeletonRows, usePullToRefresh } from '@/ui';

export default function LicenseeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, isPending, refetch } = useLicensee(Number(id));
  const pull = usePullToRefresh(refetch);

  // 403 and 404 are expected answers (no club in common, unknown id): no retry button.
  const status = error instanceof ApiError ? error.status : null;

  return (
    <ScrollScreen refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
      <Stack.Screen
        options={{ title: data?.display_name ?? '', headerBackButtonDisplayMode: 'minimal' }}
      />
      {isPending && !error ? <SkeletonRows count={5} /> : null}
      {status === 403 ? <Message title={t('licensee.forbidden')} /> : null}
      {status === 404 ? <Message title={t('licensee.notFound')} /> : null}
      {error && status !== 403 && status !== 404 ? (
        <Message
          title={loadErrorMessage(error)}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data ? <LicenseeContent licensee={data} /> : null}
    </ScrollScreen>
  );
}
