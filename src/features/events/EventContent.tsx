import { useRouter } from 'expo-router';
import { Linking, Platform, View } from 'react-native';

import type { EventDetail } from '@/api/types';
import { useOpenAttachment } from '@/features/files/useOpenAttachment';
import { formatEventWhen } from '@/features/home/format';
import { formatSize } from '@/features/licensee/format';
import { eventTypeLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Row, Section, Text, spacing } from '@/ui';

import { mapsUrl } from './maps';
import { ParticipationForm } from './ParticipationForm';

const CONTEST_TYPES = ['contest_official', 'contest_hobby'];

export function EventContent({ event }: { event: EventDetail }) {
  const router = useRouter();
  const { open, downloading } = useOpenAttachment();
  const when = formatEventWhen(event.starts_at, event.ends_at, event.all_day, t('home.allDay'));
  const isContest = CONTEST_TYPES.includes(event.type);
  const started = !!event.starts_at && new Date(event.starts_at) <= new Date();
  const url = mapsUrl(event, Platform.OS === 'ios' ? 'ios' : 'android');

  const info: [string, string | null | undefined][] = [
    [t('events.type'), eventTypeLabel(event.type)],
    [t('events.discipline'), event.discipline?.label],
    [t('events.contestType'), event.contest_type?.label],
    [t('events.club'), event.club?.name],
    [
      t('events.groups'),
      event.assigned_groups.length
        ? event.assigned_groups.map((g) => g.name).join(', ')
        : t('events.everybody'),
    ],
  ];
  const shown = info.filter(([, v]) => v);

  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingBottom: spacing.md, gap: 4 }}>
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '600' }}>
          {event.title}
        </Text>
        <Text variant="muted">{when}</Text>
      </View>

      <Section title={t('events.myAnswer')}>
        <ParticipationForm event={event} />
      </Section>

      <Section title={t('events.info')}>
        {event.address ? (
          <Row
            testID="event-address"
            title={t('events.where')}
            subtitle={event.address}
            onPress={url ? () => Linking.openURL(url) : undefined}
          />
        ) : null}
        {shown.map(([label, value], i) => (
          <Row key={label} title={label} subtitle={value} last={i === shown.length - 1} />
        ))}
      </Section>

      <Section>
        <Row
          testID="event-participants"
          title={t('events.participants')}
          detail={String(event.participants_count)}
          onPress={() =>
            router.push({ pathname: '/event/[id]/participants', params: { id: event.id } })
          }
          last={!(isContest && started)}
        />
        {isContest && started ? (
          <Row
            testID="event-results"
            title={t('events.results')}
            onPress={() =>
              router.push({ pathname: '/event/[id]/results', params: { id: event.id } })
            }
            last
          />
        ) : null}
      </Section>

      <Section title={t('events.documents')}>
        {event.attachments.length === 0 ? (
          <Row title={t('events.noDocuments')} last />
        ) : (
          event.attachments.map((a, i) => (
            <Row
              key={a.id}
              testID={`event-attachment-${a.id}`}
              title={a.type?.label ?? a.file_name ?? ''}
              subtitle={
                downloading === a.id
                  ? t('files.downloading')
                  : [a.file_name, formatSize(a.size)].filter(Boolean).join(' · ')
              }
              onPress={() => open(a)}
              last={i === event.attachments.length - 1}
            />
          ))
        )}
      </Section>
    </>
  );
}
