import { Stack } from 'expo-router';
import type { ReactElement } from 'react';
import { Pressable } from 'react-native';

import { ICONS, Icon, type IconName } from '../Icon';
import { Text } from '../primitives';
import { isIOS, useTheme } from '../theme';

export type HeaderAction = {
  label: string;
  onPress: () => void;
  /** Shown instead of the label; the label stays as the accessibility label. */
  icon?: IconName;
  hidden?: boolean;
};

/**
 * Buttons in the native header, from a page. iOS: bar button items (Liquid Glass, grouped by the
 * system). Android: the toolbar only takes image icons, so Material Symbols are drawn in a view.
 */
export function HeaderToolbar({
  placement,
  actions,
}: {
  placement: 'left' | 'right';
  actions: HeaderAction[];
}) {
  const theme = useTheme();
  if (isIOS) {
    return (
      <Stack.Toolbar placement={placement}>
        {actions.map((a) =>
          a.icon ? (
            <Stack.Toolbar.Button
              key={a.label}
              icon={ICONS[a.icon].ios}
              accessibilityLabel={a.label}
              hidden={a.hidden}
              onPress={a.onPress}
            />
          ) : (
            <Stack.Toolbar.Button key={a.label} hidden={a.hidden} onPress={a.onPress}>
              {a.label}
            </Stack.Toolbar.Button>
          ),
        )}
      </Stack.Toolbar>
    );
  }
  // A hidden Compose item still takes its slot (and shifts the title), so leave it out entirely.
  const shown = actions.filter((a) => !a.hidden);
  if (shown.length === 0) return null;
  return (
    <Stack.Toolbar placement={placement}>
      {shown.map((a) => (
        <Stack.Toolbar.View key={a.label}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={a.label}
            onPress={a.onPress}
            android_ripple={{ color: theme.tint, borderless: true, radius: 24 }}
            style={{
              minWidth: 48,
              height: 48,
              paddingHorizontal: a.icon ? 0 : 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {a.icon ? (
              <Icon name={a.icon} size={24} color={theme.text} />
            ) : (
              <Text style={{ fontSize: 14, fontWeight: '500', color: theme.primary }}>
                {a.label}
              </Text>
            )}
          </Pressable>
        </Stack.Toolbar.View>
      ))}
    </Stack.Toolbar>
  );
}

/** A custom element (an avatar, say) as the only item of one side of the header. */
export function HeaderView({
  placement,
  children,
}: {
  placement: 'left' | 'right';
  children: ReactElement;
}) {
  return (
    <Stack.Toolbar placement={placement}>
      <Stack.Toolbar.View>{children}</Stack.Toolbar.View>
    </Stack.Toolbar>
  );
}
