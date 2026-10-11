import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './primitives';
import { isIOS, spacing, useTheme } from './theme';

/**
 * A titled group of rows. iOS: inset grouped card with an uppercase header.
 * Android: flat full-width rows under a Material section label.
 */
export function Section({ title, children }: { title?: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      {title ? (
        <Text
          variant="muted"
          accessibilityRole="header"
          style={
            isIOS
              ? { textTransform: 'uppercase', fontSize: 13, marginHorizontal: 32, marginBottom: 6 }
              : { color: theme.primary, fontWeight: '500', marginHorizontal: 16, marginBottom: 4 }
          }
        >
          {title}
        </Text>
      ) : null}
      <View
        style={
          isIOS
            ? {
                backgroundColor: theme.surface,
                borderRadius: 12,
                marginHorizontal: 16,
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {children}
      </View>
    </View>
  );
}

export type RowProps = {
  title: string;
  subtitle?: string | null;
  /** Extra line, smaller (e.g. participation). */
  caption?: string | null;
  /** Right-aligned value. */
  detail?: string | null;
  left?: ReactNode;
  onPress?: () => void;
  /** Hide the iOS separator (last row of a section). */
  last?: boolean;
  /**
   * `navigation` (default when tappable) shows the iOS disclosure chevron. `action` is for rows
   * that do something in place or pick a value (pickers, sign out, share): no chevron, as on iOS.
   */
  kind?: 'navigation' | 'action';
  /** Red title for destructive actions (sign out, delete). */
  destructive?: boolean;
  /**
   * Picker rows: shows a checkmark and announces the row as selected. The glyph is hidden from
   * screen readers, which read the selected state instead.
   */
  selected?: boolean;
  testID?: string;
};

export function Row({
  title,
  subtitle,
  caption,
  detail,
  left,
  onPress,
  last,
  kind = 'navigation',
  destructive,
  selected,
  testID,
}: RowProps) {
  const theme = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: isIOS ? 10 : 12,
        minHeight: isIOS ? 44 : 64,
      }}
    >
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={2} style={destructive ? { color: theme.danger } : undefined}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {caption ? (
          <Text variant="muted" numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </View>
      {detail ? (
        <Text style={{ fontVariant: ['tabular-nums'], fontWeight: '600' }}>{detail}</Text>
      ) : null}
      {selected ? (
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{ color: theme.primary, fontWeight: '600' }}
        >
          ✓
        </Text>
      ) : null}
      {onPress && isIOS && kind === 'navigation' ? <Text variant="muted">›</Text> : null}
    </View>
  );

  const separator =
    isIOS && !last ? (
      <View
        style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border, marginLeft: 16 }}
      />
    ) : null;

  if (!onPress) {
    return (
      <View testID={testID}>
        {content}
        {separator}
      </View>
    );
  }
  return (
    <View testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={selected === undefined ? undefined : { selected }}
        onPress={onPress}
        android_ripple={{ color: '#00000014' }}
        style={({ pressed }) => ({ opacity: isIOS && pressed ? 0.6 : 1 })}
      >
        {content}
      </Pressable>
      {separator}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: isIOS ? 99 : 8,
        backgroundColor: selected ? theme.primary : isIOS ? theme.tint : 'transparent',
        borderWidth: isIOS ? 0 : 1,
        borderColor: selected ? theme.primary : theme.border,
      }}
    >
      <Text style={{ fontSize: 13, color: selected ? theme.onPrimary : theme.text }}>
        {!isIOS && selected ? '✓ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}

/** Small read-only label, e.g. a status. */
export function Badge({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: theme.tint,
      }}
    >
      <Text variant="muted" style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Wraps a row of a flat list (FlatList / SectionList) so that, on iOS, consecutive rows read as
 * one inset grouped card: surface background, rounded first and last corners.
 */
export function GroupedItem({
  index,
  count,
  children,
}: {
  index: number;
  count: number;
  children: ReactNode;
}) {
  const theme = useTheme();
  if (!isIOS) return <View>{children}</View>;
  const first = index === 0;
  const last = index === count - 1;
  return (
    <View
      style={{
        backgroundColor: theme.surface,
        marginHorizontal: 16,
        borderTopLeftRadius: first ? 12 : 0,
        borderTopRightRadius: first ? 12 : 0,
        borderBottomLeftRadius: last ? 12 : 0,
        borderBottomRightRadius: last ? 12 : 0,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

/** Header of a titled group inside a flat list (same look as the title of `Section`). */
export function GroupHeader({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <Text
      variant="muted"
      accessibilityRole="header"
      style={
        isIOS
          ? {
              textTransform: 'uppercase',
              fontSize: 13,
              marginHorizontal: 32,
              marginBottom: 6,
              marginTop: 12,
            }
          : {
              color: theme.primary,
              fontWeight: '500',
              marginHorizontal: 16,
              marginBottom: 4,
              marginTop: 12,
            }
      }
    >
      {title}
    </Text>
  );
}
