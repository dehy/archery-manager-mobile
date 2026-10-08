import { ScrollView } from 'react-native';

import type { Group } from '@/api/types';
import { t } from '@/i18n';
import { Chip, spacing } from '@/ui';

import type { GroupFilter } from './queries';

export function GroupFilters({
  groups,
  withoutGroupCount,
  value,
  onChange,
}: {
  groups: Group[];
  withoutGroupCount: number;
  value: GroupFilter;
  onChange: (value: GroupFilter) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: spacing.md }}
    >
      <Chip label={t('club.all')} selected={value === 'all'} onPress={() => onChange('all')} />
      {groups.map((g) => (
        <Chip
          key={g.id}
          label={`${g.name} ${g.member_count}`}
          selected={value === g.id}
          onPress={() => onChange(g.id)}
        />
      ))}
      {withoutGroupCount > 0 ? (
        <Chip
          label={`${t('club.withoutGroup')} ${withoutGroupCount}`}
          selected={value === 'none'}
          onPress={() => onChange('none')}
        />
      ) : null}
    </ScrollView>
  );
}
