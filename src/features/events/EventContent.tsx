import { useRouter } from 'expo-router';
import { Linking, Platform, Pressable, View } from 'react-native';

import type { EventDetail } from '@/api/types';
import { useOpenAttachment } from '@/features/files/useOpenAttachment';
import { formatEventWhen } from '@/features/home/format';
import { formatSize } from '@/features/licensee/format';
import { eventTypeLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Icon, Row, RowIcon, Section, Text, isIOS, spacing, useTheme } from '@/ui';

import { mapsUrl } from './maps';
import { ParticipationForm } from './ParticipationForm';

const CONTEST_TYPES = ['contest_official', 'contest_hobby'];

export function EventContent({ event }: { event: EventDetail }) {
  const router = useRouter();
  const theme = useTheme();
  const { open, downloading } = useOpenAttachment();
  const when = formatEventWhen(event.starts_at, event.ends_at, event.all_day, t('home.allDay'));
  const isContest = CONTEST_TYPES.includes(event.type);
  const started = !!event.starts_at && new Date(event.starts_at) <= new Date();
  const url = mapsUrl(event, Platform.OS === 'ios' ? 'ios' : 'android');
  const openMaps = url ? () => Linking.openURL(url) : undefined;
  const kind = [eventTypeLabel(event.type), event.discipline?.label, event.contest_type?.label]
    .filter(Boolean)
    .join(' · ');
  const groups = event.assigned_groups.length
    ? event.assigned_groups.map((g) => g.name).join(', ')
    : t('events.everybody');

  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingBottom: spacing.lg, gap: 8 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: theme.primary,
          }}
        >
          {kind}
        </Text>
        <Text
          accessibilityRole="header"
          style={{ fontSize: 28, fontWeight: isIOS ? '700' : '400' }}
        >
          {event.title}
        </Text>
        <View style={{ gap: 6, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="calendar" size={16} />
            <Text variant="muted" style={{ flex: 1, fontSize: 15 }}>
              {when}
            </Text>
          </View>
          {event.address ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="place" size={16} />
              <Text variant="muted" style={{ flex: 1, fontSize: 15 }} numberOfLines={1}>
                {event.address.split('\n')[0]}
              </Text>
              {openMaps ? (
                <Pressable
                  testID="event-directions"
                  accessibilityRole="button"
                  onPress={openMaps}
                  style={{
                    height: 30,
                    paddingHorizontal: 12,
                    borderRadius: 15,
                    justifyContent: 'center',
                    backgroundColor: theme.primaryContainer,
                  }}
                >
                  <Text
                    style={{ fontSize: 15, fontWeight: '600', color: theme.onPrimaryContainer }}
                  >
                    {t('events.directions')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <Section title={t('events.myAnswer')}>
        <ParticipationForm event={event} />
      </Section>

      <Section title={t('events.info')}>
        {event.address ? (
          <Row
            testID="event-address"
            left={<RowIcon name="place" />}
            title={t('events.where')}
            subtitle={event.address}
            onPress={openMaps}
          />
        ) : null}
        {event.club ? (
          <Row left={<RowIcon name="club" />} title={t('events.club')} subtitle={event.club.name} />
        ) : null}
        <Row left={<RowIcon name="groups" />} title={t('events.groups')} subtitle={groups} last />
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
              left={<RowIcon name="document" />}
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
