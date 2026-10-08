import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { api } from '@/auth/session';

import { Text } from './primitives';
import { useTheme } from './theme';

/**
 * Round picture loaded with the bearer token (pictures are authorized on every request).
 * A 404 means "no picture": the initials stay as the placeholder.
 */
export function Avatar({
  pictureUrl,
  initials,
  size = 40,
}: {
  pictureUrl: string | null;
  initials: string;
  size?: number;
}) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.tint,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {pictureUrl && !failed ? (
        <Image
          source={{ uri: api.fileUrl(pictureUrl), headers: api.fileHeaders() }}
          style={{ width: size, height: size }}
          contentFit="cover"
          cachePolicy="disk"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{ fontWeight: '600', fontSize: size * 0.36, color: theme.primary }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
