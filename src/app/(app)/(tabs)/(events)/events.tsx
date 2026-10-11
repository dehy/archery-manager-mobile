import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, View } from 'react-native';

import { isForbidden, loadErrorMessage } from '@/features/errors';
import { addMonths, currentMonth, groupByDay, monthLabel } from '@/features/events/dates';
import { EventRow } from '@/features/events/EventRow';
import { useEvents } from '@/features/events/queries';
import { t } from '@/i18n';
import { GroupedItem, GroupHeader, Message, SkeletonRows, Text, useTheme } from '@/ui';

export default function EventsScreen() {
  const theme = useTheme();
  const [month, setMonth] = useState(currentMonth);
  const { data, error, isPending, isRefetching, refetch } = useEvents(month);
  const sections = useMemo(() => groupByDay(data?.events ?? []), [data]);

  const header = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('events.previous')}
        hitSlop={12}
        onPress={() => setMonth((m) => addMonths(m, -1))}
      >
        <Text style={{ fontSize: 24, color: theme.primary }}>‹</Text>
      </Pressable>
      <Text accessibilityRole="header" style={{ fontWeight: '600', fontSize: 17 }}>
        {monthLabel(month)}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('events.next')}
        hitSlop={12}
        onPress={() => setMonth((m) => addMonths(m, 1))}
      >
        <Text style={{ fontSize: 24, color: theme.primary }}>›</Text>
      </Pressable>
    </View>
  );

  return (
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
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    />
  );
}
