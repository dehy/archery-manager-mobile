import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text as RNText,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, useTheme } from './theme';

export function Screen({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: spacing.md, gap: spacing.md }}>{children}</View>
    </SafeAreaView>
  );
}

export function Text({
  variant = 'body',
  style,
  ...props
}: TextProps & { variant?: 'title' | 'body' | 'muted' | 'error' }) {
  const theme = useTheme();
  const base = {
    title: { fontSize: 28, fontWeight: '700' as const, color: theme.text },
    body: { fontSize: 16, color: theme.text },
    muted: { fontSize: 14, color: theme.muted },
    error: { fontSize: 14, color: theme.danger },
  }[variant];
  return <RNText {...props} style={[base, style]} />;
}

export function Button({
  title,
  onPress,
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={{
        backgroundColor: theme.primary,
        opacity: inactive ? 0.6 : 1,
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
      }}
    >
      {loading ? (
        <ActivityIndicator color={theme.onPrimary} />
      ) : (
        <RNText style={{ color: theme.onPrimary, fontWeight: '600', fontSize: 16 }}>{title}</RNText>
      )}
    </Pressable>
  );
}

export function TextField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="muted">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.muted}
        {...props}
        style={{
          borderWidth: 1,
          borderColor: error ? theme.danger : theme.border,
          borderRadius: 8,
          padding: spacing.md,
          color: theme.text,
          fontSize: 16,
        }}
      />
      {error ? <Text variant="error">{error}</Text> : null}
    </View>
  );
}

/**
 * Scrolling screen under a native header. iOS lets the system inset the content below the
 * (large, translucent) header; Android has an opaque top app bar, so no extra inset is needed.
 */
export function ScrollScreen({
  children,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingVertical: spacing.md }}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function Message({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.sm, alignItems: 'center' }}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 17, fontWeight: '600', textAlign: 'center' }}
      >
        {title}
      </Text>
      {body ? (
        <Text variant="muted" style={{ textAlign: 'center' }}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ alignSelf: 'stretch', marginTop: spacing.sm }}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

/** Placeholder rows while the first load is in flight (no spinner). */
export function SkeletonRows({ count = 3 }: { count?: number }) {
  const theme = useTheme();
  return (
    <View accessibilityLabel="Chargement" style={{ gap: spacing.md, padding: spacing.md }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ gap: 6 }}>
          <View
            style={{ height: 14, width: '60%', borderRadius: 4, backgroundColor: theme.tint }}
          />
          <View
            style={{ height: 12, width: '85%', borderRadius: 4, backgroundColor: theme.tint }}
          />
        </View>
      ))}
    </View>
  );
}
