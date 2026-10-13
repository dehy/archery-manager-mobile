import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { useMe } from '@/features/account/queries';
import { initials } from '@/features/club/initials';
import { t } from '@/i18n';
import { Avatar } from '@/ui';
import { HeaderView } from '@/ui/nav';

/**
 * The selected licensee's avatar in the header: switches licensee when the account has several
 * (a parent's), opens the licensee's profile otherwise.
 */
export function LicenseeButton() {
  const router = useRouter();
  const { data } = useMe();
  const selectedId = data?.context.licensee_id ?? null;
  const selected = data?.licensees.find((l) => l.id === selectedId);
  if (!data || !selected) return null;

  const name = `${selected.firstname} ${selected.lastname}`;
  const canSwitch = data.licensees.length > 1;

  return (
    <HeaderView placement="right">
      <Pressable
        testID="header-licensee"
        accessibilityRole="button"
        accessibilityLabel={
          canSwitch ? t('account.switchLicensee', { name }) : t('account.profileOf', { name })
        }
        hitSlop={6}
        onPress={() =>
          canSwitch
            ? router.push('/licensee-picker')
            : router.push({ pathname: '/licensee/[id]', params: { id: selected.id } })
        }
      >
        <Avatar pictureUrl={null} initials={initials(name)} size={32} />
      </Pressable>
    </HeaderView>
  );
}
