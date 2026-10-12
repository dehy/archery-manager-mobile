import { useRouter } from 'expo-router';
import { View } from 'react-native';

import type { Club, HomeResponse } from '@/api/types';
import { ClubBadge } from '@/features/club/ClubBadge';
import { EventRow } from '@/features/events/EventRow';
import { applicationStatusLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Message, Row, Section, Text, spacing } from '@/ui';

import { formatResultTarget, formatSeason } from './format';

type Home = HomeResponse;

/** `club` is the selected licensee's club, shown as a badge on the dashboard once loaded. */
export function HomeContent({ home, club }: { home: Home; club?: Club }) {
  switch (home.state) {
    case 'blank_account':
      return <Message title={t('home.blankTitle')} body={t('home.blankBody')} />;
    case 'no_license':
      return <NoLicense home={home} />;
    case 'dashboard':
      return <Dashboard home={home} club={club} />;
  }
}

function Heading({ home, club }: { home: Exclude<Home, { state: 'blank_account' }>; club?: Club }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: spacing.md, gap: spacing.sm }}>
      <View style={{ gap: 2 }}>
        <Text variant="title" style={{ fontSize: 22 }}>
          {t('home.greeting', { name: home.licensee.firstname ?? '' }).trim()}
        </Text>
        <Text variant="muted">{t('home.season', { season: formatSeason(home.season) })}</Text>
      </View>
      {club ? <ClubBadge club={club} /> : null}
    </View>
  );
}

function NoLicense({ home }: { home: Extract<Home, { state: 'no_license' }> }) {
  return (
    <>
      <Heading home={home} />
      <Message title={t('home.noLicenseTitle', { season: formatSeason(home.season) })} />
      <Section title={t('home.applications')}>
        {home.applications.length === 0 ? (
          <Row title={t('home.noApplications')} last />
        ) : (
          home.applications.map((a, i) => (
            <Row
              key={a.id}
              testID={`application-${a.id}`}
              title={a.club?.name ?? ''}
              subtitle={a.admin_message}
              caption={applicationStatusLabel(a.status)}
              last={i === home.applications.length - 1}
            />
          ))
        )}
      </Section>
    </>
  );
}

function Dashboard({ home, club }: { home: Extract<Home, { state: 'dashboard' }>; club?: Club }) {
  const router = useRouter();
  return (
    <>
      <Heading home={home} club={club} />
      <Section title={t('home.nextEvents')}>
        {home.next_events.length === 0 ? (
          <Row title={t('home.noEvents')} last />
        ) : (
          home.next_events.map((e, i) => (
            <EventRow key={e.id} event={e} last={i === home.next_events.length - 1} />
          ))
        )}
      </Section>
      <Section title={t('home.lastResults')}>
        {home.last_results.length === 0 ? (
          <Row title={t('home.noResults')} last />
        ) : (
          home.last_results.map((r, i) => (
            <Row
              key={r.id}
              testID={`result-${r.id}`}
              title={r.event?.title ?? ''}
              subtitle={formatResultTarget(r.distance, r.target_type?.label ?? null, r.target_size)}
              detail={r.total != null ? String(r.total) : null}
              onPress={
                r.event
                  ? () =>
                      router.push({ pathname: '/event/[id]/results', params: { id: r.event!.id } })
                  : undefined
              }
            />
          ))
        )}
        <Row
          testID="all-results"
          title={t('results.seeAll')}
          onPress={() => router.push('/results')}
          last
        />
      </Section>
    </>
  );
}
