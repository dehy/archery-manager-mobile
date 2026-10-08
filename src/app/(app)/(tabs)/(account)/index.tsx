import { useQuery } from '@tanstack/react-query';

import { fetchMe, useSession } from '@/auth/session';
import { t } from '@/i18n';
import { Button, Screen, Text } from '@/ui';

export default function AccountScreen() {
  const signOut = useSession((s) => s.signOut);
  const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  return (
    <Screen>
      {data ? (
        <>
          <Text variant="title">
            {[data.user.firstname, data.user.lastname].filter(Boolean).join(' ') || data.user.email}
          </Text>
          <Text variant="muted">{data.user.email}</Text>
        </>
      ) : null}
      <Button title={t('common.logout')} onPress={signOut} />
    </Screen>
  );
}
