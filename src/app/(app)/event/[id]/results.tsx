import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { ApiError } from '@/api/errors';
import { loadErrorMessage } from '@/features/errors';
import { useEvent } from '@/features/events/queries';
import {
  groupByCategory,
  positionLabel,
  scoreLine,
  targetLine,
  tieBreakLine,
} from '@/features/results/format';
import { useContestResults } from '@/features/results/queries';
import { t } from '@/i18n';
import { Badge, Message, Row, ScrollScreen, Section, SkeletonRows, Text } from '@/ui';

export default function ContestResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(Number(id));
  const { data, error, isPending, isRefetching, refetch } = useContestResults(Number(id));
  const groups = useMemo(() => groupByCategory(data ?? []), [data]);
  // 404 here means the event exists but is not a contest.
  const status = error instanceof ApiError ? error.status : null;

  return (
    <ScrollScreen refreshing={isRefetching} onRefresh={refetch}>
      <Stack.Screen
        options={{ title: t('events.results'), headerBackButtonDisplayMode: 'minimal' }}
      />
      {event.data ? (
        <Text
          accessibilityRole="header"
          style={{ fontSize: 20, fontWeight: '600', marginHorizontal: 16, marginBottom: 12 }}
        >
          {event.data.title}
        </Text>
      ) : null}
      {isPending && !error ? <SkeletonRows count={6} /> : null}
      {status === 404 ? <Message title={t('results.notContest')} /> : null}
      {error && status !== 404 ? (
        <Message
          title={loadErrorMessage(error)}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data && data.length === 0 ? <Message title={t('results.contestNone')} /> : null}
      {groups.map((g) => (
        <Section key={g.key} title={g.title}>
          {g.results.map((r, i) => (
            <Row
              key={r.id}
              testID={`contest-result-${r.id}`}
              title={r.licensee.display_name}
              subtitle={targetLine(r)}
              caption={
                [positionLabel(r.position), tieBreakLine(r)].filter(Boolean).join(' · ') || null
              }
              detail={scoreLine(r)}
              left={r.is_mine ? <Badge label={t('results.mine')} /> : undefined}
              last={i === g.results.length - 1}
            />
          ))}
        </Section>
      ))}
    </ScrollScreen>
  );
}
