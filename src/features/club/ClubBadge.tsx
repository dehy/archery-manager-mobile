import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import type { Club } from '@/api/types';
import { api } from '@/auth/session';
import { Text, useTheme } from '@/ui';
import { normalizeHex, onColor } from '@/ui/clubColor';

import { initials } from './initials';

const SIZE = 24;

/** The club's logo (or its initials on its color) and name, on the club-tinted fill. */
export function ClubBadge({ club }: { club: Club }) {
  const theme = useTheme();
  const [logoFailed, setLogoFailed] = useState(false);
  const color = normalizeHex(club.primary_color);

  return (
    <View
      testID="club-badge"
      accessible
      accessibilityLabel={club.name}
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
        paddingLeft: 4,
        paddingRight: 12,
        borderRadius: 16,
        backgroundColor: theme.primaryContainer,
      }}
    >
      {club.logo_url && !logoFailed ? (
        <Image
          source={{ uri: api.fileUrl(club.logo_url) }}
          onError={() => setLogoFailed(true)}
          style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2 }}
          contentFit="contain"
        />
      ) : (
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color ?? theme.primary,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: color ? onColor(color) : theme.onPrimary,
            }}
          >
            {initials(club.name)}
          </Text>
        </View>
      )}
      <Text
        numberOfLines={1}
        style={{ flexShrink: 1, fontSize: 13, fontWeight: '600', color: theme.onPrimaryContainer }}
      >
        {club.name}
      </Text>
    </View>
  );
}
