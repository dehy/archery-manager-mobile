import { useMemo, useState } from 'react';
import { RefreshControl, SectionList } from 'react-native';

import { isForbidden, loadErrorMessage } from '@/features/errors';
import { addMonths, currentMonth, groupByDay, monthLabel } from '@/features/events/dates';
import { EventRow } from '@/features/events/EventRow';
import { useEvents } from '@/features/events/queries';
import { t } from '@/i18n';
import {
  GroupedItem,
  GroupHeader,
  Message,
  SkeletonRows,
  Text,
  useTheme,
  usePullToRefresh,
} from '@/ui';
import { HeaderToolbar } from '@/ui/nav';

export default function EventsScreen() {
  const theme = useTheme();
  const [today] = useState(currentMonth);
  const [month, setMonth] = useState(today);
  const { data, error, isPending, refetch } = useEvents(month);
  const pull = usePullToRefresh(refetch);
  const sections = useMemo(() => groupByDay(data?.events ?? []), [data]);

  const header = (
    <Text
      accessibilityRole="header"
      style={{
        paddingHorizontal: 16,
        paddingBottom: 8,
        fontSize: 20,
        fontWeight: '600',
        color: theme.muted,
      }}
    >
      {monthLabel(month)}
    </Text>
  );

  return (
    <>
      <HeaderToolbar
        placement="left"
        actions={[
          {
            label: t('events.today'),
            hidden: month.year === today.year && month.month === today.month,
            onPress: () => setMonth(today),
          },
        ]}
      />
      <HeaderToolbar
        placement="right"
        actions={[
          {
            label: t('events.previous'),
            icon: 'chevronLeft',
            onPress: () => setMonth((m) => addMonths(m, -1)),
          },
          {
            label: t('events.next'),
            icon: 'chevronRight',
            onPress: () => setMonth((m) => addMonths(m, 1)),
          },
        ]}
      />
      <SectionList
        style={{ flex: 1, backgroundColor: theme.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingVertical: 16 }}
        sections={sections}
        keyExtractor={(e) => String(e.id)}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => <GroupHeader title={section.title} />}
        renderItem={({ item, index, section }) => (
          <GroupedItem index={index} count={section.data.length}>
            <EventRow event={item} last={index === section.data.length - 1} />
          </GroupedItem>
        )}
        ListEmptyComponent={
          isPending && !error ? (
            <SkeletonRows count={4} />
          ) : error ? (
            <Message
              title={isForbidden(error) ? t('common.forbiddenSeason') : loadErrorMessage(error)}
              actionLabel={isForbidden(error) ? undefined : t('common.retry')}
              onAction={refetch}
            />
          ) : (
            <Message title={t('events.none')} />
          )
        }
        refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} />}
      />
    </>
  );
}
