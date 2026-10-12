import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { EventSummary } from '@/api/types';
import { ParticipationPill } from '@/features/events/ParticipationPill';
import { eventTypeLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Icon, Text, isIOS, spacing, useTheme } from '@/ui';

import { formatEventWhen, relativeDay } from './format';

const relativeLabels = {
  today: t('home.today'),
  tomorrow: t('home.tomorrow'),
  inDays: (count: number) => t('home.inDays', { count }),
};

function Card({
  onPress,
  label,
  children,
  testID,
}: {
  onPress: () => void;
  label?: string;
  children: React.ReactNode;
  testID?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: '#00000014' }}
      style={({ pressed }) => ({
        marginHorizontal: 16,
        marginBottom: spacing.lg,
        padding: 16,
        gap: 10,
        borderRadius: isIOS ? 16 : 12,
        overflow: 'hidden',
        backgroundColor: theme.surface,
        opacity: isIOS && pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

/**
 * The member's next registered event, first thing on the dashboard; opens the event. Without
 * one, a short note that leads to the calendar instead.
 */
export function NextEventCard({ event }: { event: EventSummary | undefined }) {
  const router = useRouter();
  const theme = useTheme();

  if (!event?.starts_at) {
    return (
      <Card testID="next-event-empty" onPress={() => router.navigate('/events')}>
        <Text variant="muted">{t('home.noRegisteredTitle')}</Text>
        <Text style={{ color: theme.primary, fontWeight: '600' }}>{t('home.seeCalendar')}</Text>
      </Card>
    );
  }

  const when = formatEventWhen(event.starts_at, event.ends_at, event.all_day, t('home.allDay'));
  const place = event.address?.split('\n')[0];
  const soon = relativeDay(event.starts_at, event.all_day, relativeLabels);

  return (
    <Card
      testID="next-event"
      label={`${t('home.nextRegistered')}, ${soon}, ${event.title}`}
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: theme.primary,
          }}
        >
          {soon}
        </Text>
        <Text variant="muted" style={{ fontSize: 13 }}>
          {eventTypeLabel(event.type)}
        </Text>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>{event.title}</Text>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="clock" size={15} />
          <Text variant="muted" style={{ flex: 1 }}>
            {when}
          </Text>
        </View>
        {place ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="place" size={15} />
            <Text variant="muted" style={{ flex: 1 }} numberOfLines={1}>
              {place}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <ParticipationPill type={event.type} state={event.participation_state} />
        <Icon name="people" size={13} />
        <Text variant="muted" style={{ flex: 1, fontSize: 13 }}>
          {t('home.participants', { count: event.participants_count })}
        </Text>
        <Text style={{ color: theme.primary }}>{t('home.details')}</Text>
      </View>
    </Card>
  );
}
