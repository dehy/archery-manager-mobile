import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useMe, useSwitchLicensee } from '@/features/account/queries';
import { useSession } from '@/auth/session';
import { t } from '@/i18n';
import { Row, Section, Text, spacing, useTheme } from '@/ui';

// Presented as a form sheet: a bottom sheet on Android, a detented sheet on iOS. Android sheets
// have no native header, so the title lives in the content.
export default function LicenseePicker() {
  const router = useRouter();
  const theme = useTheme();
  const { data } = useMe();
  const selected = useSession((s) => s.licensee) ?? data?.context.licensee ?? null;
  const switchLicensee = useSwitchLicensee();

  return (
    <View style={{ backgroundColor: theme.background, paddingTop: spacing.md }}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 17, fontWeight: '600', marginHorizontal: 16, marginBottom: spacing.sm }}
      >
        {t('account.pickLicensee')}
      </Text>
      <Section>
        {(data?.licensees ?? []).map((l, i, all) => (
          <Row
            key={l.ffta_member_code ?? i}
            testID={`licensee-option-${l.ffta_member_code}`}
            title={`${l.firstname} ${l.lastname}`}
            detail={l.ffta_member_code === selected ? '✓' : null}
            kind="action"
            last={i === all.length - 1}
            onPress={async () => {
              if (l.ffta_member_code) await switchLicensee(l.ffta_member_code);
              router.back();
            }}
          />
        ))}
      </Section>
    </View>
  );
}
