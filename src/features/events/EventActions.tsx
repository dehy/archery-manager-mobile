import { Alert, Pressable, Share, View } from 'react-native';

import type { EventDetail } from '@/api/types';
import { formatEventWhen } from '@/features/home/format';
import { t } from '@/i18n';
import { Icon, useTheme } from '@/ui';

import { addToCalendar } from './addToCalendar';

/** Header buttons of the event screen: add to the calendar, share. */
export function EventActions({ event }: { event: EventDetail }) {
  const theme = useTheme();

  const onCalendar = () =>
    addToCalendar(event)
      .then((opened) => {
        if (!opened) Alert.alert(t('events.calendarError'));
      })
      .catch(() => Alert.alert(t('events.calendarError')));

  const onShare = () => {
    const when = formatEventWhen(event.starts_at, event.ends_at, event.all_day, t('home.allDay'));
    const message = [event.title, when, event.address?.replace(/\n/g, ', ')]
      .filter(Boolean)
      .join('\n');
    Share.share({ message }).catch(() => {});
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Pressable
        testID="event-add-to-calendar"
        accessibilityRole="button"
        accessibilityLabel={t('events.addToCalendar')}
        hitSlop={8}
        onPress={onCalendar}
      >
        <Icon name="calendarAdd" size={20} color={theme.text} />
      </Pressable>
      <Pressable
        testID="event-share"
        accessibilityRole="button"
        accessibilityLabel={t('events.share')}
        hitSlop={8}
        onPress={onShare}
      >
        <Icon name="share" size={20} color={theme.text} />
      </Pressable>
    </View>
  );
}
