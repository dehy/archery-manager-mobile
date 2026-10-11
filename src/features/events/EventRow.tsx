import { useRouter } from 'expo-router';

import type { EventListItem, EventSummary } from '@/api/types';
import { formatEventWhen } from '@/features/home/format';
import { eventTypeLabel, participationLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Row } from '@/ui';

/** One event of a list (calendar or dashboard); opens the event screen. */
export function EventRow({ event, last }: { event: EventListItem | EventSummary; last?: boolean }) {
  const router = useRouter();
  const when = formatEventWhen(event.starts_at, event.ends_at, event.all_day, t('home.allDay'));
  // The dashboard summary has no `can_participate`: those events are the member's own groups'.
  const canParticipate = 'can_participate' in event ? event.can_participate : true;
  const answer = canParticipate
    ? participationLabel(event.type, event.participation_state)
    : t('events.restricted');

  return (
    <Row
      testID={`event-${event.id}`}
      title={event.title}
      subtitle={[when, event.address?.split('\n')[0]].filter(Boolean).join('\n')}
      caption={`${eventTypeLabel(event.type)} · ${answer} · ${t('home.participants', { count: event.participants_count })}`}
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      last={last}
    />
  );
}
