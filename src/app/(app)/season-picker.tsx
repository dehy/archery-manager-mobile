import { useRouter } from 'expo-router';

import { useMe, useSwitchSeason } from '@/features/account/queries';
import { formatSeason } from '@/features/home/format';
import { useSession } from '@/auth/session';
import { t } from '@/i18n';
import { Row, Section } from '@/ui';
import { PickerSheet } from '@/ui/PickerSheet';

/** The seasons the selected licensee holds a license for (from `/me`), newest first. */
export default function SeasonPicker() {
  const router = useRouter();
  const { data } = useMe();
  const selected = useSession((s) => s.season) ?? data?.context.season ?? null;
  const switchSeason = useSwitchSeason();
  const licensee = data?.licensees.find((l) => l.id === data.context.licensee_id);
  const seasons = licensee?.seasons ?? [];

  return (
    <PickerSheet title={t('account.pickSeason')}>
      <Section>
        {seasons.map((s, i) => (
          <Row
            key={s}
            testID={`season-option-${s}`}
            title={formatSeason(s)}
            detail={s === selected ? '✓' : null}
            kind="action"
            last={i === seasons.length - 1}
            onPress={async () => {
              router.back();
              if (s !== selected) await switchSeason(s);
            }}
          />
        ))}
      </Section>
    </PickerSheet>
  );
}
