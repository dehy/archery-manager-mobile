import { useQuery } from '@tanstack/react-query';

import { fetchMe, useSession } from '@/auth/session';
import { t } from '@/i18n';
import { Button, Screen, Text } from '@/ui';

export default function HomeScreen() {
  const signOut = useSession((s) => s.signOut);
  const { data, isPending, error } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  return (
    <Screen>
      {isPending ? <Text variant="muted">{t('common.loading')}</Text> : null}
      {error ? <Text variant="error">{t('errors.unknown')}</Text> : null}
      {data ? (
        <>
          <Text variant="title">
            {t('home.greeting', { name: data.user.firstname ?? data.user.email })}
          </Text>
          <Text variant="muted">{t('home.licensees')}</Text>
          {data.licensees.length === 0 ? <Text>{t('home.none')}</Text> : null}
          {data.licensees.map((l) => (
            <Text key={l.ffta_member_code}>
              {l.firstname} {l.lastname} ({l.ffta_member_code})
            </Text>
          ))}
        </>
      ) : null}
      <Button title={t('common.logout')} onPress={signOut} />
    </Screen>
  );
}
