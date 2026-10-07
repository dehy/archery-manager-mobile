import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
