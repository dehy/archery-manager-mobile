import { useRouter } from 'expo-router';

import { useMe, useSwitchLicensee } from '@/features/account/queries';
import { useSession } from '@/auth/session';
import { t } from '@/i18n';
import { Row, Section } from '@/ui';
import { PickerSheet } from '@/ui/PickerSheet';

// Presented as a form sheet: a bottom sheet on Android, a detented sheet on iOS.
export default function LicenseePicker() {
  const router = useRouter();
  const { data } = useMe();
  const selected = useSession((s) => s.licensee) ?? data?.context.licensee_id ?? null;
  const switchLicensee = useSwitchLicensee();
  const licensees = data?.licensees ?? [];

  return (
    <PickerSheet title={t('account.pickLicensee')}>
      <Section>
        {licensees.map((l, i) => (
          <Row
            key={l.id}
            testID={`licensee-option-${l.id}`}
            title={`${l.firstname} ${l.lastname}`}
            selected={l.id === selected}
            kind="action"
            last={i === licensees.length - 1}
            onPress={async () => {
              router.back();
              if (l.id !== selected) await switchLicensee(l.id);
            }}
          />
        ))}
      </Section>
    </PickerSheet>
  );
}
