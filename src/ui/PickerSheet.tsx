import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from './primitives';
import { spacing, useTheme } from './theme';

/**
 * Content of a picker shown as a form sheet. Android sheets have no native header, so the title
 * lives in the content on both platforms.
 */
export function PickerSheet({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.background, paddingTop: spacing.md }}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 17, fontWeight: '600', marginHorizontal: 16, marginBottom: spacing.sm }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
