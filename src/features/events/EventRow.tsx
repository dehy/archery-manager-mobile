import { useRouter } from 'expo-router';
import { View } from 'react-native';

import type { EventListItem, EventSummary } from '@/api/types';
import { dateTile, eventTime } from '@/features/home/format';
import { eventTypeLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Icon, Row, Text, useTheme } from '@/ui';

import { ParticipationPill } from './ParticipationPill';

const timeLabels = {
  allDay: t('home.allDayShort'),
  days: (count: number) => t('home.days', { count }),
};

/** The month and day(s) of an event, in the club tint. */
function DateTile({ event }: { event: EventListItem | EventSummary }) {
  const theme = useTheme();
  if (!event.starts_at) return null;
  const { month, day } = dateTile(event.starts_at, event.ends_at, event.all_day);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: 48,
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.primaryContainer,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.onPrimaryContainer }}>
        {month}
      </Text>
      <Text
        style={{
          fontSize: day.length > 2 ? 15 : 20,
          fontWeight: '700',
          lineHeight: day.length > 2 ? 18 : 23,
          color: theme.onPrimaryContainer,
        }}
      >
        {day}
      </Text>
    </View>
  );
}

/**
 * One event of a list; opens the event screen. `withDate` adds the date tile (lists that are not
 * already grouped by day). The answer shows as a pill, then the type and the participant count.
 */
export function EventRow({
  event,
  last,
  withDate,
}: {
  event: EventListItem | EventSummary;
  last?: boolean;
  withDate?: boolean;
}) {
  const router = useRouter();
  const theme = useTheme();
  const when = event.starts_at
    ? eventTime(event.starts_at, event.ends_at, event.all_day, timeLabels)
    : null;
  // The dashboard summary has no `can_participate`: those events are the member's own groups'.
  const canParticipate = 'can_participate' in event ? event.can_participate : true;

  return (
    <Row
      testID={`event-${event.id}`}
      title={event.title}
      subtitle={[when, event.address?.split('\n')[0]].filter(Boolean).join(' · ')}
      left={withDate ? <DateTile event={event} /> : undefined}
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {canParticipate ? (
            <ParticipationPill type={event.type} state={event.participation_state} />
          ) : null}
          <Text variant="muted" style={{ fontSize: 13 }}>
            {canParticipate ? eventTypeLabel(event.type) : t('events.restricted')}
          </Text>
          <View
            accessible
            accessibilityLabel={t('home.participants', { count: event.participants_count })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
          >
            <Icon name="people" size={13} color={theme.muted} />
            <Text variant="muted" style={{ fontSize: 13 }}>
              {event.participants_count}
            </Text>
          </View>
        </View>
      }
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      last={last}
    />
  );
}
