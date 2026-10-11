import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import type { ClubOverview } from '@/api/types';
import { api } from '@/auth/session';
import { t } from '@/i18n';
import { Text, spacing } from '@/ui';

export function ClubHeader({ overview }: { overview: ClubOverview }) {
  const { club } = overview;
  // A logo that fails to load leaves no blank box next to the name.
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: spacing.md,
      }}
    >
      {club.logo_url && !logoFailed ? (
        <Image
          source={{ uri: api.fileUrl(club.logo_url) }}
          onError={() => setLogoFailed(true)}
          style={{ width: 48, height: 48, borderRadius: 8 }}
          contentFit="contain"
          accessibilityLabel={club.name}
        />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '600' }}>
          {club.name}
        </Text>
        <Text variant="muted">
          {[club.city, t('club.members', { count: overview.member_count })]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
    </View>
  );
}
