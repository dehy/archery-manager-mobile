import { HomeContent } from '@/features/home/HomeContent';
import { useHome } from '@/features/home/useHome';
import { loadErrorMessage } from '@/features/errors';
import { t } from '@/i18n';
import { Message, ScrollScreen, SkeletonRows } from '@/ui';

export default function HomeScreen() {
  const { data, error, isPending, isRefetching, refetch } = useHome();

  return (
    <ScrollScreen refreshing={isRefetching} onRefresh={refetch}>
      {isPending && !error ? <SkeletonRows /> : null}
      {error ? (
        <Message
          title={loadErrorMessage(error)}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data ? <HomeContent home={data} /> : null}
    </ScrollScreen>
  );
}
