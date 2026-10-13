import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import type { HistoryResult } from '@/api/types';
import { isForbidden, loadErrorMessage } from '@/features/errors';
import { formatSeason } from '@/features/home/format';
import { formatDocumentDate } from '@/features/licensee/format';
import {
  positionLabel,
  progression,
  scoreLine,
  seasonsOf,
  targetLine,
  tieBreakLine,
} from '@/features/results/format';
import { useMyResults } from '@/features/results/queries';
import { t } from '@/i18n';
import {
  BarChart,
  Chip,
  Message,
  Row,
  ScrollScreen,
  Section,
  SkeletonRows,
  spacing,
  usePullToRefresh,
} from '@/ui';

const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const dayOf = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export default function MyResultsScreen() {
  const router = useRouter();
  const { data, error, isPending, refetch } = useMyResults();
  const pull = usePullToRefresh(refetch);
  const seasons = useMemo(() => seasonsOf(data ?? []), [data]);
  const [picked, setPicked] = useState<number | null>(null);
  const season = picked ?? seasons[0] ?? null;

  const results = useMemo(
    () => (data ?? []).filter((r) => r.event?.season === season),
    [data, season],
  );
  const trend = useMemo(() => (season ? progression(data ?? [], season) : null), [data, season]);

  const row = (r: HistoryResult, i: number) => (
    <Row
      key={r.id}
      testID={`result-${r.id}`}
      title={r.event?.title ?? ''}
      subtitle={[
        r.event?.starts_at ? formatDocumentDate(r.event.starts_at.slice(0, 10)) : null,
        targetLine(r),
      ]
        .filter(Boolean)
        .join(' · ')}
      caption={[positionLabel(r.position), tieBreakLine(r)].filter(Boolean).join(' · ') || null}
      detail={scoreLine(r)}
      onPress={
        r.event
          ? () => router.push({ pathname: '/event/[id]/results', params: { id: r.event!.id } })
          : undefined
      }
      last={i === results.length - 1}
    />
  );

  return (
    <ScrollScreen refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
      <Stack.Screen
        options={{ title: t('results.title'), headerBackButtonDisplayMode: 'minimal' }}
      />
      {isPending && !error ? <SkeletonRows count={5} /> : null}
      {error ? (
        <Message
          title={isForbidden(error) ? t('common.forbiddenSeason') : loadErrorMessage(error)}
          actionLabel={isForbidden(error) ? undefined : t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data && data.length === 0 ? <Message title={t('results.none')} /> : null}

      {seasons.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: spacing.md }}
        >
          {seasons.map((s) => (
            <Chip
              key={s}
              label={formatSeason(s)}
              selected={s === season}
              onPress={() => setPicked(s)}
            />
          ))}
        </ScrollView>
      ) : null}

      {trend ? (
        <Section title={t('results.progression', { format: trend.label })}>
          <View style={{ padding: 16 }}>
            <BarChart
              bars={trend.points.map((p) => ({
                key: p.id,
                value: p.total,
                label: shortDate.format(dayOf(p.date)),
              }))}
              summary={t('results.progressionSummary', {
                count: trend.points.length,
                format: trend.label,
                first: trend.points[0].total,
                last: trend.points[trend.points.length - 1].total,
                best: Math.max(...trend.points.map((p) => p.total)),
              })}
            />
          </View>
        </Section>
      ) : null}

      {data && data.length > 0 && results.length === 0 ? (
        <Message title={t('results.noneThisSeason')} />
      ) : null}
      {results.length > 0 && season ? (
        <Section title={formatSeason(season)}>{results.map(row)}</Section>
      ) : null}
    </ScrollScreen>
  );
}
