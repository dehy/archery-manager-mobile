import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useMe } from '@/features/account/queries';
import { loadErrorMessage } from '@/features/errors';
import { formatSeason } from '@/features/home/format';
import { useHome } from '@/features/home/useHome';
import { useSession } from '@/auth/session';
import { t } from '@/i18n';
import { Message, Row, ScrollScreen, Section, Text } from '@/ui';

export default function AccountScreen() {
  const router = useRouter();
  const signOut = useSession((s) => s.signOut);
  const me = useMe();
  const home = useHome();

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
  const selectedCode = data?.context.licensee ?? null;
  const selected = data?.licensees.find((l) => l.ffta_member_code === selectedCode);
  const myLicenseeId =
    home.data && home.data.state !== 'blank_account' ? home.data.licensee.id : null;
  const canSwitch = (data?.licensees.length ?? 0) > 1;

  const confirmSignOut = () =>
    Alert.alert(t('account.logoutTitle'), t('account.logoutBody'), [
      { text: t('account.cancel'), style: 'cancel' },
      { text: t('common.logout'), style: 'destructive', onPress: () => signOut() },
    ]);

  return (
    <ScrollScreen refreshing={me.isRefetching} onRefresh={me.refetch}>
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
              onPress={canSwitch ? () => router.push('/licensee-picker') : undefined}
            />
            <Row
              title={t('account.season')}
              detail={formatSeason(data.context.season)}
              last={myLicenseeId === null}
            />
            {myLicenseeId !== null ? (
              <Row
                testID="row-my-profile"
                title={t('account.myProfile')}
                onPress={() =>
                  router.push({ pathname: '/licensee/[id]', params: { id: myLicenseeId } })
                }
                last
              />
            ) : null}
          </Section>
        </>
      ) : null}

      <Section>
        <Row title={t('common.logout')} onPress={confirmSignOut} last />
      </Section>
      <Text variant="muted" style={{ textAlign: 'center' }}>
        {t('account.version', { version: Constants.expoConfig?.version ?? '' })}
      </Text>
    </ScrollScreen>
  );
}
