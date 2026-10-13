import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useMe } from '@/features/account/queries';
import { loadErrorMessage } from '@/features/errors';
import { formatSeason } from '@/features/home/format';
import { useSession } from '@/auth/session';
import { t } from '@/i18n';
import { Message, Row, ScrollScreen, Section, Text, usePullToRefresh } from '@/ui';

export default function AccountScreen() {
  const router = useRouter();
  const signOut = useSession((s) => s.signOut);
  const me = useMe();
  const pull = usePullToRefresh(me.refetch);

  if (me.error && !me.data) {
    return (
      <ScrollScreen>
        <Message
          title={loadErrorMessage(me.error)}
          actionLabel={t('common.retry')}
          onAction={me.refetch}
        />
      </ScrollScreen>
    );
  }

  const data = me.data;
  const selectedId = data?.context.licensee_id ?? null;
  const selected = data?.licensees.find((l) => l.id === selectedId);
  const canSwitchLicensee = (data?.licensees.length ?? 0) > 1;
  // The season is pickable as soon as the licensee has another season than the one in use.
  const canSwitchSeason = !!selected?.seasons.some((s) => s !== data?.context.season);

  const confirmSignOut = () =>
    Alert.alert(t('account.logoutTitle'), t('account.logoutBody'), [
      { text: t('account.cancel'), style: 'cancel' },
      { text: t('common.logout'), style: 'destructive', onPress: () => signOut() },
    ]);

  return (
    <ScrollScreen refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
      {data ? (
        <>
          <Section>
            <Row
              title={
                [data.user.firstname, data.user.lastname].filter(Boolean).join(' ') ||
                data.user.email
              }
              subtitle={data.user.email}
              last
            />
          </Section>

          <Section title={t('account.context')}>
            <Row
              testID="row-licensee"
              title={t('account.licensee')}
              detail={selected ? `${selected.firstname} ${selected.lastname}` : null}
              onPress={canSwitchLicensee ? () => router.push('/licensee-picker') : undefined}
            />
            <Row
              testID="row-season"
              title={t('account.season')}
              detail={formatSeason(data.context.season)}
              onPress={canSwitchSeason ? () => router.push('/season-picker') : undefined}
              last={selectedId === null}
            />
            {selectedId !== null ? (
              <Row
                testID="row-my-profile"
                title={t('account.myProfile')}
                onPress={() =>
                  router.push({ pathname: '/licensee/[id]', params: { id: selectedId } })
                }
                last
              />
            ) : null}
          </Section>
        </>
      ) : null}

      {data ? (
        <Section title={t('account.activity')}>
          <Row
            testID="row-results"
            title={t('results.title')}
            onPress={() => router.push('/results')}
          />
          <Row
            testID="row-advice"
            title={t('advice.title')}
            onPress={() => router.push('/advice')}
          />
          <Row
            testID="row-calendar"
            title={t('calendar.title')}
            onPress={() => router.push('/calendar')}
            last
          />
        </Section>
      ) : null}

      <Section>
        <Row
          testID="row-logout"
          title={t('common.logout')}
          onPress={confirmSignOut}
          kind="action"
          destructive
          last
        />
      </Section>
      <Text variant="muted" style={{ textAlign: 'center' }}>
        {t('account.version', { version: Constants.expoConfig?.version ?? '' })}
      </Text>
    </ScrollScreen>
  );
}
