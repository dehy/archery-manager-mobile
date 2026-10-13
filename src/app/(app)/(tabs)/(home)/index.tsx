import { useClub } from '@/features/club/queries';
import { HomeContent } from '@/features/home/HomeContent';
import { LicenseeButton } from '@/features/home/LicenseeButton';
import { useHome } from '@/features/home/useHome';
import { loadErrorMessage } from '@/features/errors';
import { t } from '@/i18n';
import { Message, ScrollScreen, SkeletonRows, usePullToRefresh } from '@/ui';

export default function HomeScreen() {
  const { data, error, isPending, refetch } = useHome();
  const pull = usePullToRefresh(refetch);
  const club = useClub();

  return (
    <ScrollScreen refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
      <LicenseeButton />
      {isPending && !error ? <SkeletonRows /> : null}
      {error ? (
        <Message
          title={loadErrorMessage(error)}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data ? <HomeContent home={data} club={club.data?.club} /> : null}
    </ScrollScreen>
  );
}
